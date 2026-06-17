import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGS, LANG_LABELS } from "@/i18n/messages";

/** Botão segmentado PT | EN para alternar o idioma do catálogo. */
export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
            lang === l ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-800",
          )}
          aria-pressed={lang === l}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
