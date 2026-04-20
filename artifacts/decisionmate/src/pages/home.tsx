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
  Sparkles, ArrowRight, Loader2, History, ChevronDown,
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
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{
        background: "linear-gradient(145deg, hsl(252 60% 97%) 0%, hsl(280 50% 95%) 50%, hsl(300 45% 95%) 100%)",
      }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, hsl(263 72% 60%) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(300 60% 62%) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <ThinkoraLogo size={30} />
          <ThinkoraWordmark />
        </div>
        <button
          onClick={() => navigate("/decisions")}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-all hover:scale-[1.02]"
          style={{ background: "rgba(124, 58, 237, 0.08)", color: "hsl(263 72% 45%)", border: "1px solid hsl(263 72% 52% / 0.2)" }}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {/* Main content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-2xl flex flex-col gap-6">

            {/* Hero text */}
            <div className="text-center mb-2">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-3 leading-tight">
                <span style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>What decision</span>
                <br />
                <span className="text-foreground/85">are you facing?</span>
              </h1>
              <p className="text-muted-foreground text-base">
                Describe it honestly — Thinkora will help you see clearly.
              </p>
            </div>

            {/* Main input card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.9)" }}>

              {/* Textarea */}
              <FormField control={form.control} name="problem" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Should I quit my job to start my own business, even though I have a family to support?"
                      className="min-h-[160px] resize-none text-lg border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-6 pt-6 pb-4 font-sans placeholder:text-muted-foreground/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="px-6 pb-2 text-sm" />
                </FormItem>
              )} />

              {/* Divider */}
              <div className="h-px mx-6" style={{ background: "linear-gradient(90deg, transparent, hsl(263 72% 52% / 0.15), transparent)" }} />

              {/* Category row */}
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium mr-1">Topic:</span>
                  {CATEGORIES.map(({ value, label, icon: Icon }) => (
                    <button key={value} type="button"
                      onClick={() => form.setValue("category", selectedCategory === value ? undefined : value as any)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                      style={selectedCategory === value ? {
                        background: "linear-gradient(135deg, hsl(263 72% 52%) 0%, hsl(300 60% 58%) 100%)",
                        color: "white", border: "1px solid transparent"
                      } : {
                        background: "transparent", color: "hsl(252 12% 50%)",
                        border: "1px solid hsl(252 20% 88%)"
                      }}>
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context toggle */}
              <div className="px-6 pb-4">
                <button type="button" onClick={() => setShowContext(!showContext)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showContext ? "rotate-180" : ""}`} />
                  {showContext ? "Hide context" : "Add context for better results"}
                </button>
              </div>

              {/* Context fields */}
              {showContext && (
                <div className="px-6 pb-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border/30 pt-5">
                  {[
                    { name: "priority" as const, label: "Priority", options: [{ v: "low", l: "Low" }, { v: "medium", l: "Medium" }, { v: "high", l: "High" }] },
                    { name: "deadline" as const, label: "Deadline", options: [{ v: "none", l: "No deadline" }, { v: "today", l: "Today" }, { v: "this_week", l: "This week" }, { v: "later", l: "Later" }] },
                    { name: "stressLevel" as const, label: "Stress", options: [{ v: "low", l: "Calm" }, { v: "medium", l: "A bit tense" }, { v: "high", l: "Overwhelmed" }] },
                    { name: "energyLevel" as const, label: "Energy", options: [{ v: "low", l: "Low / Tired" }, { v: "medium", l: "Moderate" }, { v: "high", l: "High / Alert" }] },
                    { name: "importance" as const, label: "Importance", options: [{ v: "minor", l: "Minor" }, { v: "moderate", l: "Moderate" }, { v: "major", l: "Major" }, { v: "life_changing", l: "Life-changing" }] },
                    { name: "gutFeeling" as const, label: "Gut feeling", options: [{ v: "go_for_it", l: "Go for it" }, { v: "unsure", l: "Unsure" }, { v: "avoid_it", l: "Avoid it" }] },
                  ].map(({ name, label, options }) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value as string}>
                          <FormControl>
                            <SelectTrigger className="bg-white/70 border-border/40 text-sm h-9 rounded-xl">
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
                      <div className="text-xs text-muted-foreground mb-2">
                        Sleep last night: <span className="font-semibold text-foreground">{field.value}h</span>
                      </div>
                      <FormControl>
                        <Slider min={0} max={12} step={0.5} defaultValue={[field.value ?? 7]}
                          onValueChange={(v) => field.onChange(v[0])} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              )}

              {/* Bottom action row */}
              <div className="px-6 py-4 flex items-center justify-between gap-4 border-t border-border/30"
                style={{ background: "rgba(124,58,237,0.02)" }}>
                <FormField control={form.control} name="useAi" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(300 60% 58%)" }} />
                      AI Enhanced
                    </span>
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  size="lg"
                  className="rounded-2xl border-0 text-white font-semibold px-8 py-3 text-base transition-all hover:scale-[1.03] hover:shadow-xl disabled:opacity-60 disabled:scale-100"
                  style={{ background: "linear-gradient(135deg, hsl(263 72% 52%) 0%, hsl(300 60% 58%) 100%)" }}
                  disabled={createDecision.isPending}
                >
                  {createDecision.isPending
                    ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Thinking…</>
                    : <>Decide <ArrowRight className="ml-2 h-5 w-5" /></>}
                </Button>
              </div>
            </div>

            {/* Trust line */}
            <p className="text-center text-xs text-muted-foreground">
              Powered by rule-based reasoning + Gemini AI · Your data is private
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
