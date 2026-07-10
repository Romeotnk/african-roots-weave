import { createFileRoute, notFound } from "@tanstack/react-router";
import { cmsPages } from "@/data/pages";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => {
    const page = cmsPages.find((item) => item.slug === params.slug && item.isPublished);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.metaTitle ?? "IWOSAN" },
      { name: "description", content: loaderData?.metaDescription ?? "" },
    ],
  }),
  component: CmsPageView,
});

function CmsPageView() {
  const page = Route.useLoaderData();

  return (
    <main className="bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-[var(--color-surface)] py-14">
        <div className="container-iwosan max-w-4xl">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Page</p>
          <h1 className="mt-3 text-[34px] md:text-[48px]">{page.title}</h1>
          <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">Dernière mise à jour : {page.updatedAt}</p>
        </div>
      </section>
      <section className="container-iwosan max-w-4xl py-10">
        <article
          className="prose max-w-none rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6 leading-8 text-[var(--color-text-secondary)]"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />
      </section>
    </main>
  );
}
