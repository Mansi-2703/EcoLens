// client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  // Prevent Vite from pre-bundling cesium and problematic dependencies
  optimizeDeps: {
    exclude: ["cesium", "mersenne-twister", "urijs", "grapheme-splitter", "bitmap-sdf", "lerc", "nosleep.js"],
  },

resolve: {
  alias: {
    // existing cesium alias
    cesium: path.resolve(__dirname, "node_modules/cesium/Source"),
    // map mersenne-twister to the shim file so imports resolve
    "mersenne-twister": path.resolve(__dirname, "src/shims/mersenne-twister.js"),
    // map urijs to the shim file so imports resolve
    "urijs": path.resolve(__dirname, "src/shims/urijs.js"),
    // map grapheme-splitter to the shim file so imports resolve
    "grapheme-splitter": path.resolve(__dirname, "src/shims/grapheme-splitter.js"),
    // map bitmap-sdf to the shim file so imports resolve
    "bitmap-sdf": path.resolve(__dirname, "src/shims/bitmap-sdf.js"),
    // map lerc to the shim file so imports resolve
    "lerc": path.resolve(__dirname, "src/shims/lerc.js"),
    // map nosleep.js to the shim file so imports resolve
    "nosleep.js": path.resolve(__dirname, "src/shims/nosleep.js"),
  },
},



  server: {
    fs: {
      allow: [
        path.resolve(__dirname), // allow client root
        path.resolve(__dirname, "public/cesium"),
        path.resolve(__dirname, "node_modules/cesium"),
      ],
    },
  },

  define: {
    CESIUM_BASE_URL: JSON.stringify("/cesium"),
  },

  build: {
    chunkSizeWarningLimit: 1600,
  },
});
