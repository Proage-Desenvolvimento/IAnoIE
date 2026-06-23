import { cn } from "@/lib/utils";

const PARTNER_LOGO_URL = "https://placehold.co/600x400?text=Logo%20parceiro";
const PARTNER_URL = "https://www.google.com";

export function PartnerLogo({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Apoiador / Parceiro</p>
      <a
        href={PARTNER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block transition-opacity hover:opacity-80"
      >
        <img
          src={PARTNER_LOGO_URL}
          alt="Parceiro"
          className={imgClassName ?? "h-14 w-auto object-contain"}
        />
      </a>
    </div>
  );
}
