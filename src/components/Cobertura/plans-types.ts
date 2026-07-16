/**
 * Tipos compartidos para la representación de planes de internet.
 *
 * `Plan`         -> respuesta cruda de la API de planes.
 * `CardData`     -> metadatos visuales de la tarjeta (título, color, iconos...).
 * `PlanWithCardData` -> plan enriquecido con su CardData para renderizar.
 *
 * Se extraen a este módulo para que tanto plansPrice.astro (orquestación de
 * datos) como planCard.astro (presentación) dependan de un único contrato,
 * reduciendo el acoplamiento y la duplicación.
 */
export type Plan = {
  id: number;
  descentSpeed: number;
  uploadSpeed: number;
  price: string;
};

export type CardData = {
  title: string;
  color: string;
  devices: number;
  icons: string[];
  description: string;
  text: string;
};

export type PlanWithCardData = Plan & {
  cardData: CardData;
};

export type PlanVariant = "antena" | "fibra";