import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BadgeCheck, CheckCircle2, Loader2, Sparkles, Users } from "lucide-react";
import { useAffiliateCapturePage, useTrackAffiliateClick } from "@/hooks/useMlmApi";

export const Route = createFileRoute("/parrainage/$code")({
  head: () => ({ meta: [{ title: "Rejoindre le réseau - IWOSAN" }] }),
  component: MlmCapturePage,
});

type CaptureNode = {
  affiliateCode: string;
  user: {
    firstName: string;
    lastName: string;
    country: string;
    professionalProfile: {
      displayName: string;
      specialty: string[];
      biography: string;
      photos: string[];
      isVerified: boolean;
    } | null;
  };
};

function MlmCapturePage() {
  const { t } = useTranslation();
  const { code } = Route.useParams();
  const captureQuery = useAffiliateCapturePage(code);
  const trackClick = useTrackAffiliateClick();

  useEffect(() => {
    trackClick.mutate(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const node = captureQuery.data as CaptureNode | null | undefined;
  const profile = node?.user.professionalProfile;
  const displayName = profile?.displayName ?? (node ? `${node.user.firstName} ${node.user.lastName}` : t("mlmCapture.defaultDistributorName"));
  const photo = profile?.photos?.[0];
  const registerHref = `/inscription?ref=${encodeURIComponent(code)}`;

  if (captureQuery.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--brand-bg)]">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={32} />
      </main>
    );
  }

  if (!node) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--brand-bg)] px-4">
        <div className="max-w-md rounded-[24px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
          <h1 className="text-[22px] font-bold text-[var(--color-text-primary)]">{t("mlmCapture.notFoundTitle")}</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">{t("mlmCapture.notFoundDesc")}</p>
          <Link to="/inscription" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white">
            {t("mlmCapture.createAccountAnyway")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary-subtle)] px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
          <Users size={14} /> {t("mlmCapture.eyebrow")}
        </p>

        <div className="mt-6 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            {photo ? (
              <img src={photo} alt={displayName} loading="lazy" decoding="async" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--brand-primary-subtle)] text-[20px] font-black text-[var(--brand-primary)]">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="inline-flex items-center gap-1.5 text-[22px] font-bold text-[var(--color-text-primary)]">
                {t("mlmCapture.invitedBy", { name: displayName })}
                {profile?.isVerified && <BadgeCheck size={18} className="text-[var(--brand-primary)]" />}
              </h1>
              {profile?.specialty && profile.specialty.length > 0 && (
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{profile.specialty.join(" · ")}</p>
              )}
            </div>
          </div>
          {profile?.biography && (
            <p className="mt-5 line-clamp-4 text-[14px] leading-7 text-[var(--color-text-secondary)]">{profile.biography}</p>
          )}
        </div>

        <div className="mt-6 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-[18px] font-bold text-[var(--color-text-primary)]">
            <Sparkles size={18} className="text-[var(--brand-primary)]" /> {t("mlmCapture.pitchTitle")}
          </h2>
          <ul className="mt-4 space-y-3">
            {[t("mlmCapture.pitchPoint1"), t("mlmCapture.pitchPoint2"), t("mlmCapture.pitchPoint3")].map((point) => (
              <li key={point} className="flex items-start gap-2 text-[14px] text-[var(--color-text-secondary)]">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" /> {point}
              </li>
            ))}
          </ul>
          <Link
            to={registerHref as never}
            className="mt-6 flex h-12 items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white"
          >
            {t("mlmCapture.cta")}
          </Link>
        </div>
      </div>
    </main>
  );
}
