import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { YouTubeEmbed, getYouTubeId } from "./YouTubeEmbed";
import { getCategoryGradient, getCategoryIcon } from "./constants";
import { useLanguage } from "@/i18n/LanguageContext";
import type { AppContent } from "@/content/apps";

interface AppMediaProps {
  content: AppContent | undefined;
  category: string;
  name: string;
  /** "card" → thumbnail (static); "detail" → embed de vídeo completo. */
  variant?: "card" | "detail";
  className?: string;
}

/**
 * Renderiza a mídia de um app com fallback gracioso:
 *   1. detail + vídeo  → <YouTubeEmbed> (iframe)
 *   2. card  + vídeo   → thumbnail estática do YouTube com overlay de play
 *   3. imagem (hero)   → <img> (onError cai no placeholder)
 *   4. nenhum          → placeholder gradiente com ícone da categoria
 */
export function AppMedia({
  content,
  category,
  name,
  variant = "card",
  className,
}: AppMediaProps) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const Icon = getCategoryIcon(category);
  const gradient = getCategoryGradient(category);

  const videoId = content?.video ? getYouTubeId(content.video) : null;
  const hero = content?.hero;

  const showVideoEmbed = variant === "detail" && !!videoId;
  const showVideoThumb = variant === "card" && !!videoId;
  const showHero = !!hero && !imgError && !showVideoEmbed && !showVideoThumb;

  const aspect = variant === "detail" ? "16 / 9" : "16 / 10";

  if (showVideoEmbed && videoId) {
    return (
      <YouTubeEmbed
        url={content!.video!}
        title={name}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-gradient-to-br",
        gradient,
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {showVideoThumb && videoId && (
        <>
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-lg">
              <Play className="h-5 w-5 translate-x-0.5 fill-current" />
            </span>
          </div>
        </>
      )}

      {showHero && hero && (
        <img
          src={hero}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      )}

      {!showVideoThumb && !showHero && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/60 bg-white/60 text-zinc-500 shadow-sm">
            <Icon className="h-6 w-6" />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            {videoId || content?.video ? t("media.videoSoon") : t("media.imageSoon")}
          </span>
          <span className="px-4 text-sm font-semibold text-zinc-500 line-clamp-1">{name}</span>
        </div>
      )}
    </div>
  );
}
