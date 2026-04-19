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

  if (typeof input.sleepHours === "number" && input.sleepHours < 5) {
    return {
      decision: "Rest first, then revisit the decision with a clearer mind.",
      explanation:
        "Less than 5 hours of sleep usually makes judgment worse, so recovery is the highest leverage move.",
      confidence: 86,
    };
  }

  if (input.deadline === "today" || problem.includes("deadline")) {
    return {
      decision: "Focus on the deadline now and reduce the task to the next concrete step.",
      explanation:
        "A near deadline changes the decision from choosing broadly to protecting the most urgent commitment.",
      confidence: 84,
    };
  }

  if (input.stressLevel === "high" || input.mood?.toLowerCase().includes("stress")) {
    return {
      decision: "Take a short reset break before committing to a decision.",
      explanation:
        "High stress narrows thinking, so a short pause can prevent a reactive choice.",
      confidence: 80,
    };
  }

  if (input.priority === "high") {
    return {
      decision: "Choose the option that protects your highest priority, even if it is less comfortable.",
      explanation:
        "When priority is high, the best decision is usually the one that preserves the most important outcome.",
      confidence: 78,
    };
  }

  if (input.timeAvailable?.toLowerCase().includes("minute")) {
    return {
      decision: "Pick the smallest useful next action instead of trying to solve everything now.",
      explanation:
        "Limited time favors momentum and clarity over a perfect answer.",
      confidence: 74,
    };
  }

  return {
    decision: "Choose the option with the clearest next step and lowest regret tomorrow.",
    explanation:
      "With no urgent constraint detected, a practical low-regret choice is the safest starting point.",
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
  } catch (err) {
    return {
      finalDecision: ruleResult.decision,
      explanation: `${ruleResult.explanation} AI enhancement was unavailable, so this answer uses the rule-based engine.`,
      confidence: ruleResult.confidence,
      aiUsed: false,
    };
  }
}

function parseAiJson(text: string): Partial<AiResult> {
  const jsonText = text.replace(/^```json\\s*/i, "").replace(/^```\\s*/i, "").replace(/```$/i, "");
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return {};
  }
  const value = JSON.parse(jsonText.slice(start, end + 1)) as Partial<AiResult>;
  return value;
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) {
    return 70;
  }
  return Math.max(1, Math.min(99, Math.round(value)));
}