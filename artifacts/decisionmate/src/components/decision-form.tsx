import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDecision, getGetDecisionDashboardQueryKey, getListDecisionsQueryKey, CreateDecisionRequestPriority, CreateDecisionRequestStressLevel, CreateDecisionRequestDeadline } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Briefcase, Heart, DollarSign, Users, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "work", label: "Work", icon: Briefcase },
  { value: "health", label: "Health", icon: Heart },
  { value: "finance", label: "Finance", icon: DollarSign },
  { value: "relationships", label: "Relationships", icon: Users },
  { value: "personal", label: "Personal", icon: Star },
  { value: "other", label: "Other", icon: Zap },
];

const formSchema = z.object({
  problem: z.string().min(3, "Please describe your decision in a few more words."),
  category: z.string().optional(),
  mood: z.string().optional(),
  timeAvailable: z.string().optional(),
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

export function DecisionForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { problem: "", useAi: true, sleepHours: 7 },
  });

  const createDecision = useCreateDecision();
  const mutateRef = useRef(createDecision.mutate);
  mutateRef.current = createDecision.mutate;

  function onSubmit(data: FormValues) {
    mutateRef.current(
      { data: data as any },
      {
        onSuccess: () => {
          toast({ title: "Decision processed", description: "Here is your recommendation." });
          form.reset({ problem: "", useAi: true, sleepHours: 7 });
          queryClient.invalidateQueries({ queryKey: getListDecisionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDecisionDashboardQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to process decision. Please try again.", variant: "destructive" });
        },
      }
    );
  }

  const selectedCategory = form.watch("category");

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField control={form.control} name="problem" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">The Situation</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Should I take the new job offer even though it means moving to a new city?" className="min-h-[120px] resize-none text-base bg-white/50 focus:bg-white transition-colors" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Category Pills */}
            <div>
              <FormLabel className="text-sm text-muted-foreground mb-2 block">Category</FormLabel>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button"
                    onClick={() => form.setValue("category", selectedCategory === value ? undefined : value as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${selectedCategory === value ? "bg-primary text-primary-foreground border-primary" : "bg-white/50 border-primary/20 hover:border-primary/50 text-muted-foreground"}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="context" className="border-b-0">
                <AccordionTrigger className="hover:no-underline text-sm text-muted-foreground py-2 rounded-md hover:bg-muted/50 px-2 transition-colors">
                  Add Context (Optional)
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4 px-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="priority" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="deadline" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="When is it due?" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="none">No deadline</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="this_week">This week</SelectItem>
                            <SelectItem value="later">Later</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="stressLevel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stress Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="How do you feel?" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Calm</SelectItem>
                            <SelectItem value="medium">A bit tense</SelectItem>
                            <SelectItem value="high">Overwhelmed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="energyLevel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Energy Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="How's your energy?" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low / Tired</SelectItem>
                            <SelectItem value="medium">Moderate</SelectItem>
                            <SelectItem value="high">High / Alert</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="importance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>How important is this?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select importance" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="life_changing">Life-changing</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="gutFeeling" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gut Feeling</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="What's your instinct?" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="go_for_it">Go for it</SelectItem>
                            <SelectItem value="unsure">Unsure</SelectItem>
                            <SelectItem value="avoid_it">Avoid it</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="sleepHours" render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Hours of sleep last night: {field.value}</FormLabel>
                        <FormControl>
                          <Slider min={0} max={12} step={0.5} defaultValue={[field.value ?? 7]} onValueChange={(vals) => field.onChange(vals[0])} className="pt-2" />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center justify-between pt-2">
              <FormField control={form.control} name="useAi" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 bg-white/50">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-secondary" /> AI Enhanced
                  </FormLabel>
                </FormItem>
              )} />
              <Button type="submit" size="lg" className="font-medium px-8 transition-all hover:scale-[1.02]" disabled={createDecision.isPending}>
                {createDecision.isPending ? "Thinking..." : <> Decide <ArrowRight className="ml-2 h-4 w-4" /> </>}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
