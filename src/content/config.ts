import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean().optional().default(false),
    /* ILI-806 — articles that connect to the HAS-D framework declare
       which concepts they reference. The article reader uses this to
       conditionally render the framework affordance bar (locator).
       Empty/absent → no affordance bar. */
    references: z.array(z.string()).optional(),
    postNumber: z.number().int().positive(),
  }),
});

const CATEGORY_SLUGS = ['axioms', 'constraints', 'design-requirements'] as const;
const CONCEPT_STATUSES = ['placeholder', 'canonical-entry', 'full-essay'] as const;

const concepts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/concepts' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(CATEGORY_SLUGS),
    category_index: z.number().int().positive(),
    synopsis: z.string(),
    framework_implication: z.string(),
    status: z.enum(CONCEPT_STATUSES),
    references: z.array(z.string()).optional(),
    published_at: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional(),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/categories' }),
  schema: z.object({
    slug: z.enum(CATEGORY_SLUGS),
    singular: z.string(),
    plural: z.string(),
    description: z.string(),
    semantic_intent: z.string(),
    color_token: z.string().optional(),
    glyph: z.string().optional(),
    accent_type: z.string().optional(),
  }),
});

const framework = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/framework' }),
  schema: z.object({
    title: z.string(),
    categories: z.array(z.enum(CATEGORY_SLUGS)),
    anchor_url: z.string(),
  }),
});

export const collections = {
  articles,
  concepts,
  categories,
  framework,
};
