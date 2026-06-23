import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/catalog/LanguageToggle";
import { Button } from "@/components/ui/Button";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      {children}
    </section>
  );
}

function TermsContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Topo: voltar + alternar idioma */}
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            {t("terms.back")}
          </Button>
          <LanguageToggle />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-zinc-900">{t("terms.title")}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {t("terms.lastUpdated", { date: "22/06/2026" })}
        </p>

        {/* Corpo */}
        <div className="mt-8 space-y-8">
          <Section title={t("terms.acceptance.title")}>
            <p className="text-sm leading-relaxed text-zinc-600">{t("terms.acceptance.body")}</p>
          </Section>

          <Section title={t("terms.platform.title")}>
            <p className="text-sm leading-relaxed text-zinc-600">{t("terms.platform.body")}</p>
          </Section>

          {/* §3 — Núcleo: responsabilidade do usuário */}
          <Section title={t("terms.responsibility.title")}>
            <p className="text-sm leading-relaxed text-zinc-600">
              {t("terms.responsibility.intro")}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 marker:text-zinc-300">
              <li>{t("terms.responsibility.p1")}</li>
              <li>{t("terms.responsibility.p2")}</li>
              <li>{t("terms.responsibility.p3")}</li>
              <li>{t("terms.responsibility.p4")}</li>
            </ul>
          </Section>

          {/* §4 — Núcleo: licenças de terceiros */}
          <Section title={t("terms.licenses.title")}>
            <p className="text-sm leading-relaxed text-zinc-600">{t("terms.licenses.intro")}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 marker:text-zinc-300">
              <li>{t("terms.licenses.p1")}</li>
              <li>{t("terms.licenses.p2")}</li>
              <li>{t("terms.licenses.p3")}</li>
            </ul>
          </Section>

          <Section title={t("terms.acceptableUse.title")}>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 marker:text-zinc-300">
              <li>{t("terms.acceptableUse.p1")}</li>
              <li>{t("terms.acceptableUse.p2")}</li>
              <li>{t("terms.acceptableUse.p3")}</li>
            </ul>
          </Section>

          <Section title={t("terms.data.title")}>
            <p className="text-sm leading-relaxed text-zinc-600">{t("terms.data.body")}</p>
          </Section>

          <Section title={t("terms.warranties.title")}>
            <p className="text-sm leading-relaxed text-zinc-600">{t("terms.warranties.body")}</p>
          </Section>

          <Section title={t("terms.liability.title")}>
            <p className="text-sm leading-relaxed text-zinc-600">{t("terms.liability.body")}</p>
          </Section>

          <Section title={t("terms.changes.title")}>
            <p className="text-sm leading-relaxed text-zinc-600">{t("terms.changes.body")}</p>
          </Section>

          <Section title={t("terms.contact.title")}>
            <p className="text-sm leading-relaxed text-zinc-600">{t("terms.contact.body")}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <LanguageProvider>
      <TermsContent />
    </LanguageProvider>
  );
}
