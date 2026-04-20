import { useGetDecisionDashboard, getGetDecisionDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, History, TrendingUp, Flame, ThumbsUp, Minus, ThumbsDown, Lightbulb, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ label, value, sub, icon: Icon, accent = false, highlight = false }: {
  label: string; value: string | number; sub: string;
  icon: any; accent?: boolean; highlight?: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden transition-all hover:shadow-md"
      style={{ background: highlight ? "linear-gradient(135deg, hsl(263 72% 52% / 0.08) 0%, hsl(300 60% 62% / 0.08) 100%)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)" }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={accent ? { background: "linear-gradient(135deg, hsl(263 72% 52% / 0.15) 0%, hsl(300 60% 62% / 0.15) 100%)" } : { background: "hsl(252 30% 93%)" }}>
          <Icon className="h-3.5 w-3.5" style={accent ? { color: "hsl(263 72% 52%)" } : { color: "hsl(252 12% 50%)" }} />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-serif font-bold"
          style={highlight ? {
            background: "linear-gradient(135deg, hsl(263 72% 52%) 0%, hsl(300 60% 62%) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
          } : {}}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const { data: stats, isLoading } = useGetDecisionDashboard({
    query: { queryKey: getGetDecisionDashboardQueryKey() }
  });

  if (isLoading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
      </div>
    </div>
  );

  if (!stats) return null;

  const s = stats as any;
  const outcomeStats = s.outcomeStats ?? { great: 0, okay: 0, regret: 0, pending: 0 };
  const patternInsights: string[] = s.patternInsights ?? [];
  const categoryBreakdown: { label: string; count: number }[] = s.categoryBreakdown ?? [];
  const streak: number = s.streak ?? 0;

  return (
    <div className="space-y-4">
      {/* Top stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Today" value={stats.todayCount} sub="decisions" icon={CheckCircle2} accent />
        <StatCard label="Total" value={stats.totalCount} sub="all time" icon={History} />
        <StatCard label="AI Used" value={stats.aiEnhancedCount} sub="enhanced" icon={BrainCircuit} accent highlight />
        <StatCard label="Confidence" value={`${stats.averageConfidence}%`} sub="average" icon={TrendingUp} accent />
        <StatCard label="Streak" value={streak} sub={`day${streak !== 1 ? "s" : ""} in a row`}
          icon={Flame} accent={streak >= 3} highlight={streak >= 3} />
      </div>

      {/* Outcome tracking */}
      {(outcomeStats.great + outcomeStats.okay + outcomeStats.regret) > 0 && (
        <Card className="border-0 shadow-sm" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" /> Outcome tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex gap-5">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                  <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="font-bold text-green-700">{outcomeStats.great}</span>
                <span className="text-muted-foreground text-xs">great</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Minus className="w-3.5 h-3.5 text-yellow-600" />
                </div>
                <span className="font-bold text-yellow-700">{outcomeStats.okay}</span>
                <span className="text-muted-foreground text-xs">okay</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                  <ThumbsDown className="w-3.5 h-3.5 text-red-600" />
                </div>
                <span className="font-bold text-red-700">{outcomeStats.regret}</span>
                <span className="text-muted-foreground text-xs">regret</span>
              </div>
              {outcomeStats.pending > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{outcomeStats.pending}</span>
                  <span className="text-xs">pending</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card className="border-0 shadow-sm" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" style={{ color: "hsl(263 72% 52%)" }} /> By category
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {categoryBreakdown.map((c) => (
                <span key={c.label} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "linear-gradient(135deg, hsl(263 72% 52% / 0.08) 0%, hsl(300 60% 62% / 0.08) 100%)", color: "hsl(263 72% 42%)", border: "1px solid hsl(263 72% 52% / 0.15)" }}>
                  {c.label} · {c.count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pattern insights */}
      {patternInsights.length > 0 && (
        <Card className="border-0 shadow-sm overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(263 72% 52% / 0.05) 0%, hsl(300 60% 62% / 0.05) 100%)", border: "1px solid hsl(263 72% 52% / 0.15)" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "hsl(263 72% 42%)" }}>
              <Lightbulb className="h-4 w-4" style={{ color: "hsl(300 60% 55%)" }} /> Pattern insights
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {patternInsights.map((insight, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "hsl(263 25% 35%)" }}>
                <span className="mr-1.5" style={{ color: "hsl(300 60% 55%)" }}>·</span>{insight}
              </p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
