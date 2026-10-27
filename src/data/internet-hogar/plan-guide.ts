/**
 * Guía de elección de plan inalámbrico (`/internet-hogar`).
 *
 * Convive con `data/internet-hogar/plans.ts`, pero responden a preguntas
 * distintas y por eso no se reutilizan:
 *
 *   - `plans.ts` es el **tarifario**: precio pronto pago, precio regular,
 *     instalación y rótulos tal como vienen del sistema comercial
 *     ("CONECTA ANTENA", "POTENCIA ANTENA"). Si el tarifario cambia de
 *     precio, esa sección cambia sola.
 *   - Este archivo es la **guía de elección**: qué plan le conviene a cada
 *     tipo de hogar, sin precios. El copy sale de marketing y describe usos
 *     ("Hasta 3 dispositivos", "Videollamadas"), información que el
 *     tarifario no tiene.
 *
 * Mezclar ambos en un solo arreglo obligaría a que cada plan del tarifario
 * lleve beneficios vacíos (o al revés) y acoplaría el copy comercial al
 * ciclo de vida de los precios. Se mantienen separados a propósito.
 */
import { SITE } from "../site";

/** Un plan dentro de la guía de elección. */
export interface PlanGuide {
  /** Identificador estable; no se muestra. */
  id: string;
  /** Velocidad contratada en megas. */
  megas: number;
  /** Rótulo que precede al nombre en la píldora ("PLAN"). */
  etiqueta: string;
  /** Nombre de marca del plan ("CONECTA", "POTENCIA", "ULTRA"). */
  nombre: string;
  /**
   * Marca el plan sugerido. Es una jerarquía visual (tarjeta con fondo y
   * píldora "RECOMENDADO"), no una recomendación automática por precio.
   */
  recomendado?: boolean;
  /** Usos que cubre el plan, en el orden en que se listan. */
  beneficios: string[];
}

/**
 * Planes de la guía, en orden ascendente de velocidad.
 *
 * El orden importa: la lectura natural es "del plan más chico al más
 * grande", y el destacado queda al centro de la rejilla de tres.
 */
export const PLANES_GUIA: PlanGuide[] = [
  {
    id: "guia-conecta",
    megas: 30,
    etiqueta: "PLAN",
    nombre: "CONECTA",
    beneficios: [
      "Hasta 3 dispositivos",
      "Redes sociales",
      "Navegación y tareas cotidianas",
    ],
  },
  {
    id: "guia-potencia",
    megas: 40,
    etiqueta: "PLAN",
    nombre: "POTENCIA",
    recomendado: true,
    beneficios: [
      "Hasta 5 dispositivos",
      "Videollamadas",
      "Streaming y navegación diaria",
    ],
  },
  {
    id: "guia-ultra",
    megas: 60,
    etiqueta: "PLAN",
    nombre: "ULTRA",
    beneficios: [
      "Hasta 8 dispositivos",
      "Streaming y videollamadas",
      "Hogares con mayor demanda de conexión simultánea",
    ],
  },
];

/**
 * CTA de la guía. Apunta a WhatsApp porque la acción real es "que un asesor
 * me diga cuál me conviene", no volver al formulario de contacto.
 */
export const GUIA_CTA = {
  label: "Ayúdame a elegir",
  href: SITE.whatsapp,
} as const;
