/**
 * Metadatos compartidos y nodos de JSON-LD.
 *
 * `SITE_URL` estaba escrito a mano en más de quince lugares y el nodo
 * `Organization` se repetía en cinco rutas con pequeñas variaciones (unas
 * con `logo`, otras sin él). Aquí vive una sola definición:
 *
 *   - `ORGANIZACION` es el nodo mínimo que se usa como `provider` o como
 *     `publisher`, referenciado desde otras entidades.
 *   - `organizacionCompleta()` es el nodo canónico de la home, que incluye
 *     `description`, `email`, `telephone` y `address`. Recibe la descripción
 *     porque en la home coincide con la de la página.
 *
 * Los textos por defecto (`DEFAULT_*`) y el bloque Open Graph / Twitter son
 * site-wide: `BaseHead` los usa cuando la página no pasa los suyos.
 */
import { SITE, TELEFONO_PRINCIPAL } from "./site";

/** Origen del sitio, sin barra final. Base de todas las URLs canónicas. */
export const SITE_URL = SITE.url;

/** `@id` del nodo `Organization` (home) y del nodo `WebSite`. */
export const ORGANIZACION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Logo usado por `publisher` en el JSON-LD de artículos y home. */
export const ORGANIZACION_LOGO = `${SITE_URL}/images/logos/logo-enlacesplaya.webp`;

export const DEFAULT_DESCRIPTION =
  "Enlaces Playa ofrece servicios de internet por fibra óptica y antena satelital en Playa del Carmen, Tulum, Puerto Morelos y Bacalar. Conéctate con velocidad y estabilidad desde cualquier punto de Quintana Roo.";

export const DEFAULT_KEYWORDS =
  "Internet Playa del Carmen, fibra óptica Tulum, internet satelital Bacalar, Puerto Morelos internet, Enlaces Playa, internet rápido Quintana Roo, conexión estable, servicios de internet Riviera Maya";

/**
 * Imagen social compartida por Open Graph y Twitter.
 *
 * El sitio no genera imágenes por página: la misma tarjeta se anuncia en
 * todas las rutas, así que vive aquí y no en cada `Layout`.
 */
export const OG_IMAGE = {
  url: `${SITE_URL}/banner-enlaces-playa.webp`,
  width: 1210,
  height: 634,
  type: "image/webp",
  alt: "Enlaces Playa — Internet por fibra óptica y satelital en la Riviera Maya",
} as const;

/** Copy social fijo del sitio (no depende de la página). */
export const SOCIAL_META = {
  ogTitle: "Enlaces Playa | Internet en Playa del Carmen y la Riviera Maya",
  ogDescription:
    "Conectamos Playa del Carmen, Tulum, Bacalar y Puerto Morelos con internet por fibra óptica y antena satelital de alta velocidad.",
  twitterTitle: "Enlaces Playa | Internet Rápido en la Riviera Maya",
  twitterDescription:
    "Fibra óptica y antena satelital en Playa del Carmen, Tulum, Bacalar y Puerto Morelos. Velocidad, estabilidad y cobertura garantizada.",
} as const;

/** Ciudades declaradas en `areaServed` de los servicios. */
export const AREA_SERVED = [
  { "@type": "City", name: "Cancún" },
  { "@type": "City", name: "Playa del Carmen" },
  { "@type": "City", name: "Tulum" },
] as const;

/**
 * Nodo `Organization` mínimo.
 *
 * Se usa como `provider` de los servicios y `publisher` del blog: en esos
 * contextos basta nombre + URL, y el nodo canónico (con `@id`) ya se declara
 * en la home.
 */
export const ORGANIZACION = {
  "@type": "Organization",
  name: SITE.nombre,
  url: `${SITE_URL}/`,
} as const;

/**
 * Nodo `Organization` canónico de la home.
 *
 * @param description Descripción de la organización; en la home reutiliza la
 *   descripción SEO de la página para no declarar dos textos distintos.
 */
export const organizacionCompleta = (description: string) => ({
  "@type": "Organization",
  "@id": ORGANIZACION_ID,
  name: SITE.nombre,
  url: `${SITE_URL}/`,
  logo: ORGANIZACION_LOGO,
  description,
  email: SITE.email,
  telephone: TELEFONO_PRINCIPAL.jsonLd,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Playa del Carmen",
    addressRegion: "Quintana Roo",
    addressCountry: "MX",
  },
  areaServed: AREA_SERVED,
});
