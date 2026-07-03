import { createFileRoute } from "@tanstack/react-router";
import { ForumListPage } from "@/components/forum/ForumListPage";

export const Route = createFileRoute("/forum")({
  head: () => ({ meta: [{ title: "Forum Q&A - IWOSAN" }] }),
  component: ForumListPage,
});
