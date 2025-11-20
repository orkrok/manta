import { siteConfig } from "@/lib/site";

export default function sitemap() {
  const routes = ["", "/about", "/services", "/work", "/contact"].map(
    (path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.7,
    })
  );

  return routes;
}


