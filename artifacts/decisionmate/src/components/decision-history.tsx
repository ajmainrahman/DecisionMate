import { useListDecisions, getListDecisionsQueryKey } from "@workspace/api-client-react";
import { DecisionCard } from "./decision-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Search, Filter } from "lucide-react";
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-2xl font-serif">Past Decisions</h3>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search past decisions..."
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={priority} onValueChange={(v) => setPriority(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-[130px] bg-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
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
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </>
        ) : decisions?.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed border-primary/20">
            <p className="text-muted-foreground">No decisions found.</p>
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
