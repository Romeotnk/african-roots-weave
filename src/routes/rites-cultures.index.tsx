import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArticleListPage } from "@/components/editorial/ArticleListPage";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/rites-cultures/")({
  head: () => ({
    meta: [
      { title: "Rites & Cultures - IWOSAN" },
      { name: "description", content: i18n.t("meta.ritesCulturesDescription") },
    ],
  }),
  component: RitesCulturesPage,
});

function RitesCulturesPage() {
  const { t } = useTranslation();
  return (
    <ArticleListPage
      space="Rites & Cultures"
      image="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1920&q=80"
      badge={t("ritesCultures.badge")}
      title={t("ritesCultures.title")}
      subtitle={t("ritesCultures.subtitle")}
      warning={t("ritesCultures.warning")}
    />
  );
}
