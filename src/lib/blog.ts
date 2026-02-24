import { getCollection } from 'astro:content';

const PAGE_SIZE = 3;

export async function getSortedPosts() {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
  return posts;
}

export function getPaginationForPosts(posts: Awaited<ReturnType<typeof getSortedPosts>>) {
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  return {
    PAGE_SIZE,
    totalPages,
    getPagePosts: (page: number) => {
      const start = (page - 1) * PAGE_SIZE;
      return posts.slice(start, start + PAGE_SIZE);
    },
  };
}
