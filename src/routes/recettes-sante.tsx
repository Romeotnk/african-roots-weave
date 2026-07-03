import { createFileRoute } from "@tanstack/react-router";
import { RecipeListPage } from "@/components/editorial/RecipeListPage";

export const Route = createFileRoute("/recettes-sante")({
  head: () => ({ meta: [{ title: "Recettes sante - IWOSAN" }] }),
  component: RecipeListPage,
});
