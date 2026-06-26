import {
  ShoppingBag,
  Palette,
  Brain,
  Rocket,
  Megaphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Ícone por categoria (usado no card, detail e placeholder de mídia). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  vendas: ShoppingBag,
  estudio: Palette,
  inteligencia: Brain,
  produtividade: Rocket,
  consultores: Megaphone,
};

/** Classes Tailwind (fundo/texto/borda) por categoria, para badges e ícones. */
export const CATEGORY_COLORS: Record<string, string> = {
  vendas: "bg-rose-50 text-rose-700 border-rose-200",
  estudio: "bg-pink-50 text-pink-700 border-pink-200",
  inteligencia: "bg-emerald-50 text-emerald-700 border-emerald-200",
  produtividade: "bg-blue-50 text-blue-700 border-blue-200",
  consultores: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

export const FALLBACK_ICON: LucideIcon = Wrench;

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? FALLBACK_ICON;
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "";
}

/** Gradiente suave para o placeholder de mídia, variando por categoria. */
export const CATEGORY_GRADIENTS: Record<string, string> = {
  vendas: "from-rose-100 to-rose-50",
  estudio: "from-pink-100 to-pink-50",
  inteligencia: "from-emerald-100 to-emerald-50",
  produtividade: "from-blue-100 to-blue-50",
  consultores: "from-fuchsia-100 to-fuchsia-50",
};

export function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENTS[category] ?? "from-zinc-100 to-zinc-50";
}

export const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  anthropic: "Anthropic",
  ollama: "Ollama (Local)",
  openrouter: "OpenRouter",
};
