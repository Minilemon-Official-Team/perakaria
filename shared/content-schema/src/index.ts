import { z } from "zod";

export const roles = ["superadmin", "admin_writer"] as const;
export const contentStatuses = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "archived",
] as const;
export const contentTypes = [
  "site_settings",
  "theme_settings",
  "section_settings",
  "hero",
  "about",
  "expertise",
  "skill",
  "service",
  "portfolio",
  "client",
  "contact",
] as const;

export const roleSchema = z.enum(roles);
export const contentStatusSchema = z.enum(contentStatuses);
export const contentTypeSchema = z.enum(contentTypes);

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Gunakan warna HEX 6 digit.");
const httpUrl = z.string().url().refine((value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, "Gunakan URL HTTP(S).");
const optionalUrl = z.union([httpUrl, z.literal("")]).default("");
const mediaPath = z.string().min(1).refine((value) => (/^\/(?!\/)/.test(value) || httpUrl.safeParse(value).success), "Gunakan path lokal atau URL HTTP(S).");
const optionalMediaPath = z.union([mediaPath, z.literal("")]).default("");
const actionHref = z.string().refine((value) => (/^#[a-z0-9-]+$/.test(value) || httpUrl.safeParse(value).success), "Gunakan anchor atau URL HTTP(S).");

export const themePaletteDefaults = {
  backgroundPrimary: "#06121C",
  backgroundSecondary: "#101010",
  titlePrimary: "#8C62EF",
  titleSecondary: "#D9D9D9",
  textPrimary: "#FFFFFF",
  textSecondary: "#000000",
} as const;

export const themePaletteSchema = z.object({
  backgroundPrimary: hexColor,
  backgroundSecondary: hexColor,
  titlePrimary: hexColor,
  titleSecondary: hexColor,
  textPrimary: hexColor,
  textSecondary: hexColor,
});
export type ThemePalette = z.infer<typeof themePaletteSchema>;

export const sectionThemeRoleSchema = z.object({
  background: z.enum(["backgroundPrimary", "backgroundSecondary"]),
  title: z.enum(["titlePrimary", "titleSecondary"]),
  text: z.enum(["textPrimary", "textSecondary"]),
});
export type SectionThemeRole = z.infer<typeof sectionThemeRoleSchema>;

export const siteSettingsSchema = z.object({
  brandName: z.string().min(1).max(80),
  shortName: z.string().min(1).max(24),
  logoUrl: optionalMediaPath,
  faviconUrl: optionalMediaPath,
  whatsapp: z.string().default(""),
  email: z.string().email(),
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  vimeoUrl: optionalUrl,
  location: z.string().default("Indonesia"),
  seoTitle: z.string().min(10).max(65),
  seoDescription: z.string().min(30).max(170),
  ogImageUrl: optionalMediaPath,
  canonicalUrl: optionalUrl,
  navigation: z.array(
    z.object({
      label: z.string().min(1).max(30),
      href: z.string().regex(/^#[a-z0-9-]+$/),
    }),
  ),
});

export const themeSettingsSchema = z.object({
  background: hexColor,
  surface: hexColor,
  text: hexColor,
  muted: hexColor,
  accent: hexColor,
  accentSecondary: hexColor,
  danger: hexColor,
  overlayOpacity: z.number().min(0).max(0.9),
  fontFamily: z.enum(["Archivo", "PP Neue Montreal"]),
  motionEnabled: z.boolean(),
  palette: themePaletteSchema.default(themePaletteDefaults),
});

export const sectionSettingsSchema = z.object({
  id: z.enum(["work", "services", "about", "clients", "expertise", "contact"]),
  label: z.string().min(1).max(60),
  intro: z.string().max(280).default(""),
  order: z.number().int().min(0).max(20),
  isVisible: z.boolean(),
  backgroundMode: z.enum(["solid", "image"]),
  backgroundColor: hexColor,
  backgroundImageUrl: optionalMediaPath,
  overlayOpacity: z.number().min(0).max(0.9),
  focalPoint: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),
  themeRoles: sectionThemeRoleSchema.default({ background: "backgroundPrimary", title: "titlePrimary", text: "textPrimary" }),
});

export const heroSchema = z.object({
  eyebrow: z.string().max(80).default(""),
  isVisible: z.boolean().default(true),
  alignment: z.enum(["left", "center"]).default("left"),
  headline: z.string().min(1).max(120),
  body: z.string().min(1).max(320),
  ctaLabel: z.string().min(1).max(40),
  ctaHref: actionHref,
  secondaryCtaLabel: z.string().max(40).default(""),
  secondaryCtaHref: z.union([actionHref, z.literal("")]).default(""),
  posterImageUrl: mediaPath,
  posterAlt: z.string().min(1).max(180),
  videoUrl: optionalMediaPath,
  mediaFocalPoint: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),
  metadata: z.array(
    z.object({
      label: z.string().min(1).max(24),
      value: z.string().min(1).max(40),
    }),
  ),
});

export const defaultAboutGridImages = [
  { imageUrl: "/media/team-creative-director.png", imageAlt: "Tim kreatif meninjau storyboard di dalam studio.", label: "Cinematic" },
  { imageUrl: "/media/work-post.png", imageAlt: "Editor bekerja di color grading suite.", label: "Visual Effects" },
  { imageUrl: "/media/team-post-production.png", imageAlt: "Spesialis post-production melakukan color grading di studio.", label: "Color Grading" },
  { imageUrl: "/media/team-cinematographer.png", imageAlt: "Tim produksi menyiapkan kamera sinema di studio.", label: "3D & 2D Animation" },
  { imageUrl: "/media/work-mapping.png", imageAlt: "Instalasi cahaya dan projection mapping.", label: "Motion Design" },
  { imageUrl: "/media/team-creative-technologist.png", imageAlt: "Creative technologist menguji instalasi visual interaktif.", label: "Visual Effects (VFX)" },
  { imageUrl: "/media/work-interactive.png", imageAlt: "Instalasi digital generatif di ruang gelap.", label: "Color Grading" },
  { imageUrl: "/media/work-camera-rig.png", imageAlt: "Kamera sinema di lokasi produksi.", label: "Software Engineering" },
  { imageUrl: "/media/work-live.png", imageAlt: "Pertunjukan visual dengan cahaya panggung.", label: "Technical Art" },
] as const;

const aboutGridImageSchema = z.object({
  imageUrl: mediaPath,
  imageAlt: z.string().min(1).max(180),
  label: z.string().min(1).max(80),
});

export const aboutSchema = z.object({
  kicker: z.string().max(60),
  headline: z.string().min(1).max(120),
  body: z.string().min(1).max(800),
  imageUrl: mediaPath,
  imageAlt: z.string().min(1).max(180),
  mediaType: z.enum(["image", "video"]).default("image"),
  videoUrl: optionalMediaPath,
  gridImages: z.array(aboutGridImageSchema).length(9).default(defaultAboutGridImages.map((image) => ({ ...image }))),
  gridTrim: z.number().int().min(0).max(24).default(5),
  gridLabelSize: z.number().int().min(8).max(24).default(14),
  gridVerticalPadding: z.number().int().min(0).max(24).default(7),
  metrics: z.array(
    z.object({
      value: z.string().min(1).max(20),
      label: z.string().min(1).max(40),
      isPlaceholder: z.boolean().default(true),
    }),
  ),
});

export const expertiseSchema = z.object({
  headline: z.string().min(1).max(120),
  body: z.string().min(1).max(800),
  interactionHint: z.string().min(1).max(120),
});

export const skillSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1).max(80),
  description: z.string().min(1).max(360),
  specialistName: z.string().min(1).max(80),
  specialistRole: z.string().min(1).max(100),
  photoUrl: mediaPath,
  photoAlt: z.string().min(1).max(180),
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  isPlaceholder: z.boolean().default(true),
});
export const serviceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  category: z.enum(["creative", "technology"]),
  description: z.string().min(1).max(260),
  details: z.array(z.string().min(1).max(100)).default([]),
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
});

