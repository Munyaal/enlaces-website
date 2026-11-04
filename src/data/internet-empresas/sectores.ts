/**
 * Sectores empresariales de `/internet-empresas`.
 *
 * Vive en `src/data/` por la misma razón que el resto del contenido del
 * sitio: el componente `EmpresasSectors` es sólo presentación y el copy
 * (título, descripción e imagen de cada sector) se edita aquí.
 *
 * A diferencia de `data/home/companies.ts` —que apunta a logos públicos en
 * `/images/logos/*`—, aquí las imágenes son assets optimizados por Astro
 * (`astro:assets`), así que se importan y se exporta su `ImageMetadata`.
 */
import type { ImageMetadata } from "astro";

import sectorHotel from "../../assets/images/internet-empresas/sector-empresarial-hotel-enlaces-playa.png";
import sectorInmobiliaria from "../../assets/images/internet-empresas/sector-empresarial-inmobiliaria-enlaces-playa.png";
import sectorOficinas from "../../assets/images/internet-empresas/sector-empresarial-enlaces-playa.png";
import sectorComercios from "../../assets/images/internet-empresas/sector-negocios-enlaces-playa.png";

/** Un sector al que Enlaces Playa ofrece internet empresarial. */
export interface SectorEmpresa {
  /** Identificador estable; no se muestra. */
  id: string;
  /** Título visible de la tarjeta. */
  titulo: string;
  /** Descripción corta del sector, bajo el título. */
  descripcion: string;
  /** Imagen de la tarjeta (asset optimizado por Astro). */
  imagen: ImageMetadata;
  /** Texto alternativo de la imagen. */
  alt: string;
}

/**
 * Sectores en el orden en que se muestran (grid 2×2).
 *
 * El orden sigue la lectura natural del mockup: hoteles, inmobiliarias,
 * empresas/oficinas y comercios.
 */
export const SECTORES: SectorEmpresa[] = [
  {
    id: "hoteles",
    titulo: "Hoteles y hospedaje",
    descripcion:
      "Conectividad para acompañar la operación hotelera, sistemas administrativos y servicios digitales.",
    imagen: sectorHotel,
    alt: "Recepción de un hotel con personal y huéspedes",
  },
  {
    id: "inmobiliarias",
    titulo: "Inmobiliarias y desarrollos",
    descripcion:
      "Internet para plataformas inmobiliarias, comunicación con clientes, videollamadas y gestión comercial.",
    imagen: sectorInmobiliaria,
    alt: "Desarrollo inmobiliario residencial",
  },
  {
    id: "empresas",
    titulo: "Empresas y oficinas",
    descripcion:
      "Soluciones de conectividad para equipos de trabajo, herramientas digitales y operaciones cotidianas.",
    imagen: sectorOficinas,
    alt: "Equipo de trabajo colaborando en una oficina",
  },
  {
    id: "comercios",
    titulo: "Comercios y negocios",
    descripcion:
      "Internet para gestionar ventas, atender clientes y mantener las actividades del negocio conectadas.",
    imagen: sectorComercios,
    alt: "Comercio local con personal atendiendo clientes",
  },
];
