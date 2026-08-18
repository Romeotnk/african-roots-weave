import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2, Compass, FileUp, MapPin, Plus, Sparkles, Stethoscope, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { Switch } from "@/components/ui/switch";
import { backendAuthUserStore, getMe } from "@/lib/api/auth";
import {
  useMyProfessionalProfile,
  useUploadMyProfilePhotos,
  useUploadMyVerificationDocs,
  useUpsertMyProfessionalProfile,
} from "@/hooks/useProfessionalApi";
import { useTaxonomy } from "@/hooks/useTaxonomyApi";

export const Route = createFileRoute("/devenir-pro")({
  head: () => ({ meta: [{ title: "Devenir professionnel - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute>
      <BecomePro />
    </ProtectedRoute>
  ),
});

const specialties = [
  "Gyneco-obstetrique",
  "Phytotherapie",
  "Dermatologie traditionnelle",
  "Osteo-articulaire",
  "Nutrition traditionnelle",
  "Ethnobotanique",
  "Sage-femme traditionnelle",
];

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const slots = ["Matin", "Apres-midi", "Soir"];

// Cahier des charges: "Format narratif immersif avec galerie photos (5-10 visuels)".
const MIN_GALLERY_PHOTOS = 5;
const MAX_GALLERY_PHOTOS = 10;

function BecomePro() {
  const { t } = useTranslation();
  const profileQuery = useMyProfessionalProfile();
  const upsertProfile = useUpsertMyProfessionalProfile();
  const uploadPhotos = useUploadMyProfilePhotos();
  const uploadDocs = useUploadMyVerificationDocs();
  const specialtyTaxonomyQuery = useTaxonomy("PROFESSIONAL_SPECIALTY");
  const specialtyOptions = specialtyTaxonomyQuery.data && specialtyTaxonomyQuery.data.length > 0
    ? specialtyTaxonomyQuery.data.map((item) => item.name)
    : specialties;

  const [country, setCountry] = useState("BJ");
  const [mainSpecialty, setMainSpecialty] = useState(specialties[0]);

  useEffect(() => {
    setMainSpecialty((current) => (specialtyOptions.includes(current) ? current : specialtyOptions[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialtyTaxonomyQuery.data]);
  const [online, setOnline] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [consultationPrice, setConsultationPrice] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [treated, setTreated] = useState<string[]>([]);
  const [treatedInput, setTreatedInput] = useState("");
  const [profileName, setProfileName] = useState("");
  const [bio, setBio] = useState("");
  const [initiationPath, setInitiationPath] = useState("");
  const [successRate, setSuccessRate] = useState("");
  const [innovations, setInnovations] = useState("");
  const [communityImpact, setCommunityImpact] = useState("");
  const [philosophy, setPhilosophy] = useState("");
  const [patientTestimonials, setPatientTestimonials] = useState("");
  const [caseStudies, setCaseStudies] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [formMessage, setFormMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const existingProfile = profileQuery.data?.data;

  useEffect(() => {
    if (!existingProfile) return;
    setProfileName(existingProfile.displayName);
    setBio(existingProfile.biography);
    setInitiationPath(existingProfile.initiationPath ?? "");
    setSuccessRate(existingProfile.therapeuticSuccessRate != null ? String(existingProfile.therapeuticSuccessRate) : "");
    setInnovations(existingProfile.innovations ?? "");
    setCommunityImpact(existingProfile.communityImpact ?? "");
    setPhilosophy(existingProfile.philosophy ?? "");
    setPatientTestimonials(existingProfile.patientTestimonials ?? "");
    setCaseStudies(existingProfile.caseStudies ?? "");
    setFacebookUrl(existingProfile.socialLinks?.facebook ?? "");
    setInstagramUrl(existingProfile.socialLinks?.instagram ?? "");
    setWhatsapp(existingProfile.socialLinks?.whatsapp ?? "");
    setCity(existingProfile.location);
    setLatitude(existingProfile.latitude);
    setLongitude(existingProfile.longitude);
    setTreated(existingProfile.specialty);
    setOnline(existingProfile.serviceBookingEnabled);
    const schedule = existingProfile.availabilitySchedule as { slots?: string[]; videoUrl?: string; consultationPrice?: string } | null;
    if (schedule?.slots) setSelectedSlots(schedule.slots);
    if (schedule?.videoUrl) setVideoUrl(schedule.videoUrl);
    if (schedule?.consultationPrice) setConsultationPrice(schedule.consultationPrice);
  }, [existingProfile]);

  const completeness = useMemo(() => {
    const checks = [
      profileName.trim().length >= 3,
      bio.trim().length >= 300,
      city.trim().length >= 2,
      selectedSlots.length > 0,
      treated.length > 0,
      documentFiles.length > 0 || Boolean(existingProfile?.verificationDocs),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [bio, city, documentFiles.length, existingProfile, profileName, selectedSlots.length, treated.length]);

  const toggleSlot = (value: string) => {
    setSelectedSlots((current) =>
      current.includes(value) ? current.filter((slot) => slot !== value) : [...current, value],
    );
  };

  const addTreated = () => {
    const value = treatedInput.trim();
    if (!value || treated.includes(value)) return;
    setTreated((current) => [...current, value].slice(0, 8));
    setTreatedInput("");
    setFormMessage("");
  };

  const submitProfile = async () => {
    if (profileName.trim().length < 3) {
      setFormMessage(t("becomePro.practiceNameRequired"));
      return;
    }
    if (bio.trim().length < 300) {
      setFormMessage(t("becomePro.bioTooShort"));
      return;
    }
    if (!city.trim()) {
      setFormMessage(t("becomePro.cityRequired"));
      return;
    }
    if (selectedSlots.length === 0) {
      setFormMessage(t("becomePro.slotRequired"));
      return;
    }
    const allSpecialties = Array.from(new Set([mainSpecialty, ...treated])).slice(0, 8);
    if (allSpecialties.length === 0) {
      setFormMessage(t("becomePro.specialtyRequired"));
      return;
    }
    if (!existingProfile && documentFiles.length === 0) {
      setFormMessage(t("becomePro.documentRequired"));
      return;
    }
    const projectedGalleryCount = (existingProfile?.photos.length ?? 0) + (avatarFile ? 1 : 0) + galleryFiles.length;
    if (projectedGalleryCount < MIN_GALLERY_PHOTOS) {
      setFormMessage(t("becomePro.galleryTooSmall", { min: MIN_GALLERY_PHOTOS, count: projectedGalleryCount }));
      return;
    }

    try {
      const socialLinks: Record<string, string> = {};
      if (facebookUrl.trim()) socialLinks.facebook = facebookUrl.trim();
      if (instagramUrl.trim()) socialLinks.instagram = instagramUrl.trim();
      if (whatsapp.trim()) socialLinks.whatsapp = whatsapp.trim();

      await upsertProfile.mutateAsync({
        displayName: profileName.trim(),
        specialty: allSpecialties,
        biography: bio.trim(),
        initiationPath: initiationPath.trim() || undefined,
        therapeuticSuccessRate: successRate ? Number(successRate) : undefined,
        innovations: innovations.trim() || undefined,
        communityImpact: communityImpact.trim() || undefined,
        philosophy: philosophy.trim() || undefined,
        patientTestimonials: patientTestimonials.trim() || undefined,
        caseStudies: caseStudies.trim() || undefined,
        location: city.trim(),
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        serviceBookingEnabled: online,
        availabilitySchedule: { slots: selectedSlots, videoUrl: online ? videoUrl.trim() : "", consultationPrice: consultationPrice.trim() },
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      });

      const photoFiles = [avatarFile, ...galleryFiles].filter((file): file is File => Boolean(file));
      if (photoFiles.length > 0) await uploadPhotos.mutateAsync(photoFiles);
      if (documentFiles.length > 0) await uploadDocs.mutateAsync(documentFiles);

      // Submitting the profile may have just upgraded this account to
      // PROFESSIONAL server-side — resync so the pro dashboard unlocks
      // immediately instead of requiring a logout/login.
      const me = await getMe();
      if (me.data) backendAuthUserStore.set(me.data);

      setSubmitted(true);
      setFormMessage(t("becomePro.profileSubmitted"));
    } catch (error) {
      setSubmitted(false);
      setFormMessage(error instanceof Error ? error.message : t("becomePro.submitError"));
    }
  };

  const isSaving = upsertProfile.isPending || uploadPhotos.isPending || uploadDocs.isPending;

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">{t("becomePro.eyebrow")}</p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">{t("becomePro.title")}</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            {t("becomePro.description")}
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitProfile();
          }}
          className="space-y-6"
        >
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[20px] font-bold"><Stethoscope size={20} /> {t("becomePro.identitySection")}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <input required value={profileName} onChange={(event) => { setProfileName(event.target.value); setFormMessage(""); }} placeholder={t("becomePro.practiceNamePlaceholder")} className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
              <select value={mainSpecialty} onChange={(event) => setMainSpecialty(event.target.value)} className="h-11 rounded-lg border border-[var(--brand-border)] bg-white px-4">
                {specialtyOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)]">
                <Camera size={26} className="text-[var(--brand-primary)]" />
                <span className="mt-2 text-[13px] font-semibold">{t("becomePro.profilePhoto")}</span>
                <span className="mt-1 max-w-full truncate px-3 text-[11px] text-[var(--color-text-muted)]">{avatarFile?.name ?? t("becomePro.noFile")}</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)} />
              </label>
              <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)]">
                <Upload size={26} className="text-[var(--brand-primary)]" />
                <span className="mt-2 text-[13px] font-semibold">{t("becomePro.gallery5to10")}</span>
                <span className="mt-1 max-w-full truncate px-3 text-[11px] text-[var(--color-text-muted)]">{galleryFiles.length ? t("becomePro.fileCount", { count: galleryFiles.length }) : t("becomePro.noFile")}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const remaining = Math.max(0, MAX_GALLERY_PHOTOS - (existingProfile?.photos.length ?? 0));
                    setGalleryFiles(Array.from(event.target.files ?? []).slice(0, remaining));
                  }}
                />
              </label>
            </div>
            <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">
              {t("becomePro.galleryCount", { count: existingProfile?.photos.length ?? 0, max: MAX_GALLERY_PHOTOS, min: MIN_GALLERY_PHOTOS })}
            </p>
            {existingProfile && existingProfile.photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {existingProfile.photos.map((url) => (
                  <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-[8px] border border-[var(--brand-border-light)]">
                    <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        upsertProfile.mutate({
                          displayName: existingProfile.displayName,
                          specialty: existingProfile.specialty,
                          biography: existingProfile.biography,
                          location: existingProfile.location,
                          photos: existingProfile.photos.filter((photo) => photo !== url),
                        })
                      }
                      aria-label={t("becomePro.removePhoto")}
                      className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[20px] font-bold">{t("becomePro.narrativeSection")}</h2>
            <div className="mt-5 space-y-3">
              <textarea required minLength={300} value={bio} onChange={(event) => { setBio(event.target.value); setFormMessage(""); }} rows={6} placeholder={t("becomePro.biographyPlaceholder")} className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
              <textarea value={initiationPath} onChange={(event) => setInitiationPath(event.target.value)} rows={4} placeholder={t("becomePro.initiationPlaceholder")} className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
              <div className="flex gap-2">
                <input value={treatedInput} onChange={(event) => setTreatedInput(event.target.value)} placeholder={t("becomePro.specialtyPlaceholder")} className="h-10 flex-1 rounded-lg border border-[var(--brand-border)] px-3" />
                <button type="button" aria-label={t("becomePro.addSpecialty")} onClick={addTreated} className="h-10 rounded-lg bg-[var(--brand-primary)] px-4 text-white"><Plus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {treated.map((item) => <button type="button" key={item} onClick={() => setTreated((current) => current.filter((value) => value !== item))} className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]">{item} x</button>)}
              </div>
              <input type="number" min="0" max="100" value={successRate} onChange={(event) => setSuccessRate(event.target.value)} placeholder={t("becomePro.successRatePlaceholder")} className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4 md:w-auto" />
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[20px] font-bold"><Sparkles size={20} /> {t("becomePro.impactSection")}</h2>
            <div className="mt-5 space-y-3">
              <textarea value={innovations} onChange={(event) => setInnovations(event.target.value)} rows={3} placeholder={t("becomePro.innovationsPlaceholder")} className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
              <textarea value={communityImpact} onChange={(event) => setCommunityImpact(event.target.value)} rows={3} placeholder={t("becomePro.communityImpactPlaceholder")} className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
              <textarea value={philosophy} onChange={(event) => setPhilosophy(event.target.value)} rows={3} placeholder={t("becomePro.philosophyPlaceholder")} className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
              <textarea value={patientTestimonials} onChange={(event) => setPatientTestimonials(event.target.value)} rows={3} placeholder={t("becomePro.patientTestimonialsPlaceholder")} className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
              <textarea value={caseStudies} onChange={(event) => setCaseStudies(event.target.value)} rows={3} placeholder={t("becomePro.caseStudiesPlaceholder")} className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
              <div className="grid gap-3 md:grid-cols-3">
                <input value={facebookUrl} onChange={(event) => setFacebookUrl(event.target.value)} placeholder={t("becomePro.facebookPlaceholder")} className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
                <input value={instagramUrl} onChange={(event) => setInstagramUrl(event.target.value)} placeholder={t("becomePro.instagramPlaceholder")} className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
                <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder={t("becomePro.whatsappPlaceholder")} className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[20px] font-bold"><MapPin size={20} /> {t("becomePro.locationSection")}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <CountrySelect value={country} onChange={setCountry} className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4" />
              <input value={city} onChange={(event) => { setCity(event.target.value); setFormMessage(""); }} placeholder={t("becomePro.cityPlaceholder")} className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLocationMessage("");
                  if (!navigator.geolocation) {
                    setLocationMessage(t("becomePro.geolocationUnavailable"));
                    return;
                  }
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setLatitude(position.coords.latitude);
                      setLongitude(position.coords.longitude);
                      setLocationMessage(t("becomePro.positionSaved"));
                    },
                    () => setLocationMessage(t("becomePro.positionError")),
                  );
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold"
              >
                <Compass size={16} /> {t("becomePro.useCurrentPosition")}
              </button>
              {latitude != null && longitude != null && (
                <span className="text-[12px] text-[var(--color-text-muted)]">
                  {t("becomePro.positionSavedCoords", { lat: latitude.toFixed(4), lng: longitude.toFixed(4) })}
                </span>
              )}
            </div>
            {locationMessage && <p className="mt-2 text-[12px] text-[var(--brand-primary)]">{locationMessage}</p>}
            <div className="mt-5 overflow-x-auto">
              <div className="grid min-w-[620px] grid-cols-[120px_repeat(3,1fr)] gap-2 text-[13px]">
                <div />
                {slots.map((slot) => <div key={slot} className="font-bold">{slot}</div>)}
                {days.map((day) => (
                  <Fragment key={day}>
                    <div className="font-semibold">{day}</div>
                    {slots.map((slot) => {
                      const value = `${day}-${slot}`;
                      return (
                        <button type="button" key={value} onClick={() => toggleSlot(value)} className={`rounded-lg border p-2 ${selectedSlots.includes(value) ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)]"}`}>
                          {selectedSlots.includes(value) ? t("becomePro.available") : t("becomePro.free")}
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
              <label className="flex flex-1 items-center justify-between rounded-lg border border-[var(--brand-border)] px-4 py-3 text-[13px] font-semibold">
                {t("becomePro.onlineConsultations")} <Switch checked={online} onCheckedChange={setOnline} />
              </label>
              {online && <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder={t("becomePro.videoconferenceLinkPlaceholder")} className="h-11 flex-1 rounded-lg border border-[var(--brand-border)] px-4" />}
              <input type="number" value={consultationPrice} onChange={(event) => setConsultationPrice(event.target.value)} placeholder={t("becomePro.consultationPricePlaceholder")} className="h-11 flex-1 rounded-lg border border-[var(--brand-border)] px-4" />
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[20px] font-bold">{t("becomePro.documentsSection")}</h2>
            <label className="mt-5 flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)]">
              <FileUp size={28} className="text-[var(--brand-primary)]" />
              <span className="mt-2 text-[13px] font-semibold">{t("becomePro.documentsSentForValidation")}</span>
              <span className="mt-1 max-w-full px-4 text-center text-[11px] text-[var(--color-text-muted)]">{documentFiles.length ? t("becomePro.filesSelected", { count: documentFiles.length }) : t("becomePro.noFileSelected")}</span>
              <input type="file" multiple className="sr-only" onChange={(event) => { setDocumentFiles(Array.from(event.target.files ?? []).slice(0, 5)); setFormMessage(""); }} />
            </label>
          </div>

          {formMessage && <p className={`rounded-lg border p-3 text-[13px] ${submitted ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>{formMessage}</p>}
          <button type="submit" disabled={isSaving} className="h-12 rounded-full bg-[var(--brand-primary)] px-7 font-semibold text-white disabled:opacity-60">
            {isSaving ? t("becomePro.sending") : t("becomePro.submitProfile")}
          </button>
        </form>

        <aside className="h-fit space-y-4">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="font-bold">{t("becomePro.completionTitle")}</h2>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--brand-border-light)]">
              <div className="h-full bg-[var(--brand-primary)]" style={{ width: `${completeness}%` }} />
            </div>
            <p className="mt-2 text-[13px] font-semibold text-[var(--brand-primary)]">{t("becomePro.readyPercent", { percent: completeness })}</p>
          </div>
          {existingProfile && (
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 text-[13px]">
              <p className="font-bold">{t("becomePro.status")}</p>
              <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${existingProfile.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {existingProfile.isVerified ? t("becomePro.verified") : t("becomePro.pendingVerification")}
              </p>
            </div>
          )}
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 text-[13px] text-[var(--color-text-secondary)]">
            <CheckCircle2 className="mb-3 text-[var(--brand-primary)]" /> {t("becomePro.certificationsPrivacyNotice")}
          </div>
        </aside>
      </section>
    </main>
  );
}
