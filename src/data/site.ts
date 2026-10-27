/**
 * Datos institucionales y canales de contacto del sitio.
 *
 * Vive en `src/data/` porque es la única fuente de verdad de la marca: la
 * URL del sitio, el correo, la dirección, el portal de cliente y los
 * teléfonos se consumen desde el navbar, el footer, la página de contacto,
 * los CTA telefónicos y el JSON-LD. Antes cada uno de esos puntos tenía su
 * propia copia del literal y bastaba editar un número en un solo lugar para
 * dejar el resto desactualizado.
 *
 * Regla que no debe romperse (ver AGENTS.md): los teléfonos son **distintos
 * por canal** y no deben normalizarse a uno solo. Por eso viven como
 * `CANALES`, una lista de canales con su propia etiqueta, y no como una
 * constante única. `TELEFONO_PRINCIPAL` es solo el que se usa en los CTA
 * comerciales, no "el teléfono del sitio".
 */
import { sanitizePhone } from "../utils/helpers";

/** Datos de la empresa que no dependen del canal de contacto. */
export const SITE = {
  nombre: "Enlaces Playa",
  url: "https://enlacesplaya.com.mx",
  email: "hola@enlacesplaya.com.mx",
  direccion:
    "Enlaces Playa, una empresa de Grupo Webtel, Calle 72 entre Av. Sian Ka'an y Carr. Federal, Mza. 026, Lote 0, Col. Ejidal, C.P. 77714, Playa del Carmen, Q. Roo.",
  portalCliente: "https://portal.enlacesplaya.com.mx/cliente/login",
  whatsapp: "https://wa.me/529841845726",
  mapaOficinas: "https://maps.app.goo.gl/g1xk8DjxTot7QoTr5",
} as const;

/**
 * Construye el destino `tel:` en formato internacional a partir del número
 * visible. Se deriva del mismo valor que se muestra en pantalla para que el
 * `href` y el texto no puedan divergir.
 */
const telHref = (numero: string): string => `tel:+52${sanitizePhone(numero)}`;

/**
 * Teléfono comercial principal (`984 184 5726`).
 *
 * Lo usan el CTA del navbar, `PhoneCTAButton`, la página de contacto y el
 * JSON-LD. `jsonLd` conserva el formato con guiones que espera
 * `schema.org` (`telephone`), distinto del `href` de marcación.
 */
export const TELEFONO_PRINCIPAL = {
  value: "984 184 5726",
  href: telHref("984 184 5726"),
  jsonLd: "+52-984-184-5726",
} as const;

/** Forma de un canal de contacto mostrado en el footer. */
export interface CanalContacto {
  /** Identificador estable; no se muestra. */
  id: string;
  /** Determina el esquema del `href` y la etiqueta accesible. */
  kind: "tel" | "mailto";
  /**
   * Etiqueta visible encima del valor. `null` cuando el propio valor hace
   * de etiqueta (el correo se muestra sin rótulo, como enlace directo).
   */
  label: string | null;
  /** Valor tal como se muestra al usuario. */
  value: string;
  /** Destino del enlace (`tel:` o `mailto:`). */
  href: string;
}

/**
 * Canales de atención en el orden en que se muestran en el footer.
 *
 * Se declaran como constantes con nombre (además de la lista) para que los
 * consumidores que usan un canal concreto —el CTA de la home usa atención
 * telefónica, no el número comercial— no dependan de un índice.
 *
 * `CANAL_VENTAS` reutiliza `TELEFONO_PRINCIPAL`: es el mismo número del CTA
 * comercial, así que se deriva en lugar de repetirse.
 */
export const CANAL_ATENCION = {
  id: "atencion-telefonica",
  kind: "tel",
  label: "Atención telefónica",
  value: "984 109 1111",
  href: telHref("984 109 1111"),
} satisfies CanalContacto;

export const CANAL_CLIENTES = {
  id: "atencion-clientes",
  kind: "tel",
  label: "Atención a Clientes y Ventas Residenciales",
  value: "984 144 0714",
  href: telHref("984 144 0714"),
} satisfies CanalContacto;

export const CANAL_VENTAS = {
  id: "ventas-empresariales",
  kind: "tel",
  label: "Ventas Empresariales y PYME",
  ...TELEFONO_PRINCIPAL,
} satisfies CanalContacto;

export const CANAL_CORREO = {
  id: "correo-comercial",
  kind: "mailto",
  label: null,
  value: "comercial@webtelsistemas.com",
  href: "mailto:comercial@webtelsistemas.com",
} satisfies CanalContacto;

export const CANALES: CanalContacto[] = [
  CANAL_ATENCION,
  CANAL_CLIENTES,
  CANAL_VENTAS,
  CANAL_CORREO,
];
