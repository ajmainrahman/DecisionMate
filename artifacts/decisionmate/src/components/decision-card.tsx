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
        toast({ title: "Decision removed" });
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

  const getConfidenceColor = (c: number) =>
    c >= 80 ? "text-green-700 bg-green-50 border-green-200"
    : c >= 60 ? "text-yellow-700 bg-yellow-50 border-yellow-200"
    : "text-red-700 bg-red-50 border-red-200";

  const CategoryIcon = decision.category ? CATEGORY_ICONS[decision.category] ?? Zap : null;

  const outcomeConfig = {
    great: { icon: ThumbsUp, label: "Great outcome", color: "bg-green-50 text-green-700 border-green-200" },
    okay: { icon: Minus, label: "Okay outcome", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    regret: { icon: ThumbsDown, label: "I regret this", color: "bg-red-50 text-red-700 border-red-200" },
  };

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md"
      style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}>
      {/* Left accent bar */}
      <div className="absolute top-0 left-0 w-0.5 h-full transition-all duration-300 group-hover:w-1 rounded-r-full"
        style={{ background: "linear-gradient(180deg, hsl(263 72% 52%) 0%, hsl(300 60% 62%) 100%)" }} />

      <CardHeader className="pb-3 pl-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <p className="text-xs text-muted-foreground">
                {format(new Date(decision.createdAt), "MMM d, yyyy · h:mm a")}
              </p>
              {CategoryIcon && decision.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: "hsl(263 72% 52% / 0.08)", color: "hsl(263 72% 45%)", border: "1px solid hsl(263 72% 52% / 0.15)" }}>
                  <CategoryIcon className="w-3 h-3" />{decision.category}
                </span>
              )}
            </div>
            <h4 className="text-base font-semibold leading-snug text-foreground/90">{decision.problem}</h4>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {decision.aiUsed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "linear-gradient(135deg, hsl(263 72% 52% / 0.1) 0%, hsl(300 60% 62% / 0.1) 100%)", color: "hsl(300 60% 48%)", border: "1px solid hsl(300 60% 62% / 0.2)" }}>
                <Sparkles className="w-3 h-3" /> AI Enhanced
              </span>
            )}
            <Badge variant="outline" className={`text-xs font-medium ${getConfidenceColor(decision.confidence)}`}>
              {decision.confidence}% confident
            </Badge>
            {decision.outcome && outcomeConfig[decision.outcome as keyof typeof outcomeConfig] && (() => {
              const cfg = outcomeConfig[decision.outcome as keyof typeof outcomeConfig];
              const Icon = cfg.icon;
              return <Badge className={`border text-xs ${cfg.color}`}><Icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>;
            })()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pl-5">
        <div className="p-4 rounded-xl"
          style={{ background: "linear-gradient(135deg, hsl(263 72% 52% / 0.05) 0%, hsl(300 60% 62% / 0.05) 100%)", border: "1px solid hsl(263 72% 52% / 0.1)" }}>
          <div className="flex items-center gap-2 mb-2 font-semibold text-sm" style={{ color: "hsl(263 72% 45%)" }}>
            <BrainCircuit className="w-4 h-4" /> Recommendation
          </div>
          <p className="font-serif text-lg font-semibold leading-snug mb-2 text-foreground/90">{decision.finalDecision}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{decision.explanation}</p>
        </div>

        {decision.ruleExplanation && decision.aiUsed && (
          <div className="text-xs text-muted-foreground border-l-2 border-border pl-3 ml-1 py-1 leading-relaxed">
            <span className="font-medium text-foreground/60">Rule-based: </span>{decision.ruleExplanation}
          </div>
        )}

        {!decision.outcome && (
          <div className="pt-1">
            <p className="text-xs text-muted-foreground font-medium mb-2.5 uppercase tracking-wide">How did this turn out?</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50 rounded-full text-xs font-medium" onClick={() => handleOutcome("great")}>
                <ThumbsUp className="w-3.5 h-3.5 mr-1.5" /> Great
              </Button>
              <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-200 hover:bg-yellow-50 rounded-full text-xs font-medium" onClick={() => handleOutcome("okay")}>
                <Minus className="w-3.5 h-3.5 mr-1.5" /> Okay
              </Button>
              <Button variant="outline" size="sm" className="text-red-700 border-red-200 hover:bg-red-50 rounded-full text-xs font-medium" onClick={() => handleOutcome("regret")}>
                <ThumbsDown className="w-3.5 h-3.5 mr-1.5" /> Regret
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pl-5 justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/8 text-xs rounded-full">
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this decision?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently remove this decision from your history.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Re-ask
        </Button>
      </CardFooter>
    </Card>
  );
}
