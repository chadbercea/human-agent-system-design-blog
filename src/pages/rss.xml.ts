import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { articleSlug } from '../lib/articles.ts';

export async function GET(context: { site: string | undefined }) {
  const posts = await getCollection('articles', ({ data }) => !data.draft);
  posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'HAS Design',
    description: 'Human–agent system design writing.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? post.data.title,
      link: `/${articleSlug(post.id)}`,
      pubDate: post.data.date,
    })),
  });
}
