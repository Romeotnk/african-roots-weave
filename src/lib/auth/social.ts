import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

export type SocialAuthProvider = "google" | "facebook";

const socialAuthLabels: Record<SocialAuthProvider, string> = {
  google: "Google",
  facebook: "Facebook",
};

const translateSocialAuthError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return "Ce fournisseur de connexion n'est pas encore active dans Supabase.";
  }

  if (lower.includes("redirect") || lower.includes("url")) {
    return "L'URL de redirection OAuth n'est pas encore autorisee dans Supabase.";
  }

  if (lower.includes("load failed") || lower.includes("failed to fetch") || lower.includes("network")) {
    return "Impossible de joindre Supabase. Verifiez la configuration OAuth ou reessayez dans un instant.";
  }

  return message || "La connexion sociale n'a pas pu etre lancee.";
};

export const signInWithSocialProvider = async (provider: SocialAuthProvider) => {
  if (!isSupabaseConfigured) {
    throw new Error("La connexion Google/Facebook n'est pas encore configuree. Ajoutez les variables Supabase publiques pour l'activer.");
  }

  const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/connexion`;

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: redirectTo ? { redirectTo } : undefined,
    });

    if (error) throw error;
  } catch (error) {
    throw new Error(translateSocialAuthError(error));
  }
};

export const getSocialAuthLabel = (provider: SocialAuthProvider) => socialAuthLabels[provider];