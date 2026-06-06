import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://renascent-elements.github.io",
  base: "/relements",
  // Project root is docs/public/, so the default static dir would be
  // docs/public/public/. Use ./static instead to avoid the nested name.
  publicDir: "./static",
  integrations: [
    starlight({
      title: "Relements",
      description: "HTML-first, framework-agnostic design system.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Renascent-Elements/relements",
        },
      ],
      customCss: ["@relements/core/index.css", "./src/styles/site.css"],
      components: {
        Head: "./src/components/Head.astro",
      },
      sidebar: [
        { label: "Introduction", slug: "index" },
        { label: "Guides", autogenerate: { directory: "guides" } },
        { label: "Components", autogenerate: { directory: "components" } },
        { label: "Frameworks", autogenerate: { directory: "frameworks" } },
      ],
    }),
  ],
  vite: {
    // Allow the monorepo root (resolved relative to this package) so the dev
    // server can read both the example pages (docs/examples) and hoisted deps
    // in the root node_modules.
    server: { fs: { allow: ["../.."] } },
  },
});
