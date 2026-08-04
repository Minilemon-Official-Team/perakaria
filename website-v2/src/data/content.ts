// Hardcoded content for Perakaria V2 landing page.
// Source: design-references/PERAKARIA_FIGMA_SPEC.md

export type NavItem = {
  label: string;
  href: string;
  icon: "home" | "reel" | "services" | "contact";
};

export const heroNav: NavItem[] = [
  { label: "Home", href: "#home", icon: "home" },
  { label: "Reel", href: "#reel", icon: "reel" },
  { label: "Services", href: "#services", icon: "services" },
  { label: "Contact", href: "#contact", icon: "contact" },
];

export const heroBody =
  "adalah Creative Tech Studio dengan pengalaman lebih dari satu dekade membangun brand campaign bersama mitra dan klien.";

export const aboutHeading = "PERAKARIA";

export const aboutBody: string[] = [
  "Fokus di bidang Video Production & Interactive Media, dengan pendekatan storytelling, sentuhan artistik dan teknologi inovatif sesuai trend audience saat ini.",
  "Menawarkan ide tetap sasaran, komunikasi efektif, manajemen terukur dan mengedepankan hasil akhir yang memukau.",
];

export const aboutButtons: string[] = [
  "SCREEN WRITING",
  "VISUAL FX",
  "MOTION GRAPHIC",
  "3D ANIMATION",
];

export const productionServices: string[] = [
  "VIDEO PROFILE",
  "VIDEO COMMERCIAL",
  "MUSIC VIDEO",
  "POST PRODUCTION",
];

export const interactiveServices: string[] = [
  "PRODUCT SHOWCASE",
  "VIRTUAL SHOWROOMS",
  "VISUALS EVENT PACKAGES",
  "AR / VR & 3D SIMULATOR",
  "WEB DESIGN & BRANDING",
];

export type Client = {
  name: string;
  src: string;
  alt: string;
};

export const clients: Client[] = [
  {
    name: "JTI",
    src: "/assets/clients/jti.svg",
    alt: "JTI",
  },
  {
    name: "Danone",
    src: "/assets/clients/danone.svg",
    alt: "Danone",
  },
  {
    name: "Koperasi Astra",
    src: "/assets/clients/koperasi-astra.svg",
    alt: "Koperasi Astra",
  },
  {
    name: "Toyota",
    src: "/assets/clients/toyota.svg",
    alt: "Toyota",
  },
];

export const contactAddress =
  "Jl. Duren I No 129, Pancoran Mas, Kota Depok, Jawa Barat 16434";

export const contactEmail = "hello@perakaria.id";

export const contactWhatsapp = "https://wa.me/6281234567890";

export const portfolioThumbnails: { src: string; alt: string }[] = Array.from(
  { length: 8 },
  (_, i) => ({
    src: `/assets/portfolio/thumb-${String(i + 1).padStart(2, "0")}.svg`,
    alt: `Portfolio thumbnail ${i + 1}`,
  }),
);
