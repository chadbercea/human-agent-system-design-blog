import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type CategorySlug = 'axioms' | 'constraints' | 'design-requirements';
export type ConceptStatus = 'placeholder' | 'canonical-entry' | 'full-essay';

export type Concept = CollectionEntry<'concepts'>;
export type Category = CollectionEntry<'categories'>;
export type FrameworkRoot = CollectionEntry<'framework'>;

export interface CategoryWithMembers extends Category {
  member_count: number;
  members: Concept[];
}

let validatedPromise: Promise<void> | null = null;

async function ensureValidated(): Promise<void> {
  if (validatedPromise) return validatedPromise;
  validatedPromise = (async () => {
    const [concepts, categories] = await Promise.all([
      getCollection('concepts'),
      getCollection('categories'),
    ]);

    const conceptSlugs = new Set(concepts.map((c) => c.id));
    const categorySlugs = new Set(categories.map((c) => c.data.slug));

    for (const concept of concepts) {
      if (!categorySlugs.has(concept.data.category)) {
        throw new Error(
          `[has-framework] Concept "${concept.id}" declares category "${concept.data.category}" which is not registered in src/content/categories.`,
        );
      }
      for (const ref of concept.data.references ?? []) {
        if (!conceptSlugs.has(ref)) {
          throw new Error(
            `[has-framework] Concept "${concept.id}" references unknown concept slug "${ref}".`,
          );
        }
      }
    }

    const seen = new Map<string, string>();
    for (const concept of concepts) {
      const key = `${concept.data.category}:${concept.data.category_index}`;
      const prior = seen.get(key);
      if (prior) {
        throw new Error(
          `[has-framework] Duplicate category_index ${concept.data.category_index} in "${concept.data.category}": "${prior}" and "${concept.id}".`,
        );
      }
      seen.set(key, concept.id);
    }
  })();
  return validatedPromise;
}

export async function getAllConcepts(): Promise<Concept[]> {
  await ensureValidated();
  return getCollection('concepts');
}

export async function getConceptBySlug(slug: string): Promise<Concept | undefined> {
  await ensureValidated();
  return getEntry('concepts', slug);
}

export async function getAllCategories(): Promise<Category[]> {
  await ensureValidated();
  const cats = await getCollection('categories');
  const order: CategorySlug[] = ['axioms', 'constraints', 'design-requirements'];
  return [...cats].sort((a, b) => order.indexOf(a.data.slug) - order.indexOf(b.data.slug));
}

export async function getCategoryBySlug(slug: CategorySlug): Promise<CategoryWithMembers | undefined> {
  await ensureValidated();
  const cats = await getCollection('categories');
  const cat = cats.find((c) => c.data.slug === slug);
  if (!cat) return undefined;
  const concepts = await getCollection('concepts');
  const members = concepts
    .filter((c) => c.data.category === slug)
    .sort((a, b) => a.data.category_index - b.data.category_index);
  return { ...cat, member_count: members.length, members };
}

export async function getReferencedBy(slug: string): Promise<Concept[]> {
  await ensureValidated();
  const concepts = await getCollection('concepts');
  return concepts.filter((c) => c.data.references?.includes(slug));
}

export async function getFramework(): Promise<FrameworkRoot | undefined> {
  await ensureValidated();
  const entries = await getCollection('framework');
  return entries[0];
}
