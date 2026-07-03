import { createFileRoute } from "@tanstack/react-router";
import { ArticleDetailPage } from "@/components/editorial/ArticleDetailPage";

export const Route = createFileRoute("/rites-cultures/$slug")({
  head: () => ({ meta: [{ title: "Article rites & cultures - IWOSAN" }] }),
  component: () => <ArticleDetailPage slug={Route.useParams().slug} fallbackSpace="Rites & Cultures" />,
});
