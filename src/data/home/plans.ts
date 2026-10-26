/**
 * Planes destacados de la home.
 *
 * Los precios son orientativos y viven como texto: el tarifario real está
 * en las páginas de detalle. `PlanKind` es el contrato compartido con
 * `PackageCard`, que deriva de él su variante visual.
 */
export type PlanKind = "hogar" | "empresarial";

export interface HomePlan {
  tipo: PlanKind;
  icon: string;
  titulo: string;
  descripcion: string;
  precio: string;
  cta: {
    label: string;
    href: string;
  };
}

export const PLANS: HomePlan[] = [
  {
    tipo: "hogar",
    icon: "home",
    titulo: "Internet para hogar",
    descripcion:
      "Internet rápido y estable para trabajar, estudiar, disfrutar streaming y conectar todos tus dispositivos.",
    precio: "$499",
    cta: {
      label: "Ver planes para hogar",
      href: "/internet-hogar",
    },
  },
  {
    tipo: "empresarial",
    icon: "building",
    titulo: "Internet para tu negocio",
    descripcion:
      "Soluciones de internet para mantener conectados tus sistemas, operaciones, clientes y equipos.",
    precio: "$899",
    cta: {
      label: "Ver planes para empresa",
      href: "/internet-empresas",
    },
  },
];
