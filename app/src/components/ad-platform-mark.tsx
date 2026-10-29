import { MetaLogo } from "@phosphor-icons/react";
import "./ad-platform-mark.css";

export type AdPlatform = "google" | "amazon" | "linkedin" | "microsoft" | "meta";

const platforms = {
  google: { label: "Google Ads", src: "/assets/platforms/google-ads-logo.webp", width: 500, height: 250 },
  amazon: { label: "Amazon Ads", src: "/assets/platforms/amazon-ads-logo.webp", width: 4730, height: 1220 },
  linkedin: { label: "LinkedIn", src: "/assets/platforms/linkedin-mark.png", width: 635, height: 540 },
  microsoft: { label: "Microsoft Advertising / Bing", src: "/assets/platforms/bing-logo.svg", width: 2535, height: 1024 },
} as const;

/** Channel identification, not a partnership badge. Preserve supplied logo colours. */
export function AdPlatformMark({ platform, decorative = false }: { platform: AdPlatform; decorative?: boolean }) {
  const mark = platform === "meta" ? null : platforms[platform];
  const label = mark?.label ?? "Meta";
  return <span className={`ad-platform-mark ad-platform-mark--${platform}`} aria-hidden={decorative || undefined}>
    {mark ? <img src={mark.src} width={mark.width} height={mark.height} alt={decorative || platform === "linkedin" ? "" : label} decoding="async" />
      : <><MetaLogo size={32} weight="regular" aria-hidden="true" /><span>Meta</span></>}
    {platform === "linkedin" && <span>LinkedIn</span>}
  </span>;
}
