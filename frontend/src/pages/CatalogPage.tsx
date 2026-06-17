import { useState } from "react";
import { Search } from "lucide-react";
import { useApps } from "@/hooks/useApps";
import { useInstallations } from "@/hooks/useInstallations";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppCard } from "@/components/catalog/AppCard";
import { AppDetailDialog } from "@/components/catalog/AppDetailDialog";
import { LanguageToggle } from "@/components/catalog/LanguageToggle";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { APP_CATEGORIES } from "@/lib/constants";
import { getAppContent } from "@/content/apps";
import type { App } from "@/lib/types";

function CatalogContent() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  const { data, isLoading } = useApps({ category, search: search || undefined });
  const { data: installationsData } = useInstallations();
  const installedAppIds = new Set((installationsData?.items ?? []).map((i) => i.app_id));

  return (
    <div className="space-y-6">
      {/* Cabeçalho + idioma */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t("catalog.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">{t("catalog.subtitle")}</p>
        </div>
        <LanguageToggle />
      </div>

      {/* Busca + filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={t("catalog.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory(undefined)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !category ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {t("catalog.all")}
          </button>
          {APP_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value === category ? undefined : cat.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                cat.value === category ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {t(`cat.${cat.value}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de apps */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl border border-zinc-200 bg-zinc-50" />
          ))}
        </div>
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState title={t("catalog.noResults")} description={t("catalog.noResultsHint")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              content={getAppContent(app.slug)}
              isInstalled={installedAppIds.has(app.id)}
              onOpen={setSelectedApp}
            />
          ))}
        </div>
      )}

      {/* Detalhe + instalação */}
      <AppDetailDialog
        app={selectedApp}
        content={selectedApp ? getAppContent(selectedApp.slug) : undefined}
        isInstalled={selectedApp ? installedAppIds.has(selectedApp.id) : false}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
}

export function CatalogPage() {
  return (
    <LanguageProvider>
      <CatalogContent />
    </LanguageProvider>
  );
}
