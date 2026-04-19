import { useGetDecisionDashboard, getGetDecisionDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, History, TrendingUp, Flame, ThumbsUp, Minus, ThumbsDown, Lightbulb, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
  const { data: stats, isLoading } = useGetDecisionDashboard({
    query: { queryKey: getGetDecisionDashboardQueryKey() }
  });

  if (isLoading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
        <Card className="bg-white/80 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary opacity-70" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-serif">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground mt-1">decisions</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle>
            <History className="h-4 w-4 text-primary opacity-70" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-serif">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">all time</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">AI Used</CardTitle>
            <BrainCircuit className="h-4 w-4 text-secondary opacity-70" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-serif">{stats.aiEnhancedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">enhanced</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary opacity-70" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-serif">{stats.averageConfidence}%</div>
            <p className="text-xs text-muted-foreground mt-1">average</p>
          </CardContent>
        </Card>

        <Card className={`border-none shadow-sm ${streak >= 3 ? "bg-orange-50" : "bg-white/80"}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Streak</CardTitle>
            <Flame className={`h-4 w-4 ${streak >= 3 ? "text-orange-500" : "text-primary opacity-70"}`} />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-2xl font-bold font-serif ${streak >= 3 ? "text-orange-600" : ""}`}>{streak}</div>
            <p className="text-xs text-muted-foreground mt-1">day{streak !== 1 ? "s" : ""} in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Outcome tracking */}
      {(outcomeStats.great + outcomeStats.okay + outcomeStats.regret) > 0 && (
        <Card className="bg-white/80 border-none shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" /> Outcome tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-700">{outcomeStats.great}</span>
                <span className="text-muted-foreground">great</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Minus className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-700">{outcomeStats.okay}</span>
                <span className="text-muted-foreground">okay</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <ThumbsDown className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-700">{outcomeStats.regret}</span>
                <span className="text-muted-foreground">regret</span>
              </div>
              {outcomeStats.pending > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {outcomeStats.pending} pending
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card className="bg-white/80 border-none shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" /> By category
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {categoryBreakdown.map((c) => (
                <span key={c.label} className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium border border-primary/15">
                  {c.label} · {c.count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pattern insights */}
      {patternInsights.length > 0 && (
        <Card className="bg-amber-50/60 border-amber-100 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-800">
              <Lightbulb className="h-4 w-4 text-amber-600" /> Pattern insights
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {patternInsights.map((insight, i) => (
              <p key={i} className="text-sm text-amber-900 leading-relaxed">· {insight}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
