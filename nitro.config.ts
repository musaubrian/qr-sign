//https://nitro.unjs.io/config
export default defineNitroConfig({
  compatibilityDate: "2025-05-20",
  srcDir: "server",
  runtimeConfig: {
    jwtSecret: "",
  },
  experimental: {
    websocket: true,
  },
});
