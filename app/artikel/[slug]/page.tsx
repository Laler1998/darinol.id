import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleSlug, fetchRssArticles, findRssArticle, type NormalizedRssArticle } from "@/lib/rss";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://darinol.online";

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

function compactSummary(value: string | null, source: string) {
  const text = value?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return `Ringkasan berita dari ${source} di Darinol.id.`;
  if (text.length <= 220) return text;

  return `${text.slice(0, 217).replace(/\s+\S*$/, "")}...`;
}

function articleImageUrl(article: NormalizedRssArticle) {
  if (!article.image) return `${siteUrl}/darinol-og.png`;

  try {
    return new URL(article.image, article.url ?? siteUrl).toString();
  } catch {
    return `${siteUrl}/darinol-og.png`;
  }
}

function relatedArticles(article: NormalizedRssArticle, articles: NormalizedRssArticle[]) {
  const words = new Set(
    (article.title ?? "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3),
  );

  return articles
    .filter((candidate) => candidate.url && candidate.title && candidate.url !== article.url)
    .map((candidate) => {
      const sharedWords = (candidate.title ?? "")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => words.has(word)).length;
      const sameSource = candidate.source.name === article.source.name ? 1 : 0;

      return { candidate, score: sharedWords * 2 + sameSource };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await findRssArticle(slug);

  if (!article?.title) {
    return {
      title: "Artikel tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const description = compactSummary(article.description, article.source.name);
  const canonical = `${siteUrl}/artikel/${articleSlug(article.title, article.source.name)}`;

  return {
    title: article.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description,
      siteName: "Darinol.id",
      locale: "id_ID",
      publishedTime: article.publishedAt ?? undefined,
      authors: [article.source.name],
      images: [{
        url: articleImageUrl(article),
        width: 1200,
        height: 630,
        alt: article.title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [articleImageUrl(article)],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, articles] = await Promise.all([
    findRssArticle(slug),
    fetchRssArticles().catch(() => []),
  ]);

  if (!article?.title || !article.url) notFound();

  const publishedDate = formatDate(article.publishedAt);
  const canonical = `${siteUrl}/artikel/${articleSlug(article.title, article.source.name)}`;
  const description = compactSummary(article.description, article.source.name);
  const related = relatedArticles(article, articles);
  const articleImage = articleImageUrl(article);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description,
    image: [articleImage],
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.publishedAt ?? undefined,
    author: {
      "@type": "Organization",
      name: article.source.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Darinol.id",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/darinol-icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    isBasedOn: article.url,
  };

  return (
    <main className="min-h-screen bg-darinol-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex items-center justify-between gap-4 border-b border-darinol-border/70 pb-5">
          <a href="/" className="font-heading text-base font-bold text-darinol-text">
            Darinol<span className="text-darinol-primaryInk">.id</span>
          </a>
          <a
            href="/"
            className="tap-target inline-flex min-h-11 items-center rounded-full border border-darinol-border bg-darinol-surface/70 px-4 text-sm font-semibold text-darinol-text transition hover:border-darinol-primary/50"
          >
            Kembali ke radar
          </a>
        </header>

        <article className="mx-auto mt-10 max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs font-medium text-darinol-muted">
            <a href="/" className="transition hover:text-darinol-primaryInk">
              Radar tren
            </a>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span aria-current="page">Ringkasan berita</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-darinol-muted">
            <span className="rounded-full bg-darinol-primary/10 px-3 py-1 text-darinol-primaryInk">
              Ringkasan berita
            </span>
            <span>{article.source.name}</span>
          </div>
          <h1 className="mt-5 font-heading text-3xl font-bold leading-[1.12] text-darinol-text sm:text-5xl">
            {article.title}
          </h1>
          {publishedDate ? (
            <time
              dateTime={article.publishedAt ?? undefined}
              className="mt-5 block text-sm font-medium text-darinol-muted"
            >
              Dipublikasikan {publishedDate}
            </time>
          ) : null}

          <section
            aria-label="Ringkasan artikel"
            className="mt-10 border-l-4 border-darinol-primary bg-darinol-surface/60 px-5 py-5 sm:px-7 sm:py-6"
          >
            <p className="text-lg leading-8 text-darinol-text sm:text-xl sm:leading-9">{description}</p>
          </section>

          <div className="mt-8 border-t border-darinol-border/70 pt-6">
            <p className="text-sm leading-6 text-darinol-muted">
              Darinol.id menampilkan ringkasan dari feed publik dan tidak menyalin artikel penuh.
              Baca laporan lengkap pada situs publisher asli.
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target inline-flex min-h-11 items-center rounded-full bg-darinol-primaryFill px-5 text-sm font-semibold text-white transition hover:brightness-105"
            >
              Baca artikel lengkap di {article.source.name}
            </a>
            <a
              href="/"
              className="tap-target mt-3 inline-flex min-h-11 items-center rounded-full border border-darinol-border bg-darinol-surface/70 px-5 text-sm font-semibold text-darinol-text transition hover:border-darinol-primary/50 hover:text-darinol-primaryInk sm:ml-3 sm:mt-0"
            >
              Temukan tren lainnya
            </a>
          </div>

          {related.length ? (
            <section aria-labelledby="related-articles" className="mt-12 border-t border-darinol-border/70 pt-8">
              <h2 id="related-articles" className="font-heading text-xl font-semibold text-darinol-text">
                Artikel Terkait
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {related.map((relatedArticle) => (
                  <a
                    key={`${relatedArticle.source.name}-${relatedArticle.url}`}
                    href={`/artikel/${articleSlug(relatedArticle.title ?? "", relatedArticle.source.name)}`}
                    className="group rounded-xl border border-darinol-border/70 bg-darinol-surface/50 p-4 transition hover:border-darinol-primary/50 hover:bg-darinol-surface"
                  >
                    <p className="text-sm font-semibold leading-snug text-darinol-text group-hover:text-darinol-primaryInk">
                      {relatedArticle.title}
                    </p>
                    <p className="mt-3 text-xs font-medium text-darinol-muted">
                      {relatedArticle.source.name}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
