import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { authTokenStore } from "@/lib/api/client";
import { backendAuthUserStore, loginWithSupabaseAccessToken, logout as backendLogout, type AuthUser } from "@/lib/api/auth";

export type AppRole = "user" | "professional" | "admin" | "super_admin";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  authSyncError: string | null;
  signOut: () => Promise<void>;
  hasRole: (r: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

const roleMap: Record<string, AppRole> = {
  USER: "user",
  PROFESSIONAL: "professional",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

const rolesFromBackendUser = (backendUser: AuthUser): AppRole[] => {
  const role = roleMap[backendUser.role] ?? "user";
  const roles = new Set<AppRole>([role]);
  if (backendUser.role === "SUPER_ADMIN") roles.add("admin");
  if (backendUser.role === "PROFESSIONAL") roles.add("user");
  return [...roles];
};

const toSupabaseLikeUser = (backendUser: AuthUser): User =>
  ({
    id: backendUser.id,
    email: backendUser.email,
    user_metadata: {
      first_name: backendUser.firstName,
      last_name: backendUser.lastName,
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: "",
  }) as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [authSyncError, setAuthSyncError] = useState<string | null>(null);

  const syncBackendFromSupabaseSession = async (supabaseSession: Session | null, attempt = 1): Promise<boolean> => {
    const token = supabaseSession?.access_token;
    if (!token) return false;

    try {
      const response = await loginWithSupabaseAccessToken(token);
      if (response.data?.user) {
        setAuthSyncError(null);
        setSession(null);
        setUser(toSupabaseLikeUser(response.data.user));
        setRoles(rolesFromBackendUser(response.data.user));
        return true;
      }
    } catch (error) {
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return syncBackendFromSupabaseSession(supabaseSession, attempt + 1);
      }
      console.warn("Synchronisation OAuth Supabase vers backend impossible.", error);
      setAuthSyncError("La connexion n'a pas pu être synchronisée avec votre compte. Merci de réessayer.");
    }

    return false;
  };
  const loadRoles = async (uid: string | undefined) => {
    if (!uid) {
      setRoles([]);
      return;
    }
    try {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const mappedRoles = new Set<AppRole>(
        (data ?? [])
          .map((r) => r.role as string)
          .filter((role): role is AppRole => ["user", "professional", "admin", "super_admin"].includes(role)),
      );
      if (mappedRoles.size === 0) mappedRoles.add("user");
      if (mappedRoles.has("professional")) mappedRoles.add("user");
      setRoles([...mappedRoles]);
    } catch (error) {
      console.warn("Supabase roles unavailable, using default user role.", error);
      setRoles(["user"]);
    }
  };

  const hydrateFromSupabaseSession = async (supabaseSession: Session | null) => {
    if (!supabaseSession?.user) return false;

    const synced = await syncBackendFromSupabaseSession(supabaseSession);
    if (synced) return true;

    // The backend sync failed: don't fall back to a Supabase-only session.
    // It has no backend access token, so every apiRequest call would
    // silently 401 while the UI still showed the user as logged in.
    setSession(null);
    setUser(null);
    setRoles([]);
    return false;
  };

  useEffect(() => {
    // Safety net: if a Supabase network call stalls without ever resolving
    // or rejecting (no timeout of its own), loading would stay true forever
    // and every ProtectedRoute page would show an infinite spinner. Force it
    // to settle after a few seconds so the app falls back to "logged out"
    // instead of hanging.
    const loadingSafetyTimeout = window.setTimeout(() => setLoading(false), 10000);

    const loadBackendUser = () => {
      const backendUser = backendAuthUserStore.get();
      const token = authTokenStore.get();
      if (backendUser && token) {
        setSession(null);
        setUser(toSupabaseLikeUser(backendUser));
        setRoles(rolesFromBackendUser(backendUser));
        setLoading(false);
        return true;
      }

      setSession(null);
      setUser(null);
      setRoles([]);
      setLoading(false);
      return false;
    };

    // Always listen for backend-login changes, regardless of which branch
    // below ends up driving the initial state. A plain email/password
    // login always goes through backendAuthUserStore and must be picked
    // up even while Supabase's own OAuth listeners are also active —
    // previously these listeners were only attached on the
    // already-authenticated-at-mount and no-Supabase branches, so logging
    // in from a logged-out /connexion (the normal case, with Supabase
    // configured) silently dispatched "iwosan.auth.changed" to no one:
    // the URL would navigate away but roles/user state never updated,
    // and the next ProtectedRoute check bounced the user straight back.
    window.addEventListener("iwosan.auth.changed", loadBackendUser);
    window.addEventListener("storage", loadBackendUser);

    const backendAuthenticated = loadBackendUser();
    let sub: { subscription: { unsubscribe: () => void } } | null = null;

    if (!backendAuthenticated && isSupabaseConfigured) {
      try {
        const listener = supabase.auth.onAuthStateChange((_event, s) => {
          setLoading(true);
          // Defer Supabase calls to avoid deadlocks
          setTimeout(() => {
            if (!s) {
              loadBackendUser();
              return;
            }
            hydrateFromSupabaseSession(s).finally(() => setLoading(false));
          }, 0);
        });
        sub = listener.data;

        supabase.auth
          .getSession()
          .then(({ data }) => {
            if (data.session?.user) {
              hydrateFromSupabaseSession(data.session).finally(() => setLoading(false));
              return;
            }

            if (!loadBackendUser()) {
              setLoading(false);
            }
          })
          .catch((error) => {
            console.warn("Supabase session unavailable, falling back to backend auth.", error);
            loadBackendUser();
            setLoading(false);
          });
      } catch (error) {
        console.warn("Supabase auth unavailable, falling back to backend auth.", error);
        loadBackendUser();
        setLoading(false);
      }
    }

    return () => {
      window.clearTimeout(loadingSafetyTimeout);
      window.removeEventListener("iwosan.auth.changed", loadBackendUser);
      window.removeEventListener("storage", loadBackendUser);
      sub?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setAuthSyncError(null);
    await backendLogout();
    if (!isSupabaseConfigured) {
      setRoles([]);
      setSession(null);
      setUser(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Supabase sign out skipped.", error);
    }
    setRoles([]);
    setSession(null);
    setUser(null);
  };

  const value: AuthCtx = {
    user,
    session,
    roles,
    loading,
    authSyncError,
    signOut,
    hasRole: (r) => roles.includes(r),
    refreshRoles: () => loadRoles(user?.id),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
