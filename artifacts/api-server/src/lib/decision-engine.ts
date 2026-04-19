import { CreateDecisionBody } from "@workspace/api-zod";
import { ai } from "@workspace/integrations-gemini-ai";
import type { z } from "zod/v4";

type CreateDecisionInput = z.infer<typeof CreateDecisionBody>;

type RuleResult = {
  decision: string;
  explanation: string;
  confidence: number;
};

type AiResult = {
  finalDecision: string;
  explanation: string;
  confidence: number;
  aiUsed: boolean;
};

export function evaluateRules(input: CreateDecisionInput): RuleResult {
  const problem = input.problem.toLowerCase();

  // Sleep deprivation overrides everything
  if (typeof input.sleepHours === "number" && input.sleepHours < 5) {
    return {
      decision: "Rest first, then revisit with a clearer mind.",
      explanation: "Less than 5 hours of sleep impairs judgment significantly — recovery is the highest-leverage move right now.",
      confidence: 86,
    };
  }

  // Life-changing + low energy = don't rush
  if (input.importance === "life_changing" && input.energyLevel === "low") {
    return {
      decision: "Postpone this decision until your energy recovers — the stakes are too high to decide now.",
      explanation: "Life-changing decisions made while depleted have a much higher regret rate.",
      confidence: 88,
    };
  }

  // Gut says avoid + high stress = trust the gut
  if (input.gutFeeling === "avoid_it" && input.stressLevel === "high") {
    return {
      decision: "Your instincts are signaling caution — take a break before committing.",
      explanation: "When gut feeling and stress align toward avoidance, pausing is almost always the right call.",
      confidence: 82,
    };
  }

  // Hard deadline
  if (input.deadline === "today" || problem.includes("deadline")) {
    return {
      decision: "Focus on the deadline now — reduce to the single next concrete step.",
      explanation: "A near deadline shifts the decision from broad choices to protecting the most urgent commitment.",
      confidence: 84,
    };
  }

  // Large budget impact + unsure gut = get more info
  if (input.budgetImpact === "large" && input.gutFeeling === "unsure") {
    return {
      decision: "Gather more information before spending — uncertainty on a large financial decision is a red flag.",
      explanation: "Large financial decisions made under uncertainty have outsized downside risk.",
      confidence: 83,
    };
  }

  // High stress
  if (input.stressLevel === "high" || input.mood?.toLowerCase().includes("stress")) {
    return {
      decision: "Take a short reset break before committing.",
      explanation: "High stress narrows thinking — a short pause prevents reactive choices.",
      confidence: 80,
    };
  }

  // Affects many people + low energy = consult others first
  if (input.socialInfluence === "public" && input.energyLevel === "low") {
    return {
      decision: "Delegate or delay — a decision affecting many people deserves your full energy.",
      explanation: "Public decisions made while depleted risk poor communication and reduced buy-in.",
      confidence: 79,
    };
  }

  // High priority
  if (input.priority === "high") {
    return {
      decision: "Choose the option that protects your highest priority, even if it is less comfortable.",
      explanation: "When priority is high, the best decision usually preserves the most important outcome.",
      confidence: 78,
    };
  }

  // Gut says go for it + high energy = act
  if (input.gutFeeling === "go_for_it" && input.energyLevel === "high") {
    return {
      decision: "Your instincts and energy are aligned — move forward with confidence.",
      explanation: "High energy plus positive gut feeling is a reliable signal to act.",
      confidence: 77,
    };
  }

  // Limited time
  if (input.timeAvailable?.toLowerCase().includes("minute")) {
    return {
      decision: "Pick the smallest useful next action instead of solving everything now.",
      explanation: "Limited time favors momentum and clarity over a perfect answer.",
      confidence: 74,
    };
  }

  // Default
  return {
    decision: "Choose the option with the clearest next step and lowest regret tomorrow.",
    explanation: "With no urgent constraint detected, a practical low-regret choice is the safest starting point.",
    confidence: 70,
  };
}

export async function enhanceWithAi(
  input: CreateDecisionInput,
  ruleResult: RuleResult,
): Promise<AiResult> {
  if (input.useAi === false) {
    return {
      finalDecision: ruleResult.decision,
      explanation: ruleResult.explanation,
      confidence: ruleResult.confidence,
      aiUsed: false,
    };
  }

  try {
    const prompt = `You are DecisionMate, a practical daily decision assistant. Refine the rule-based recommendation below. Keep it short, specific, and actionable.

Return only JSON with keys finalDecision, explanation, confidence.

User problem: ${input.problem}
Mood: ${input.mood ?? "not provided"}
Time available: ${input.timeAvailable ?? "not provided"}
Priority: ${input.priority ?? "not provided"}
Sleep hours: ${input.sleepHours ?? "not provided"}
Stress level: ${input.stressLevel ?? "not provided"}
Deadline: ${input.deadline ?? "not provided"}
Energy level: ${input.energyLevel ?? "not provided"}
Importance: ${input.importance ?? "not provided"}
Budget impact: ${input.budgetImpact ?? "not provided"}
Who it affects: ${input.socialInfluence ?? "not provided"}
Gut feeling: ${input.gutFeeling ?? "not provided"}
Rule-based decision: ${ruleResult.decision}
Rule reasoning: ${ruleResult.explanation}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text?.trim() ?? "";
    const parsed = parseAiJson(text);

    return {
      finalDecision: parsed.finalDecision || ruleResult.decision,
      explanation: parsed.explanation || ruleResult.explanation,
      confidence: clampConfidence(parsed.confidence ?? ruleResult.confidence),
      aiUsed: true,
    };
  } catch {
    return {
      finalDecision: ruleResult.decision,
      explanation: `${ruleResult.explanation} AI enhancement was unavailable.`,
      confidence: ruleResult.confidence,
      aiUsed: false,
    };
  }
}

function parseAiJson(text: string): Partial<AiResult> {
  const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start === -1 || end === -1) return {};
  return JSON.parse(jsonText.slice(start, end + 1)) as Partial<AiResult>;
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 70;
  return Math.max(1, Math.min(99, Math.round(value)));
}
