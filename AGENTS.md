# AGENTS.md

Static marketing site for **Enlaces Playa** (ISP, Riviera Maya / Quintana Roo,
Mexico). Astro 7 + Tailwind v4 + TypeScript. No backend, no auth, no test suite.

## Commands

```sh
npm install            # npm only — package-lock.json, no other lockfile
npm run dev            # dev server, localhost:4321
npm run build          # static output -> ./dist/
npm run preview        # serve the built dist/
npx astro check        # typecheck (astro check); 0 errors at time of writing
```

There is **no linter, formatter, or test runner** — don't look for
`npm run lint` / `npm test`, they don't exist. `astro check` + `npm run build`
is the entire verification story; run both before claiming a change works.

`astro check` generates `.astro/types.d.ts` itself, so there is no separate
codegen step and no pre-build task to run first.

## Architecture

- **Static output only.** Every page is prerendered. Never add server
  endpoints, SSR adapters, middleware, or a database.
- **Routes** (`src/pages/`, one file per route): `/`, `/internet-hogar`,
  `/internet-empresas`, `/cobertura`, `/nosotros`, `/ayuda`, `/contacto`,
  `/blog`, `/blog/[slug]`, `/preguntas-frecuentes`, `/terminos-y-condiciones`,
  `/aviso-de-privacidad`, `/politica-de-cookies`.
  `blog/[slug].astro` is the only dynamic route (`getStaticPaths` over the
  content collection).
- **Components** (`src/components/`), split by page area:
  - `layout/` — `Navbar`, `Footer`, `BaseHead`, GTM, plus the footer-column
    helpers `HyperlinksSection` / `CustomerServiceHyperlinks`.
  - `ui/` — shared primitives: `Button`, `CTAButton`, `PhoneCTAButton`,
    `Container`, `PageHero`, `SectionHeading`, `SectionDivider`.
  - `home/` is two levels deep: `sections/` (page blocks), `cards/`, `forms/`.
  - `about/`, `blog/`, `internet-hogar/` — one folder per page area.
- **`src/layouts/Layout.astro`** is the only page shell (Navbar + `<main>` +
  Footer + GTM). Props: `title` (required), `description`, `keywords`.
  `BaseHead.astro` reads `SITE_URL` from `data/seo.ts` and builds the canonical
  URL from the request path; **OG/Twitter copy, image + type are hardcoded
  site-wide** (also in `data/seo.ts`), so per-page SEO work happens in JSON-LD,
  not meta tags.
- **`src/data/`** holds hardcoded content, nested by area:
  `data/home/{benefits,companies,plans}.ts`,
  `data/internet-hogar/{plans,faqs}.ts`, `data/testimonials.ts`.
  Cross-cutting data lives at the root: `site.ts` (marca, contacto, canales),
  `seo.ts` (URLs, defaults, nodos JSON-LD), `navigation.ts` (`NAV_URLS` /
  `NAV_LINKS` / CTA) and `footer.ts` (columnas, portal, legal).
  Content changes belong here, not inline in `.astro`.

### Two `plans.ts` files, two different contracts

`data/home/plans.ts` is the home teaser (2 cards, prices as display strings,
`PlanKind = "hogar" | "empresarial"`). `data/internet-hogar/plans.ts` is the
real tariff (fibra/inalámbrico groups, `prontoPago`/`precioRegular`/`instalacion`).
Editing one does not update the other.

`data/internet-hogar/faqs.ts` also feeds the page's `FAQPage` JSON-LD, so
visible copy and structured data cannot drift — edit the data, not the markup.

### Images: `src/assets/` vs `public/`

- **`src/assets/images/<area>/`** is the default. Import the file and render it
  with `Image` from `astro:assets` (hashed, optimized, needs `ImageMetadata`).
- **`public/`** is only for paths that must stay stable strings: `/fonts`
  (self-hosted `@font-face`), `/images/logos/*` (used by `companies.ts` and
  JSON-LD), `favicon.ico`, `banner-enlaces-playa.webp`, `llms.txt`.

### Module boundary: `astro:content` never enters the client bundle

`src/utils/blog.ts` imports `astro:content`, so it is **server-only**. Anything
imported by a client `<script>` (e.g. `BlogExplorer.astro`) must come from
`src/utils/blog-filter.ts` instead. This split is deliberate — keep it.

