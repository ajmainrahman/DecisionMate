import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDecision, getGetDecisionDashboardQueryKey, getListDecisionsQueryKey, CreateDecisionRequestPriority, CreateDecisionRequestStressLevel, CreateDecisionRequestDeadline } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, ArrowRight, Brain, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  problem: z.string().min(3, "Please describe your decision in a few more words."),
  mood: z.string().optional(),
  timeAvailable: z.string().optional(),
  priority: z.nativeEnum(CreateDecisionRequestPriority).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  stressLevel: z.nativeEnum(CreateDecisionRequestStressLevel).optional(),
  deadline: z.nativeEnum(CreateDecisionRequestDeadline).optional(),
  useAi: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function DecisionForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeDecisionId, setActiveDecisionId] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problem: "",
      useAi: true,
      sleepHours: 7,
    },
  });

  const createDecision = useCreateDecision();
  const mutateRef = useRef(createDecision.mutate);
  mutateRef.current = createDecision.mutate;

  function onSubmit(data: FormValues) {
    mutateRef.current(
      { data },
      {
        onSuccess: (decision) => {
          toast({
            title: "Decision processed",
            description: "Here is your recommendation.",
          });
          form.reset();
          setActiveDecisionId(decision.id);
          queryClient.invalidateQueries({ queryKey: getListDecisionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDecisionDashboardQueryKey() });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to process decision. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">The Situation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Should I take the new job offer even though it means moving to a new city?"
                      className="min-h-[120px] resize-none text-base bg-white/50 focus:bg-white transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="context" className="border-b-0">
                <AccordionTrigger className="hover:no-underline text-sm text-muted-foreground py-2 rounded-md hover:bg-muted/50 px-2 transition-colors">
                  Add Context (Optional)
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4 px-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low - Nice to have</SelectItem>
                              <SelectItem value="medium">Medium - Important</SelectItem>
                              <SelectItem value="high">High - Urgent/Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="When is it due?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No deadline</SelectItem>
                              <SelectItem value="today">Today</SelectItem>
                              <SelectItem value="this_week">This week</SelectItem>
                              <SelectItem value="later">Later</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stressLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Stress Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="How do you feel?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Calm</SelectItem>
                              <SelectItem value="medium">A bit tense</SelectItem>
                              <SelectItem value="high">Overwhelmed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sleepHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours of sleep last night: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={12}
                              step={0.5}
                              defaultValue={[field.value ?? 7]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="pt-2"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center justify-between pt-2">
              <FormField
                control={form.control}
                name="useAi"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 bg-white/50">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-secondary" /> AI Enhanced
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                size="lg" 
                className="font-medium px-8 transition-all hover:scale-[1.02]"
                disabled={createDecision.isPending}
              >
                {createDecision.isPending ? (
                  "Thinking..."
                ) : (
                  <>
                    Decide <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
