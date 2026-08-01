import { defaultSiteContent, publicSitePayloadSchema, type PublicSitePayload } from "@perakaria/content-schema";

const API_URL = import.meta.env.VITE_CMS_API_URL?.replace(/\/$/, "");

export interface SiteContentResult {
  content: PublicSitePayload;
  source: "cms" | "fallback";
  error?: string;
}

export const getSiteContent = async (): Promise<SiteContentResult> => {
  if (!API_URL) return { content: defaultSiteContent, source: "fallback" };
  try {
    const response = await fetch(`${API_URL}/public/site?locale=id`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`CMS merespons ${response.status}`);
    const payload = (await response.json()) as { data: unknown };
    return { content: publicSitePayloadSchema.parse(payload.data), source: "cms" };
  } catch (error) {
    return {
      content: defaultSiteContent,
      source: "fallback",
      error: error instanceof Error ? error.message : "CMS tidak tersedia",
    };
  }
};
export const loadPublicSite = async () => {
  const result = await getSiteContent();
  return { data: result.content, fallback: result.source === "fallback", error: result.error };
};