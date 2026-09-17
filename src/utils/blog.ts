/**
 * src/utils/blog.ts
 *
 * Helpers compartidos por las páginas y componentes que consumen la
 * Content Collection `blog`. Concentrar la lógica aquí evita duplicar
 * reglas en `src/pages/blog.astro` y `src/pages/blog/[slug].astro`.
 */
import type { CollectionEntry } from "astro:content";

// Sufijo SEO de marca que el frontmatter añade al final de `title` (p. ej.
// "... | Enlaces Playa"). Se acepta cualquier espacio alrededor de la
// barra y se normaliza el case para no fallar por mayúsculas/minúsculas.
const BRAND_SUFFIX_RE = /\s*\|\s*Enlaces Playa\s*$/i;

/**
 * Devuelve el título que debe mostrarse al usuario (H1 del artículo y
 * H3 de la tarjeta del listado).
 *
 * Prioridad:
 *   1. `post.data.displayTitle`, si está definido y no queda vacío tras
 *      trim. Permite controlar el heading sin tocar el `<title>` SEO.
 *   2. `post.data.title` sin un sufijo `| Enlaces Playa` al final, para
 *      que las entradas existentes —cuyo frontmatter usa el mismo
 *      `title` para SEO y heading— sigan mostrando un título visible
 *      limpio sin perder el sufijo en la meta.
 *   3. Si nada coincide, se devuelve `post.data.title` tal cual.
 */
export const resolveDisplayTitle = (post: CollectionEntry<"blog">): string => {
  const override = post.data.displayTitle?.trim();
  if (override) return override;
  return post.data.title.replace(BRAND_SUFFIX_RE, "").trim();
};

