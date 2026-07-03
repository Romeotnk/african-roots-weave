import { createFileRoute } from "@tanstack/react-router";
import { RecipeDetailPage } from "@/components/editorial/RecipeDetailPage";

export const Route = createFileRoute("/recettes/$slug")({
  head: () => ({ meta: [{ title: "Recette - IWOSAN" }] }),
  component: () => <RecipeDetailPage slug={Route.useParams().slug} />,
});
