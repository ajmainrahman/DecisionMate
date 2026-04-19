import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const decisionsTable = pgTable("decisions", {
  id: serial("id").primaryKey(),
  problem: text("problem").notNull(),
  mood: varchar("mood", { length: 80 }),
  timeAvailable: varchar("time_available", { length: 80 }),
  priority: varchar("priority", { length: 20 }),
  sleepHours: real("sleep_hours"),
  stressLevel: varchar("stress_level", { length: 20 }),
  deadline: varchar("deadline", { length: 20 }),
  ruleDecision: text("rule_decision").notNull(),
  ruleExplanation: text("rule_explanation").notNull(),
  finalDecision: text("final_decision").notNull(),
  explanation: text("explanation").notNull(),
  confidence: integer("confidence").notNull(),
  aiUsed: boolean("ai_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDecisionSchema = createInsertSchema(decisionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type Decision = typeof decisionsTable.$inferSelect;