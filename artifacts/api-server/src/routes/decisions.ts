import { and, desc, eq, gte, ilike, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateDecisionBody,
  DeleteDecisionParams,
  GetDecisionDashboardResponse,
  ListDecisionsQueryParams,
  ListDecisionsResponse,
  ListDecisionsResponseItem,
  UpdateDecisionOutcomeBody,
  UpdateDecisionOutcomeParams,
} from "@workspace/api-zod";
import { db, decisionsTable } from "@workspace/db";
import { enhanceWithAi, evaluateRules } from "../lib/decision-engine.js";

const router: IRouter = Router();

router.get("/decisions", async (req, res, next) => {
  try {
    const params = ListDecisionsQueryParams.parse(req.query);
    const filters = [
      params.search ? ilike(decisionsTable.problem, `%${params.search}%`) : undefined,
      params.mood ? eq(decisionsTable.mood, params.mood) : undefined,
      params.priority ? eq(decisionsTable.priority, params.priority) : undefined,
      (params as any).category ? eq(decisionsTable.category, (params as any).category) : undefined,
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
        energyLevel: body.energyLevel ?? null,
        importance: body.importance ?? null,
        budgetImpact: body.budgetImpact ?? null,
        socialInfluence: body.socialInfluence ?? null,
        gutFeeling: body.gutFeeling ?? null,
        category: body.category ?? null,
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

router.patch("/decisions/:id/outcome", async (req, res, next) => {
  try {
    const params = UpdateDecisionOutcomeParams.parse(req.params);
    const body = UpdateDecisionOutcomeBody.parse(req.body);
    const [updated] = await db
      .update(decisionsTable)
      .set({ outcome: body.outcome, outcomeNote: body.outcomeNote ?? null })
      .where(eq(decisionsTable.id, params.id))
      .returning();
    res.json(ListDecisionsResponseItem.parse(updated));
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

    const categoryBreakdown = await db
      .select({
        label: sql<string>`coalesce(${decisionsTable.category}, 'other')`,
        count: sql<number>`count(*)::int`,
      })
      .from(decisionsTable)
      .groupBy(sql`coalesce(${decisionsTable.category}, 'other')`)
      .orderBy(desc(sql`count(*)`));

    // Outcome stats
    const outcomeRows = await db
      .select({
        outcome: decisionsTable.outcome,
        count: sql<number>`count(*)::int`,
      })
      .from(decisionsTable)
      .groupBy(decisionsTable.outcome);

    const outcomeStats = { great: 0, okay: 0, regret: 0, pending: 0 };
    for (const row of outcomeRows) {
      if (row.outcome === "great") outcomeStats.great = row.count;
      else if (row.outcome === "okay") outcomeStats.okay = row.count;
      else if (row.outcome === "regret") outcomeStats.regret = row.count;
      else outcomeStats.pending += row.count;
    }

    // Streak: count consecutive days with at least one decision
    const dailyRows = await db
      .select({
        day: sql<string>`date_trunc('day', ${decisionsTable.createdAt})::text`,
      })
      .from(decisionsTable)
      .groupBy(sql`date_trunc('day', ${decisionsTable.createdAt})`)
      .orderBy(desc(sql`date_trunc('day', ${decisionsTable.createdAt})`))
      .limit(365);

    let streak = 0;
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);
    for (const row of dailyRows) {
      const d = new Date(row.day);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((nowDate.getTime() - d.getTime()) / 86400000);
      if (diff === streak) streak++;
      else break;
    }

    // Pattern insights
    const patternInsights: string[] = [];
    const stressHighRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(decisionsTable)
      .where(eq(decisionsTable.stressLevel, "high"));
    const stressHighCount = stressHighRows[0]?.count ?? 0;
    if (stressHighCount > 0 && totals.totalCount > 0) {
      const pct = Math.round((stressHighCount / totals.totalCount) * 100);
      if (pct >= 30) patternInsights.push(`${pct}% of your decisions were made under high stress — consider building in more reflection time.`);
    }

    const sleepRows = await db
      .select({ avg: sql<number>`coalesce(round(avg(${decisionsTable.sleepHours})), 0)::int` })
      .from(decisionsTable)
      .where(sql`${decisionsTable.sleepHours} is not null`);
    const avgSleep = sleepRows[0]?.avg ?? 0;
    if (avgSleep > 0 && avgSleep < 6) patternInsights.push(`Your average sleep when making decisions is ${avgSleep}h — low sleep may be affecting decision quality.`);

    if (outcomeStats.regret > 0 && (outcomeStats.great + outcomeStats.okay + outcomeStats.regret) > 0) {
      const regretPct = Math.round((outcomeStats.regret / (outcomeStats.great + outcomeStats.okay + outcomeStats.regret)) * 100);
      if (regretPct >= 20) patternInsights.push(`${regretPct}% of tracked decisions resulted in regret — reviewing those patterns may help.`);
    }

    if (totals.aiEnhancedCount > 0 && totals.totalCount > 0) {
      const aiPct = Math.round((totals.aiEnhancedCount / totals.totalCount) * 100);
      patternInsights.push(`You use AI enhancement for ${aiPct}% of decisions.`);
    }

    if (patternInsights.length === 0) patternInsights.push("Make more decisions to unlock pattern insights.");

    res.json(
      GetDecisionDashboardResponse.parse({
        todayCount: todayRow?.todayCount ?? 0,
        totalCount: totals?.totalCount ?? 0,
        aiEnhancedCount: totals?.aiEnhancedCount ?? 0,
        averageConfidence: totals?.averageConfidence ?? 0,
        streak,
        outcomeStats,
        patternInsights,
        categoryBreakdown,
        recentDecisions,
        moodBreakdown,
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
