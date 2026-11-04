/**
 * Contenido y configuración de la sección de contacto (`/contacto`).
 *
 * Vive en `src/data/` por la misma razón que el resto de los datos del
 * sitio: es la única fuente de verdad del formulario y de los canales de
 * contacto de la columna izquierda, de modo que etiquetas, placeholders,
 * teléfonos, correo, dirección y el endpoint de envío no se repitan inline
 * en el markup.
 *
 * El sitio es 100% estático (sin backend): al enviar el formulario, un
 * `<script>` de cliente hace `fetch` POST hacia `CONTACT_ENDPOINT`. Esa
 * API **aún no existe**, por lo que la URL es un placeholder que se debe
 * reemplazar cuando el endpoint esté disponible.
 */
import {
  CANAL_CLIENTES,
  CANAL_CORREO,
  SITE,
  TELEFONO_PRINCIPAL,
  TELEFONO_SOPORTE,
} from "./site";

/** Endpoint al que el formulario envía los datos. Placeholder por definir. */
export const CONTACT_ENDPOINT = "https://api.example.com/contacto";

/**
 * API key de Google Maps Embed API
 * (https://developers.google.com/maps/documentation/embed/get-api-key).
 *
 * El iframe clásico (`?q=…&output=embed`) funciona sin key, así que el
 * mapa de `UbicacionSection` se renderiza igual aunque este valor esté
 * vacío. Cuando se disponga de una key, `buildMapEmbedSrc()` cambia al
 * endpoint oficial `/maps/embed/v1/place`, que requiere key y da más
 * control (idioma, zoom, estilo). Basta pegar el valor aquí: el markup
 * no cambia.
 */
export const GOOGLE_MAPS_API_KEY = "";

/**
 * Dirección usada como consulta del mapa.
 *
 * Es una versión "limpia" de `SITE.direccion` (sin el prefijo "Enlaces
 * Playa, una empresa de Grupo Webtel…"), porque ese rótulo ensucia la
 * geocodificación sin aportar al pin. Debe mantenerse alineada con la
 * dirección real; `SITE.direccion` sigue siendo la fuente canónica.
 */
const MAP_QUERY =
  "Calle 72 entre Av. Sian Ka'an y Carr. Federal, Mza. 026 Lote 03, Col. Ejidal, 77714 Playa del Carmen, Quintana Roo";

/**
 * Construye la URL del iframe de Google Maps según haya o no API key.
 *
 * Con key usa la Embed API oficial; sin ella cae al embed clásico sin
 * key, de modo que la sección funciona desde el primer despliegue y no
 * depende de un secreto que aún no existe en el proyecto.
 */
export const buildMapEmbedSrc = (): string => {
  const query = encodeURIComponent(MAP_QUERY);

  return GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${query}`
    : `https://www.google.com/maps?q=${query}&output=embed`;
};

/** Forma de un campo del formulario de contacto. */
export interface ContactField {
  /** Identificador estable (`id` / `name` / `for` del control). */
  id: string;
  /** Etiqueta visible encima del control. */
  label: string;
  /** Texto de ayuda dentro del control vacío. */
  placeholder: string;
  /** Tipo de control a renderizar. */
  type: "text" | "tel" | "email" | "textarea";
  /** Valor de `autocomplete` del input (no aplica a `textarea`). */
  autocomplete?: string;
}

/** Campos en el orden en que se muestran dentro del card. */
export const CONTACT_FIELDS: ContactField[] = [
  {
    id: "nombre",
    label: "Nombre completo",
    placeholder: "Nombre completo *",
    type: "text",
    autocomplete: "name",
  },
  {
    id: "correo",
    label: "Correo electrónico",
    placeholder: "Correo electrónico *",
    type: "email",
    autocomplete: "email",
  },
  {
    id: "telefono",
    label: "Número de teléfono",
    placeholder: "Número de teléfono *",
    type: "tel",
    autocomplete: "tel",
  },
  {
    id: "mensaje",
    label: "Mensaje",
    placeholder: "Escribe tu mensaje *",
    type: "textarea",
  },
];

/** Línea de contacto dentro del bloque de teléfonos. */
export interface ContactLine {
  /** Etiqueta visible del canal (p. ej. "Ventas"). */
  label: string;
  /** Valor visible (el número). */
  value: string;
  /** Destino del enlace (`tel:`). */
  href: string;
}

/**
 * Ítem de la columna de información de contacto.
 *
 * O bien tiene `value`/`href` (dirección o correo) o bien `lines` (el
 * bloque de teléfonos). Son mutuamente excluyentes por construcción.
 */
export interface ContactInfoItem {
  /** Identificador estable; no se muestra. */
  id: string;
  /** Nombre del icono (`map-pin`, `mail` o `phone`). */
  icon: "map-pin" | "mail" | "phone";
  /** Texto visible único (dirección o correo). */
  value?: string;
  /** Destino del enlace único. */
  href?: string;
  /** Líneas múltiples (teléfonos). */
  lines?: ContactLine[];
}

/** Información de contacto de la columna izquierda, en orden de lectura. */
export const CONTACT_INFO: ContactInfoItem[] = [
  {
    id: "direccion",
    icon: "map-pin",
    value:
      "Calle 72 entre AV. Sian Ka'an y, Carr. Federal Mza. 026-Lote 03, Ejidal, 77714 Playa del Carmen, Q.R.",
    href: SITE.mapaOficinas,
  },
  {
    id: "correo",
    icon: "mail",
    value: CANAL_CORREO.value,
    href: CANAL_CORREO.href,
  },
  {
    id: "telefonos",
    icon: "phone",
    lines: [
      {
        label: "Ventas",
        value: TELEFONO_PRINCIPAL.value,
        href: TELEFONO_PRINCIPAL.href,
      },
      {
        label: "Atención a cliente",
        value: CANAL_CLIENTES.value,
        href: CANAL_CLIENTES.href,
      },
      {
        label: "Soporte",
        value: TELEFONO_SOPORTE.value,
        href: TELEFONO_SOPORTE.href,
      },
    ],
  },
];

/** Copias de estado y etiquetas del botón del formulario. */
export const CONTACT_FORM = {
  submitLabel: "Enviar mensaje",
  loadingLabel: "Enviando…",
  success: "¡Gracias! Recibimos tu mensaje y te contactaremos pronto.",
  error:
    "No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.",
} as const;
