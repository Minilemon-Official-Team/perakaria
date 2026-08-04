import {
  defaultSiteContent,
  publicSitePayloadSchema,
  type PublicSitePayload,
} from "@perakaria/content-schema";
import { composePublicSite, type ContentRow } from "./db";

export type SnapshotStatus = "working" | "published";

export interface SiteSnapshotRow {
  id: string;
  status: SnapshotStatus;
  data_json: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

const statusPriority: Record<string, number> = {
  draft: 0,
  rejected: 1,
  pending_review: 2,
  published: 3,
  archived: 4,
};

const rowKey = (row: ContentRow) => row.content_type + ":" + row.locale + ":" + row.slug;

const chooseWorkingRows = (rows: ContentRow[]) => {
  const chosen = new Map<string, ContentRow>();
  for (const row of rows) {
    const current = chosen.get(rowKey(row));
    if (!current) {
      chosen.set(rowKey(row), row);
      continue;
    }
    const nextPriority = statusPriority[row.status] ?? 99;
    const currentPriority = statusPriority[current.status] ?? 99;
    if (
      nextPriority < currentPriority ||
      (nextPriority === currentPriority && row.updated_at > current.updated_at)
    ) {
      chosen.set(rowKey(row), row);
    }
  }
  return [...chosen.values()].filter((row) => row.status !== "archived");
};

const contentFromRows = (rows: ContentRow[]): PublicSitePayload => {
  const payload = structuredClone(defaultSiteContent);
  const entries = rows
    .sort((a, b) => a.sort_order - b.sort_order || a.updated_at.localeCompare(b.updated_at))
    .map((row) => ({
      contentType: row.content_type,
      data: JSON.parse(row.data_json) as Record<string, unknown>,
      sortOrder: row.sort_order,
      isVisible: row.is_visible === 1,
    }));
  const first = (type: string) => entries.find((entry) => entry.contentType === type)?.data;
  payload.settings = (first("site_settings") as PublicSitePayload["settings"] | undefined) ?? payload.settings;
  payload.theme = (first("theme_settings") as PublicSitePayload["theme"] | undefined) ?? payload.theme;
  payload.hero = (first("hero") as PublicSitePayload["hero"] | undefined) ?? payload.hero;
  payload.about = (first("about") as PublicSitePayload["about"] | undefined) ?? payload.about;
  payload.expertise = (first("expertise") as PublicSitePayload["expertise"] | undefined) ?? payload.expertise;
  payload.contact = (first("contact") as PublicSitePayload["contact"] | undefined) ?? payload.contact;
  const list = <T>(type: string) =>
    entries.filter((entry) => entry.contentType === type).map((entry) => entry.data as T);
  const sections = list<PublicSitePayload["sections"][number]>("section_settings");
  const skills = list<PublicSitePayload["skills"][number]>("skill");
  const services = list<PublicSitePayload["services"][number]>("service");
  const portfolio = list<PublicSitePayload["portfolio"][number]>("portfolio");
  const clients = list<PublicSitePayload["clients"][number]>("client");
  if (sections.length) payload.sections = sections;
  if (skills.length) payload.skills = skills;
  if (services.length) payload.services = services;
  if (portfolio.length) {
    payload.portfolio = portfolio.map((item, index) => {
      const fallback = defaultSiteContent.portfolio[index] ?? defaultSiteContent.portfolio[0];
      return {
        ...fallback,
        ...item,
        coverImageUrl: item.coverImageUrl || fallback.coverImageUrl || "/assets/portfolio/thumb.svg",
        coverImageAlt: item.coverImageAlt || fallback.coverImageAlt || "Portfolio image",
      };
    });
  }
  if (clients.length) payload.clients = clients;
  return publicSitePayloadSchema.parse(payload);
};

export const composeWorkingPayload = (rows: ContentRow[]) => contentFromRows(chooseWorkingRows(rows));

export const composePublishedPayload = (rows: ContentRow[]) =>
  publicSitePayloadSchema.parse(composePublicSite(rows.filter((row) => row.status === "published" && row.is_visible === 1)));

export const parseSnapshot = (row: SiteSnapshotRow) =>
  publicSitePayloadSchema.parse(JSON.parse(row.data_json) as unknown);

export async function ensureSiteSnapshots(db: D1Database, actorId: string) {
  const existing = await db.prepare(
    "SELECT * FROM site_revisions WHERE status IN ('working','published') ORDER BY status",
  ).all<SiteSnapshotRow>();
  const byStatus = new Map(existing.results.map((row) => [row.status, row]));
  if (!byStatus.has("working") || !byStatus.has("published")) {
    const rows = await db.prepare("SELECT * FROM content_entries ORDER BY content_type, sort_order, updated_at DESC").all<ContentRow>();
    const published = composePublishedPayload(rows.results);
    const working = composeWorkingPayload(rows.results);
    const statements: D1PreparedStatement[] = [];
    if (!byStatus.has("published")) {
      statements.push(db.prepare(
        "INSERT INTO site_revisions (id,status,data_json,created_by,updated_by,published_at) VALUES (?, 'published', ?, ?, ?, CURRENT_TIMESTAMP)",
      ).bind(crypto.randomUUID(), JSON.stringify(published), actorId, actorId));
    }
    if (!byStatus.has("working")) {
      statements.push(db.prepare(
        "INSERT INTO site_revisions (id,status,data_json,created_by,updated_by) VALUES (?, 'working', ?, ?, ?)",
      ).bind(crypto.randomUUID(), JSON.stringify(working), actorId, actorId));
    }
    try {
      if (statements.length) await db.batch(statements);
    } catch {
      // Another request may have seeded the unique working/published rows.
    }
  }
  const refreshed = await db.prepare(
    "SELECT * FROM site_revisions WHERE status IN ('working','published') ORDER BY status",
  ).all<SiteSnapshotRow>();
  return new Map(refreshed.results.map((row) => [row.status, row]));
}

export const validateSnapshot = (value: unknown) => publicSitePayloadSchema.parse(value);