Other `src/utils/` modules: `reveal.ts` (animation), `bold-text.ts`
(`parseBoldSegments`), `helpers.ts` (`sanitizePhone`, used by `data/site.ts` to
derive `tel:` hrefs).

## Content Collections (blog)

Schema lives in `src/content.config.ts` (glob loader over `src/content/blog/**/*.md`,
Zod-validated at build — malformed frontmatter **fails the build**). There is
currently exactly one post, `internet-para-casa.md`.

Required frontmatter: `title`, `description`, `keywords`, `category`, `summary`,
`datePublished`, `dateModified`, `cta {label, href}`. `displayTitle` is optional
and overrides the visible heading.

Gotchas:
- `title` doubles as the SEO `<title>` and commonly ends with `| Enlaces Playa`.
  The visible heading strips that suffix via `resolveDisplayTitle()` unless
  `displayTitle` is set.
- Dates use `z.coerce.date()` → midnight UTC. **All date formatting pins
  `timeZone: "UTC"`** (`formatBlogDate`/`toIsoDate` in `src/utils/blog.ts`).
  Don't switch to a local-time formatter — it shows the previous day in
  timezones west of UTC.
- The URL slug is `post.id`, i.e. the filename without extension. Renaming a
  file **changes the URL** and breaks links in `public/llms.txt`.
- The client-side search index is built at SSR (`buildSearchText`) and
  serialized into `data-search`; matching happens on normalized text
  (`lowercase`, NFD, no accents). Keep `normalizeQuery` in `blog-filter.ts` in
  sync with it or search silently stops matching.

## Animations (`src/utils/reveal.ts`)

Single entry point for all scroll/entry animation. Rules that are easy to break:

- Animate only `opacity` and `transform` (`y`, and the hero Ken Burns `scale`).
  Never layout properties.
- `prefers-reduced-motion: reduce` ⇒ nothing is hidden and nothing animates.
  **There is no CSS initial hidden state** — the `opacity: 0` comes from JS
  (`gsap.set`), so content is visible without JS.
- Scoped: a reveal requires a `data-reveal-scope="<name>"` ancestor and targets
  `[data-reveal]` inside it. Missing/mistyped scope = console warning + no
  animation (fail-closed, never falls back to `document`).
- Presets are the only source of `y`/`duration`/`stagger` (`hero`, `section`,
  `list`) — never pass raw numbers from a component.
- Use `revealSection(scope, preset)`, `revealHero(scope)`, `ambientZoom({scope})`,
  `countUp(...)` from a component `<script>`; `whenReady(fn)` wraps DOM-ready
  logic.
- Don't call `mm.revert()` manually — `gsap.matchMedia()` reverts its own
  contexts, and a manual `revert()` causes infinite recursion.
- `revealNow()` exists for content shown by client-side logic after the reveal
  already applied its hidden state (blog filtering). Use it, or the element
  stays invisible.

## Styling (Tailwind v4, CSS-first)

- **No `tailwind.config.js`.** Config lives in `src/styles/global.css` under
  `@theme inline`. Tokens: `primary`, `primary-on-light`, `secondary`, `accent`,
  `surface-1`, `light`, `dark`, `line`, `font-sans` (Poppins), `font-display`
  (SkolaSans).
- Custom utilities are declared with `@utility` (see `src/styles/typography.css`
  for `heading-1..6` and `paragraph-xs..lg`, `src/styles/global.css` for
  `bg-accent-grad-t` / `bg-accent-grad-radial`). Use these typography utilities
  instead of ad-hoc `text-*` sizes on headings/body.
- Files are split: `global.css` (tokens + swiper overrides + `.article-body`
  styles), `fonts.css` (`@font-face`, self-hosted from `/public/fonts/`),
  `typography.css` (type scale). `global.css` is the entry; import order matters.
- Shared button classes are constants in `src/components/ui/button-styles.ts`,
  consumed by `Button`/`CTAButton`/`PhoneCTAButton`. Use the components rather
  than re-writing button utility strings inline.
- Duration scale used across the site: **150 ms** (text color/hover), **200 ms**
  (buttons/controls), **300 ms** (surfaces/shadows), **8 s** (hero Ken Burns).
