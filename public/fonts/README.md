# Fonts

Drop your custom font files here.

## Setup

1. Add your font file (`.woff2` recommended, `.woff` or `.ttf` also work)
2. In `src/style.css`, add a `@font-face` declaration:

```css
@font-face {
  font-family: 'YourFontName';
  src: url('/fonts/your-font.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

3. In `src/pptx.js`, update the `fontFace` values on punch sequence and name text elements
   to match the font name you registered.

## Notes
- `.woff2` is the most efficient format for web use
- The font will be served by Vercel as a static asset
- Vite bundles everything in `public/` automatically — no extra config needed
