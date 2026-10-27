/**
 * Guía de elección de plan para `/internet-hogar`.
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
 *
 * La guía está indexada por tecnología porque **no tiene tabs propios**:
 * reacciona al tab activo de `InternetHogarPlans` (ver
 * `src/utils/plan-technology.ts`). La clave es el mismo `id` de tecnología
 * del tarifario, no una etiqueta nueva.
 */
import type { PlanTechnology } from "./plans";
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

/** Una tecnología con su encabezado y sus planes. */
export interface PlanGuideGroup {
  /** Id de la tecnología; coincide con el del tab que la activa. */
  id: PlanTechnology;
  /**
   * Título en dos líneas: `destacado` se pinta en naranja y `resto` en
   * navy. Se guarda partido porque el diseño fija dónde cambia el color,
   * y así el componente no tiene que interpretar el texto.
   */
  titulo: { destacado: string; resto: string };
  /** Planes de la tecnología, en orden ascendente de velocidad. */
  planes: PlanGuide[];
}

/**
 * Guía por tecnología.
 *
 * Es un `Record` y no un arreglo para que el componente pueda recorrer
 * `TECNOLOGIAS` (la fuente del orden de los tabs) y resolver el contenido
 * por id. Si mañana se agrega una tecnología al tarifario, TypeScript
 * exige también su guía: el orden nunca puede desincronizarse.
 *
 * El orden de los planes importa: la lectura natural es "del más chico al
 * más grande" y el destacado queda al centro de la rejilla de tres.
 */
export const GUIA_POR_TECNOLOGIA: Record<PlanTechnology, PlanGuideGroup> = {
  fibra: {
    id: "fibra",
    titulo: {
      destacado: "¿Qué plan de internet para el hogar",
      resto: "es ideal para ti?",
    },
    planes: [
      {
        id: "guia-fibra-conecta",
        megas: 80,
        etiqueta: "PLAN",
        nombre: "CONECTA",
        beneficios: ["Hasta 4 dispositivos", "Redes sociales", "Tareas cotidianas"],
      },
      {
        id: "guia-fibra-potencia",
        megas: 150,
        etiqueta: "PLAN",
        nombre: "POTENCIA",
        recomendado: true,
        beneficios: ["Hasta 10 dispositivos", "Videollamadas", "Streaming"],
      },
      {
        id: "guia-fibra-ultra",
        megas: 200,
        etiqueta: "PLAN",
        nombre: "ULTRA",
        beneficios: [
          "Hasta 13 dispositivos",
          "Hogares con mayor demanda de conexión simultánea",
        ],
      },
    ],
  },
  inalambrico: {
    id: "inalambrico",
    titulo: {
      destacado: "¿Qué plan de internet por antena",
      resto: "es ideal para ti?",
    },
    planes: [
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
    ],
  },
};

/**
 * CTA de la guía. Apunta a WhatsApp porque la acción real es "que un asesor
 * me diga cuál me conviene", no volver al formulario de contacto.
 */
export const GUIA_CTA = {
  label: "Ayúdame a elegir",
  href: SITE.whatsapp,
} as const;
