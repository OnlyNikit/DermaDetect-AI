// import { defineConfig, loadEnv } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";

// // https://vite.dev/config/
// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), "");
//   const ngrokHost = env.VITE_NGROK_URL
//     ? new URL(env.VITE_NGROK_URL).hostname
//     : null;

//   return {
//     plugins: [react(), tailwindcss()],
//     server: {
//       host: true,
//       allowedHosts: ngrokHost ? [ngrokHost] : [],
//       proxy: {
//         "/api": {
//           target: "http://localhost:8080",
//           changeOrigin: true,
//         },
//         "/uploads": {
//           target: "http://localhost:8080",
//           changeOrigin: true,
//         },
//       },
//     },
//   };
// });


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});