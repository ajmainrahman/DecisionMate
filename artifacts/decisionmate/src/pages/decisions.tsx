import { useLocation } from "wouter";
import { useListDecisions, getListDecisionsQueryKey, useGetDecisionDashboard, getGetDecisionDashboardQueryKey, useDeleteDecision, useUpdateDecisionOutcome } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useThinkoraContext } from "@/App";
import { ThinkoraLogo, ThinkoraWordmark } from "@/components/thinkora-logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useState, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Plus, Sparkles, Flame, ThumbsUp, Minus, ThumbsDown, Search,
  Briefcase, Heart, DollarSign, Users, Star, Zap, Trash2,
  CheckCircle2, BrainCircuit, TrendingUp, BarChart3, Lightbulb,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  work: Briefcase, health: Heart, finance: DollarSign,
  relationships: Users, personal: Star, other: Zap,
};

const GREEN = "#3d5a47";
const GREEN_DARK = "#2b3f32";
const CREAM = "#f5f0e8";
const TERRA = "#b05a3a";

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? "#4a7c59" : value >= 60 ? "#c4852a" : "#b05a3a";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(61,90,71,0.12)" }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>{value}%</span>
    </div>
  );
}

function OutcomeButton({ label, icon: Icon, color, onClick }: { label: string; icon: any; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all hover:opacity-80"
      style={{ color, borderColor: color + "40", background: color + "0d" }}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
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
  const streak: number = s?.streak ?? 0;
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
    <div className="min-h-[100dvh]" style={{ background: CREAM }}>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: CREAM, borderColor: "rgba(61,90,71,0.1)" }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 hover:opacity-75 transition-opacity">
            <ThinkoraLogo size={30} />
            <ThinkoraWordmark />
          </button>
          <button
            onClick={() => { setFreshDecision(null); navigate("/"); }}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-all hover:opacity-80"
            style={{ background: GREEN, color: CREAM }}
          >
            <Plus className="w-4 h-4" /> New decision
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">

        {/* Fresh Result */}
        {freshDecision && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: TERRA }} />
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(61,90,71,0.45)" }}>
                  {freshDecision.aiUsed ? "AI-Enhanced" : "Rule-Based"} Recommendation
                </p>
              </div>
              <button onClick={() => setFreshDecision(null)}
                className="text-xs transition-opacity hover:opacity-60"
                style={{ color: "rgba(61,90,71,0.4)" }}>
                dismiss
              </button>
            </div>

            <div className="rounded-2xl bg-white overflow-hidden shadow-sm"
              style={{ border: "1px solid rgba(61,90,71,0.1)" }}>
              {/* Top accent line */}
              <div className="h-1" style={{ background: `linear-gradient(90deg, ${GREEN} 0%, ${TERRA} 100%)` }} />

              <div className="p-7">
                <p className="text-sm italic mb-4 leading-relaxed" style={{ color: "rgba(61,90,71,0.5)" }}>
                  "{freshDecision.problem}"
                </p>

                <h2 className="font-serif text-3xl font-bold leading-tight mb-3" style={{ color: GREEN_DARK }}>
                  {freshDecision.finalDecision}
                </h2>

                <p className="text-base leading-relaxed mb-6" style={{ color: "rgba(61,90,71,0.7)" }}>
                  {freshDecision.explanation}
                </p>

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(61,90,71,0.4)" }}>Confidence</span>
                  <div className="flex-1"><ConfidenceBar value={freshDecision.confidence} /></div>
                </div>

                <div className="pt-5" style={{ borderTop: "1px solid rgba(61,90,71,0.08)" }}>
                  <p className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: "rgba(61,90,71,0.4)" }}>
                    How did it turn out?
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <OutcomeButton label="Great outcome" icon={ThumbsUp} color="#4a7c59" onClick={() => handleOutcome(freshDecision.id, "great")} />
                    <OutcomeButton label="It was okay" icon={Minus} color="#c4852a" onClick={() => handleOutcome(freshDecision.id, "okay")} />
                    <OutcomeButton label="I regret it" icon={ThumbsDown} color={TERRA} onClick={() => handleOutcome(freshDecision.id, "regret")} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        {stats && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(61,90,71,0.4)" }}>
              Overview
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Today", value: stats.todayCount, sub: "decisions", icon: CheckCircle2 },
                { label: "Total", value: stats.totalCount, sub: "all time", icon: BarChart3 },
                { label: "AI Used", value: stats.aiEnhancedCount, sub: "enhanced", icon: BrainCircuit },
                { label: "Confidence", value: `${stats.averageConfidence}%`, sub: "average", icon: TrendingUp },
              ].map(({ label, value, sub, icon: Icon }) => (
                <div key={label} className="rounded-2xl bg-white p-5"
                  style={{ border: "1px solid rgba(61,90,71,0.09)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(61,90,71,0.4)" }}>{label}</span>
                    <Icon className="w-4 h-4" style={{ color: "rgba(61,90,71,0.3)" }} />
                  </div>
                  <div className="font-serif text-3xl font-bold" style={{ color: GREEN_DARK }}>{value}</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(61,90,71,0.45)" }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Streak + Insights row */}
            {(streak > 0 || categoryBreakdown.length > 0 || (patternInsights.length > 0 && patternInsights[0] !== "Make more decisions to unlock pattern insights.")) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {streak > 0 && (
                  <div className="rounded-2xl p-5"
                    style={{ background: streak >= 3 ? "#fdf3ec" : "white", border: streak >= 3 ? `1px solid ${TERRA}30` : "1px solid rgba(61,90,71,0.09)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-4 h-4" style={{ color: streak >= 3 ? TERRA : "rgba(61,90,71,0.4)" }} />
                      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(61,90,71,0.4)" }}>Streak</span>
                    </div>
                    <div className="font-serif text-3xl font-bold" style={{ color: streak >= 3 ? TERRA : GREEN_DARK }}>
                      {streak}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "rgba(61,90,71,0.45)" }}>
                      day{streak !== 1 ? "s" : ""} in a row
                    </div>
                  </div>
                )}

                {categoryBreakdown.length > 0 && (
                  <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid rgba(61,90,71,0.09)" }}>
                    <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(61,90,71,0.4)" }}>
                      By category
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryBreakdown.map((c) => (
                        <span key={c.label} className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "rgba(61,90,71,0.07)", color: GREEN }}>
                          {c.label} · {c.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {patternInsights.length > 0 && patternInsights[0] !== "Make more decisions to unlock pattern insights." && (
                  <div className="rounded-2xl p-5" style={{ background: "#fdf8ef", border: `1px solid ${TERRA}25` }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Lightbulb className="w-4 h-4" style={{ color: TERRA }} />
                      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(176,90,58,0.6)" }}>Pattern insight</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(61,90,71,0.7)" }}>{patternInsights[0]}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(61,90,71,0.4)" }}>
              Decision history
            </p>
            <div className="flex items-center gap-2">
              <div className="relative w-44">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5" style={{ color: "rgba(61,90,71,0.35)" }} />
                <Input placeholder="Search…"
                  className="pl-8 text-sm h-9 rounded-xl border-0"
                  style={{ background: "white", color: GREEN_DARK }}
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={priority} onValueChange={(v) => setPriority(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-[100px] text-sm h-9 rounded-xl border-0"
                  style={{ background: "white", color: GREEN }}>
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
              [1, 2, 3].map(i => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)
            ) : decisions?.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed"
                style={{ borderColor: "rgba(61,90,71,0.2)" }}>
                <p className="text-sm" style={{ color: "rgba(61,90,71,0.45)" }}>No decisions yet. Make one!</p>
              </div>
            ) : (
              decisions?.map((decision) => {
                const isFresh = freshDecision?.id === decision.id;
                const CategoryIcon = decision.category ? CATEGORY_ICONS[decision.category] ?? Zap : null;
                const outcomeColors = {
                  great: { label: "Great outcome", color: "#4a7c59" },
                  okay: { label: "Okay", color: "#c4852a" },
                  regret: { label: "Regret", color: TERRA },
                };

                return (
                  <div key={decision.id}
                    className="rounded-2xl bg-white overflow-hidden transition-all hover:shadow-sm"
                    style={{
                      border: isFresh ? `1.5px solid ${GREEN}` : "1px solid rgba(61,90,71,0.1)",
                    }}>
                    <div className="flex">
                      {/* Left accent */}
                      <div className="w-1 flex-shrink-0"
                        style={{ background: isFresh ? `linear-gradient(180deg, ${GREEN} 0%, ${TERRA} 100%)` : "rgba(61,90,71,0.08)" }} />

                      <div className="flex-1 p-5">
                        {/* Meta */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs" style={{ color: "rgba(61,90,71,0.4)" }}>
                              {format(new Date(decision.createdAt), "MMM d, yyyy · h:mm a")}
                            </span>
                            {CategoryIcon && decision.category && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: "rgba(61,90,71,0.07)", color: GREEN }}>
                                <CategoryIcon className="w-3 h-3" /> {decision.category}
                              </span>
                            )}
                            {decision.aiUsed && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: "rgba(176,90,58,0.08)", color: TERRA, border: `1px solid ${TERRA}25` }}>
                                <Sparkles className="w-3 h-3" /> AI
                              </span>
                            )}
                            {isFresh && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: `${GREEN}15`, color: GREEN }}>just decided</span>
                            )}
                          </div>

                          {/* Outcome badge */}
                          {decision.outcome && outcomeColors[decision.outcome as keyof typeof outcomeColors] && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                              style={{ color: outcomeColors[decision.outcome as keyof typeof outcomeColors].color, background: outcomeColors[decision.outcome as keyof typeof outcomeColors].color + "15", border: `1px solid ${outcomeColors[decision.outcome as keyof typeof outcomeColors].color}30` }}>
                              {outcomeColors[decision.outcome as keyof typeof outcomeColors].label}
                            </span>
                          )}
                        </div>

                        {/* Problem */}
                        <p className="text-sm italic mb-1.5 leading-relaxed" style={{ color: "rgba(61,90,71,0.5)" }}>
                          "{decision.problem}"
                        </p>

                        {/* Decision */}
                        <p className="font-serif font-semibold text-base mb-3" style={{ color: GREEN_DARK }}>
                          {decision.finalDecision}
                        </p>

                        <ConfidenceBar value={decision.confidence} />

                        {/* Outcome + Delete */}
                        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid rgba(61,90,71,0.07)" }}>
                          {!decision.outcome ? (
                            <div className="flex gap-2 flex-wrap">
                              <OutcomeButton label="Great" icon={ThumbsUp} color="#4a7c59" onClick={() => handleOutcome(decision.id, "great")} />
                              <OutcomeButton label="Okay" icon={Minus} color="#c4852a" onClick={() => handleOutcome(decision.id, "okay")} />
                              <OutcomeButton label="Regret" icon={ThumbsDown} color={TERRA} onClick={() => handleOutcome(decision.id, "regret")} />
                            </div>
                          ) : <div />}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="text-xs flex items-center gap-1 transition-opacity hover:opacity-60"
                                style={{ color: "rgba(61,90,71,0.3)" }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
