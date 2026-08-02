-- All app data access goes through the Express/Prisma backend, which
-- connects as the `postgres` role (BYPASSRLS by default on Supabase), so
-- enabling RLS here does not change anything for the application itself.
-- What it does close: every one of these tables was reachable, unauthenticated,
-- through Supabase's auto-generated PostgREST API using nothing but the
-- public anon key shipped in the frontend bundle (confirmed exploitable —
-- flagged by Supabase's own database linter as ERROR-level "RLS Disabled in
-- Public" on all 45 public tables). No policies are added because nothing
-- legitimate should ever query these tables as `anon`/`authenticated` via
-- PostgREST — RLS-enabled-with-no-policies denies all access to those roles
-- by default, which is exactly what's wanted here.

ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ProfessionalProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Bid" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Article" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Answer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ForumComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."MLMNode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Commission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."EmailVerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."EventRegistration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."WalletTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."TicketMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SiteConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AdSpace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."HomeBanner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SavedSearch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Formation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PlantMonograph" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."FormationModule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."FormationLesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."QuoteRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AffiliateLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Page" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ForumCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."RolePermission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Taxonomy" ENABLE ROW LEVEL SECURITY;
