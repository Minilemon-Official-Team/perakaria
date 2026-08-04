import { describe, expect, it } from "vitest";
import { defaultSiteContent, type ContentType } from "@perakaria/content-schema";
import { composeWorkingPayload } from "./site-snapshot";
import type { ContentRow } from "./db";

const row = (content_type: ContentType, slug: string, data: unknown, sort_order = 0): ContentRow => ({
  id: content_type + ":" + slug,
  content_type,
  locale: "id",
  slug,
  data_json: JSON.stringify(data),
  status: "published",
  sort_order,
  is_visible: 1,
  rejection_reason: null,
  created_by: "user",
  updated_by: "user",
  approved_by: null,
  approved_at: null,
  published_at: null,
  created_at: "",
  updated_at: "",
});

describe("site snapshot composition", () => {
  it("keeps services and all contact image slots in one working payload", () => {
    const rows: ContentRow[] = [
      row("site_settings", "site", defaultSiteContent.settings),
      row("theme_settings", "theme", defaultSiteContent.theme),
      row("hero", "hero", defaultSiteContent.hero),
      row("about", "about", defaultSiteContent.about),
      row("expertise", "expertise", defaultSiteContent.expertise),
      row("contact", "contact", defaultSiteContent.contact),
      ...defaultSiteContent.sections.map((item) => row("section_settings", item.id, item, item.order)),
      ...defaultSiteContent.skills.map((item) => row("skill", item.id, item, item.order)),
      ...defaultSiteContent.services.map((item) => row("service", item.id, item, item.order)),
      ...defaultSiteContent.portfolio.map((item) => row("portfolio", item.id, item, item.order)),
      ...defaultSiteContent.clients.map((item) => row("client", item.id, item, item.order)),
    ];
    const payload = composeWorkingPayload(rows);
    expect(payload.services.length).toBe(defaultSiteContent.services.length);
    expect(payload.contact.galleryImages).toHaveLength(9);
  });

  it("prefers a working draft over the published row for the same key", () => {
    const published = row("contact", "contact", defaultSiteContent.contact);
    const draftContact = structuredClone(defaultSiteContent.contact);
    draftContact.galleryImages[8].title = "Draft grid 09";
    const draft = { ...row("contact", "contact", draftContact), id: "draft-contact", status: "draft" as const, updated_at: "9999-01-01" };
    const rows = [
      row("site_settings", "site", defaultSiteContent.settings),
      row("theme_settings", "theme", defaultSiteContent.theme),
      row("hero", "hero", defaultSiteContent.hero),
      row("about", "about", defaultSiteContent.about),
      row("expertise", "expertise", defaultSiteContent.expertise),
      published,
      draft,
      ...defaultSiteContent.sections.map((item) => row("section_settings", item.id, item, item.order)),
      ...defaultSiteContent.skills.map((item) => row("skill", item.id, item, item.order)),
      ...defaultSiteContent.services.map((item) => row("service", item.id, item, item.order)),
      ...defaultSiteContent.portfolio.map((item) => row("portfolio", item.id, item, item.order)),
      ...defaultSiteContent.clients.map((item) => row("client", item.id, item, item.order)),
    ];
    expect(composeWorkingPayload(rows).contact.galleryImages[8].title).toBe("Draft grid 09");
  });
});
