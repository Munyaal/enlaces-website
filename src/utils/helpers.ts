export const sanitizePhone = (raw: string) => raw.replace(/\D/g, "");

export const buildContact = (label: string, value: string, kind: "tel" | "mailto") => {
  const target = kind === "tel" ? `tel:${sanitizePhone(value)}` : `mailto:${value}`;
  return { label, value, href: target };
};