import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createContext, useContext, useState } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Decisions from "@/pages/decisions";

const queryClient = new QueryClient();

interface FreshDecision {
  id: number;
  problem: string;
  finalDecision: string;
  explanation: string;
  confidence: number;
  aiUsed: boolean;
}

interface ThinkoraCtx {
  freshDecision: FreshDecision | null;
  setFreshDecision: (d: FreshDecision | null) => void;
}

export const ThinkoraContext = createContext<ThinkoraCtx>({
  freshDecision: null,
  setFreshDecision: () => {},
});

export function useThinkoraContext() {
  return useContext(ThinkoraContext);
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/decisions" component={Decisions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [freshDecision, setFreshDecision] = useState<FreshDecision | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThinkoraContext.Provider value={{ freshDecision, setFreshDecision }}>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ThinkoraContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
