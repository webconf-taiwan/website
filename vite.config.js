import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint";
import svgLoader from "vite-svg-loader";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader(),
    eslintPlugin({
      include: ["src/**/*.js", "src/**/*.vue", "src/*.js", "src/*.vue"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
