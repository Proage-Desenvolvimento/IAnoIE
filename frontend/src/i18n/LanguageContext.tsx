import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { MESSAGES, type Lang } from "./messages";

const STORAGE_KEY = "ianoie_lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Traduz uma chave do catálogo; aceita {placeholder} substituído por vars. */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "pt-br";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "pt-br" || stored === "en") return stored;
  } catch {
    /* localStorage indisponível */
  }
  // Default pt-br — público-alvo é um gestor brasileiro.
  return "pt-br";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignora falha de persistência */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = MESSAGES[lang][key] ?? MESSAGES.en[key] ?? key;
      if (!vars) return raw;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
        raw,
      );
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage deve ser usado dentro de <LanguageProvider>");
  }
  return ctx;
}
