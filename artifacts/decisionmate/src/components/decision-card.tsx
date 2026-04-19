import type { Decision } from "@workspace/api-client-react";
import { useDeleteDecision, getListDecisionsQueryKey, getGetDecisionDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trash2, Sparkles, BrainCircuit, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DecisionCardProps {
  decision: Decision;
}

export function DecisionCard({ decision }: DecisionCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteDecision = useDeleteDecision();
  
  const deleteRef = useRef(deleteDecision.mutate);
  deleteRef.current = deleteDecision.mutate;

  const handleDelete = () => {
    deleteRef.current(
      { id: decision.id },
      {
        onSuccess: () => {
          toast({
            title: "Decision deleted",
          });
          queryClient.invalidateQueries({ queryKey: getListDecisionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDecisionDashboardQueryKey() });
        }
      }
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-700 bg-green-100";
    if (confidence >= 60) return "text-yellow-700 bg-yellow-100";
    return "text-red-700 bg-red-100";
  };

  return (
    <Card className="group relative overflow-hidden bg-white hover:shadow-md transition-all duration-300 border-primary/10">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {format(new Date(decision.createdAt), "MMM d, yyyy • h:mm a")}
            </p>
            <h4 className="text-lg font-medium leading-tight">
              {decision.problem}
            </h4>
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
          <div className="flex items-center gap-2 mb-2 text-primary font-medium">
            <BrainCircuit className="w-4 h-4" />
            Recommendation
          </div>
          <p className="text-foreground/90 font-serif text-lg leading-snug mb-3">
            {decision.finalDecision}
          </p>
          <p className="text-sm text-muted-foreground">
            {decision.explanation}
          </p>
        </div>
        
        {decision.ruleExplanation && decision.aiUsed && (
          <div className="text-xs text-muted-foreground border-l-2 border-border pl-3 ml-1 py-1">
            <span className="font-medium text-foreground/70">Rule-based assessment:</span> {decision.ruleExplanation}
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
              <AlertDialogDescription>
                This will permanently delete this decision from your history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" size="sm" onClick={() => {
          // In a real app, this might prepopulate the form
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Re-ask
        </Button>
      </CardFooter>
    </Card>
  );
}
