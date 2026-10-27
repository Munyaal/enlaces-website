/**
 * Navegación principal del sitio.
 *
 * Las rutas viven aquí —y no en `Navbar.astro`— para que el navbar y
 * cualquier otro punto que necesite enlazar una sección compartan la misma
 * definición. `NAV_URLS` sigue siendo la fuente de los `href`: así cambiar
 * una ruta no obliga a buscar literales por el proyecto.
 *
 * El orden de `NAV_LINKS` es el orden visible en desktop y en el menú móvil.
 */
import { TELEFONO_PRINCIPAL } from "./site";

export const NAV_URLS = {
  home: "/",
  homeInternet: "/internet-hogar",
  businessInternet: "/internet-empresas",
  coverage: "/cobertura",
  aboutUs: "/nosotros",
  help: "/ayuda",
  contact: "/contacto",
} as const;

/** Un enlace del navbar. */
export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Internet para Hogar", href: NAV_URLS.homeInternet },
  { label: "Internet para Empresas", href: NAV_URLS.businessInternet },
  { label: "Cobertura", href: NAV_URLS.coverage },
  { label: "Nosotros", href: NAV_URLS.aboutUs },
  { label: "Ayuda", href: NAV_URLS.help },
  { label: "Contacto", href: NAV_URLS.contact },
];

/**
 * CTA telefónico del navbar. Se deriva de `TELEFONO_PRINCIPAL` para que el
 * `href`, el texto visible de `aria-label` y el resto de los CTA comerciales
 * apunten siempre al mismo número.
 */
export const NAV_CTA = {
  label: "Cotizar plan ahora",
  href: TELEFONO_PRINCIPAL.href,
} as const;
