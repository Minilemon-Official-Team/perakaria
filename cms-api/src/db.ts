import type {
  ContentEntry,
  ContentType,
  PublicSitePayload,
} from "@perakaria/content-schema";
import { defaultSiteContent } from "@perakaria/content-schema";

export interface ContentRow {
  id: string;
  content_type: ContentType;
  locale: "id";
  slug: string;
  data_json: string;
  status: ContentEntry["status"];
  sort_order: number;
  is_visible: number;
  rejection_reason: string | null;
  created_by: string;
  updated_by: string;
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const mapContentRow = (row: ContentRow): ContentEntry => ({
  id: row.id,
  contentType: row.content_type,
  locale: row.locale,
  slug: row.slug,
  data: JSON.parse(row.data_json) as Record<string, unknown>,
  status: row.status,
  sortOrder: row.sort_order,
  isVisible: row.is_visible === 1,
  rejectionReason: row.rejection_reason,
  createdBy: row.created_by,
  updatedBy: row.updated_by,
  approvedBy: row.approved_by,
  approvedAt: row.approved_at,
  publishedAt: row.published_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const composePublicSite = (rows: ContentRow[]): PublicSitePayload => {
  const payload = structuredClone(defaultSiteContent);
  const entries = rows.filter((row) => row.status === "published" && row.is_visible === 1).map(mapContentRow);
  const byType = <T>(type: ContentType) =>
    entries
      .filter((entry) => entry.contentType === type)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((entry) => entry.data as T);

  payload.settings = byType<PublicSitePayload["settings"]>("site_settings")[0] ??
    payload.settings;
  payload.theme = byType<PublicSitePayload["theme"]>("theme_settings")[0] ??
    payload.theme;
  payload.hero = byType<PublicSitePayload["hero"]>("hero")[0] ?? payload.hero;
  payload.about =
    byType<PublicSitePayload["about"]>("about")[0] ?? payload.about;
  payload.expertise =
    byType<PublicSitePayload["expertise"]>("expertise")[0] ?? payload.expertise;
  payload.contact =
    byType<PublicSitePayload["contact"]>("contact")[0] ?? payload.contact;

  const sections =
    byType<PublicSitePayload["sections"][number]>("section_settings");
  const skills = byType<PublicSitePayload["skills"][number]>("skill");
  const services = byType<PublicSitePayload["services"][number]>("service");
  const portfolio =
    byType<PublicSitePayload["portfolio"][number]>("portfolio");
  const clients = byType<PublicSitePayload["clients"][number]>("client");

  if (sections.length) {
    const publishedSections = new Map(sections.map((section) => [section.id, section]));
    payload.sections = payload.sections.map((section) =>
      publishedSections.get(section.id) ?? section,
    );
  }
  if (skills.length) payload.skills = skills;
  if (services.length) payload.services = services;
  if (portfolio.length) payload.portfolio = portfolio;
  if (clients.length) payload.clients = clients;

  return payload;
};
