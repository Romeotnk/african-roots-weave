import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { authTokenStore } from "@/lib/api/client";
import { backendAuthUserStore, logout as backendLogout, type AuthUser } from "@/lib/api/auth";

export type AppRole = "user" | "professional" | "researcher" | "moderator" | "editor" | "admin" | "super_admin";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (r: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

const roleMap: Record<string, AppRole> = {
  USER: "user",
  PROFESSIONAL: "professional",
  RESEARCHER: "researcher",
  MODERATOR: "moderator",
  EDITOR: "editor",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

const rolesFromBackendUser = (backendUser: AuthUser): AppRole[] => {
  const role = roleMap[backendUser.role] ?? "user";
  const roles = new Set<AppRole>([role]);
  if (backendUser.role === "SUPER_ADMIN") roles.add("admin");
  if (backendUser.role === "PROFESSIONAL") roles.add("user");
  if (backendUser.role === "RESEARCHER" || backendUser.isResearcher) {
    roles.add("researcher");
    roles.add("professional");
    roles.add("user");
  }
  if (backendUser.adminSubRole === "MODERATOR") roles.add("moderator");
  if (backendUser.adminSubRole === "EDITOR") roles.add("editor");
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

  const loadRoles = async (uid: string | undefined) => {
    if (!uid) {
      setRoles([]);
      return;
    }
    try {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const mappedRoles = new Set<AppRole>((data ?? []).map((r) => r.role as AppRole));
      if (mappedRoles.has("researcher")) {
        mappedRoles.add("professional");
        mappedRoles.add("user");
      }
      if (mappedRoles.has("professional")) mappedRoles.add("user");
      setRoles([...mappedRoles]);
    } catch (error) {
      console.warn("Supabase roles unavailable, keeping backend roles only.", error);
      setRoles([]);
    }
  };

  useEffect(() => {
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

    const backendAuthenticated = loadBackendUser();
    if (backendAuthenticated) {
      window.addEventListener("iwosan.auth.changed", loadBackendUser);
      window.addEventListener("storage", loadBackendUser);
      return () => {
        window.removeEventListener("iwosan.auth.changed", loadBackendUser);
        window.removeEventListener("storage", loadBackendUser);
      };
    }

    if (!isSupabaseConfigured) {
      window.addEventListener("iwosan.auth.changed", loadBackendUser);
      window.addEventListener("storage", loadBackendUser);
      return () => {
        window.removeEventListener("iwosan.auth.changed", loadBackendUser);
        window.removeEventListener("storage", loadBackendUser);
      };
    }

    // Listener first (synchronous state set), then fetch session
    let sub: { subscription: { unsubscribe: () => void } } | null = null;
    try {
      const listener = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        // Defer Supabase calls to avoid deadlocks
        setTimeout(() => loadRoles(s?.user?.id), 0);
      });
      sub = listener.data;

      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (data.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            loadRoles(data.session.user.id).finally(() => setLoading(false));
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

    return () => sub?.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
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
