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

/**
 * Elimina la sintaxis Markdown para dejar texto plano apto para
 * búsquedas. Es una normalización deliberadamente laxa: lo que
 * necesitamos es que una coincidencia en el cuerpo sea localizable,
 * no reconstruir el HTML. Mantiene el texto visible tal como lo lee
 * una persona (palabras separadas por espacios) y descarta ruido
 * estructural (marcadores, fences, URLs de imágenes/links).
 */
const stripMarkdown = (body: string): string =>
  body
    // Bloques de código (fenced): conservamos el contenido por si
    // alguien cita un comando en el cuerpo del artículo.
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?|```/g, ""))
    // Imágenes `![alt](url)` → alt.
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Enlaces `[texto](url)` → texto.
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Marcadores de headings, blockquote y listas al inicio de línea.
    .replace(/^[#>\-\*\+]+\s+/gm, "")
    // Marcadores de ordered list `1.`, `2.`, etc.
    .replace(/^\d+\.\s+/gm, "")
    // Énfasis: negrita, cursiva, combinaciones con/sin espacios.
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Tachado ~~texto~~ → texto.
    .replace(/~~(.*?)~~/g, "$1")
    // Código inline `code` → code.
    .replace(/`([^`]+)`/g, "$1")
    // HTML embebido: conservamos el texto interior.
    .replace(/<[^>]+>/g, " ")
    // Reglas horizontales (`---`, `***`).
    .replace(/^[-*_]{3,}\s*$/gm, " ")
    // Colapsa whitespace.
    .replace(/\s+/g, " ")
    .trim();

/**
 * Construye el texto plano e indexable de un post para búsqueda
 * client-side. Se concatena el frontmatter completo y el cuerpo
 * Markdown saneado, separado por espacios, para que cualquier match
 * —ya sea en título, resumen, descripción, keywords, categoría o
 * cuerpo— se localice con un único `includes`.
 *
 * El resultado se calcula en SSR (Astro frontmatter) y se serializa
 * como `data-search` en cada `<li>`; el script de cliente lo lee tal
 * cual, así que normalizar (lowercase + sin acentos) aquí evita
 * duplicar trabajo en el navegador y mantiene el contrato
 * client-side barato.
 */
export const buildSearchText = (post: CollectionEntry<"blog">): string => {
  const parts = [
    post.data.title,
    post.data.displayTitle ?? "",
    post.data.summary,
    post.data.description,
    post.data.keywords,
    post.data.category,
    stripMarkdown(post.body ?? ""),
  ];
  return parts
    .filter((p) => p && p.length > 0)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

