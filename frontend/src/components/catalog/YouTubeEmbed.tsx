import { cn } from "@/lib/utils";

/** Extrai o ID de 11 caracteres de várias formas de URL do YouTube. */
export function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

/** Embed responsivo 16:9 do YouTube via domínio no-cookie (privacidade). */
export function YouTubeEmbed({ url, title = "YouTube video", className }: YouTubeEmbedProps) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-lg bg-zinc-900", className)}
      style={{ aspectRatio: "16 / 9" }}
    >
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
