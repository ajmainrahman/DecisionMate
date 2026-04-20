interface ThinkoraLogoProps {
  size?: number;
}

export function ThinkoraLogo({ size = 32 }: ThinkoraLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring — warm sand */}
      <circle cx="16" cy="16" r="15" stroke="#c9956b" strokeWidth="1.2" fill="none" />
      {/* Inner circle — warm brown fill */}
      <circle cx="16" cy="16" r="10" fill="#2d2520" />
      {/* Small dot — sand accent */}
      <circle cx="16" cy="16" r="3" fill="#f8f5f0" />
      {/* Highlight */}
      <circle cx="17.4" cy="14.6" r="1.1" fill="rgba(201,149,107,0.7)" />
    </svg>
  );
}

export function ThinkoraWordmark({ className = "", size = "default" }: { className?: string; size?: "default" | "lg" | "xl" }) {
  const fontSize = size === "xl" ? "2rem" : size === "lg" ? "1.5rem" : "1.15rem";
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 600,
        fontSize,
        color: "#2d2520",
        letterSpacing: "0.01em",
      }}
    >
      Thinkora
    </span>
  );
}
