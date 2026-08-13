import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import i18n from "@/lib/i18n";

export type SocialAuthProvider = "google" | "facebook";
export type SocialAccountIntent = "user" | "professional";

const PENDING_SOCIAL_ACCOUNT_TYPE_KEY = "iwosan.pendingSocialAccountType";

const socialAuthLabels: Record<SocialAuthProvider, string> = {
  google: "Google",
  facebook: "Facebook",
};

const translateSocialAuthError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return i18n.t("socialAuth.providerNotEnabled");
  }

  if (lower.includes("redirect") || lower.includes("url")) {
    return i18n.t("socialAuth.redirectNotAllowed");
  }

  if (lower.includes("load failed") || lower.includes("failed to fetch") || lower.includes("network")) {
    return i18n.t("socialAuth.unreachable");
  }

  return message || i18n.t("socialAuth.genericError");
};

export const consumePendingSocialAccountType = (): SocialAccountIntent | null => {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(PENDING_SOCIAL_ACCOUNT_TYPE_KEY);
  window.localStorage.removeItem(PENDING_SOCIAL_ACCOUNT_TYPE_KEY);
  return value === "professional" || value === "user" ? value : null;
};

export const signInWithSocialProvider = async (
  provider: SocialAuthProvider,
  accountIntent: SocialAccountIntent = "user",
) => {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.t("socialAuth.notConfigured"));
  }

  const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/connexion`;

  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PENDING_SOCIAL_ACCOUNT_TYPE_KEY, accountIntent);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: redirectTo ? { redirectTo } : undefined,
    });

    if (error) throw error;
  } catch (error) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(PENDING_SOCIAL_ACCOUNT_TYPE_KEY);
    }
    throw new Error(translateSocialAuthError(error));
  }
};

export const getSocialAuthLabel = (provider: SocialAuthProvider) => socialAuthLabels[provider];