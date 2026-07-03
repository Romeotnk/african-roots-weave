import { createFileRoute } from "@tanstack/react-router";
import { RecipeListPage } from "@/components/editorial/RecipeListPage";

export const Route = createFileRoute("/recettes")({
  head: () => ({ meta: [{ title: "Recettes - IWOSAN" }] }),
  component: RecipeListPage,
});
