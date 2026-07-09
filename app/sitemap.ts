import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/constants/site";

/** Dynamic sitemap for the single-page app. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
