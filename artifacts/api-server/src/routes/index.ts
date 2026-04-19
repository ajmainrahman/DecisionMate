import { Router } from "express";
import decisionsRouter from "./decisions.js";
import healthRouter from "./health.js";

const router = Router();

router.use(healthRouter);
router.use(decisionsRouter);

export default router;
