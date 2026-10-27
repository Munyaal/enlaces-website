/**
 * Tarifario de Internet para Hogar (`/internet-hogar`).
 *
 * A diferencia de `data/home/plans.ts` —que es una llamada a la acción
 * orientativa de la home— aquí viven los precios reales de los planes,
 * con su precio de contado, su precio regular y el costo de instalación.
 *
 * Los planes se agrupan por tecnología porque la sección los muestra
 * en dos pestañas (Fibra óptica / Inalámbrico). El `id` de la tecnología
 * es el que conecta la pestaña con su panel (`aria-controls`).
 */

/** Tecnologías disponibles para el servicio de Internet en el hogar. */
export type PlanTechnology = "fibra" | "inalambrico";

/** Un plan concreto de una tecnología. */
export interface HogarPlan {
  /** Identificador estable dentro de su tecnología. */
  id: string;
  /**
   * Prefijo que acompaña al nombre del plan. Se muestra separado del
   * nombre para poder Loose los rótulos inconsistentes del tarifario
   * real ("PLAN CONECTA", "CONECTA ANTENA", "PLAN ANTENA 60") sin
   * reescribir el nombre de marca.
   */
  etiqueta: string;
  /** Nombre del plan tal como aparece en el tarifario. */
  nombre: string;
  /** Velocidad contratada en megas. */
  megas: number;
  /** Precio de contado (MXN). */
  prontoPago: string;
  /** Precio regular (MXN). */
  precioRegular: string;
  /** Costo de instalación (MXN). */
  instalacion: string;
  /**
   * Marca el plan destacado de su tecnología. En la referencia visual el
   * plan central es el que se presenta con fondo azul; aquí se replica
   * esa jerarquía, no una recomendación comercial.
   */
  destacado?: boolean;
}

/** Una tecnología con su etiqueta de pestaña y sus planes. */
export interface PlanTechnologyGroup {
  /** Id de la tecnología. Coincide con el `id` del panel que la muestra. */
  id: PlanTechnology;
  /** Etiqueta visible en la pestaña. */
  label: string;
  /** Texto corto que describe la tecnología bajo el encabezado. */
  descripcion: string;
  /** Planes de la tecnología, en el orden en que se muestran. */
  planes: HogarPlan[];
}

/**
 * Definición de las pestañas y sus planes.
 *
 * El orden de `tecnologias` es el orden de las pestañas y de los paneles:
 * la primera es la que queda activa por defecto.
 */
export const TECNOLOGIAS: PlanTechnologyGroup[] = [
  {
    id: "fibra",
    label: "Fibra óptica",
    descripcion:
      "Conexión por fibra óptica con la máxima velocidad y estabilidad para tu hogar.",
    planes: [
      {
        id: "conecta",
        etiqueta: "PLAN",
        nombre: "CONECTA",
        megas: 80,
        prontoPago: "$449",
        precioRegular: "$580",
        instalacion: "$219",
      },
      {
        id: "potencia",
        etiqueta: "PLAN",
        nombre: "POTENCIA",
        megas: 150,
        prontoPago: "$549",
        precioRegular: "$680",
        instalacion: "$219",
        destacado: true,
      },
      {
        id: "ultra",
        etiqueta: "PLAN",
        nombre: "ULTRA",
        megas: 200,
        prontoPago: "$649",
        precioRegular: "$780",
        instalacion: "$219",
      },
    ],
  },
  {
    id: "inalambrico",
    label: "Inalámbrico",
    descripcion:
      "Internet inalámbrico por antena, ideal para zonas donde la fibra todavía no llega.",
    planes: [
      {
        id: "conecta-antena",
        etiqueta: "CONECTA",
        nombre: "ANTENA",
        megas: 30,
        prontoPago: "$499",
        precioRegular: "$630",
        instalacion: "$499",
      },
      {
        id: "potencia-antena",
        etiqueta: "POTENCIA",
        nombre: "ANTENA",
        megas: 40,
        prontoPago: "$599",
        precioRegular: "$730",
        instalacion: "$499",
        destacado: true,
      },
      {
        id: "antena-60",
        etiqueta: "PLAN",
        nombre: "ANTENA 60",
        megas: 60,
        prontoPago: "$699",
        precioRegular: "$830",
        instalacion: "$499",
      },
    ],
  },
];

/** Destino del CTA "Quiero Contratar" de cada tarjeta. */
export const PLAN_CTA = {
  label: "Quiero Contratar",
  href: "/contacto",
} as const;
