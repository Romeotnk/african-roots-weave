import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArticleListPage } from "@/components/editorial/ArticleListPage";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/sante-au-quotidien/")({
  head: () => ({
    meta: [
      { title: "Sante au quotidien - IWOSAN" },
      { name: "description", content: i18n.t("meta.santeQuotidienDescription") },
    ],
  }),
  component: SanteQuotidienPage,
});

function SanteQuotidienPage() {
  const { t } = useTranslation();
  return (
    <ArticleListPage
      space="Sante au quotidien"
      image="https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1920&q=80"
      badge={t("santeQuotidien.badge")}
      title={t("santeQuotidien.title")}
      subtitle={t("santeQuotidien.subtitle")}
    />
  );
}
