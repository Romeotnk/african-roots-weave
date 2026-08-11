import { createFileRoute } from "@tanstack/react-router";
import { RecipeListPage } from "@/components/editorial/RecipeListPage";

export const Route = createFileRoute("/recettes-sante/")({
  head: () => ({
    meta: [
      { title: "Recettes sante - IWOSAN" },
      { name: "description", content: "Recettes de médecine traditionnelle africaine : infusions, préparations et remèdes à base de plantes, vérifiés par nos praticiens." },
    ],
  }),
  component: RecipeListPage,
});
