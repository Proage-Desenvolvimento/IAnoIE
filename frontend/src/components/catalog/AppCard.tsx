import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Cpu, ArrowRight, Check, Github } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
  const [logoError, setLogoError] = useState(false);
  const Icon = getCategoryIcon(app.category);
  const colorClass = getCategoryColor(app.category);

  const gpuReq = app.gpu_requirements as Record<string, unknown> | null;
  const needsGpu = Boolean(gpuReq?.gpu_required);

  const loc = content ? content[lang] : undefined;
  const tagline = loc?.tagline ?? app.description;
  const benefits = loc?.benefits ?? [];
  const categoryLabel = t(`cat.${app.category}`);

  // Logo do app, quando houver — aparece no card no lugar do ícone de categoria.
  // A imagem grande (hero/vídeo) só aparece no modal de detalhe.
  const logo = content?.logo;
  const showLogo = !!logo && !logoError;

  return (
    <Card
      className="flex cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md"
      onClick={() => onOpen(app)}
    >
      <CardContent className="flex flex-1 flex-col gap-3">
        {/* Identidade */}
        <div className="flex items-start gap-2.5">
          {showLogo && logo ? (
            <img
              src={logo}
              alt={app.name}
              loading="lazy"
              className="h-8 w-auto max-w-[120px] shrink-0 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900 leading-tight">
                {app.name}
              </h3>
              {content?.repo_url && (
                <a
                  href={content.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${app.name} no GitHub`}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <Github className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
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

        {/* Benefícios */}
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
          <Link to="/my-apps" className="block w-full" onClick={(e) => e.stopPropagation()}>
            <Button variant="secondary" className="w-full" size="sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("card.manage")}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(app);
            }}
            className="w-full"
            size="sm"
          >
            {t("card.learnMore")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
