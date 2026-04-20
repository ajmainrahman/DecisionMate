interface ThinkoraLogoProps {
  size?: number;
  className?: string;
}

export function ThinkoraLogo({ size = 32, className = "" }: ThinkoraLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="lg-core" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="lg-ring1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#e879f9" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="lg-ring2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f0abfc" stopOpacity="0.25" />
        </linearGradient>
        <filter id="f-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer aura ring */}
      <circle cx="24" cy="24" r="23" stroke="url(#lg-ring2)" strokeWidth="1" fill="none" />

      {/* Mid ring - partial arcs for asymmetry */}
      <path
        d="M 24 7 A 17 17 0 1 1 7.5 31"
        stroke="url(#lg-ring1)" strokeWidth="1.2" fill="none" strokeLinecap="round"
      />

      {/* Core filled circle */}
      <circle cx="24" cy="24" r="13" fill="url(#lg-core)" filter="url(#f-glow)" />

      {/* Inner mark: three dots in a triangle = "decisions / clarity / thought" */}
      <circle cx="24" cy="18.5" r="2.8" fill="white" fillOpacity="0.97" />
      <circle cx="19.5" cy="27" r="2.2" fill="white" fillOpacity="0.82" />
      <circle cx="28.5" cy="27" r="2.2" fill="white" fillOpacity="0.82" />

      {/* Connecting lines */}
      <line x1="24" y1="18.5" x2="19.5" y2="27" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="24" y1="18.5" x2="28.5" y2="27" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="19.5" y1="27" x2="28.5" y2="27" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" />

      {/* Sparkle - top right */}
      <circle cx="36" cy="12" r="2" fill="#e879f9" fillOpacity="0.9" />
      <circle cx="36" cy="12" r="1" fill="white" fillOpacity="0.95" />
    </svg>
  );
}

export function ThinkoraWordmark({ className = "", size = "default" }: { className?: string; size?: "default" | "lg" | "xl" }) {
  const sizeClass = size === "xl" ? "text-4xl" : size === "lg" ? "text-2xl" : "text-xl";
  return (
    <span
      className={`font-serif font-bold tracking-tight ${sizeClass} ${className}`}
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      Thinkora
    </span>
  );
}
