import type { Decision } from "@workspace/api-client-react";
import { useDeleteDecision, useUpdateDecisionOutcome, getListDecisionsQueryKey, getGetDecisionDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trash2, Sparkles, BrainCircuit, RefreshCw, ThumbsUp, Minus, ThumbsDown, Briefcase, Heart, DollarSign, Users, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const CATEGORY_ICONS: Record<string, any> = {
  work: Briefcase, health: Heart, finance: DollarSign,
  relationships: Users, personal: Star, other: Zap,
};

interface DecisionCardProps {
  decision: Decision;
}

export function DecisionCard({ decision }: DecisionCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteDecision = useDeleteDecision();
  const updateOutcome = useUpdateDecisionOutcome();
  const deleteRef = useRef(deleteDecision.mutate);
  deleteRef.current = deleteDecision.mutate;
  const updateRef = useRef(updateOutcome.mutate);
  updateRef.current = updateOutcome.mutate;

  const handleDelete = () => {
    deleteRef.current({ id: decision.id }, {
      onSuccess: () => {
        toast({ title: "Decision deleted" });
        queryClient.invalidateQueries({ queryKey: getListDecisionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDecisionDashboardQueryKey() });
      }
    });
  };

  const handleOutcome = (outcome: "great" | "okay" | "regret") => {
    updateRef.current({ id: decision.id, data: { outcome } }, {
      onSuccess: () => {
        toast({ title: "Outcome saved", description: `Marked as "${outcome}"` });
        queryClient.invalidateQueries({ queryKey: getListDecisionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDecisionDashboardQueryKey() });
      }
    });
  };

  const getConfidenceColor = (c: number) => c >= 80 ? "text-green-700 bg-green-100" : c >= 60 ? "text-yellow-700 bg-yellow-100" : "text-red-700 bg-red-100";

  const CategoryIcon = decision.category ? CATEGORY_ICONS[decision.category] ?? Zap : null;

  const outcomeConfig = {
    great: { icon: ThumbsUp, label: "Great outcome", color: "bg-green-100 text-green-700" },
    okay: { icon: Minus, label: "Okay outcome", color: "bg-yellow-100 text-yellow-700" },
    regret: { icon: ThumbsDown, label: "I regret this", color: "bg-red-100 text-red-700" },
  };

  return (
    <Card className="group relative overflow-hidden bg-white hover:shadow-md transition-all duration-300 border-primary/10">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-muted-foreground">{format(new Date(decision.createdAt), "MMM d, yyyy • h:mm a")}</p>
              {CategoryIcon && decision.category && (
                <Badge variant="outline" className="text-xs px-2 py-0 border-primary/20">
                  <CategoryIcon className="w-3 h-3 mr-1" />{decision.category}
                </Badge>
              )}
            </div>
            <h4 className="text-lg font-medium leading-tight">{decision.problem}</h4>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {decision.aiUsed && (
              <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                <Sparkles className="w-3 h-3 mr-1" /> AI Enhanced
              </Badge>
            )}
            <Badge variant="outline" className={`border-none ${getConfidenceColor(decision.confidence)}`}>
              {decision.confidence}% Confident
            </Badge>
            {decision.outcome && outcomeConfig[decision.outcome as keyof typeof outcomeConfig] && (() => {
              const cfg = outcomeConfig[decision.outcome as keyof typeof outcomeConfig];
              const Icon = cfg.icon;
              return <Badge className={`border-none text-xs ${cfg.color}`}><Icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>;
            })()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
          <div className="flex items-center gap-2 mb-2 text-primary font-medium">
            <BrainCircuit className="w-4 h-4" /> Recommendation
          </div>
          <p className="text-foreground/90 font-serif text-lg leading-snug mb-3">{decision.finalDecision}</p>
          <p className="text-sm text-muted-foreground">{decision.explanation}</p>
        </div>
        {decision.ruleExplanation && decision.aiUsed && (
          <div className="text-xs text-muted-foreground border-l-2 border-border pl-3 ml-1 py-1">
            <span className="font-medium text-foreground/70">Rule-based assessment:</span> {decision.ruleExplanation}
          </div>
        )}

        {/* Outcome tracking */}
        {!decision.outcome && (
          <div className="pt-1">
            <p className="text-xs text-muted-foreground mb-2">How did this turn out?</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50" onClick={() => handleOutcome("great")}>
                <ThumbsUp className="w-3.5 h-3.5 mr-1.5" /> Great
              </Button>
              <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-200 hover:bg-yellow-50" onClick={() => handleOutcome("okay")}>
                <Minus className="w-3.5 h-3.5 mr-1.5" /> Okay
              </Button>
              <Button variant="outline" size="sm" className="text-red-700 border-red-200 hover:bg-red-50" onClick={() => handleOutcome("regret")}>
                <ThumbsDown className="w-3.5 h-3.5 mr-1.5" /> Regret
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete this decision.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <RefreshCw className="w-4 h-4 mr-2" /> Re-ask
        </Button>
      </CardFooter>
    </Card>
  );
}
