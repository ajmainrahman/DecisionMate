import express from "express";
import { Router } from "express";

const decisionsModule = await import("../artifacts/api-server/src/routes/decisions.js");
const healthModule = await import("../artifacts/api-server/src/routes/health.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const router = Router();
router.use(healthModule.default);
router.use(decisionsModule.default);
app.use(router);

export default function handler(req, res) {
  req.url = req.url?.replace(/^\/api/, "") ?? "/";
  return app(req, res);
}
