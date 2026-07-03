import { createFileRoute } from "@tanstack/react-router";
import { ArticleDetailPage } from "@/components/editorial/ArticleDetailPage";

export const Route = createFileRoute("/sante-au-quotidien/$slug")({
  head: () => ({ meta: [{ title: "Article sante - IWOSAN" }] }),
  component: () => <ArticleDetailPage slug={Route.useParams().slug} fallbackSpace="Sante au quotidien" />,
});
