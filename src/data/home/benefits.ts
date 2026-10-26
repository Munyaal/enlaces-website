/**
 * Beneficios de la home.
 *
 * El copy se separa del componente para que editarlo no obligue a tocar
 * markup ni clases. `titulo` se mantiene como líneas independientes
 * porque la tarjeta las separa visualmente con un `<br />`.
 */
export interface HomeBenefit {
  titulo: string[];
  icon: string;
  descripcion: string;
}

export const BENEFITS: HomeBenefit[] = [
  {
    titulo: ["Internet que se adapta", "a tu forma de vivir"],
    icon: "wifi",
    descripcion:
      "Disfruta de una conexión de internet estable para trabajar, estudiar, hacer streaming y mantener todos tus dispositivos conectados.",
  },
  {
    titulo: ["Cobertura de Internet", "en la Riviera Maya"],
    icon: "map-pin",
    descripcion:
      "Conectamos hogares y negocios en Playa del Carmen, Puerto Morelos y Tulum, con opciones de fibra óptica e internet inalámbrico según disponibilidad.",
  },
  {
    titulo: ["Soporte", "técnico local"],
    icon: "tool",
    descripcion:
      "Atención personalizada de expertos en conectividad que conocen la Riviera Maya y tu zona.",
  },
];
