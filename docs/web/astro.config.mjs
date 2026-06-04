import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://renascent-elements.github.io",
  base: "/relements",
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
    server: { fs: { allow: [".."] } },
  },
});
