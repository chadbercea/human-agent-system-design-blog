/* Hand-curated map: concept slug → article slugs that engage with it.
   Inverse of the killed unlock mechanic — concepts surface the writing.
   Keep curation editorial; keys must match glossary entry slugs in
   src/pages/glossary.astro, values must match article slugs in
   src/content/articles/. Unknown slugs are dropped silently at render. */

export const conceptReferences: Record<string, string[]> = {
  'different-not-lesser': [],
  'bilateral-non-reducibility': [],
  'asymmetry-of-choice': [],
  'entity-classification': [],
  'co-authored-epistemology': ['hello-world'],
  'gradient-descent-problem': [],
  'mirroring-constraint': [],
  'spiral-detection-problem': [],
  'agency-without-alternatives': [],
  'adversarial-interdependence': [],
  'availability-function': [],
  'self-editing-corrosion-prevention': [],
  'third-orientation': [],
};
