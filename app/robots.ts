import type { MetadataRoute } from "next";

import { getSiteUrl, isIndexable } from "@/lib/constants/site";

/** Dynamic robots.txt with sitemap reference and env-based indexing rules. */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (!isIndexable()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
