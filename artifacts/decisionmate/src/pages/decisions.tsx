import { useLocation } from "wouter";
import { useListDecisions, getListDecisionsQueryKey, useGetDecisionDashboard, getGetDecisionDashboardQueryKey, useDeleteDecision, useUpdateDecisionOutcome } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useThinkoraContext } from "@/App";
import { ThinkoraLogo, ThinkoraWordmark } from "@/components/thinkora-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useState, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ArrowLeft, Plus, BrainCircuit, Sparkles, CheckCircle2, History,
  TrendingUp, Flame, ThumbsUp, Minus, ThumbsDown, Search, Filter,
  Briefcase, Heart, DollarSign, Users, Star, Zap, Trash2, Tag, Lightbulb,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  work: Briefcase, health: Heart, finance: DollarSign,
  relationships: Users, personal: Star, other: Zap,
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? "#22c55e" : value >= 60 ? "#eab308" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-border/40 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function Decisions() {
  const [, navigate] = useLocation();
  const { freshDecision, setFreshDecision } = useThinkoraContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebounce(search, 300);

  const { data: decisions, isLoading } = useListDecisions(
    { search: debouncedSearch || undefined, priority: priority as any || undefined },
    { query: { queryKey: getListDecisionsQueryKey({ search: debouncedSearch || undefined, priority: priority as any || undefined }) } }
  );

  const { data: stats } = useGetDecisionDashboard({ query: { queryKey: getGetDecisionDashboardQueryKey() } });
  const deleteDecision = useDeleteDecision();
  const updateOutcome = useUpdateDecisionOutcome();
  const deleteRef = useRef(deleteDecision.mutate);
  deleteRef.current = deleteDecision.mutate;
  const updateRef = useRef(updateOutcome.mutate);
  updateRef.current = updateOutcome.mutate;

  const s = stats as any;
  const streak = s?.streak ?? 0;
  const patternInsights: string[] = s?.patternInsights ?? [];
  const categoryBreakdown: { label: string; count: number }[] = s?.categoryBreakdown ?? [];

  const handleDelete = (id: number) => {
    deleteRef.current({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDecisionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDecisionDashboardQueryKey() });
        if (freshDecision?.id === id) setFreshDecision(null);
      }
    });
  };

  const handleOutcome = (id: number, outcome: "great" | "okay" | "regret") => {
    updateRef.current({ id, data: { outcome } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDecisionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDecisionDashboardQueryKey() });
      }
    });
  };

  return (
    <div
      className="min-h-[100dvh]"
      style={{ background: "linear-gradient(145deg, hsl(252 60% 97%) 0%, hsl(280 50% 95%) 50%, hsl(300 45% 95%) 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(263 72% 60%) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(300 60% 62%) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/50"
        style={{ background: "rgba(248, 246, 255, 0.85)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <ThinkoraLogo size={28} />
              <ThinkoraWordmark />
            </div>
          </div>
          <Button
            onClick={() => { setFreshDecision(null); navigate("/"); }}
            className="rounded-full border-0 text-white text-sm font-medium px-5"
            style={{ background: "linear-gradient(135deg, hsl(263 72% 52%) 0%, hsl(300 60% 58%) 100%)" }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Decision
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Fresh Result Hero */}
        {freshDecision && (
          <div className="rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.95)" }}>
            {/* Top gradient bar */}
            <div className="h-1.5 w-full"
              style={{ background: "linear-gradient(90deg, hsl(263 72% 52%) 0%, hsl(300 60% 58%) 100%)" }} />

            <div className="p-7">
              {/* Label */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: "linear-gradient(135deg, hsl(263 72% 52% / 0.1) 0%, hsl(300 60% 58% / 0.1) 100%)", color: "hsl(263 72% 45%)", border: "1px solid hsl(263 72% 52% / 0.2)" }}>
                  {freshDecision.aiUsed && <Sparkles className="w-3.5 h-3.5" />}
                  Your Recommendation
                </span>
                <button onClick={() => setFreshDecision(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Dismiss
                </button>
              </div>

              {/* Problem */}
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">"{freshDecision.problem}"</p>

              {/* Decision */}
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3 leading-tight"
                style={{
                  background: "linear-gradient(135deg, hsl(252 25% 14%) 0%, hsl(263 72% 35%) 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>
                {freshDecision.finalDecision}
              </h2>

              {/* Explanation */}
              <p className="text-muted-foreground text-base leading-relaxed mb-5">{freshDecision.explanation}</p>

              {/* Confidence */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Confidence</span>
                  <span className="text-xs font-semibold text-muted-foreground">{freshDecision.confidence}%</span>
                </div>
                <ConfidenceBar value={freshDecision.confidence} />
              </div>

              {/* Outcome question */}
              <div className="pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">Once you decide — how did it go?</p>
                <div className="flex gap-2 flex-wrap">
                  {(["great", "okay", "regret"] as const).map((outcome) => {
                    const config = {
                      great: { icon: ThumbsUp, label: "Great!", color: "text-green-700 border-green-200 hover:bg-green-50" },
                      okay: { icon: Minus, label: "Okay", color: "text-yellow-700 border-yellow-200 hover:bg-yellow-50" },
                      regret: { icon: ThumbsDown, label: "Regret", color: "text-red-700 border-red-200 hover:bg-red-50" },
                    };
                    const { icon: Icon, label, color } = config[outcome];
                    return (
                      <Button key={outcome} variant="outline" size="sm"
                        className={`rounded-full text-xs font-medium ${color}`}
                        onClick={() => handleOutcome(freshDecision.id, outcome)}>
                        <Icon className="w-3.5 h-3.5 mr-1.5" />{label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Today", value: stats.todayCount, sub: "decisions", icon: CheckCircle2 },
              { label: "Total", value: stats.totalCount, sub: "all time", icon: History },
              { label: "AI Used", value: stats.aiEnhancedCount, sub: "enhanced", icon: BrainCircuit },
              { label: "Confidence", value: `${stats.averageConfidence}%`, sub: "average", icon: TrendingUp },
            ].map(({ label, value, sub, icon: Icon }) => (
              <div key={label} className="rounded-2xl p-4 transition-all hover:shadow-md"
                style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.85)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: "hsl(263 72% 52% / 0.1)" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: "hsl(263 72% 52%)" }} />
                  </div>
                </div>
                <div className="text-2xl font-serif font-bold">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Streak + category + insights */}
        {stats && (
          <div className="flex flex-col sm:flex-row gap-4">
            {streak > 0 && (
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: streak >= 3 ? "linear-gradient(135deg, #fff7ed, #fef3c7)" : "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: streak >= 3 ? "1px solid #fed7aa" : "1px solid rgba(255,255,255,0.85)" }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${streak >= 3 ? "bg-orange-100" : "bg-primary/10"}`}>
                  <Flame className={`w-5 h-5 ${streak >= 3 ? "text-orange-500" : "text-primary"}`} />
                </div>
                <div>
                  <div className={`text-xl font-serif font-bold ${streak >= 3 ? "text-orange-600" : ""}`}>{streak} day{streak !== 1 ? "s" : ""}</div>
                  <div className="text-xs text-muted-foreground">streak</div>
                </div>
              </div>
            )}

            {categoryBreakdown.length > 0 && (
              <div className="flex-1 rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.85)" }}>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                  <Tag className="w-3.5 h-3.5" /> Categories
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categoryBreakdown.map((c) => (
                    <span key={c.label} className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "hsl(263 72% 52% / 0.08)", color: "hsl(263 72% 40%)", border: "1px solid hsl(263 72% 52% / 0.15)" }}>
                      {c.label} · {c.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patternInsights.length > 0 && patternInsights[0] !== "Make more decisions to unlock pattern insights." && (
              <div className="flex-1 rounded-2xl p-4"
                style={{ background: "linear-gradient(135deg, hsl(263 72% 52% / 0.05) 0%, hsl(300 60% 62% / 0.05) 100%)", border: "1px solid hsl(263 72% 52% / 0.15)" }}>
                <div className="flex items-center gap-1.5 text-xs font-medium mb-3" style={{ color: "hsl(263 72% 45%)" }}>
                  <Lightbulb className="w-3.5 h-3.5" style={{ color: "hsl(300 60% 55%)" }} /> Insight
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(263 25% 35%)" }}>{patternInsights[0]}</p>
              </div>
            )}
          </div>
        )}

        {/* Decision History */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <h3 className="text-lg font-serif font-semibold flex items-center gap-2">
              <History className="w-5 h-5" style={{ color: "hsl(263 72% 52%)" }} /> All Decisions
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search…" className="pl-8 bg-white/70 border-border/40 rounded-xl text-sm h-9"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={priority} onValueChange={(v) => setPriority(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-[110px] bg-white/70 border-border/40 rounded-xl text-sm h-9">
                  <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
            ) : decisions?.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed"
                style={{ borderColor: "hsl(263 72% 52% / 0.2)", background: "hsl(263 72% 52% / 0.02)" }}>
                <p className="text-muted-foreground text-sm">No decisions yet — go make one!</p>
              </div>
            ) : (
              decisions?.map((decision) => {
                const isFresh = freshDecision?.id === decision.id;
                const CategoryIcon = decision.category ? CATEGORY_ICONS[decision.category] ?? Zap : null;
                const outcomeConfig = {
                  great: { label: "Great outcome", color: "bg-green-50 text-green-700 border-green-200" },
                  okay: { label: "Okay outcome", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
                  regret: { label: "I regret this", color: "bg-red-50 text-red-700 border-red-200" },
                };

                return (
                  <div key={decision.id} className={`rounded-2xl overflow-hidden transition-all ${isFresh ? "ring-2" : ""}`}
                    style={{
                      background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.9)",
                      ...(isFresh ? { ringColor: "hsl(263 72% 52%)" } : {})
                    }}>
                    <div className="flex">
                      {/* Left color accent */}
                      <div className="w-1 flex-shrink-0 rounded-l-2xl"
                        style={{ background: isFresh ? "linear-gradient(180deg, hsl(263 72% 52%) 0%, hsl(300 60% 58%) 100%)" : "hsl(252 30% 90%)" }} />

                      <div className="flex-1 p-5">
                        {/* Meta row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(decision.createdAt), "MMM d, yyyy · h:mm a")}
                            </span>
                            {CategoryIcon && decision.category && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: "hsl(263 72% 52% / 0.07)", color: "hsl(263 72% 45%)", border: "1px solid hsl(263 72% 52% / 0.15)" }}>
                                <CategoryIcon className="w-3 h-3" /> {decision.category}
                              </span>
                            )}
                            {isFresh && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: "hsl(263 72% 52% / 0.1)", color: "hsl(263 72% 45%)" }}>
                                Just decided
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {decision.aiUsed && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: "hsl(300 60% 58% / 0.1)", color: "hsl(300 60% 45%)", border: "1px solid hsl(300 60% 58% / 0.2)" }}>
                                <Sparkles className="w-3 h-3 inline mr-0.5" /> AI
                              </span>
                            )}
                            {decision.outcome && outcomeConfig[decision.outcome as keyof typeof outcomeConfig] && (
                              <Badge className={`text-xs border ${outcomeConfig[decision.outcome as keyof typeof outcomeConfig].color}`}>
                                {outcomeConfig[decision.outcome as keyof typeof outcomeConfig].label}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Problem */}
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">"{decision.problem}"</p>

                        {/* Decision */}
                        <p className="font-serif font-semibold text-base text-foreground/90 mb-3">{decision.finalDecision}</p>

                        {/* Confidence bar */}
                        <ConfidenceBar value={decision.confidence} />

                        {/* Outcome + Delete */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                          {!decision.outcome ? (
                            <div className="flex gap-1.5">
                              {(["great", "okay", "regret"] as const).map((outcome) => {
                                const icons = { great: ThumbsUp, okay: Minus, regret: ThumbsDown };
                                const colors = { great: "text-green-700 border-green-200 hover:bg-green-50", okay: "text-yellow-700 border-yellow-200 hover:bg-yellow-50", regret: "text-red-700 border-red-200 hover:bg-red-50" };
                                const Icon = icons[outcome];
                                return (
                                  <Button key={outcome} variant="outline" size="sm"
                                    className={`rounded-full text-xs h-7 px-2.5 ${colors[outcome]}`}
                                    onClick={() => handleOutcome(decision.id, outcome)}>
                                    <Icon className="w-3 h-3 mr-1" />{outcome}
                                  </Button>
                                );
                              })}
                            </div>
                          ) : <div />}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive h-7 px-2 rounded-full text-xs">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this decision?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(decision.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
