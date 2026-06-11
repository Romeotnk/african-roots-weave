
-- profiles : ajouter colonne country si nécessaire (déjà présente)
-- Mettre à jour le trigger pour lire country + role depuis raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
  v_requested text;
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, country, affiliate_code)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'country',
    upper(substr(md5(NEW.id::text), 1, 8))
  );

  v_requested := lower(coalesce(NEW.raw_user_meta_data->>'role', 'user'));
  IF v_requested IN ('professional','researcher') THEN
    v_role := v_requested::public.app_role;
  ELSE
    v_role := 'user'::public.app_role;
  END IF;

  -- Tous les utilisateurs reçoivent le rôle 'user' de base
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Plus le rôle demandé si différent
  IF v_role <> 'user' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
