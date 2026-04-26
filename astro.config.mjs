import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://vdolicku.cz",
  vite: {
    plugins: [tailwindcss()],
  },
});
