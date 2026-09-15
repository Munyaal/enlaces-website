## Repository
- This is a single Astro 7 site using npm, not a monorepo. Use Node `22.13.x` to match `dockerfile.prod`.
- `README.md` is the untouched Astro starter README and is not project documentation.

## Structure
- Routes are standalone `.astro` files under `src/pages/`; blog articles are standalone pages, not content-collection entries.
- `src/layouts/Layout.astro` owns the shared SEO head, Google Tag Manager, navbar, global CSS, and footer. Page SEO props are passed to `src/components/BaseHead.astro`.
- The home page is assembled in `src/components/home/`. Client behavior stays in component-local `<script>` blocks, including direct GSAP and Swiper imports; there are no framework islands.
- `src/pages/cobertura.astro` is the only coverage page. Its three detail links currently have no matching routes, so do not recreate or assume dynamic `[zona]` pages.

## Styling And Icons
- Tailwind CSS v4 is enabled through the Vite plugin in `astro.config.mjs`; there is no `tailwind.config.*` file.
- Global theme tokens, custom utilities, and Swiper overrides are in `src/styles/global.css`; it imports `fonts.css` and `typography.css`.
- Use `astro-icon` for icons. Keep the existing kebab-case SVGs in `src/icons/` compatible with their current Tabler icon usage; use raster assets only for imagery, logos, banners, and illustrations.

## Commands
- Install dependencies with `npm install`.
- Run the site with `npm run dev`; preview a production build with `npm run preview`.
- Verify changes in this order: `npm run astro -- check`, then `npm run build`.
- There are no lint or test scripts in `package.json`; the production Docker build is the CI build check.

## Deployment
- `dockerfile.prod` builds static `dist/` with Node `22.13.0`, then serves it with Nginx on port `8080`. Keep `nginx/nginx.conf` and `.k8s/manifest.yaml` consistent with that port.
- `.github/workflows/workflow.yml` runs on pushes and pull requests targeting `main`, builds and pushes the Docker image, then updates the existing `website` deployment in namespace `enlaces`. It does not apply `.k8s/manifest.yaml`.
