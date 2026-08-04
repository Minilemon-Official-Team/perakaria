import { defaultSiteContent, publicSitePayloadSchema, type PublicSitePayload } from "@perakaria/content-schema";

const API_URL = import.meta.env.VITE_CMS_API_URL?.replace(/\/$/, "");

const v2Fallback: PublicSitePayload = structuredClone(defaultSiteContent);
v2Fallback.settings.navigation = [
  { label: "Home", href: "#home" },
  { label: "Reel", href: "#reel" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];
v2Fallback.settings.email = "hello@perakaria.id";
v2Fallback.settings.whatsapp = "6281234567890";
v2Fallback.settings.location = "Jl. Duren I No 129, Pancoran Mas, Kota Depok, Jawa Barat 16434";
v2Fallback.hero.posterImageUrl = "/assets/hero/collage.svg";
v2Fallback.hero.posterAlt = "Kolase visual produksi Perakaria.";
v2Fallback.hero.body = "adalah Creative Tech Studio dengan pengalaman lebih dari satu dekade membangun brand campaign bersama mitra dan klien.";
v2Fallback.about.imageUrl = "/assets/about/reel.svg";
v2Fallback.about.imageAlt = "Showreel Perakaria.";
v2Fallback.about.mediaType = "video";
v2Fallback.about.videoUrl = "/assets/about/showreel.mp4";
v2Fallback.about.body = "Fokus di bidang Video Production & Interactive Media, dengan pendekatan storytelling, sentuhan artistik dan teknologi inovatif sesuai trend audience saat ini.\n\nMenawarkan ide tetap sasaran, komunikasi efektif, manajemen terukur dan mengedepankan hasil akhir yang memukau.";
v2Fallback.clients = [
  ["JTI", "/assets/clients/jti.svg"],
  ["Danone", "/assets/clients/danone.svg"],
  ["Koperasi Astra", "/assets/clients/koperasi-astra.svg"],
  ["Wonderful Indonesia", ""],
  ["Toyota", "/assets/clients/toyota-reference.png"],
  ["Prodia", "/assets/clients/prodia-reference.png"],
  ["Shell", "/assets/clients/shell-reference.png"],
  ["Enjoy Jakarta", "/assets/clients/enjoy-jakarta-reference.png"],
  ["Client 09", ""],
  ["Client 10", ""],
  ["Client 11", ""],
  ["Client 12", ""],
].map(([name, logoUrl], index) => ({
  id: `v2-client-${index + 1}`,
  name,
  logoUrl,
  logoAlt: name,
  websiteUrl: "",
  order: index + 1,
  isVisible: true,
  isPlaceholder: index >= 6,
}));
v2Fallback.portfolio = Array.from({ length: 19 }, (_, index) => ({
  id: `v2-portfolio-${index + 1}`,
  title: `Thumbnail ${String(index + 1).padStart(2, "0")}`,
  client: "Perakaria",
  year: 2026,
  category: "Production",
  summary: "Karya visual Perakaria.",
  coverImageUrl: index < 18
    ? `/assets/portfolio/thumb-${String(index + 1).padStart(2, "0")}-reference.png`
    : `/assets/portfolio/thumb-${String(index + 1).padStart(2, "0")}.svg`,
  coverImageAlt: `Portfolio visual ${index + 1} Perakaria`,
  mediaType: "image" as const,
  videoUrl: "",
  order: index + 1,
  featured: true,
  isVisible: true,
  isPlaceholder: true,
}));
v2Fallback.contact.galleryImages = Array.from({ length: 5 }, (_, index) => ({
  imageUrl: `/assets/contact/tile-${index + 1}.svg`,
  imageAlt: `Visual contact Perakaria ${index + 1}`,
  title: `Studio visual ${index + 1}`,
}));

const isChanged = (current: unknown, baseline: unknown) => JSON.stringify(current) !== JSON.stringify(baseline);

/**
 * The existing production database contains the pre-v2 default payload. Keep
 * genuine CMS edits, but replace untouched legacy defaults with the v2 visual
 * baseline so a legacy publish cannot silently roll the v2 layout back.
 */
function mergeV2CmsContent(remote: PublicSitePayload): PublicSitePayload {
  const merged = structuredClone(v2Fallback);
  const legacy = defaultSiteContent as Record<string, any>;
  const incoming = remote as Record<string, any>;
  const target = merged as Record<string, any>;
  for (const key of ["settings", "theme", "sections", "hero", "about", "expertise", "contact"]) {
    const current = incoming[key];
    const baseline = legacy[key];
    if (!current || !baseline) continue;
    if (Array.isArray(current) || typeof current !== "object") {
      if (isChanged(current, baseline)) target[key] = structuredClone(current);
      continue;
    }
    for (const field of Object.keys(current)) {
      if (isChanged(current[field], baseline[field])) target[key][field] = structuredClone(current[field]);
    }
  }
  for (const key of ["skills", "services", "portfolio", "clients"]) {
    if (isChanged(incoming[key], legacy[key])) target[key] = structuredClone(incoming[key]);
  }
  return merged;
}

export const getV2Fallback = () => structuredClone(v2Fallback);

export async function loadSiteContent(): Promise<{ content: PublicSitePayload; source: "cms" | "fallback"; error?: string }> {
  if (!API_URL) return { content: getV2Fallback(), source: "fallback" };
  try {
    const response = await fetch(`${API_URL}/public/site?locale=id`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`CMS merespons ${response.status}`);
    const payload = (await response.json()) as { data: unknown };
    return { content: mergeV2CmsContent(publicSitePayloadSchema.parse(payload.data)), source: "cms" };
  } catch (error) {
    return { content: getV2Fallback(), source: "fallback", error: error instanceof Error ? error.message : "CMS tidak tersedia" };
  }
}






