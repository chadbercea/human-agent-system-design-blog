/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-human)'],
        mono: ['var(--font-system)'],
        serif: ['var(--font-editorial)'],
      },
    },
  },
};
