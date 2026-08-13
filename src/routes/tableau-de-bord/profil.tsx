import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Camera, Eye, EyeOff, KeyRound, Save, User } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { AppRole } from "@/lib/auth/AuthContext";
import { AccountLayout } from "@/components/account/AccountLayout";
import { changePassword, updateMe } from "@/lib/api/auth";
import { useMeQuery } from "@/hooks/useAuthApi";
import { PROFESSIONAL_ACCOUNT_ROLES } from "@/lib/auth/roles";
import type { TFunction } from "i18next";

const getNewPasswordValidationError = (password: string, t: TFunction) => {
  const requirements = [
    { test: (value: string) => value.length >= 8, message: t("account.profile.newPasswordMinLength") },
    { test: (value: string) => /[A-Z]/.test(value), message: t("account.profile.newPasswordUppercase") },
    { test: (value: string) => /[a-z]/.test(value), message: t("account.profile.newPasswordLowercase") },
    { test: (value: string) => /[0-9]/.test(value), message: t("account.profile.newPasswordDigit") },
    { test: (value: string) => /[^A-Za-z0-9]/.test(value), message: t("account.profile.newPasswordSpecialChar") },
  ];
  return requirements.find((requirement) => !requirement.test(password))?.message ?? null;
};

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
  const { t } = useTranslation();
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

  const profileQuery = useMeQuery();

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
      setProfileMessage(t("account.profile.profileUpdated"));
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error) => {
      setProfileMessage(error instanceof Error ? error.message : t("account.profile.updateError"));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword(passwords.currentPassword, passwords.password),
    onSuccess: () => {
      setPasswordMessage(t("account.profile.passwordChanged"));
      setPasswords({ currentPassword: "", password: "", confirmPassword: "" });
    },
    onError: (error) => {
      setPasswordMessage(error instanceof Error ? error.message : t("account.profile.passwordChangeError"));
    },
  });

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");

    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) {
      setProfileMessage(t("account.profile.firstNameLastNameTooShort"));
      return;
    }

    if (!isValidUrl(form.avatarUrl)) {
      setProfileMessage(t("account.profile.invalidAvatarUrl"));
      return;
    }

    profileMutation.mutate();
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");

    if (!passwords.currentPassword) {
      setPasswordMessage(t("account.profile.currentPasswordRequired"));
      return;
    }

    const passwordError = getNewPasswordValidationError(passwords.password, t);
    if (passwordError) {
      setPasswordMessage(passwordError);
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      setPasswordMessage(t("account.profile.passwordsDontMatch"));
      return;
    }

    passwordMutation.mutate();
  };

  return (
    <ProtectedRoute requireAnyRole={allowedRoles}>
      <AccountLayout
        title={t("account.profile.title")}
        description={t("account.profile.description")}
        actions={
          <div className="flex items-center gap-3 rounded-[8px] border border-[var(--brand-border-light)] px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-primary-subtle)]">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User size={20} className="text-[var(--brand-primary)]" />
              )}
            </div>
            <div>
              <p className="text-[14px] font-bold">{form.firstName || t("account.profile.firstNamePlaceholder")} {form.lastName || t("account.profile.lastNamePlaceholder")}</p>
              <p className="text-[12px] text-[var(--color-text-muted)]">{profileQuery.data?.role ?? t("account.profile.accountPlaceholder")}</p>
            </div>
          </div>
        }
      >
        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <form onSubmit={submitProfile} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex items-center gap-3">
              <Camera size={20} className="text-[var(--brand-primary)]" />
              <h2 className="text-[20px] font-bold">{t("account.profile.personalInfoTitle")}</h2>
            </div>

            {profileQuery.isLoading ? (
              <p className="mt-5 text-[14px] text-[var(--color-text-muted)]">{t("account.profile.loadingProfile")}</p>
            ) : profileQuery.isError ? (
              <p className="mt-5 rounded-[8px] bg-red-50 p-4 text-[14px] text-red-700">
                {t("account.profile.loadError")}
              </p>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label={t("account.profile.firstName")} value={form.firstName} onChange={(firstName) => setForm((current) => ({ ...current, firstName }))} />
                <Field label={t("account.profile.lastName")} value={form.lastName} onChange={(lastName) => setForm((current) => ({ ...current, lastName }))} />
                <Field label={t("account.profile.country")} value={form.country} onChange={(country) => setForm((current) => ({ ...current, country }))} />
                <label className="grid gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
                  {t("account.profile.language")}
                  <select
                    value={form.language}
                    onChange={(event) => setForm((current) => ({ ...current, language: event.target.value as ProfileForm["language"] }))}
                    className="h-11 rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="fr">{t("account.profile.languageFr")}</option>
                    <option value="en">{t("account.profile.languageEn")}</option>
                    <option value="ar">{t("account.profile.languageAr")}</option>
                  </select>
                </label>
                <div className="md:col-span-2">
                  <Field
                    label={t("account.profile.avatarUrlLabel")}
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
              {profileMutation.isPending ? t("account.profile.saving") : t("account.profile.save")}
            </button>
          </form>

          <form onSubmit={submitPassword} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex items-center gap-3">
              <KeyRound size={20} className="text-[var(--brand-primary)]" />
              <h2 className="text-[20px] font-bold">{t("account.profile.passwordSectionTitle")}</h2>
            </div>

            <div className="mt-5 grid gap-4">
              <PasswordField
                label={t("account.profile.currentPassword")}
                value={passwords.currentPassword}
                onChange={(currentPassword) => setPasswords((current) => ({ ...current, currentPassword }))}
              />
              <PasswordField
                label={t("account.profile.newPassword")}
                value={passwords.password}
                onChange={(password) => setPasswords((current) => ({ ...current, password }))}
              />
              <PasswordField
                label={t("account.profile.confirmPassword")}
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
              {passwordMutation.isPending ? t("account.profile.changing") : t("account.profile.changePassword")}
            </button>
          </form>
        </div>
      </AccountLayout>
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
  const { t } = useTranslation();
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
          aria-label={visible ? t("account.profile.hidePassword") : t("account.profile.showPassword")}
        >
          <Icon size={17} />
        </button>
      </span>
    </label>
  );
}