- `Container`'s extra `class` prop is appended, so it does **not** reliably
  override base utilities (e.g. `py-0` won't beat `py-10`) — Tailwind's output
  order wins, not the string order.
- A generic `tailwind-design-system` skill is vendored in `.agents/skills/`
  (tracked in `skills-lock.json`). Its advice is generic: the project's tokens
  and `@utility` scale above win.

## Component APIs (mismatched prop sets)

The three button components do **not** share a prop surface — passing the wrong
one fails `astro check`:

| Component | `variant` | `size` |
| --- | --- | --- |
| `Button` | `orange` (default) \| `navy` | `sm` \| `md` \| `lg` |
| `CTAButton` | `solid` (default) \| `navy` \| `orange` | `sm` \| `md` only |
| `PhoneCTAButton` | none | none |

`Button` and `CTAButton` take `as="a" | "button"`, and `as="a"` requires
`href`. `PhoneCTAButton` is always an `<a>` and takes `label` / `phone` /
`href` instead of `variant`/`size`.

## Conventions

- **All copy, code comments, and content are in Spanish.** Keep it that way.
- Components carry a block comment at the top explaining *why* the structure is
  what it is (design decisions, constraints, past regressions). Match this: the
  codebase's value is in the rationale, not just the code.
- Prefer small presentational components + a data array over long inline markup
  in a page.
- **`set:html` is reserved for JSON-LD**, always as
  `JSON.stringify(x).replace(/</g, "\\u003c")`. Visible copy is rendered from
  typed fragments instead (`parseBoldSegments` for `**bold**`, plain
  `{texto, href}` objects for FAQ answers). Don't introduce HTML strings.
- Icons come from `src/icons/` (24 local SVGs) via `<Icon name="..."/>` —
  don't add a new icon library or a `customDir`.

## Known broken links (do not "fix" by creating pages)

Several internal links point at routes that do not exist. This is known state,
not a task list; the instruction is to fix `href`s when you touch that file, and
not to invent pages to satisfy them.

- `src/pages/cobertura.astro`: `zonas` links to
  `/cobertura/playa-del-carmen`, `/cobertura/tulum`, `/cobertura/puerto-morelos`
  — none of these files exist.
- `public/llms.txt` advertises `/soporte-tecnico`, `/pagos-facturacion`,
  `/iniciar-sesion` and two blog posts that don't exist. Treat it as
  hand-maintained copy, **not** a route inventory.

## Deploy

Push or PR to `main` → `.github/workflows/workflow.yml` builds `dockerfile.prod`
(node 22.13 alpine → nginx 1.28 alpine serving `dist/` on port **8080**) →
pushes `registry.digitalocean.com/munyaal-docr/enlaces/website:<sha7>` →
`kubectl set image` + label patch + `rollout status` on deployment `website`
in namespace `enlaces`.

- The image tag is the first 7 chars of the commit SHA; the deployment is also
  patched with an `app.kubernetes.io/version` label.
- `.k8s/manifest.yaml` is the checked-in baseline (Deployment/Service/Ingress
  for host `enlaces.munyaal.com.mx`, TLS secret `munyaal-com-mx-tls`).
- `nginx/nginx.conf` is **minimal**: no SPA rewrite, `try_files $uri
  $uri/index.html =404`, and `error_page 404 /404.html`. Astro does not emit
  `404.html` (no `404.astro` exists), so unmatched routes fall back to nginx's
  default 404 body.
- `dockerfile.prod` is a typo'd filename (not `Dockerfile`); CI references it
  explicitly via `-f dockerfile.prod`. It runs `npm install` (not `npm ci`),
  then `npm ci -f --only=production` before copying `dist/`.
- No CI lint/typecheck step — only build + deploy. `astro check` is your job.

## Other notes

- `README.md` is still the upstream Astro starter-kit boilerplate and is
  inaccurate for this project; ignore it.
- Los teléfonos son **distintos por canal** y viven en `src/data/site.ts`
  (`CANALES`, cada uno con su `label`): `984 184 5726` (`TELEFONO_PRINCIPAL`,
  CTAs comerciales y JSON-LD), `984 109 1111` (atención telefónica),
  `984 144 0714` (atención a clientes) y `984 116 3005` (soporte, local a
  `data/internet-hogar/faqs.ts`). **No** normalizarlos a un solo número.
- El mapa de rutas del navbar vive en `data/navigation.ts` (`NAV_URLS`,
  `NAV_LINKS`, `NAV_CTA`); `Navbar.astro` solo conserva `isActive()`.
- `dist/` and `.astro/` are gitignored build artifacts; never edit them.
- `opencode.jsonc` is present but only sets `$schema` — project instructions
  live in this file.
