# AGENTS.md

## Sources of truth
- `README.md` is the untouched Astro starter README; do not use it as project documentation.
- This is one Astro 7 package using npm, not a monorepo. Use Node 22.13 to match `dockerfile.prod`.

## Application wiring
- Routes are static `.astro` files under `src/pages/`; blog articles are also standalone pages, not content-collection entries.
- `src/layouts/Layout.astro` owns the shared head, Google Tag Manager, navbar, global CSS, and footer. Page-specific SEO props flow through it to `src/components/BaseHead.astro`.
- The home page is composed from `src/components/home/`; browser behavior stays in component-local `<script>` blocks with direct GSAP/Swiper imports. There are no framework islands.
- Coverage currently has only `src/pages/cobertura.astro`. Its three detail links have no matching routes; do not assume the deleted markdown-driven `[zona]` pages still exist.

## Frontend conventions
- Tailwind CSS v4 is enabled through the Vite plugin in `astro.config.mjs`; there is no `tailwind.config.*` file.
- Theme tokens, custom utilities, and Swiper overrides live in `src/styles/global.css`; it imports local font faces from `fonts.css` and heading rules from `typography.css`.

## Iconography
- Render icons through `astro-icon`; raster files remain acceptable for photos, banners, backgrounds, logos, and illustrations, but not icons.
- `src/icons/*.svg` must be unmodified Tabler Icons with their original kebab-case filenames. Confirm new icon names and paths against current Tabler docs via Context7 before adding them.

## Commands and verification
- Install with `npm install`; run locally with `npm run dev` and preview a built site with `npm run preview`.
- Validate changes in order with `npm run astro -- check`, then `npm run build`.
- No lint or test scripts are defined. CI only exercises the production Docker build.

## Deployment
- `dockerfile.prod` builds static `dist/` with Node 22.13, then serves it from Nginx on port `8080`; `nginx/nginx.conf` and `.k8s/manifest.yaml` must stay aligned with that port.
- `.github/workflows/workflow.yml` builds, pushes, and deploys on both pushes to `main` and pull requests targeting `main`. It updates the existing `website` deployment in namespace `enlaces`; it does not apply `.k8s/manifest.yaml`.
