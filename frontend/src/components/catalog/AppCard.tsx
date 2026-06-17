import { Link } from "react-router-dom";
import { CheckCircle2, Cpu, ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AppMedia } from "./AppMedia";
import { getCategoryColor, getCategoryIcon } from "./constants";
import { useLanguage } from "@/i18n/LanguageContext";
import type { App } from "@/lib/types";
import type { AppContent } from "@/content/apps";

interface AppCardProps {
  app: App;
  content: AppContent | undefined;
  isInstalled: boolean;
  onOpen: (app: App) => void;
}

export function AppCard({ app, content, isInstalled, onOpen }: AppCardProps) {
  const { lang, t } = useLanguage();
  const Icon = getCategoryIcon(app.category);
  const colorClass = getCategoryColor(app.category);

  const gpuReq = app.gpu_requirements as Record<string, unknown> | null;
  const needsGpu = Boolean(gpuReq?.gpu_required);

  const loc = content ? content[lang] : undefined;
  const tagline = loc?.tagline ?? app.description;
  const benefits = (loc?.benefits ?? []).slice(0, 3);
  const categoryLabel = t(`cat.${app.category}`);

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {/* Thumbnail / mídia */}
      <button
        type="button"
        onClick={() => onOpen(app)}
        className="block w-full text-left"
        aria-label={`${t("card.learnMore")}: ${app.name}`}
      >
        <div className="p-3 pb-0">
          <AppMedia content={content} category={app.category} name={app.name} variant="card" />
        </div>
      </button>

      <CardContent className="flex flex-1 flex-col gap-3 pt-3">
        {/* Identidade */}
        <div className="flex items-start gap-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-zinc-900 leading-tight">{app.name}</h3>
            <p className="text-[11px] text-zinc-400">v{app.version}</p>
          </div>
        </div>

        {/* Tagline do gestor */}
        <p className="text-sm text-zinc-600 line-clamp-2">{tagline}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${colorClass}`}>
            {categoryLabel}
          </span>
          {needsGpu && (
            <Badge variant="info">
              <Cpu className="h-3 w-3" />
              {t("card.gpu")}
            </Badge>
          )}
          {isInstalled && (
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3" />
              {t("card.installed")}
            </Badge>
          )}
        </div>

        {/* Benefícios (até 3) */}
        {benefits.length > 0 && (
          <ul className="mt-auto space-y-1.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-1.5 text-xs text-zinc-600">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span className="line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter>
        {isInstalled ? (
          <Link to="/my-apps" className="block w-full">
            <Button variant="secondary" className="w-full" size="sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("card.manage")}
            </Button>
          </Link>
        ) : (
          <Button onClick={() => onOpen(app)} className="w-full" size="sm">
            {t("card.learnMore")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
