import { createFileRoute } from "@tanstack/react-router";
import { RecipeDetailPage } from "@/components/editorial/RecipeDetailPage";

export const Route = createFileRoute("/recettes-sante/$slug")({
  head: () => ({ meta: [{ title: "Recette sante - IWOSAN" }] }),
  component: () => <RecipeDetailPage slug={Route.useParams().slug} />,
});
