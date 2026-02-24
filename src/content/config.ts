import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean(),
    author: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = {
  blog,
};