export const portfolioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  client: z.string().min(1).max(100),
  year: z.number().int().min(2000).max(2100),
  category: z.string().min(1).max(80),
  summary: z.string().max(320).default(""),
  coverImageUrl: mediaPath,
  coverImageAlt: z.string().min(1).max(180),
  mediaType: z.enum(["image", "video"]),
  videoUrl: optionalMediaPath,
  order: z.number().int().min(0),
  featured: z.boolean(),
  isVisible: z.boolean().default(true),
  isPlaceholder: z.boolean().default(true),
});

export const clientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  logoUrl: optionalMediaPath,
  logoAlt: z.string().max(180).default(""),
  websiteUrl: optionalUrl,
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  isPlaceholder: z.boolean().default(true),
}).superRefine((client, context) => {
  if (client.logoUrl && !client.logoAlt.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["logoAlt"],
      message: "Alt text wajib ketika logo klien diisi.",
    });
  }
});

const defaultContactGalleryImages = [
  { imageUrl: "/assets/contact/grid-01.png", imageAlt: "Visual contact Perakaria 01", title: "Studio visual 01" },
  { imageUrl: "/assets/contact/grid-02.png", imageAlt: "Visual contact Perakaria 02", title: "Studio visual 02" },
  { imageUrl: "/assets/contact/grid-03.png", imageAlt: "Visual contact Perakaria 03", title: "Studio visual 03" },
  { imageUrl: "/assets/contact/grid-04.png", imageAlt: "Visual contact Perakaria 04", title: "Studio visual 04" },
  { imageUrl: "/assets/contact/grid-05.png", imageAlt: "Visual contact Perakaria 05", title: "Studio visual 05" },
  { imageUrl: "/assets/contact/grid-06.png", imageAlt: "Visual contact Perakaria 06", title: "Studio visual 06" },
  { imageUrl: "/assets/contact/grid-07.png", imageAlt: "Visual contact Perakaria 07", title: "Studio visual 07" },
  { imageUrl: "/assets/contact/grid-08.png", imageAlt: "Visual contact Perakaria 08", title: "Studio visual 08" },
  { imageUrl: "/assets/contact/grid-09.png", imageAlt: "Visual contact Perakaria 09", title: "Studio visual 09" },
] as const;

