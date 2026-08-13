import { useTranslation } from "react-i18next";
import { useAdsByPosition } from "@/hooks/useSiteConfig";

// Ad code is admin-authored embed markup (e.g. Google AdSense snippets) that
// legitimately needs <script> tags — rendering it in a sandboxed iframe keeps
// it in its own browsing context, isolated from the host page's DOM, cookies
// and CSP, instead of injecting it directly into the main document.
export function AdSlot({ position, className }: { position: string; className?: string }) {
  const { t } = useTranslation();
  const { data } = useAdsByPosition(position);
  const ads = data?.data ?? [];

  if (ads.length === 0) return null;

  return (
    <div className={className} data-ad-position={position}>
      {ads.map((ad) => (
        <iframe
          key={ad.id}
          title={t("adSlot.iframeTitle", { position })}
          srcDoc={ad.code}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
          className="h-full min-h-[90px] w-full border-0"
        />
      ))}
    </div>
  );
}
