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
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">

      {/* LEFT PANEL — forest green, branding + atmosphere */}
      <div
        className="lg:w-[42%] flex flex-col justify-between px-10 py-10 lg:py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #3d5a47 0%, #2b3f32 100%)" }}
      >
        {/* Decorative circle */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f5f0e8 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-16 w-64 h-64 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #f5f0e8 0%, transparent 70%)" }} />

        {/* Logo row */}
        <div className="flex items-center gap-2.5 relative z-10">
          <ThinkoraLogo size={34} light />
          <ThinkoraWordmark light />
        </div>

        {/* Hero text */}
        <div className="relative z-10 py-8 lg:py-0">
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(245,240,232,0.45)" }}>
            AI-Assisted Clarity
          </p>
          <h1
            className="font-serif text-5xl lg:text-[3.4rem] xl:text-[3.8rem] leading-[1.1] mb-6"
            style={{ color: "#f5f0e8" }}
          >
            Your decision,<br />
            <span style={{ color: "rgba(245,240,232,0.62)", fontStyle: "italic" }}>clearer.</span>
          </h1>
          <p className="text-base leading-relaxed max-w-xs" style={{ color: "rgba(245,240,232,0.6)" }}>
            Describe what you're weighing. Thinkora reasons through it alongside you — practically and without judgment.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-xs relative z-10" style={{ color: "rgba(245,240,232,0.3)" }}>
          Powered by rule-based reasoning + Gemini AI
        </p>
      </div>

      {/* RIGHT PANEL — cream, the form */}
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ background: "#f5f0e8" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(61,90,71,0.1)" }}>
          <p className="text-sm font-medium" style={{ color: "#3d5a47" }}>What's on your mind?</p>
          <button
            onClick={() => navigate("/decisions")}
            className="text-sm font-medium px-4 py-1.5 rounded-full transition-all hover:opacity-80"
            style={{ background: "rgba(61,90,71,0.1)", color: "#3d5a47" }}
          >
            View history →
          </button>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 flex items-start justify-center px-6 sm:px-10 py-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-xl flex flex-col gap-6">

              {/* Situation card */}
              <div className="rounded-2xl bg-white shadow-sm overflow-hidden"
                style={{ border: "1px solid rgba(61,90,71,0.1)" }}>
                <div className="px-5 pt-5 pb-1">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(61,90,71,0.45)" }}>
                    The Situation
                  </p>
                  <FormField control={form.control} name="problem" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Should I take the new job offer even though it means moving to a new city?"
                          className="min-h-[140px] resize-none text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 font-sans"
                          style={{ color: "#2b3f32", caretColor: "#3d5a47" }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs pb-2" />
                    </FormItem>
                  )} />
                </div>

                {/* Category */}
                <div className="px-5 pt-3 pb-4" style={{ borderTop: "1px solid rgba(61,90,71,0.07)" }}>
                  <p className="text-xs font-medium mb-2.5" style={{ color: "rgba(61,90,71,0.5)" }}>Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(({ value, label, icon: Icon }) => (
                      <button key={value} type="button"
                        onClick={() => form.setValue("category", selectedCategory === value ? undefined : value as any)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={selectedCategory === value ? {
                          background: "#3d5a47", color: "#f5f0e8", border: "1px solid #3d5a47"
                        } : {
                          background: "transparent", color: "rgba(61,90,71,0.7)", border: "1px solid rgba(61,90,71,0.2)"
                        }}>
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add context toggle */}
              <div>
                <button type="button" onClick={() => setShowContext(!showContext)}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ color: showContext ? "#3d5a47" : "rgba(61,90,71,0.5)" }}>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showContext ? "rotate-180" : ""}`} />
                  {showContext ? "Hide context" : "Add context for better results"}
                </button>

                {showContext && (
                  <div className="mt-4 rounded-2xl bg-white p-5 grid grid-cols-2 sm:grid-cols-3 gap-3"
                    style={{ border: "1px solid rgba(61,90,71,0.1)" }}>
                    {[
                      { name: "priority" as const, label: "Priority", options: [{ v: "low", l: "Low" }, { v: "medium", l: "Medium" }, { v: "high", l: "High" }] },
                      { name: "deadline" as const, label: "Deadline", options: [{ v: "none", l: "No deadline" }, { v: "today", l: "Today" }, { v: "this_week", l: "This week" }, { v: "later", l: "Later" }] },
                      { name: "stressLevel" as const, label: "Stress level", options: [{ v: "low", l: "Calm" }, { v: "medium", l: "A bit tense" }, { v: "high", l: "Overwhelmed" }] },
                      { name: "energyLevel" as const, label: "Energy", options: [{ v: "low", l: "Tired" }, { v: "medium", l: "Moderate" }, { v: "high", l: "Alert" }] },
                      { name: "importance" as const, label: "Importance", options: [{ v: "minor", l: "Minor" }, { v: "moderate", l: "Moderate" }, { v: "major", l: "Major" }, { v: "life_changing", l: "Life-changing" }] },
                      { name: "gutFeeling" as const, label: "Gut feeling", options: [{ v: "go_for_it", l: "Go for it" }, { v: "unsure", l: "Unsure" }, { v: "avoid_it", l: "Avoid it" }] },
                    ].map(({ name, label, options }) => (
                      <FormField key={name} control={form.control} name={name} render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value as string}>
                            <FormControl>
                              <SelectTrigger className="text-sm h-9 rounded-xl"
                                style={{ background: "#f5f0e8", border: "1px solid rgba(61,90,71,0.15)" }}>
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
                        <div className="text-xs mb-2" style={{ color: "rgba(61,90,71,0.6)" }}>
                          Sleep last night: <span className="font-semibold" style={{ color: "#2b3f32" }}>{field.value}h</span>
                        </div>
                        <FormControl>
                          <Slider min={0} max={12} step={0.5} defaultValue={[field.value ?? 7]}
                            onValueChange={(v) => field.onChange(v[0])} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <FormField control={form.control} name="useAi" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#3d5a47]" />
                    </FormControl>
                    <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: "#3d5a47" }}>
                      <Sparkles className="w-3.5 h-3.5" style={{ color: "#b05a3a" }} />
                      AI Enhanced
                    </span>
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  className="rounded-full text-sm font-semibold px-7 py-2.5 border-0 transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                  style={{ background: "#3d5a47", color: "#f5f0e8" }}
                  disabled={createDecision.isPending}
                >
                  {createDecision.isPending
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking…</>
                    : <>Think it through <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
