/**
 * Contenido del footer.
 *
 * Se centraliza aquí porque son cuatro bloques de enlaces + copy
 * institucional que antes vivían inline en `Footer.astro`, donde cualquier
 * cambio de ruta obligaba a editar markup. El componente queda reducido a
 * composición.
 *
 * Las columnas «Internet» y «Cobertura» son texto plano a propósito: la
 * coordinadora de marketing las mantenía como enlaces solo por SEO, así que
 * se modelan como `string[]` y se renderizan sin `<a>`. La columna
 * «Recursos» sí conserva enlaces.
 */
import { SITE, TELEFONO_SOPORTE } from "./site";

/** Tagline aprobada: posicionamiento del sitio. */
export const TAGLINE =
  "Internet rápido y estable para hogares y empresas en la Riviera Maya, con cobertura local y soporte técnico cercano.";

/** Un enlace de columna del footer. */
export interface FooterLink {
  href: string;
  text: string;
  /** Abre en pestaña nueva (WhatsApp) con `rel` de seguridad. */
  externo?: boolean;
}

/** Columna Internet — texto plano, sin enlaces. */
export const INTERNET_ITEMS: string[] = [
  "Internet para Hogar",
  "Planes de Internet",
  "Fibra Óptica",
  "Internet Inalámbrico",
];

/**
 * Columna Cobertura — texto plano, sin enlaces.
 *
 * No existen rutas por ciudad (`/cobertura/playa-del-carmen`, etc.), así que
 * antes apuntaban al listado de cobertura; hoy son solo texto.
 */
export const COBERTURA_ITEMS: string[] = [
  "Cobertura en Playa del Carmen",
  "Cobertura en Puerto Morelos",
  "Cobertura en Tulum",
];

/** Sub-bloque Recursos — enlaces de soporte y contenido. */
export const RECURSOS_LINKS: FooterLink[] = [
  { href: "/blog", text: "Blog" },
  { href: "/ayuda", text: "Preguntas frecuentes" },
  {
    href: TELEFONO_SOPORTE.whatsapp,
    text: "Soporte técnico",
    externo: true,
  },
];

/** Franja Portal de Cliente — copy y CTA outline. */
export const PORTAL_CLIENTE = {
  copy: "¿YA ERES CLIENTE? Consulta y paga tu servicio desde tu Portal de Cliente.",
  href: SITE.portalCliente,
  label: "Iniciar sesión",
} as const;

/** Franja legal — texto plano, sin enlaces (por ahora). */
export const LEGAL_ITEMS: string[] = [
  "Términos y Condiciones",
  "Aviso de Privacidad",
];
