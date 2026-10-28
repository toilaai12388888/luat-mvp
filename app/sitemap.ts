import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getAllCaseStudies } from "@/lib/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/on-tap",
    "/thi-thu",
    "/tra-cuu",
    "/xep-hang",
    "/tien-do",
    "/hang-ngay",
    "/luyen-an",
    "/mon/dan-su",
    "/mon/hanh-chinh",
    "/mon/doanh-nghiep",
  ];

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/luyen-an" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/luyen-an" ? 0.9 : 0.8,
  }));

  const caseStudies = getAllCaseStudies();
  const caseEntries: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
    url: `${SITE_URL}/luyen-an/${cs.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...caseEntries];
}
