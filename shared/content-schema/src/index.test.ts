import { describe, expect, it } from "vitest";
import {
  clientSchema,
  contentEntryInputSchema,
  defaultSiteContent,
  heroSchema,
  publicSitePayloadSchema,
  themeSettingsSchema,
  siteSettingsSchema,
} from "./index";

describe("content contracts", () => {
  it("validates the default public site payload pieces", () => {
    expect(themeSettingsSchema.parse(defaultSiteContent.theme).accent).toBe("#FFC700");
    expect(heroSchema.parse(defaultSiteContent.hero).headline).toContain("Solusi Digital");
  });

  it("rejects unsafe URL protocols", () => { expect(() => siteSettingsSchema.parse({ ...defaultSiteContent.settings, logoUrl: "javascript:alert(1)" })).toThrow(); });

  it("requires alt text whenever a client logo is configured", () => {
    expect(() => clientSchema.parse({
      ...defaultSiteContent.clients[0],
      logoUrl: "/media/client-logo.png",
      logoAlt: "",
    })).toThrow(/Alt text wajib/);
  });
  it("fills backward-compatible expertise and team skill defaults", () => {
    const legacy = structuredClone(defaultSiteContent) as Record<string, any>;
    delete legacy.expertise;
    delete legacy.skills;
    const parsed = publicSitePayloadSchema.parse(legacy);
    expect(parsed.expertise.headline).toContain("Kreativitas");
    expect(parsed.skills).toHaveLength(4);
  });
  it("fills backward-compatible hero visibility defaults", () => {
    const legacy = structuredClone(defaultSiteContent) as Record<string, any>;
    delete legacy.hero.isVisible;
    expect(publicSitePayloadSchema.parse(legacy).hero.isVisible).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(() => contentEntryInputSchema.parse({ contentType: "service", locale: "id", slug: "Invalid Slug", data: {} })).toThrow();
  });
});