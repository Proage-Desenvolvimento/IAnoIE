import {
  Cpu,
  Zap,
  BookOpen,
  Image as ImageIcon,
  Database,
  Wrench,
  Mic,
  type LucideIcon,
} from "lucide-react";

/** Ícone por categoria (usado no card, detail e placeholder de mídia). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  llm: Zap,
  inference: Cpu,
  notebook: BookOpen,
  imaging: ImageIcon,
  data: Database,
  utility: Wrench,
  automation: Wrench,
  productivity: Mic,
};

/** Classes Tailwind (fundo/texto/borda) por categoria, para badges e ícones. */
export const CATEGORY_COLORS: Record<string, string> = {
  llm: "bg-violet-50 text-violet-700 border-violet-200",
  inference: "bg-cyan-50 text-cyan-700 border-cyan-200",
  notebook: "bg-amber-50 text-amber-700 border-amber-200",
  imaging: "bg-pink-50 text-pink-700 border-pink-200",
  data: "bg-emerald-50 text-emerald-700 border-emerald-200",
  utility: "bg-zinc-50 text-zinc-700 border-zinc-200",
  automation: "bg-orange-50 text-orange-700 border-orange-200",
  productivity: "bg-indigo-50 text-indigo-700 border-indigo-200",
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
  llm: "from-violet-100 to-violet-50",
  inference: "from-cyan-100 to-cyan-50",
  notebook: "from-amber-100 to-amber-50",
  imaging: "from-pink-100 to-pink-50",
  data: "from-emerald-100 to-emerald-50",
  utility: "from-zinc-100 to-zinc-50",
  automation: "from-orange-100 to-orange-50",
  productivity: "from-indigo-100 to-indigo-50",
};

export function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENTS[category] ?? "from-zinc-100 to-zinc-50";
}

export const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  anthropic: "Anthropic",
  ollama: "Ollama (Local)",
};
