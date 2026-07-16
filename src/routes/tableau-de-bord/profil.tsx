import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Eye, EyeOff, KeyRound, Save, User } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { AppRole } from "@/lib/auth/AuthContext";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { apiRequest } from "@/lib/api/client";
import { changePassword, updateMe, type AuthUser } from "@/lib/api/auth";
import { getPasswordValidationError } from "@/lib/auth/password";
import { PROFESSIONAL_ACCOUNT_ROLES } from "@/lib/auth/roles";

export const Route = createFileRoute("/tableau-de-bord/profil")({
  head: () => ({ meta: [{ title: "Mon profil - IWOSAN" }] }),
  component: ProfilePage,
});

type ProfileForm = {
  firstName: string;
  lastName: string;
  country: string;
  language: "fr" | "en" | "ar";
  avatarUrl: string;
};

const isValidUrl = (value: string) => {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export function ProfilePage({ allowedRoles = PROFESSIONAL_ACCOUNT_ROLES }: { allowedRoles?: AppRole[] } = {}) {
  const queryClient = useQueryClient();
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    country: "",
    language: "fr",
    avatarUrl: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await apiRequest<AuthUser>("/auth/me");
      return response.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    setForm({
      firstName: profileQuery.data.firstName ?? "",
      lastName: profileQuery.data.lastName ?? "",
      country: profileQuery.data.country ?? "",
      language: (profileQuery.data.language as ProfileForm["language"]) ?? "fr",
      avatarUrl: profileQuery.data.avatarUrl ?? "",
    });
  }, [profileQuery.data]);

  const profileMutation = useMutation({
    mutationFn: () =>
      updateMe({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        country: form.country.trim(),
        language: form.language,
        avatarUrl: form.avatarUrl.trim() || null,
      }),
    onSuccess: async () => {
      setProfileMessage("Profil mis a jour.");
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error) => {
      setProfileMessage(error instanceof Error ? error.message : "Mise à jour impossible.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword(passwords.currentPassword, passwords.password),
    onSuccess: () => {
      setPasswordMessage("Mot de passe changé. Utilisez le nouveau mot de passe à la prochaine connexion.");
      setPasswords({ currentPassword: "", password: "", confirmPassword: "" });
    },
    onError: (error) => {
      setPasswordMessage(error instanceof Error ? error.message : "Changement impossible.");
    },
  });

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");

    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) {
      setProfileMessage("Renseignez un prénom et un nom d'au moins 2 caractères.");
      return;
    }

    if (!isValidUrl(form.avatarUrl)) {
      setProfileMessage("L'URL de la photo doit commencer par http:// ou https://.");
      return;
    }

    profileMutation.mutate();
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");

    if (!passwords.currentPassword) {
      setPasswordMessage("Saisissez votre mot de passe actuel.");
      return;
    }

    const passwordError = getPasswordValidationError(passwords.password);
    if (passwordError) {
      setPasswordMessage(passwordError.replace("Le mot de passe", "Le nouveau mot de passe"));
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      setPasswordMessage("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    passwordMutation.mutate();
  };

  return (
    <ProtectedRoute requireAnyRole={allowedRoles}>
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-border-light)] bg-white">
          <div className="container-iwosan py-8">
            <AccountBackLink />
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Profil</p>
                <h1 className="mt-2 text-[32px] md:text-[42px]">Mon profil</h1>
                <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                  Identite, photo de compte et securite du compte connecte.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-[8px] border border-[var(--brand-border-light)] px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-primary-subtle)]">
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User size={20} className="text-[var(--brand-primary)]" />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-bold">{form.firstName || "Prenom"} {form.lastName || "Nom"}</p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">{profileQuery.data?.role ?? "Compte"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-iwosan grid gap-5 py-8 lg:grid-cols-[1.3fr_0.7fr]">
          <form onSubmit={submitProfile} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex items-center gap-3">
              <Camera size={20} className="text-[var(--brand-primary)]" />
              <h2 className="text-[20px] font-bold">Informations personnelles</h2>
            </div>

            {profileQuery.isLoading ? (
              <p className="mt-5 text-[14px] text-[var(--color-text-muted)]">Chargement du profil...</p>
            ) : profileQuery.isError ? (
              <p className="mt-5 rounded-[8px] bg-red-50 p-4 text-[14px] text-red-700">
                Impossible de charger le profil. Reconnectez-vous puis reessayez.
              </p>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Prenom" value={form.firstName} onChange={(firstName) => setForm((current) => ({ ...current, firstName }))} />
                <Field label="Nom" value={form.lastName} onChange={(lastName) => setForm((current) => ({ ...current, lastName }))} />
                <Field label="Pays" value={form.country} onChange={(country) => setForm((current) => ({ ...current, country }))} />
                <label className="grid gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
                  Langue
                  <select
                    value={form.language}
                    onChange={(event) => setForm((current) => ({ ...current, language: event.target.value as ProfileForm["language"] }))}
                    className="h-11 rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="fr">Francais</option>
                    <option value="en">English</option>
                    <option value="ar">Arabe</option>
                  </select>
                </label>
                <div className="md:col-span-2">
                  <Field
                    label="URL photo de profil"
                    value={form.avatarUrl}
                    placeholder="https://..."
                    onChange={(avatarUrl) => setForm((current) => ({ ...current, avatarUrl }))}
                  />
                </div>
              </div>
            )}

            {profileMessage && (
              <p className="mt-4 rounded-[8px] bg-[var(--brand-primary-subtle)] p-3 text-[13px] font-semibold text-[var(--brand-primary)]">
                {profileMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={profileMutation.isPending || profileQuery.isLoading}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              <Save size={17} />
              {profileMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>

          <form onSubmit={submitPassword} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex items-center gap-3">
              <KeyRound size={20} className="text-[var(--brand-primary)]" />
              <h2 className="text-[20px] font-bold">Mot de passe</h2>
            </div>

            <div className="mt-5 grid gap-4">
              <PasswordField
                label="Mot de passe actuel"
                value={passwords.currentPassword}
                onChange={(currentPassword) => setPasswords((current) => ({ ...current, currentPassword }))}
              />
              <PasswordField
                label="Nouveau mot de passe"
                value={passwords.password}
                onChange={(password) => setPasswords((current) => ({ ...current, password }))}
              />
              <PasswordField
                label="Confirmer"
                value={passwords.confirmPassword}
                onChange={(confirmPassword) => setPasswords((current) => ({ ...current, confirmPassword }))}
              />
            </div>

            {passwordMessage && (
              <p className="mt-4 rounded-[8px] bg-[var(--brand-surface-alt)] p-3 text-[13px] font-semibold text-[var(--color-text-secondary)]">
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-5 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              <KeyRound size={17} />
              {passwordMutation.isPending ? "Changement..." : "Changer le mot de passe"}
            </button>
          </form>
        </section>
      </main>
    </ProtectedRoute>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--brand-primary)]"
      />
    </label>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <label className="grid gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
      {label}
      <span className="flex h-11 items-center rounded-[8px] border border-[var(--brand-border-light)] bg-white focus-within:border-[var(--brand-primary)]">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[var(--color-text-primary)] outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="grid h-10 w-10 place-items-center text-[var(--color-text-muted)]"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          <Icon size={17} />
        </button>
      </span>
    </label>
  );
}