# AGENTS.md

Static marketing site for **Enlaces Playa** (ISP, Riviera Maya / Quintana Roo, Mexico).
Astro 7 + Tailwind v4 + TypeScript. No backend, no auth, no test suite.

## Commands

```sh
npm install
npm run dev        # dev server, localhost:4321
npm run build      # static output -> ./dist/
npm run preview    # serve the built dist/
npm run astro -- check   # typecheck (astro check); currently 0 errors
```

There is **no linter, formatter, or test runner** in this repo — don't look for
`npm run lint` / `npm test`, they don't exist. `astro check` is the only
verification step; run it plus `npm run build` before claiming a change works.

## Architecture

- **Static output only.** Every page is prerendered at build time. Never add
  server endpoints, SSR, or a database.
- **`src/pages/`** = one file per route. `blog/[slug].astro` is the only dynamic
  route (via `getStaticPaths` over the content collection).
- **`src/components/`** = presentational, split by area: `layout/`, `ui/`,
  `home/`, `about/`, `blog/`. `ui/` holds the shared primitives (`Button`,
  `Container`, `PageHero`, `SectionHeading`, `CTAButton`, `PhoneCTAButton`).
- **`src/layouts/Layout.astro`** = the only page shell (Navbar + `<main>` +
  Footer + GTM). It takes `title` (required), `description`, `keywords`.
  `BaseHead.astro` supplies canonical URL + OG/Twitter tags; **OG/Twitter tags
  are hardcoded site-wide**, per-page JSON-LD is the per-page SEO hook.
- **`src/data/`** = hardcoded content arrays (plans, benefits, companies,
  testimonials). This is where content changes belong — not inline in `.astro`.
- **`src/utils/`** = shared logic: `reveal.ts` (GSAP animation), `blog.ts`
  (content-collection helpers), `blog-filter.ts` (pure filter/pagination).
- **`src/content/blog/*.md`** = blog posts (Content Layer API, see below).
- **`src/icons/*.svg`** = local icon set. `astro-icon`'s `<Icon name="..."/>`
  resolves against `src/icons/` by default (no `customDir` configured).
  SVGs can also be imported directly (`import IconArrowRight from "...svg"`).

### Module boundary: `astro:content` never enters the client bundle

`src/utils/blog.ts` imports `astro:content`, so it is **server-only**. Anything
imported by a client `<script>` (e.g. `BlogExplorer.astro`) must come from
`src/utils/blog-filter.ts` instead. This split is deliberate — keep it.

## Content Collections (blog)

Schema lives in `src/content.config.ts` (glob loader over `src/content/blog/**/*.md`,
Zod-validated at build — a malformed frontmatter **fails the build**).

Required frontmatter fields: `title`, `description`, `keywords`, `category`,
`summary`, `datePublished`, `dateModified`, `cta {label, href}`.
`displayTitle` is optional and overrides the visible heading.

Gotchas:
- `title` doubles as the SEO `<title>` and commonly ends with `| Enlaces Playa`.
  The visible heading strips that suffix via `resolveDisplayTitle()` unless
  `displayTitle` is set.
- Dates use `z.coerce.date()` → midnight UTC. **All date formatting pins
  `timeZone: "UTC"`** (`formatBlogDate`/`toIsoDate` in `src/utils/blog.ts`).
  Don't switch to a local-time formatter — it shows the previous day in
  timezones west of UTC.
- The slug is the filename without extension. Renaming a file **changes the URL**.

## Animations (`src/utils/reveal.ts`)

Single entry-point for all scroll/entry animation. Rules that are easy to break:

- Animate only `opacity` and `transform` (`y`, and the hero Ken Burns `scale`).
  Never layout properties.
- `prefers-reduced-motion: reduce` ⇒ nothing is hidden and nothing animates.
  **There is no CSS initial hidden state** — the `opacity: 0` comes from JS
  (`gsap.set`), so content is visible without JS.
- Scoped: a reveal requires a `data-reveal-scope="<name>"` ancestor and targets
  `[data-reveal]` inside it. Missing scope = warning + no animation (fail-closed,
  never falls back to `document`).
- Presets are the only source of `y`/`duration`/`stagger` (`hero`, `section`,
  `list`) — never pass raw numbers from a component.
- Use `revealSection(scope, preset)`, `revealHero(scope)`, `ambientZoom({scope})`
  from a component `<script>`; `whenReady(fn)` wraps DOM-ready logic.
