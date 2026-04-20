import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDecision, CreateDecisionRequestPriority, CreateDecisionRequestStressLevel, CreateDecisionRequestDeadline } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ThinkoraLogo, ThinkoraWordmark } from "@/components/thinkora-logo";
import { useThinkoraContext } from "@/App";
import {
  Briefcase, Heart, DollarSign, Users, Star, Zap,
  Sparkles, ArrowRight, Loader2, ChevronDown,
} from "lucide-react";

const CATEGORIES = [
  { value: "work", label: "Work", icon: Briefcase },
  { value: "health", label: "Health", icon: Heart },
  { value: "finance", label: "Finance", icon: DollarSign },
  { value: "relationships", label: "Relationships", icon: Users },
  { value: "personal", label: "Personal", icon: Star },
  { value: "other", label: "Other", icon: Zap },
];

const formSchema = z.object({
  problem: z.string().min(3, "Please describe your decision."),
  category: z.string().optional(),
  priority: z.nativeEnum(CreateDecisionRequestPriority).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  stressLevel: z.nativeEnum(CreateDecisionRequestStressLevel).optional(),
  deadline: z.nativeEnum(CreateDecisionRequestDeadline).optional(),
  energyLevel: z.enum(["low", "medium", "high"]).optional(),
  importance: z.enum(["minor", "moderate", "major", "life_changing"]).optional(),
  gutFeeling: z.enum(["go_for_it", "unsure", "avoid_it"]).optional(),
  useAi: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const BG = "#f8f5f0";
const BROWN = "#2d2520";
const BROWN_MID = "#6b5e55";
const SAND = "#c9956b";
const BORDER = "rgba(45,37,32,0.09)";

export default function Home() {
  const [, navigate] = useLocation();
  const { setFreshDecision } = useThinkoraContext();
  const [showContext, setShowContext] = useState(false);
  const createDecision = useCreateDecision();
  const mutateRef = useRef(createDecision.mutate);
  mutateRef.current = createDecision.mutate;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { problem: "", useAi: true, sleepHours: 7 },
  });

  const selectedCategory = form.watch("category");

  function onSubmit(data: FormValues) {
    mutateRef.current(
      { data: data as any },
      {
        onSuccess: (result: any) => {
          setFreshDecision({
            id: result.id,
            problem: result.problem,
            finalDecision: result.finalDecision,
            explanation: result.explanation,
            confidence: result.confidence,
            aiUsed: result.aiUsed,
          });
          navigate("/decisions");
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: BG }}>

      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <ThinkoraLogo size={28} />
          <ThinkoraWordmark />
        </div>
        <button
          onClick={() => navigate("/decisions")}
          className="text-sm transition-opacity hover:opacity-60"
          style={{ color: BROWN_MID, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
        >
          View history
        </button>
      </nav>

      {/* Center area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[580px] flex flex-col gap-8">

          {/* Heading block */}
          <div className="text-center">
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
                lineHeight: 1.15,
                color: BROWN,
                letterSpacing: "-0.01em",
              }}
            >
              What are you<br />
              <em style={{ fontWeight: 400, color: BROWN_MID }}>weighing right now?</em>
            </h1>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: BROWN_MID, fontWeight: 300 }}
            >
              Describe it simply. Thinkora will help you see clearly.
            </p>
          </div>

          {/* Form card */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(30,22,14,0.07)" }}>

                {/* Textarea section */}
                <div className="px-6 pt-6 pb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "rgba(45,37,32,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
                    The situation
                  </p>
                  <FormField control={form.control} name="problem" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Should I take the new job offer even though it means moving to a new city?"
                          className="min-h-[130px] resize-none text-[15px] border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed"
                          style={{ fontFamily: "'DM Sans', sans-serif", color: BROWN, caretColor: SAND }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs mt-1" />
                    </FormItem>
                  )} />
                </div>

                {/* Divider */}
                <div className="h-px mx-6" style={{ background: BORDER }} />

                {/* Category */}
                <div className="px-6 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "rgba(45,37,32,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(({ value, label, icon: Icon }) => (
                      <button key={value} type="button"
                        onClick={() => form.setValue("category", selectedCategory === value ? undefined : value as any)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={selectedCategory === value
                          ? { background: BROWN, color: "#f8f5f0", border: `1px solid ${BROWN}` }
                          : { background: "transparent", color: BROWN_MID, border: `1px solid rgba(45,37,32,0.14)` }
                        }
                      >
                        <Icon className="w-3 h-3" /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px mx-6" style={{ background: BORDER }} />

                {/* Context toggle */}
                <div className="px-6 py-3">
                  <button type="button" onClick={() => setShowContext(!showContext)}
                    className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                    style={{ color: BROWN_MID, fontFamily: "'DM Sans', sans-serif" }}>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showContext ? "rotate-180" : ""}`} />
                    {showContext ? "Hide context" : "Add context for better results"}
                  </button>
                </div>

                {/* Context fields */}
                {showContext && (
                  <div className="px-6 pb-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t pt-4" style={{ borderColor: BORDER }}>
                    {[
                      { name: "priority" as const, label: "Priority", options: [{ v: "low", l: "Low" }, { v: "medium", l: "Medium" }, { v: "high", l: "High" }] },
                      { name: "deadline" as const, label: "Deadline", options: [{ v: "none", l: "No deadline" }, { v: "today", l: "Today" }, { v: "this_week", l: "This week" }, { v: "later", l: "Later" }] },
                      { name: "stressLevel" as const, label: "Stress", options: [{ v: "low", l: "Calm" }, { v: "medium", l: "Tense" }, { v: "high", l: "Overwhelmed" }] },
                      { name: "energyLevel" as const, label: "Energy", options: [{ v: "low", l: "Tired" }, { v: "medium", l: "Moderate" }, { v: "high", l: "Alert" }] },
                      { name: "importance" as const, label: "Importance", options: [{ v: "minor", l: "Minor" }, { v: "moderate", l: "Moderate" }, { v: "major", l: "Major" }, { v: "life_changing", l: "Life-changing" }] },
                      { name: "gutFeeling" as const, label: "Gut feeling", options: [{ v: "go_for_it", l: "Go for it" }, { v: "unsure", l: "Unsure" }, { v: "avoid_it", l: "Avoid it" }] },
                    ].map(({ name, label, options }) => (
                      <FormField key={name} control={form.control} name={name} render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value as string}>
                            <FormControl>
                              <SelectTrigger className="text-xs h-8 rounded-lg" style={{ background: BG, border: `1px solid ${BORDER}`, color: BROWN }}>
                                <SelectValue placeholder={label} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {options.map(({ v, l }) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    ))}
                    <FormField control={form.control} name="sleepHours" render={({ field }) => (
                      <FormItem className="col-span-full">
                        <div className="text-xs mb-2" style={{ color: "rgba(45,37,32,0.45)", fontFamily: "'DM Sans', sans-serif" }}>
                          Sleep last night — <span style={{ color: BROWN, fontWeight: 500 }}>{field.value}h</span>
                        </div>
                        <FormControl>
                          <Slider min={0} max={12} step={0.5} defaultValue={[field.value ?? 7]}
                            onValueChange={(v) => field.onChange(v[0])} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* Divider */}
                <div className="h-px mx-6" style={{ background: BORDER }} />

                {/* Bottom action row */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <FormField control={form.control} name="useAi" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: BROWN_MID, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                        <Sparkles className="w-3.5 h-3.5" style={{ color: SAND }} />
                        AI Enhanced
                      </span>
                    </FormItem>
                  )} />

                  <Button
                    type="submit"
                    disabled={createDecision.isPending}
                    className="rounded-full px-6 text-sm border-0 transition-all hover:opacity-85 disabled:opacity-50"
                    style={{ background: BROWN, color: "#f8f5f0", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
                  >
                    {createDecision.isPending
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Thinking…</>
                      : <>Decide <ArrowRight className="ml-1.5 h-4 w-4" /></>}
                  </Button>
                </div>

              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
