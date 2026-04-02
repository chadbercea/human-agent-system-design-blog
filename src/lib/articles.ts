import { getCollection, type CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'articles'>;

/** URL segment and `[slug]` param (collection `id` may include `.md`). */
export function articleSlug(id: string): string {
  return id.replace(/\.md$/i, '');
}

export async function getSortedArticles(): Promise<ArticleEntry[]> {
  const posts = await getCollection('articles', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** ~200 wpm; minimum 1 minute per Linear article header. */
export function readingTimeMinutes(markdownBody: string): number {
  const text = markdownBody.replace(/```[\s\S]*?```/g, ' ').replace(/[#*_`[\]()]/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