- Don't call `mm.revert()` manually — `gsap.matchMedia()` reverts its own
  contexts, and a manual `revert()` causes infinite recursion.
- `revealNow()` exists for content shown by client-side logic after the reveal
  already applied its hidden state (blog filtering). Use it, or the element
  stays invisible.

## Styling (Tailwind v4, CSS-first)

- **No `tailwind.config.js`.** Config lives in `src/styles/global.css` under
  `@theme inline`. Tokens: `primary`, `primary-on-light`, `secondary`, `accent`,
  `surface-1`, `light`, `dark`, `line`, `font-sans` (Poppins), `font-display` (SkolaSans).
- Custom utilities are declared with `@utility` (see `src/styles/typography.css`
  for `heading-1..6` and `paragraph-xs..lg`, `src/styles/global.css` for
  `bg-accent-grad-t` / `bg-accent-grad-radial`). Use these typography utilities
  instead of ad-hoc `text-*` sizes on headings/body.
- Files are split: `global.css` (tokens + swiper overrides + article/blog
  styles), `fonts.css` (`@font-face`, self-hosted from `/public/fonts/`),
  `typography.css` (type scale). Import order matters; `global.css` is the entry.
- Shared button classes are constants in `src/components/ui/button-styles.ts`,
  consumed by `Button`/`CTAButton`/`PhoneCTAButton`. Use the components rather
  than re-writing button utility strings inline.
- Duration scale used across the site: **150 ms** (text color/hover), **200 ms**
  (buttons/controls), **300 ms** (surfaces/shadows), **8 s** (hero Ken Burns).
- `Container`'s extra `class` prop is appended, so it does **not** reliably
  override base utilities (e.g. `py-0` won't beat `py-10`) — Tailwind's output
  order wins, not the string order.

## Conventions

- **All copy, code comments, and content are in Spanish.** Keep it that way.
- Components carry a block comment at the top explaining *why* the structure is
  what it is (design decisions, constraints, past regressions). Match this:
  the codebase's value is in the rationale, not just the code.
- Prefer small presentational components + a data array over long inline
  markup in a page.
- Buttons use `variant="orange" | "navy"` and `size="sm" | "md" | "lg"`.
  `as="a"` requires `href`.
- Icons come from `src/icons/` — don't add a new icon library.

## Deploy

Push/PR to `main` → `.github/workflows/workflow.yml` builds `dockerfile.prod`
(node 22 alpine → nginx alpine serving `dist/` on port **8080**) → pushes to
DigitalOcean Container Registry → `kubectl set image` + rollout on the
`enlaces` namespace.

- The image tag is the first 7 chars of the commit SHA; the k8s deployment is
  patched with an `app.kubernetes.io/version` label.
- `.k8s/manifest.yaml` is the checked-in baseline (Deployment/Service/Ingress
  for host `enlaces.munyaal.com.mx`, TLS secret `munyaal-com-mx-tls`).
- `nginx/nginx.conf` is a **minimal** config: no SPA rewrite, `try_files $uri
  $uri/index.html =404`, and `error_page 404 /404.html` — but Astro does not
  emit a `404.html`, so unmatched routes return nginx's own 404.
- `dockerfile.prod` is a typo'd filename (not `Dockerfile`) and the CI workflow
  references it explicitly as `-f dockerfile.prod`.
- No CI lint/typecheck step — only build + deploy. `astro check` is your job.

## Other notes

- `README.md` is still the upstream Astro starter-kit boilerplate and is
  inaccurate for this project; ignore it.
- `public/llms.txt` is hand-maintained site copy for LLM crawlers — update it
  when services or routes change.
- Phone/WhatsApp number is `984 184 5726`; `src/utils/constants.ts` holds the
  WhatsApp link, `Navbar.astro` holds the nav URL map.
- `dist/` and `.astro/` are gitignored build artifacts; never edit them.
- **Dead links are known and intentional-ish:** `Footer.astro` still points most
  links at `href="#"` even though the target pages exist
  (`/internet-hogar`, `/internet-empresas`, `/preguntas-frecuentes`,
  `/terminos-y-condiciones`, `/aviso-de-privacidad`, `/cobertura/...` — the
  last group has no matching route files). Fix the `href`s if you touch the
  Footer; don't create pages to satisfy them.
