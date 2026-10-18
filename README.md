# AKDworks

Source code for [akdworks.com](https://akdworks.com), built with React and Vite.

The homepage contains a Vanta CLOUDS2 background, an avatar, and GitHub and email
links. Scroll down to find Vokeyra and AKD Image on a solid background.

Project content and links are in `src/components/Projects.jsx`. Profile links
are in `src/components/ProfileLinks.jsx`. Images are in `src/assets/`.

## Local development

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

The build output is `dist/`.

## Deployment

The production source is the `main` branch. `vercel.json` specifies the Vite
framework, `npm ci`, `npm run build`, and the `dist/` output directory. A Vercel
project connected to this repository can deploy new pushes to `main`.

The old Works, About, and Contact HTML pages have been removed. Their previous
URLs redirect to the corresponding section or the homepage.

## Background

Settings are in `src/components/CloudsBackground.jsx`. Speed is `0.5`; colors match the selected Vanta demo. The noise texture is hosted locally, so the background does not rely on a runtime CDN.

`CloudsBackground` stays mounted above the page sections, so scrolling to Projects
preserves the same canvas and animation. Full document reloads restart it.

Animation pauses when the browser tab is hidden. Reduced-motion preferences display a still frame. If WebGL is unavailable, a static sky gradient remains visible.

See `THIRD_PARTY_NOTICES.md` for background attribution.
