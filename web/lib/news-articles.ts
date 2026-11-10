import { siteData } from "./site-data";
import { guideIso } from "./guide-dates";
import type { GuideBody, GuideRow } from "./types";

/**
 * News articles: guides in the "News" category, plus any imported piece with a
 * content type (news, analysis or opinion), newest first. These live at
 * /guides/<slug>; /news and the header's News tab list them.
 */
export function newsArticles(): (GuideRow & { iso: string; contentType?: GuideBody["contentType"] })[] {
  const bodies = siteData.guideBodies as Record<string, GuideBody>;
  return siteData.guideRows
    .filter((g) => g.category === "News" || !!bodies[g.slug]?.contentType)
    .map((g) => ({ ...g, iso: guideIso(g.updated) ?? "", contentType: bodies[g.slug]?.contentType }))
    .sort((a, b) => b.iso.localeCompare(a.iso) || a.title.localeCompare(b.title));
}
