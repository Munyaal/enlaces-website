/**
 * Logos de "Empresas que confían" en la home.
 *
 * `className` sólo contiene los anchos responsivos: los filtros y la
 * opacidad viven en `CompanyLogo` para no mezclar dos utilidades `w-*`
 * que Tailwind resolvería por orden de hoja, no de atributo.
 */
export interface HomeCompany {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}

export const COMPANIES: HomeCompany[] = [
  {
    src: "/images/logos/logo-colegio.png",
    alt: "Logo Colegio",
    width: 1546,
    height: 600,
    className: "w-28 sm:w-32 lg:w-36",
  },
  {
    src: "/images/logos/logo-leones.png",
    alt: "Logo Leones",
    width: 667,
    height: 592,
    className: "w-24 sm:w-24 lg:w-28",
  },
  {
    src: "/images/logos/logo-munyaal.webp",
    alt: "Logo Munyaal",
    width: 720,
    height: 197,
    className: "w-28 sm:w-32 lg:w-36",
  },
  {
    src: "/images/logos/logo-cui.svg",
    alt: "Logo CUI",
    width: 1920,
    height: 941,
    className: "w-28 sm:w-32 lg:w-36",
  },
  {
    src: "/images/logos/logo-idiomar.webp",
    alt: "Logo Idiomar",
    width: 993,
    height: 206,
    className: "col-span-2 w-28 sm:col-span-1 sm:w-32 lg:w-36",
  },
];
