import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../artifacts/api-server/src/app.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  req.url = req.url?.replace(/^\/api/, "") ?? "/";
  return app(req as any, res as any);
}
