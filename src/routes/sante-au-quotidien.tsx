import { createFileRoute } from "@tanstack/react-router";
import { ArticleListPage } from "@/components/editorial/ArticleListPage";

export const Route = createFileRoute("/sante-au-quotidien")({
  head: () => ({ meta: [{ title: "Sante au quotidien - IWOSAN" }] }),
  component: () => (
    <ArticleListPage
      space="Sante au quotidien"
      image="https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1920&q=80"
      badge="Blog"
      title="Sante au quotidien"
      subtitle="Conseils pratiques, prevention et bien-etre issus des savoirs africains, vulgarises par nos experts."
    />
  ),
});
