interface ThinkoraLogoProps {
  size?: number;
  light?: boolean;
}

export function ThinkoraLogo({ size = 36, light = false }: ThinkoraLogoProps) {
  const cream = "#f5f0e8";
  const green = "#3d5a47";

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill={light ? cream : green} />
      <circle cx="20" cy="20" r="13.5" fill="none"
        stroke={light ? "rgba(61,90,71,0.18)" : "rgba(245,240,232,0.14)"}
        strokeWidth="1" />
      <path
        d="M12 20 C14 14.5, 26 14.5, 28 20 C26 25.5, 14 25.5, 12 20 Z"
        fill="none"
        stroke={light ? green : cream}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="2.8" fill={light ? green : cream} />
      <circle cx="21.8" cy="18.3" r="0.9" fill={light ? "rgba(245,240,232,0.5)" : "rgba(245,240,232,0.45)"} />
    </svg>
  );
}

export function ThinkoraWordmark({ light = false, size = "default" }: { light?: boolean; size?: "default" | "lg" | "xl"; className?: string }) {
  const color = light ? "#f5f0e8" : "#2b3f32";
  const fontSize = size === "xl" ? "1.8rem" : size === "lg" ? "1.45rem" : "1.2rem";
  return (
    <span
      style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 600,
        fontSize,
        color,
        letterSpacing: "-0.015em",
      }}
    >
      Thinkora
    </span>
  );
}
