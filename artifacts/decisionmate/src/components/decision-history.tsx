import { useListDecisions, getListDecisionsQueryKey } from "@workspace/api-client-react";
import { DecisionCard } from "./decision-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Search, Filter, Clock } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function DecisionHistory() {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebounce(search, 300);

  const { data: decisions, isLoading } = useListDecisions({
    search: debouncedSearch || undefined,
    priority: priority as any || undefined,
  }, {
    query: {
      queryKey: getListDecisionsQueryKey({ search: debouncedSearch || undefined, priority: priority as any || undefined })
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(263 72% 52% / 0.12) 0%, hsl(300 60% 62% / 0.12) 100%)" }}>
            <Clock className="h-4 w-4" style={{ color: "hsl(263 72% 52%)" }} />
          </div>
          <h3 className="text-xl font-serif font-semibold">Decision History</h3>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search decisions…"
              className="pl-9 bg-white/70 border-border/50 focus:border-primary/40 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={priority} onValueChange={(v) => setPriority(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-[120px] bg-white/70 border-border/50 rounded-xl">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Priority" />
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

      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
          </>
        ) : decisions?.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border border-dashed"
            style={{ borderColor: "hsl(263 72% 52% / 0.2)", background: "hsl(263 72% 52% / 0.03)" }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(263 72% 52% / 0.1) 0%, hsl(300 60% 62% / 0.1) 100%)" }}>
              <Clock className="w-6 h-6" style={{ color: "hsl(263 72% 52%)" }} />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No decisions yet</p>
            <p className="text-muted-foreground/70 text-xs mt-1">Your decision history will appear here</p>
          </div>
        ) : (
          decisions?.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))
        )}
      </div>
    </div>
  );
}
