# HAS Design — Brand

The HAS Design wordmark, committed as a portable SVG asset so it can be linked
from anywhere (other repos, READMEs, slide decks, articles).

## Files

- `logo.svg` — `#111` fill on transparent. Use on light backgrounds.
- `logo-light.svg` — `#FFFFFF` fill on transparent. Use on dark backgrounds.

Both share the same `viewBox="0 30 305 120"` and scale cleanly at any size.

## Reference from another GitHub project

Use the `raw.githubusercontent.com` URL so the SVG renders inline:

```markdown
![HAS Design](https://raw.githubusercontent.com/chadbercea/human-agent-system-design-blog/main/public/brand/logo.svg)
```

For READMEs that need to adapt to GitHub's light/dark theme, use `<picture>`:

```html
<picture>
  <source media="(prefers-color-scheme: dark)"
          srcset="https://raw.githubusercontent.com/chadbercea/human-agent-system-design-blog/main/public/brand/logo-light.svg">
  <img src="https://raw.githubusercontent.com/chadbercea/human-agent-system-design-blog/main/public/brand/logo.svg"
       alt="HAS Design" width="305">
</picture>
```

## Reference from this site

Both files are served from `/brand/` at runtime, e.g. `/brand/logo.svg`.

## Source of truth

The geometry mirrors the inline bar/clip-path logo used across the site
(`src/components/SiteHeader.astro`, `src/pages/index.astro`,
`src/styles/design-system.css`). If the brand mark changes, update those
sources and regenerate these SVGs from the same coordinates.
