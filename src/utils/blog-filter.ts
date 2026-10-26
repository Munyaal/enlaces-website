/**
 * src/utils/blog-filter.ts
 *
 * Reglas puras del filtrado/paginación del listado del blog. No tocan el
 * DOM: reciben datos y devuelven datos, para que el script de cliente
 * sólo se encargue de leer atributos y pintar el resultado.
 */

/** Tamaño de página fijo de la paginación client-side. */
export const POSTS_PER_PAGE = 12;

/**
 * Cuenta de artículos con concordancia singular/plural. Se usa tanto en
 * SSR como en el filtrado client-side para que el contador nunca diga
 * "1 artículos".
 *
 * Vive aquí —y no en `blog.ts`— porque `blog.ts` importa `astro:content`
 * y ese módulo no puede entrar en el bundle de cliente.
 */
export const formatArticleCount = (count: number): string =>
  `${count} ${count === 1 ? "artículo" : "artículos"}`;

export interface BlogFilterState {
  category: string;
  query: string;
  page: number;
}

/**
 * Normaliza la consulta igual que `buildSearchText`: trim, lowercase,
 * sin diacríticos y con los espacios internos colapsados a uno solo,
 * para comparar 1:1 contra `data-search`.
 */
export const normalizeQuery = (query: string): string =>
  query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

/**
 * Indica si un artículo pasa el filtro de categoría y de búsqueda.
 *
 * Contrato: `filters.query` debe venir ya normalizada con
 * `normalizeQuery`. Así el llamador normaliza una sola vez por tecleo
 * en lugar de una vez por artículo.
 */
export const matchesFilters = (
  item: { category: string; searchText: string },
  filters: { category: string; query: string },
): boolean => {
  const matchesCategory =
    filters.category === "all" || item.category === filters.category;
  if (!matchesCategory) return false;

  if (!filters.query) return true;

  return item.searchText.includes(filters.query);
};

/**
 * Recorta la lista a la página pedida. `totalPages` nunca es 0 y tanto
 * `page` como `perPage` se acotan a su rango válido: `page` se corrige
 * al rango [1, totalPages] tras filtrar y `perPage` se normaliza a un
 * entero ≥ 1.
 */
export const paginate = <T>(
  items: T[],
  page: number,
  perPage: number = POSTS_PER_PAGE,
): { items: T[]; page: number; totalPages: number } => {
  const perPageSafe = Math.max(1, Math.floor(perPage));
  const totalPages = Math.max(1, Math.ceil(items.length / perPageSafe));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPageSafe;

  return {
    items: items.slice(start, start + perPageSafe),
    page: currentPage,
    totalPages,
  };
};
