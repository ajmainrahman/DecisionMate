import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { Router } from "express";

// Direct imports bypassing workspace aliases for Vercel compatibility
import decisionsRouter from "../artifacts/api-server/src/routes/decisions.js";
import healthRouter from "../artifacts/api-server/src/routes/health.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const router = Router();
router.use(healthRouter);
router.use(decisionsRouter);
app.use(router);

export default function handler(req: VercelRequest, res: VercelResponse) {
  req.url = req.url?.replace(/^\/api/, "") ?? "/";
  return app(req as any, res as any);
}
