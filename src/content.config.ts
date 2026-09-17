/**
 * src/content.config.ts
 *
 * Define la colección `blog` usando la Content Layer API de Astro 7.
 *
 * - `loader`: `glob` carga archivos Markdown (`.md`) desde `./src/content/blog`.
 *   Markdown nativo, sin MDX, sin base de datos, sin CMS.
 * - `schema`: Zod valida el frontmatter de cada artículo en build/dev. Si un
 *   archivo no cumple el contrato, Astro falla al compilar.
 *
 * Decisiones de diseño:
 *   - El frontmatter incluye todos los campos SEO que antes vivían inline en
 *     los `.astro` (title, description, keywords, datePublished/dateModified)
 *     para que el contenido sea la única fuente de verdad.
 *   - `category` modela el "kicker" (p. ej. "Guía") que aparece arriba del H1.
 *   - `summary` es el texto que se usa en la tarjeta del listado `/blog`.
 *   - `cta` modela el botón del pie del artículo para mantenerlo declarativo.
 */
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    // Título visible (H1/H3 de tarjeta) sin el sufijo SEO de marca.
    // Opcional: si se omite, `resolveDisplayTitle` lo deriva de `title`
    // eliminando un sufijo `| Enlaces Playa` al final, dejando el
    // comportamiento previo intacto cuando no hay override explícito.
    displayTitle: z.string().optional(),
    description: z.string(),
    keywords: z.string(),
    category: z.string(),
    summary: z.string(),
    // `z.coerce.date()` acepta strings ISO (YYYY-MM-DD) y los convierte a Date.
    datePublished: z.coerce.date(),
    dateModified: z.coerce.date(),
    cta: z.object({
      label: z.string(),
      href: z.string(),
    }),
  }),
});

export const collections = { blog };