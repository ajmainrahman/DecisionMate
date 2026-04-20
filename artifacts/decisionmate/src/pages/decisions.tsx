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

const BG = "#f8f5f0";
const BROWN = "#2d2520";
const BROWN_MID = "#6b5e55";
const SAND = "#c9956b";
const BORDER = "rgba(45,37,32,0.09)";
const SERIF = "'Cormorant Garamond', serif";
const SANS = "'DM Sans', sans-serif";

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? "#5c8c6e" : value >= 60 ? "#c4852a" : "#b05a3a";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(45,37,32,0.08)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs tabular-nums font-medium" style={{ color, fontFamily: SANS, minWidth: "2.5rem" }}>
        {value}% confidence
      </span>
    </div>
  );
}

function OutcomeBtn({ label, icon: Icon, color, onClick }: { label: string; icon: any; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-opacity hover:opacity-75"
      style={{ color, background: color + "12", border: `1px solid ${color}28`, fontFamily: SANS }}>
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
    <div className="min-h-[100dvh]" style={{ background: BG }}>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: BG, borderColor: BORDER }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
            <ThinkoraLogo size={26} />
            <ThinkoraWordmark />
          </button>
          <button
            onClick={() => { setFreshDecision(null); navigate("/"); }}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full transition-opacity hover:opacity-75"
            style={{ background: BROWN, color: BG, fontFamily: SANS, fontWeight: 500 }}
          >
            <Plus className="w-3.5 h-3.5" /> New decision
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-12">

        {/* Fresh Result */}
        {freshDecision && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-px" style={{ background: SAND }} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: SAND, fontFamily: SANS }}>
                  {freshDecision.aiUsed ? "AI-enhanced" : "Rule-based"} recommendation
                </span>
              </div>
              <button onClick={() => setFreshDecision(null)}
                className="text-xs transition-opacity hover:opacity-50"
                style={{ color: BROWN_MID, fontFamily: SANS }}>
                dismiss
              </button>
            </div>

            <div className="rounded-2xl bg-white p-8" style={{ border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(30,22,14,0.06)" }}>
              <p className="text-sm italic mb-5 leading-relaxed" style={{ color: BROWN_MID, fontFamily: SERIF }}>
                "{freshDecision.problem}"
              </p>
              <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", lineHeight: 1.2, color: BROWN, marginBottom: "1rem" }}>
                {freshDecision.finalDecision}
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: BROWN_MID, fontFamily: SANS, fontWeight: 300 }}>
                {freshDecision.explanation}
              </p>
              <div className="mb-6">
                <ConfidenceBar value={freshDecision.confidence} />
              </div>
              <div className="pt-5" style={{ borderTop: `1px solid ${BORDER}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "rgba(45,37,32,0.35)", fontFamily: SANS }}>
                  Once you've decided — how did it go?
                </p>
                <div className="flex gap-2 flex-wrap">
                  <OutcomeBtn label="Great outcome" icon={ThumbsUp} color="#5c8c6e" onClick={() => handleOutcome(freshDecision.id, "great")} />
                  <OutcomeBtn label="It was okay" icon={Minus} color="#c4852a" onClick={() => handleOutcome(freshDecision.id, "okay")} />
                  <OutcomeBtn label="I regret it" icon={ThumbsDown} color="#b05a3a" onClick={() => handleOutcome(freshDecision.id, "regret")} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats */}
        {stats && (
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-5 h-px" style={{ background: SAND }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: SAND, fontFamily: SANS }}>Overview</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {[
                { label: "Today", value: stats.todayCount, sub: "decisions", icon: CheckCircle2 },
                { label: "Total", value: stats.totalCount, sub: "all time", icon: BarChart3 },
                { label: "AI Used", value: stats.aiEnhancedCount, sub: "enhanced", icon: BrainCircuit },
                { label: "Confidence", value: `${stats.averageConfidence}%`, sub: "average", icon: TrendingUp },
              ].map(({ label, value, sub, icon: Icon }) => (
                <div key={label} className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "rgba(45,37,32,0.35)", fontFamily: SANS }}>{label}</span>
                    <Icon className="w-3.5 h-3.5" style={{ color: "rgba(45,37,32,0.2)" }} />
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 600, color: BROWN, lineHeight: 1 }}>{value}</div>
                  <div className="text-xs mt-1" style={{ color: BROWN_MID, fontFamily: SANS, fontWeight: 300 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Secondary stats row */}
            {(streak > 0 || categoryBreakdown.length > 0 || (patternInsights.length > 0 && patternInsights[0] !== "Make more decisions to unlock pattern insights.")) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {streak > 0 && (
                  <div className="rounded-xl p-4"
                    style={{ background: streak >= 3 ? "#fdf3ec" : "white", border: streak >= 3 ? "1px solid rgba(176,90,58,0.15)" : `1px solid ${BORDER}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-3.5 h-3.5" style={{ color: streak >= 3 ? "#b05a3a" : BROWN_MID }} />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "rgba(45,37,32,0.35)", fontFamily: SANS }}>Streak</span>
                    </div>
                    <div style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 600, color: streak >= 3 ? "#b05a3a" : BROWN, lineHeight: 1 }}>{streak}</div>
                    <div className="text-xs mt-1" style={{ color: BROWN_MID, fontFamily: SANS, fontWeight: 300 }}>day{streak !== 1 ? "s" : ""} in a row</div>
                  </div>
                )}
                {categoryBreakdown.length > 0 && (
                  <div className="rounded-xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] block mb-3" style={{ color: "rgba(45,37,32,0.35)", fontFamily: SANS }}>By category</span>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryBreakdown.map((c) => (
                        <span key={c.label} className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: "rgba(45,37,32,0.05)", color: BROWN_MID, fontFamily: SANS }}>
                          {c.label} · {c.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {patternInsights.length > 0 && patternInsights[0] !== "Make more decisions to unlock pattern insights." && (
                  <div className="rounded-xl p-4" style={{ background: "#fdf8ef", border: "1px solid rgba(201,149,107,0.2)" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Lightbulb className="w-3.5 h-3.5" style={{ color: SAND }} />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: SAND, fontFamily: SANS }}>Pattern</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: BROWN_MID, fontFamily: SANS, fontWeight: 300 }}>{patternInsights[0]}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* History */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-px" style={{ background: SAND }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: SAND, fontFamily: SANS }}>History</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-40">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5" style={{ color: "rgba(45,37,32,0.3)" }} />
                <Input placeholder="Search…"
                  className="pl-8 text-sm h-9 rounded-xl border-0"
                  style={{ background: "white", color: BROWN, fontFamily: SANS, border: `1px solid ${BORDER}` }}
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={priority} onValueChange={(v) => setPriority(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-[90px] text-xs h-9 rounded-xl border-0"
                  style={{ background: "white", color: BROWN_MID, fontFamily: SANS, border: `1px solid ${BORDER}` }}>
                  <SelectValue placeholder="All" />
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
              <div className="text-center py-16 rounded-2xl" style={{ border: `1px dashed rgba(45,37,32,0.15)` }}>
                <p className="text-sm" style={{ color: BROWN_MID, fontFamily: SANS, fontWeight: 300 }}>No decisions yet — go make one.</p>
              </div>
            ) : (
              decisions?.map((decision) => {
                const isFresh = freshDecision?.id === decision.id;
                const CategoryIcon = decision.category ? CATEGORY_ICONS[decision.category] ?? Zap : null;
                const outcomeMap = {
                  great: { label: "Great outcome", color: "#5c8c6e" },
                  okay: { label: "Okay", color: "#c4852a" },
                  regret: { label: "I regret it", color: "#b05a3a" },
                };

                return (
                  <div key={decision.id}
                    className="rounded-2xl bg-white overflow-hidden transition-shadow hover:shadow-sm"
                    style={{ border: isFresh ? `1.5px solid ${SAND}` : `1px solid ${BORDER}` }}
                  >
                    <div className="flex">
                      {/* Left accent bar */}
                      <div className="w-0.5 flex-shrink-0 rounded-l-2xl"
                        style={{ background: isFresh ? SAND : "transparent" }} />

                      <div className="flex-1 p-5">
                        {/* Meta row */}
                        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs" style={{ color: "rgba(45,37,32,0.35)", fontFamily: SANS }}>
                              {format(new Date(decision.createdAt), "MMM d, yyyy · h:mm a")}
                            </span>
                            {CategoryIcon && decision.category && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                                style={{ background: "rgba(45,37,32,0.05)", color: BROWN_MID, fontFamily: SANS }}>
                                <CategoryIcon className="w-3 h-3" /> {decision.category}
                              </span>
                            )}
                            {decision.aiUsed && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                                style={{ background: "rgba(201,149,107,0.1)", color: SAND, border: `1px solid rgba(201,149,107,0.2)`, fontFamily: SANS }}>
                                <Sparkles className="w-3 h-3" /> AI
                              </span>
                            )}
                            {isFresh && (
                              <span className="px-2 py-0.5 rounded-full text-xs"
                                style={{ background: `${SAND}18`, color: SAND, fontFamily: SANS }}>
                                just decided
                              </span>
                            )}
                          </div>
                          {decision.outcome && outcomeMap[decision.outcome as keyof typeof outcomeMap] && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ color: outcomeMap[decision.outcome as keyof typeof outcomeMap].color, background: outcomeMap[decision.outcome as keyof typeof outcomeMap].color + "12", border: `1px solid ${outcomeMap[decision.outcome as keyof typeof outcomeMap].color}28`, fontFamily: SANS }}>
                              {outcomeMap[decision.outcome as keyof typeof outcomeMap].label}
                            </span>
                          )}
                        </div>

                        <p className="text-sm italic mb-1.5 leading-relaxed" style={{ color: BROWN_MID, fontFamily: SERIF }}>
                          "{decision.problem}"
                        </p>

                        <p className="font-semibold mb-3" style={{ fontFamily: SERIF, fontSize: "1.1rem", color: BROWN, lineHeight: 1.35 }}>
                          {decision.finalDecision}
                        </p>

                        <ConfidenceBar value={decision.confidence} />

                        {/* Outcome + Delete */}
                        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                          {!decision.outcome ? (
                            <div className="flex gap-2 flex-wrap">
                              <OutcomeBtn label="Great" icon={ThumbsUp} color="#5c8c6e" onClick={() => handleOutcome(decision.id, "great")} />
                              <OutcomeBtn label="Okay" icon={Minus} color="#c4852a" onClick={() => handleOutcome(decision.id, "okay")} />
                              <OutcomeBtn label="Regret" icon={ThumbsDown} color="#b05a3a" onClick={() => handleOutcome(decision.id, "regret")} />
                            </div>
                          ) : <div />}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="transition-opacity hover:opacity-50" style={{ color: "rgba(45,37,32,0.25)" }}>
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
        </section>

      </main>
    </div>
  );
}
