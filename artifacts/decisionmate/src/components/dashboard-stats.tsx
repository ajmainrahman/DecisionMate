import { useGetDecisionDashboard, getGetDecisionDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, History, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
  const { data: stats, isLoading } = useGetDecisionDashboard({
    query: {
      queryKey: getGetDecisionDashboardQueryKey(),
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card className="bg-white/80 border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-primary opacity-70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif">{stats.todayCount}</div>
          <p className="text-xs text-muted-foreground mt-1">decisions made</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/80 border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          <History className="h-4 w-4 text-primary opacity-70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif">{stats.totalCount}</div>
          <p className="text-xs text-muted-foreground mt-1">all time</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/80 border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">AI Assisted</CardTitle>
          <BrainCircuit className="h-4 w-4 text-secondary opacity-70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif">{stats.aiEnhancedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">enhanced insights</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Confidence</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary opacity-70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif">{stats.averageConfidence}%</div>
          <p className="text-xs text-muted-foreground mt-1">average rating</p>
        </CardContent>
      </Card>
    </div>
  );
}
