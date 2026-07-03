import { createFileRoute } from "@tanstack/react-router";
import { ArticleListPage } from "@/components/editorial/ArticleListPage";

export const Route = createFileRoute("/rites-cultures")({
  head: () => ({
    meta: [
      { title: "Rites & Cultures - IWOSAN" },
      { name: "description", content: "Ceremonies de guerison, symboliques vegetales et transmission ancestrale." },
    ],
  }),
  component: () => (
    <ArticleListPage
      space="Rites & Cultures"
      image="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1920&q=80"
      badge="Patrimoine vivant"
      title="Rites & Cultures"
      subtitle="Ceremonies de guerison, symboliques vegetales et transmission des savoirs initiatiques a travers le continent."
      warning="Contenu reserve a des fins documentaires et culturelles."
    />
  ),
});
