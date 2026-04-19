import { and, desc, eq, gte, ilike, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateDecisionBody,
  DeleteDecisionParams,
  GetDecisionDashboardResponse,
  ListDecisionsQueryParams,
  ListDecisionsResponse,
  ListDecisionsResponseItem,
} from "@workspace/api-zod";
import { db, decisionsTable } from "@workspace/db";
import { enhanceWithAi, evaluateRules } from "../lib/decision-engine";

const router: IRouter = Router();

router.get("/decisions", async (req, res, next) => {
  try {
    const params = ListDecisionsQueryParams.parse(req.query);
    const filters = [
      params.search ? ilike(decisionsTable.problem, `%${params.search}%`) : undefined,
      params.mood ? eq(decisionsTable.mood, params.mood) : undefined,
      params.priority ? eq(decisionsTable.priority, params.priority) : undefined,
    ].filter(Boolean);

    const rows = await db
      .select()
      .from(decisionsTable)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(decisionsTable.createdAt))
      .limit(50);

    res.json(ListDecisionsResponse.parse(rows));
  } catch (err) {
    next(err);
  }
});

router.post("/decisions", async (req, res, next) => {
  try {
    const body = CreateDecisionBody.parse(req.body);
    const rule = evaluateRules(body);
    const enhanced = await enhanceWithAi(body, rule);

    const [created] = await db
      .insert(decisionsTable)
      .values({
        problem: body.problem,
        mood: body.mood ?? null,
        timeAvailable: body.timeAvailable ?? null,
        priority: body.priority ?? null,
        sleepHours: body.sleepHours ?? null,
        stressLevel: body.stressLevel ?? null,
        deadline: body.deadline ?? null,
        ruleDecision: rule.decision,
        ruleExplanation: rule.explanation,
        finalDecision: enhanced.finalDecision,
        explanation: enhanced.explanation,
        confidence: enhanced.confidence,
        aiUsed: enhanced.aiUsed,
      })
      .returning();

    res.status(201).json(ListDecisionsResponseItem.parse(created));
  } catch (err) {
    next(err);
  }
});

router.delete("/decisions/:id", async (req, res, next) => {
  try {
    const params = DeleteDecisionParams.parse(req.params);
    await db.delete(decisionsTable).where(eq(decisionsTable.id, params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get("/decisions/dashboard", async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totals] = await db
      .select({
        totalCount: sql<number>`count(*)::int`,
        aiEnhancedCount: sql<number>`count(*) filter (where ${decisionsTable.aiUsed})::int`,
        averageConfidence: sql<number>`coalesce(round(avg(${decisionsTable.confidence})), 0)::int`,
      })
      .from(decisionsTable);

    const [todayRow] = await db
      .select({ todayCount: sql<number>`count(*)::int` })
      .from(decisionsTable)
      .where(gte(decisionsTable.createdAt, today));

    const recentDecisions = await db
      .select()
      .from(decisionsTable)
      .orderBy(desc(decisionsTable.createdAt))
      .limit(5);

    const moodBreakdown = await db
      .select({
        label: sql<string>`coalesce(${decisionsTable.mood}, 'unspecified')`,
        count: sql<number>`count(*)::int`,
      })
      .from(decisionsTable)
      .groupBy(sql`coalesce(${decisionsTable.mood}, 'unspecified')`)
      .orderBy(desc(sql`count(*)`))
      .limit(6);

    res.json(
      GetDecisionDashboardResponse.parse({
        todayCount: todayRow?.todayCount ?? 0,
        totalCount: totals?.totalCount ?? 0,
        aiEnhancedCount: totals?.aiEnhancedCount ?? 0,
        averageConfidence: totals?.averageConfidence ?? 0,
        recentDecisions,
        moodBreakdown,
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
import { z } from "zod";

const UpdateOutcomeBody = z.object({
  outcome: z.enum(["great", "okay", "regret"]),
  outcomeNote: z.string().optional(),
});

router.patch("/decisions/:id/outcome", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateOutcomeBody.parse(req.body);
    const [updated] = await db
      .update(decisionsTable)
      .set({ outcome: body.outcome, outcomeNote: body.outcomeNote ?? null })
      .where(eq(decisionsTable.id, id))
      .returning();
    res.json(ListDecisionsResponseItem.parse(updated));
  } catch (err) {
    next(err);
  }
});
