// Official brand marks, not generic icons — Google and Meta both require
// their real logo/colors on a sign-in button (not a plain bordered button
// with text only), so these are inlined at the exact path data from each
// provider's brand guidelines rather than a generic icon font glyph.
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="white" aria-hidden="true">
      <path d="M18 9c0-4.97-4.03-9-9-9S0 4.03 0 9c0 4.49 3.29 8.21 7.59 8.88v-6.28H5.31V9h2.28V7.02c0-2.25 1.34-3.49 3.39-3.49.98 0 2.01.18 2.01.18v2.21h-1.13c-1.11 0-1.46.69-1.46 1.4V9h2.49l-.4 2.6h-2.09v6.28C14.71 17.21 18 13.49 18 9z" />
    </svg>
  );
}

export function SocialAuthButtons({
  pending,
  onSelect,
  openingLabel,
}: {
  pending: "google" | "facebook" | null;
  onSelect: (provider: "google" | "facebook") => void;
  openingLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onSelect("google")}
        disabled={pending !== null}
        className="flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#dadce0] bg-white text-[14px] font-semibold text-[#3c4043] shadow-sm transition hover:bg-[#f7f8f8] hover:shadow disabled:opacity-70"
      >
        <GoogleLogo />
        {pending === "google" ? openingLabel : "Google"}
      </button>
      <button
        type="button"
        onClick={() => onSelect("facebook")}
        disabled={pending !== null}
        className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#1877F2] text-[14px] font-semibold text-white transition hover:bg-[#166FE0] disabled:opacity-70"
      >
        <FacebookLogo />
        {pending === "facebook" ? openingLabel : "Facebook"}
      </button>
    </div>
  );
}