const contactGalleryImageSchema = z.object({
  imageUrl: mediaPath,
  imageAlt: z.string().min(1).max(180),
  title: z.string().min(1).max(80),
});

export const contactSchema = z.object({
  headline: z.string().min(1).max(120),
  whatsappLabel: z.string().max(40),
  emailLabel: z.string().max(40),
  galleryImages: z.array(contactGalleryImageSchema).min(1).max(9).default(defaultContactGalleryImages.map((image) => ({ ...image }))),
  galleryDirection: z.enum(["descending-right", "ascending-right"]).default("descending-right"),
  galleryVerticalAlignment: z.enum(["start", "center", "end"]).default("center"),
  footerNote: z.string().min(1).max(180),
});

export const dataSchemas = {
  site_settings: siteSettingsSchema,
  theme_settings: themeSettingsSchema,
  section_settings: sectionSettingsSchema,
  hero: heroSchema,
  about: aboutSchema,
  expertise: expertiseSchema,
  skill: skillSchema,
  service: serviceSchema,
  portfolio: portfolioSchema,
  client: clientSchema,
  contact: contactSchema,
} satisfies Record<(typeof contentTypes)[number], z.ZodType>;

export const contentEntryInputSchema = z.object({
  contentType: contentTypeSchema,
  locale: z.literal("id").default("id"),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  data: z.record(z.unknown()),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const validateContentData = (
  contentType: ContentType,
  data: unknown,
) => dataSchemas[contentType].parse(data);

export type Role = z.infer<typeof roleSchema>;
export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type ContentType = z.infer<typeof contentTypeSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
export type SectionSettings = z.infer<typeof sectionSettingsSchema>;
export type Hero = z.infer<typeof heroSchema>;
export type About = z.infer<typeof aboutSchema>;
export type Expertise = z.infer<typeof expertiseSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type PortfolioItem = z.infer<typeof portfolioSchema>;
export type Client = z.infer<typeof clientSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type ContentEntryInput = z.infer<typeof contentEntryInputSchema>;

export interface ContentEntry<TData = Record<string, unknown>> {
  id: string;
  contentType: ContentType;
  locale: "id";
  slug: string;
  data: TData;
  status: ContentStatus;
  sortOrder: number;
  isVisible: boolean;
  rejectionReason: string | null;
  createdBy: string;
  updatedBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const defaultExpertiseContent: Expertise = {
  headline: "Kreativitas yang dieksekusi dengan presisi.",
  body:
    "Kami memadukan energi kreatif yang segar dengan keahlian teknis yang inovatif untuk menghasilkan karya berstandar tinggi, dari Video Production hingga Creative Tech.",
  interactionHint:
    "Arahkan kursor atau fokuskan nama keahlian untuk melihat detail. Di mobile, ketuk salah satu keahlian.",
};

export const defaultTeamSkills: Skill[] = [
  {
    id: "video-production",
    name: "Video Production",
    description:
      "Produksi video menyeluruh yang mencakup Company Profile, TV Commercial, Digital Commercial, Music Video, hingga Post Production.",
    specialistName: "Tim Perakaria",
    specialistRole: "Audio Visual Production",
    photoUrl: "/media/team-creative-director.png",
    photoAlt: "Tim kreatif meninjau storyboard di dalam studio.",
    order: 1,
    isVisible: true,
    isPlaceholder: false,
  },
  {
    id: "animation",
    name: "3D & 2D Animation",
    description:
      "Eksplorasi visual sinematik melalui animasi 3D dan 2D yang memperkuat cerita, identitas, dan pengalaman brand.",
    specialistName: "Tim Perakaria",
    specialistRole: "Design & Animation",
    photoUrl: "/media/team-cinematographer.png",
    photoAlt: "Tim produksi menyiapkan kamera sinema di studio.",
    order: 2,
    isVisible: true,
    isPlaceholder: false,
  },
  {
    id: "software-engineering",
    name: "Software Engineering",
    description:
      "Pengembangan solusi digital yang dirancang presisi, fungsional, dan selaras dengan kebutuhan pengalaman pengguna.",
    specialistName: "Tim Perakaria",
    specialistRole: "Digital Innovation",
    photoUrl: "/media/team-post-production.png",
    photoAlt: "Spesialis post-production melakukan color grading di studio.",
    order: 3,
    isVisible: true,
    isPlaceholder: false,
  },
  {
    id: "creative-tech",
    name: "Creative Tech",
    description:
      "Interactive Media, Virtual Showrooms, Game, AR / VR, dan Web Design untuk pengalaman digital yang responsif.",
    specialistName: "Tim Perakaria",
    specialistRole: "Creative Technology",
    photoUrl: "/media/team-creative-technologist.png",
    photoAlt: "Creative technologist menguji instalasi visual interaktif.",
    order: 4,
    isVisible: true,
    isPlaceholder: false,
  },
];export const publicSitePayloadSchema = z.object({
  settings: siteSettingsSchema,
  theme: themeSettingsSchema,
  sections: z.array(sectionSettingsSchema),
  hero: heroSchema,
  about: aboutSchema,
  expertise: expertiseSchema.default(defaultExpertiseContent),
  skills: z.array(skillSchema).default(defaultTeamSkills),
  services: z.array(serviceSchema),
  portfolio: z.array(portfolioSchema),
  clients: z.array(clientSchema),
  contact: contactSchema,
});
export type PublicSitePayload = z.infer<typeof publicSitePayloadSchema>;

export const defaultSiteContent: PublicSitePayload = {
  settings: {
    brandName: "Perakaria",
    shortName: "Perakaria",
    logoUrl: "",
    faviconUrl: "",
    whatsapp: "6281234567890",
    email: "halo@perakaria.studio",
    instagramUrl: "",
    linkedinUrl: "",
    vimeoUrl: "",
    location: "Jl. Duren I No. 129, Rangkapan Jaya Baru, Kec. Pancoran Mas, Kota Depok, Jawa Barat 16434",
    seoTitle: "Perakaria — Creative & Production House",
    seoDescription:
      "Perakaria adalah Creative & Production House untuk Audio Visual Production, Design & Branding, serta solusi digital interaktif.",
    ogImageUrl: "/media/hero-studio-signal.png",
    canonicalUrl: "",
    navigation: [
      { label: "Work", href: "#work" },
      { label: "Klien", href: "#clients" },
      { label: "Tentang", href: "#about" },
      { label: "Kontak", href: "#contact" },
    ],
  },
  theme: {
    background: "#06121C",
    surface: "#101010",
    text: "#FFFFFF",
    muted: "#D9D9D9",
    accent: "#8C62EF",
    accentSecondary: "#D9D9D9",
    danger: "#FF4D4D",
    overlayOpacity: 0.46,
    fontFamily: "Archivo",
    motionEnabled: true,
    palette: { ...themePaletteDefaults },
  },
  sections: [
    {
      id: "work",
      label: "Work & Services",
      intro: "Audio Visual Production, Design & Branding, dan solusi digital untuk pengalaman yang berdampak.",
      order: 1,
      isVisible: true,
      backgroundMode: "solid",
      backgroundColor: "#090A0D",
      backgroundImageUrl: "",
      overlayOpacity: 0.4,
      focalPoint: { x: 50, y: 50 },
      themeRoles: { background: "backgroundPrimary", title: "titlePrimary", text: "textPrimary" },
    },
    {
      id: "about",
      label: "Creative + Technology",
      intro: "",
      order: 3,
      isVisible: true,
      backgroundMode: "solid",
      backgroundColor: "#090A0D",
      backgroundImageUrl: "",
      overlayOpacity: 0.4,
      focalPoint: { x: 50, y: 50 },
      themeRoles: { background: "backgroundSecondary", title: "titlePrimary", text: "textPrimary" },
    },
    {
      id: "clients",
      label: "Our Clients",
      intro: "Kami berkolaborasi dengan brand dan institusi di berbagai sektor.",
      order: 2,
      isVisible: true,
      backgroundMode: "solid",
      backgroundColor: "#15161B",
      backgroundImageUrl: "",
      overlayOpacity: 0.4,
      focalPoint: { x: 50, y: 50 },
      themeRoles: { background: "backgroundSecondary", title: "titlePrimary", text: "textPrimary" },
    },
{
      id: "expertise",
      label: "Expertise",
      intro: "",
      order: 4,
      isVisible: true,
      backgroundMode: "solid",
      backgroundColor: "#06121C",
      backgroundImageUrl: "",
      overlayOpacity: 0.4,
      focalPoint: { x: 50, y: 50 },
      themeRoles: { background: "backgroundPrimary", title: "titlePrimary", text: "textPrimary" },
    },    {
      id: "contact",
      label: "Alamat & Kontak",
      intro: "",
      order: 5,
      isVisible: true,
      backgroundMode: "solid",
      backgroundColor: "#090A0D",
      backgroundImageUrl: "",
      overlayOpacity: 0,
      focalPoint: { x: 50, y: 50 },
      themeRoles: { background: "backgroundPrimary", title: "titlePrimary", text: "textPrimary" },
    },
  ],
  hero: {
    eyebrow: "Creative & Production House",
    isVisible: true,
    alignment: "left",
    headline: "Solusi Digital Inovatif, Eksekusi Visual Sinematik.",
    body:
      "Creative & Production House untuk Video Production, Design & Branding, serta inovasi digital.",
    ctaLabel: "Mulai percakapan",
    ctaHref: "#contact",
    secondaryCtaLabel: "Lihat karya",
    secondaryCtaHref: "#work",
    posterImageUrl: "/media/hero-studio-signal.png",
    posterAlt:
      "Siluet profesional kreatif di studio gelap dengan pencahayaan linear.",
    videoUrl: "",
    mediaFocalPoint: { x: 56, y: 50 },
    metadata: [
      { label: "Studio", value: "Perakaria" },
      { label: "Fokus", value: "70% Audiovisual" },
      { label: "Kapabilitas", value: "30% Technology" },
      { label: "Lokasi", value: "Indonesia" },
    ],
  },
  about: {
    kicker: "Tentang Perakaria",
    headline: "Creative & Production House",
    body:
      "Kami adalah Creative and Production House dengan pengalaman lebih dari satu dekade, dibangun atas dasar komitmen terhadap kualitas, estetika, dan ketepatan sasaran. Bidang kami mencakup Video Production secara menyeluruh, mulai dari Cinematic, 3D & 2D Animation, serta inovasi digital melalui Software Engineering dan Creative Tech. Kami memadukan energi kreatif yang segar dengan keahlian teknis yang inovatif untuk menghasilkan karya berstandar tinggi. Jangkauan global kami menjadi bukti komitmen kami dalam menghadirkan solusi yang dirancang presisi, dieksekusi dengan mulus, dan memberikan dampak nyata bagi setiap klien.",
    imageUrl: "/media/about-studio-floor.png",
    imageAlt: "Tim produksi di dalam studio film.",
    mediaType: "video",
    videoUrl: "/assets/about/showreel.mp4",
    gridImages: defaultAboutGridImages.map((image) => ({ ...image })),
    gridTrim: 5,
    gridLabelSize: 14,
    gridVerticalPadding: 7,
    metrics: [
      { value: "10+", label: "Tahun pengalaman", isPlaceholder: false },
      { value: "Global", label: "Jangkauan", isPlaceholder: false },
      { value: "End-to-end", label: "Video production", isPlaceholder: false },
      { value: "Creative Tech", label: "Digital innovation", isPlaceholder: false },
    ],
  },
  expertise: defaultExpertiseContent,
  skills: defaultTeamSkills,
  services: [
    {
      id: "audio-visual-production",
      title: "Audio Visual Production",
      category: "creative",
      description:
        "Produksi audio visual menyeluruh, dari perencanaan kreatif hingga post production.",
      details: ["Video Profile", "Video Commercial", "Music Video", "Post Production"],
      order: 1,
      isVisible: true,
    },
    {
      id: "design-branding",
      title: "Design & Branding",
      category: "creative",
      description:
        "Sistem visual dan pengalaman brand yang dibangun dengan arah kreatif yang jelas.",
      details: ["Product Showcase", "Virtual Showrooms", "Visuals Event Packages", "AR / VR & 3D Simulator", "Web Design & Branding"],
      order: 2,
      isVisible: true,
    },
    {
      id: "interactive-media",
      title: "Interactive Media",
      category: "technology",
      description:
        "Pengalaman digital interaktif yang menghubungkan ruang, audiens, dan teknologi.",
      details: [],
      order: 3,
      isVisible: false,
    },
    {
      id: "digital-innovation",
      title: "Digital Innovation",
      category: "technology",
      description:
        "Software Engineering dan Creative Tech untuk solusi digital yang fungsional dan berkarakter.",
      details: [],
      order: 4,
      isVisible: false,
    },
  ],  portfolio: [
    {
      id: "company-profile",
      title: "Company Profile",
      client: "Audio Visual Production",
      year: 2026,
      category: "Production",
      summary: "Company Profile dengan arah visual sinematik dan cerita yang tepat sasaran.",
      coverImageUrl: "/media/work-camera-rig.png",
      coverImageAlt: "Kamera sinema di lokasi produksi.",
      mediaType: "video",
      videoUrl: "",
      order: 1,
      featured: true,
      isVisible: true,
      isPlaceholder: false,
    },
    {
      id: "tv-commercial",
      title: "TV Commercial",
      client: "Audio Visual Production",
      year: 2026,
      category: "Commercial",
      summary: "TV Commercial dengan eksekusi visual yang tajam dan terukur.",
      coverImageUrl: "/media/work-mapping.png",
      coverImageAlt: "Instalasi cahaya dan projection mapping.",
      mediaType: "video",
      videoUrl: "",
      order: 2,
      featured: true,
      isVisible: true,
      isPlaceholder: false,
    },
    {
      id: "digital-commercial",
      title: "Digital Commercial",
      client: "Audio Visual Production",
      year: 2025,
      category: "Digital",
      summary: "Digital Commercial yang menyatukan pesan brand dan craft visual.",
      coverImageUrl: "/media/work-product.png",
      coverImageAlt: "Still life produk dengan pencahayaan sinematik.",
      mediaType: "image",
      videoUrl: "",
      order: 3,
      featured: true,
      isVisible: true,
      isPlaceholder: false,
    },
    {
      id: "music-video",
      title: "Music Video",
      client: "Audio Visual Production",
      year: 2025,
      category: "Music",
      summary: "Music Video yang membangun emosi melalui ritme, gambar, dan performa.",
      coverImageUrl: "/media/work-live.png",
      coverImageAlt: "Pertunjukan visual dengan cahaya panggung.",
      mediaType: "video",
      videoUrl: "",
      order: 4,
      featured: true,
      isVisible: true,
      isPlaceholder: false,
    },
    {
      id: "post-production",
      title: "Post Production",
      client: "Audio Visual Production",
      year: 2025,
      category: "Finishing",
      summary: "Editing, color, dan finishing untuk menjaga kualitas akhir setiap frame.",
      coverImageUrl: "/media/work-post.png",
      coverImageAlt: "Editor bekerja di color grading suite.",
      mediaType: "video",
      videoUrl: "",
      order: 5,
      featured: true,
      isVisible: true,
      isPlaceholder: false,
    },
    {
      id: "interactive-media",
      title: "Interactive Media",
      client: "Creative Tech",
      year: 2025,
      category: "Technology",
      summary: "Interactive Media untuk pengalaman yang responsif dan dapat digunakan.",
      coverImageUrl: "/media/work-interactive.png",
      coverImageAlt: "Instalasi digital generatif di ruang gelap.",
      mediaType: "image",
      videoUrl: "",
      order: 6,
      featured: true,
      isVisible: true,
      isPlaceholder: false,
    },
    {
      id: "v2-thumbnail-07",
      title: "Thumbnail 07",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 07, siap diganti dari CMS.",
      coverImageUrl: "/assets/portfolio/thumb-07.svg",
      coverImageAlt: "Placeholder Thumbnail 07 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 7,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-08",
      title: "Thumbnail 08",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 08, siap diganti dari CMS.",
      coverImageUrl: "/assets/portfolio/thumb-08.svg",
      coverImageAlt: "Placeholder Thumbnail 08 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 8,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-09",
      title: "Thumbnail 09",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 09, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 09 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 9,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-10",
      title: "Thumbnail 10",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 10, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 10 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 10,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-11",
      title: "Thumbnail 11",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 11, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 11 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 11,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-12",
      title: "Thumbnail 12",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 12, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 12 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 12,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-13",
      title: "Thumbnail 13",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 13, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 13 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 13,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-14",
      title: "Thumbnail 14",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 14, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 14 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 14,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-15",
      title: "Thumbnail 15",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 15, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 15 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 15,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-16",
      title: "Thumbnail 16",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 16, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 16 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 16,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-17",
      title: "Thumbnail 17",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 17, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 17 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 17,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-18",
      title: "Thumbnail 18",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 18, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 18 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 18,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
    {
      id: "v2-thumbnail-19",
      title: "Thumbnail 19",
      client: "Perakaria",
      year: 2026,
      category: "Production",
      summary: "Placeholder thumbnail 19, siap diganti dari CMS.",
      coverImageUrl: "",
      coverImageAlt: "Placeholder Thumbnail 19 Perakaria.",
      mediaType: "image",
      videoUrl: "",
      order: 19,
      featured: true,
      isVisible: true,
      isPlaceholder: true,
    },
  ],  clients: [
    ["JTI", "/assets/clients/jti-reference.png"],
    ["Danone", "/assets/clients/danone-reference.png"],
    ["Koperasi Astra", "/assets/clients/koperasi-astra-reference.png"],
    ["Wonderful Indonesia", ""],
    ["Toyota", "/assets/clients/toyota-reference.png"],
    ["Prodia", "/assets/clients/prodia-reference.png"],
    ["Shell", "/assets/clients/shell-reference.png"],
    ["Enjoy Jakarta", "/assets/clients/enjoy-jakarta-reference.png"],
  ].map(([name, logoUrl], index) => ({
    id: `client-${index + 1}`,
    name,
    logoUrl,
    logoAlt: logoUrl ? name : "",
    websiteUrl: "",
    order: index + 1,
    isVisible: true,
    isPlaceholder: false,
  })),  contact: {
    headline: "Alamat & Kontak",
    whatsappLabel: "WhatsApp",
    emailLabel: "Email",
    galleryImages: defaultContactGalleryImages.map((image) => ({ ...image })),
    galleryDirection: "descending-right",
    galleryVerticalAlignment: "center",
    footerNote: "© 2026 Perakaria. Creative & Production House.",
  },
};




