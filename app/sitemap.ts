import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/on-tap",
    "/thi-thu",
    "/tra-cuu",
    "/xep-hang",
    "/tien-do",
    "/hang-ngay",
    "/mon/dan-su",
    "/mon/hanh-chinh",
    "/mon/doanh-nghiep",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
