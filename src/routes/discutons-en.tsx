import { createFileRoute } from "@tanstack/react-router";
import { ForumListPage } from "@/components/forum/ForumListPage";

export const Route = createFileRoute("/discutons-en")({
  head: () => ({ meta: [{ title: "Discutons-en - Forum IWOSAN" }] }),
  component: ForumListPage,
});
