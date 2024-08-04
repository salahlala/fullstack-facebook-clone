import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
// import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tsconfigPaths()],
  server: {
    port: 3000,
  },
  // resolve: {
  //   alias: {
  //     "@components": "/src/components",
  //     "@pages": "/src/pages",
  //     "@utils": "/src/utils",
  //     "@hooks": "/src/hooks",
  //     "@types": "/src/types",
  //     "@routes": "/src/routes",
  //     "@layouts": "/src/layouts",
  //     "@features": "/src/features",
  //     "@store": "/src/store",
  //     // "@": path.resolve(__dirname, "./src"),
  //   },
  // },
});
