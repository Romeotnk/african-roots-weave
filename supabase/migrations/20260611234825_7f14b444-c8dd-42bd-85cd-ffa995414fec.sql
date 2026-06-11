
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('user','professional','researcher','moderator','admin');
CREATE TYPE public.kyc_status AS ENUM ('pending','submitted','verified','rejected');
CREATE TYPE public.med_category AS ENUM ('gyneco_obstetrique','gastro_intestinal','maladies_enfance','etats_febriles_icteres','affections_cutanees','systeme_nerveux','osteo_articulaire','pulmonaire','uro_genital','orl','ophtalmologique','bucco_dentaire','cardio_vasculaire','stomatologique','mystique');
CREATE TYPE public.product_type AS ENUM ('physical','service','digital');
CREATE TYPE public.order_status AS ENUM ('pending','paid','shipped','delivered','disputed','refunded','cancelled');
CREATE TYPE public.escrow_status AS ENUM ('held','released','refunded');
CREATE TYPE public.review_target AS ENUM ('product','professional');
CREATE TYPE public.article_space AS ENUM ('sante_quotidien','rites_cultures','recettes_sante','pharmacopee');
CREATE TYPE public.event_type AS ENUM ('webinar','formation','salon','portes_ouvertes');
CREATE TYPE public.commission_type AS ENUM ('direct','mlm_level1','mlm_level2','mlm_level3','affiliate');
CREATE TYPE public.commission_status AS ENUM ('pending','approved','paid','cancelled');
CREATE TYPE public.transaction_type AS ENUM ('deposit','withdrawal','commission','payment','refund','transfer');

-- ============ UPDATED_AT trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  country TEXT,
  kyc_status public.kyc_status NOT NULL DEFAULT 'pending',
  wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  affiliate_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, affiliate_code)
  VALUES (NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    upper(substr(md5(NEW.id::text), 1, 8))
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profile policies
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- user_roles policies
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_manage" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ PROFESSIONAL_PROFILES ============
CREATE TABLE public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  specialty TEXT[] NOT NULL DEFAULT '{}',
  biography TEXT NOT NULL,
  location TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  photos TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.professional_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_profiles TO authenticated;
GRANT ALL ON public.professional_profiles TO service_role;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_pp_updated BEFORE UPDATE ON public.professional_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "pp_select_all" ON public.professional_profiles FOR SELECT USING (true);
CREATE POLICY "pp_insert_own" ON public.professional_profiles FOR INSERT WITH CHECK (auth.uid() = user_id AND (public.has_role(auth.uid(),'professional') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "pp_update_own" ON public.professional_profiles FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pp_admin_all" ON public.professional_profiles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category public.med_category NOT NULL,
  type public.product_type NOT NULL DEFAULT 'physical',
  images TEXT[] NOT NULL DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  commission_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (is_active OR seller_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "products_insert_seller" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id AND (public.has_role(auth.uid(),'professional') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "products_update_own" ON public.products FOR UPDATE USING (auth.uid() = seller_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "products_delete_own" ON public.products FOR DELETE USING (auth.uid() = seller_id OR public.has_role(auth.uid(),'admin'));

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.order_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  escrow_status public.escrow_status NOT NULL DEFAULT 'held',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "orders_select_party" ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders_insert_buyer" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "orders_update_party" ON public.orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type public.review_target NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(author_id, target_id, target_type)
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = author_id OR public.has_role(auth.uid(),'admin'));

-- ============ ARTICLES ============
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  space public.article_space NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  cover_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "articles_select_published" ON public.articles FOR SELECT USING (is_published OR author_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "articles_insert_own" ON public.articles FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "articles_update_own" ON public.articles FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "articles_delete_own" ON public.articles FOR DELETE USING (auth.uid() = author_id OR public.has_role(auth.uid(),'admin'));

-- ============ QUESTIONS ============
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  vote_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_questions_updated BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "questions_select_all" ON public.questions FOR SELECT USING (true);
CREATE POLICY "questions_insert_auth" ON public.questions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "questions_update_own" ON public.questions FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "questions_delete_own" ON public.questions FOR DELETE USING (auth.uid() = author_id OR public.has_role(auth.uid(),'admin'));

-- ============ ANSWERS ============
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.answers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.answers TO authenticated;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_answers_updated BEFORE UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "answers_select_all" ON public.answers FOR SELECT USING (true);
CREATE POLICY "answers_insert_auth" ON public.answers FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "answers_update_own" ON public.answers FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "answers_delete_own" ON public.answers FOR DELETE USING (auth.uid() = author_id OR public.has_role(auth.uid(),'admin'));

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "notif_admin_all" ON public.notifications FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ COMMISSIONS ============
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  type public.commission_type NOT NULL,
  status public.commission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_commissions_updated BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "commissions_select_own" ON public.commissions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "commissions_admin_all" ON public.commissions FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ MLM_NODES ============
CREATE TABLE public.mlm_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.mlm_nodes(id) ON DELETE SET NULL,
  level INTEGER NOT NULL DEFAULT 0,
  total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  affiliate_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mlm_nodes TO authenticated;
GRANT ALL ON public.mlm_nodes TO service_role;
ALTER TABLE public.mlm_nodes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_mlm_updated BEFORE UPDATE ON public.mlm_nodes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "mlm_select_own" ON public.mlm_nodes FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "mlm_admin_all" ON public.mlm_nodes FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ WALLET_TRANSACTIONS ============
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  balance_before NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wt_select_own" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "wt_admin_all" ON public.wallet_transactions FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ EVENTS ============
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  type public.event_type NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  max_attendees INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "events_select_published" ON public.events FOR SELECT USING (is_published OR created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "events_insert_pro" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by AND (public.has_role(auth.uid(),'professional') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "events_manage_own" ON public.events FOR UPDATE USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "events_delete_own" ON public.events FOR DELETE USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));

-- ============ PLANT_MONOGRAPHS ============
CREATE TABLE public.plant_monographs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scientific_name TEXT NOT NULL UNIQUE,
  vernacular_names JSONB NOT NULL DEFAULT '{}'::jsonb,
  therapeutic_indications TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plant_monographs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plant_monographs TO authenticated;
GRANT ALL ON public.plant_monographs TO service_role;
ALTER TABLE public.plant_monographs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_plants_updated BEFORE UPDATE ON public.plant_monographs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "plants_select_published" ON public.plant_monographs FOR SELECT USING (is_published OR created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "plants_insert_researcher" ON public.plant_monographs FOR INSERT WITH CHECK (auth.uid() = created_by AND (public.has_role(auth.uid(),'researcher') OR public.has_role(auth.uid(),'professional') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "plants_update_own" ON public.plant_monographs FOR UPDATE USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "plants_delete_admin" ON public.plant_monographs FOR DELETE USING (public.has_role(auth.uid(),'admin'));
