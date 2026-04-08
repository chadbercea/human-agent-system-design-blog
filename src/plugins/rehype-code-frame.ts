import { visit } from 'unist-util-visit';

export function rehypeCodeFrame() {
  return (tree: any) => {
    visit(tree, 'element', (_node: any) => {
      // Stripped — code blocks now styled directly via .prose pre in prose.css.
      // This plugin is a no-op placeholder; remove when ready.
    });
  };
}
