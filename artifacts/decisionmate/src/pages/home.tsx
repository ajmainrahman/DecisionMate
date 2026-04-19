import { useGetDecisionDashboard, getGetDecisionDashboardQueryKey, useListDecisions, getListDecisionsQueryKey } from "@workspace/api-client-react";
import { DecisionForm } from "@/components/decision-form";
import { DecisionHistory } from "@/components/decision-history";
import { DashboardStats } from "@/components/dashboard-stats";
import { BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-serif font-medium tracking-tight">DecisionMate</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Decision Maker */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6 lg:sticky lg:top-24">
          <div>
            <h2 className="text-3xl font-serif mb-2">What's on your mind?</h2>
            <p className="text-muted-foreground text-sm">
              Take a breath. Let's work through this together, practically and without judgment.
            </p>
          </div>
          <DecisionForm />
        </div>

        {/* Right Column: Dashboard & History */}
        <div className="w-full lg:w-7/12 flex flex-col gap-8">
          <DashboardStats />
          <DecisionHistory />
        </div>
      </main>
    </div>
  );
}
