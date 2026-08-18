import { createFileRoute } from "@tanstack/react-router";
import { RecipeListPage } from "@/components/editorial/RecipeListPage";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/recettes-sante/")({
  head: () => ({
    meta: [
      { title: "Recettes sante - IWOSAN" },
      { name: "description", content: i18n.t("meta.recettesSanteDescription") },
    ],
  }),
  component: RecipeListPage,
});
