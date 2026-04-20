interface ThinkoraLogoProps {
  size?: number;
  className?: string;
}

export function ThinkoraLogo({ size = 32, className = "" }: ThinkoraLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="aura-outer" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="core-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
        <linearGradient id="spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer aura ring */}
      <circle cx="20" cy="20" r="19" fill="url(#aura-outer)" />

      {/* Inner aura ring */}
      <circle cx="20" cy="20" r="15.5" fill="none" stroke="url(#spark-grad)" strokeWidth="0.5" strokeOpacity="0.4" />

      {/* Core circle */}
      <circle cx="20" cy="20" r="13" fill="url(#core-grad)" filter="url(#glow)" />

      {/* Abstract "T" / thought mark — stylized brain wave */}
      {/* Horizontal top bar of T */}
      <rect x="11" y="13" width="18" height="2.8" rx="1.4" fill="white" fillOpacity="0.95" />

      {/* Vertical stem */}
      <rect x="18.3" y="15.8" width="3.4" height="8.4" rx="1.7" fill="white" fillOpacity="0.95" />

      {/* Spark dot — top right aura sparkle */}
      <circle cx="30" cy="10" r="1.8" fill="url(#spark-grad)" fillOpacity="0.8" />
      <circle cx="30" cy="10" r="0.8" fill="white" fillOpacity="0.9" />

      {/* Tiny spark — bottom left */}
      <circle cx="10" cy="30" r="1.2" fill="url(#spark-grad)" fillOpacity="0.6" />
    </svg>
  );
}

export function ThinkoraWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-serif font-semibold tracking-tight ${className}`}
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      Thinkora
    </span>
  );
}
