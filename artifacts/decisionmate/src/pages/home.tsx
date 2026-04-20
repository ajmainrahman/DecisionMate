import { DecisionForm } from "@/components/decision-form";
import { DecisionHistory } from "@/components/decision-history";
import { DashboardStats } from "@/components/dashboard-stats";
import { ThinkoraLogo, ThinkoraWordmark } from "@/components/thinkora-logo";

export default function Home() {
  return (
    <div className="min-h-[100dvh]" style={{ background: "linear-gradient(160deg, hsl(252 60% 97%) 0%, hsl(280 40% 96%) 50%, hsl(300 40% 96%) 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/60"
        style={{ background: "rgba(248, 246, 255, 0.85)", backdropFilter: "blur(16px)" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2.5">
            <ThinkoraLogo size={34} />
            <ThinkoraWordmark className="text-xl" />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: "linear-gradient(135deg, hsl(263 72% 52% / 0.08) 0%, hsl(300 60% 62% / 0.08) 100%)", color: "hsl(263 72% 45%)", border: "1px solid hsl(263 72% 52% / 0.15)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              AI-Powered Decisions
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero section */}
        <div className="text-center mb-10 pt-2">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold mb-3 leading-tight">
            <span className="thinkora-text-gradient">Think clearly.</span>
            <br />
            <span className="text-foreground/90">Decide confidently.</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Share what's on your mind — Thinkora weighs your context and brings clarity, backed by AI.
          </p>
        </div>

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Decision Maker */}
          <div className="w-full lg:w-5/12 flex flex-col gap-5 lg:sticky lg:top-24">
            <DecisionForm />
          </div>

          {/* Right Column: Dashboard & History */}
          <div className="w-full lg:w-7/12 flex flex-col gap-8">
            <DashboardStats />
            <DecisionHistory />
          </div>
        </div>
      </main>

      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(263 72% 52%) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(300 60% 62%) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, hsl(280 65% 55%) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
    </div>
  );
}
