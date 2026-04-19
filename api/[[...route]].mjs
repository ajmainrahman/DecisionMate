const { default: app } = await import("../artifacts/api-server/dist/app-export.mjs");

export default function handler(req, res) {
  req.url = req.url?.replace(/^\/api/, "") ?? "/";
  return app(req, res);
}
