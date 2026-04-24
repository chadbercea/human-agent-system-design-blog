import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site =
  process.env.PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4321');

// Monochrome Shiki theme — reads as telemetry printout, not a rainbow IDE.
// Only uses --white / --light / --mid / --dim. Weight differentiates tokens.
const hasTerminalTheme = {
  name: 'has-terminal',
  type: 'dark',
  colors: {
    'editor.background': '#050506',
    'editor.foreground': '#c4c4c6',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#5a5a5c' } },
    {
      scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator.new'],
      settings: { foreground: '#ffffff', fontStyle: 'bold' },
    },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#c4c4c6' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: '#c4c4c6' } },
    { scope: ['variable', 'variable.other', 'variable.parameter'], settings: { foreground: '#c4c4c6' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#c4c4c6' } },
    { scope: ['entity.name.class', 'entity.name.type', 'support.class', 'support.type'], settings: { foreground: '#c4c4c6' } },
    { scope: ['punctuation', 'meta.brace', 'meta.delimiter'], settings: { foreground: '#8a8a8c' } },
    { scope: ['entity.name.tag', 'entity.other.attribute-name'], settings: { foreground: '#c4c4c6' } },
    { scope: ['meta.property-name', 'support.type.property-name'], settings: { foreground: '#c4c4c6' } },
  ],
};

export default defineConfig({
  site,
  integrations: [sitemap()],
  devToolbar: { enabled: !process.env.ASTRO_TEST },
  markdown: {
    shikiConfig: {
      theme: hasTerminalTheme,
      wrap: false,
    },
  },
});
