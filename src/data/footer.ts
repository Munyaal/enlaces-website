/**
 * Contenido del footer.
 *
 * Se centraliza aquí porque son cuatro bloques de enlaces + copy
 * institucional que antes vivían inline en `Footer.astro`, donde cualquier
 * cambio de ruta obligaba a editar markup. El componente queda reducido a
 * composición.
 *
 * Rutas: los enlaces apuntan solo a páginas que existen. Las que no tienen
 * ruta propia (detalle por zona, soporte técnico dedicado) apuntan a la
 * página que hoy cubre ese contenido —`/cobertura` y `/ayuda`— en lugar de
 * dejar `href="#"`.
 */
import { SITE } from "./site";

/** Tagline aprobada: posicionamiento del sitio. */
export const TAGLINE =
  "Internet rápido y estable para hogares y empresas en la Riviera Maya, con cobertura local y soporte técnico cercano.";

/** Un enlace de columna del footer. */
export interface FooterLink {
  href: string;
  text: string;
}

/** Columna Internet — cuatro enlaces principales de producto. */
export const INTERNET_LINKS: FooterLink[] = [
  { href: "/internet-hogar", text: "Internet para Hogar" },
  { href: "/internet-empresas", text: "Planes de Internet" },
  { href: "/internet-hogar", text: "Fibra Óptica" },
  { href: "/internet-hogar", text: "Internet Inalámbrico" },
];

/**
 * Columna Cobertura — tres enlaces de zona.
 *
 * No existen rutas por ciudad (`/cobertura/playa-del-carmen`, etc.), así que
 * las tres apuntan al listado de cobertura en lugar de a un `#`.
 */
export const COBERTURA_LINKS: FooterLink[] = [
  { href: "/cobertura", text: "Cobertura en Playa del Carmen" },
  { href: "/cobertura", text: "Cobertura en Puerto Morelos" },
  { href: "/cobertura", text: "Cobertura en Tulum" },
];

/** Sub-bloque Recursos — tres enlaces de soporte y contenido. */
export const RECURSOS_LINKS: FooterLink[] = [
  { href: "/blog", text: "Blog" },
  { href: "/preguntas-frecuentes", text: "Preguntas frecuentes" },
  { href: "/ayuda", text: "Soporte técnico" },
];

/** Franja Portal de Cliente — copy y CTA outline. */
export const PORTAL_CLIENTE = {
  copy: "¿YA ERES CLIENTE? Consulta y paga tu servicio desde tu Portal de Cliente.",
  href: SITE.portalCliente,
  label: "Iniciar sesión",
} as const;

/** Franja legal — enlaces a documentos. */
export const LEGAL_LINKS: FooterLink[] = [
  { href: "/terminos-y-condiciones", text: "Términos y Condiciones" },
  { href: "/aviso-de-privacidad", text: "Aviso de Privacidad" },
];
