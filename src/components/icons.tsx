const PATHS: Record<string, string[]> = {
  calendar: ["M3 5h18v16H3z", "M3 9h18", "M8 3v4", "M16 3v4"],
  history: ["M3 12a9 9 0 1 0 3-6.7", "M3 4v4h4", "M12 8v4l3 2"],
  star: ["M12 3l2.6 5.6 6.1.8-4.5 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.3 9.4l6.1-.8z"],
  gear: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"],
  flame: ["M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"],
  sun: ["M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z", "M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"],
  utensils: ["M7 3v8a2 2 0 0 0 2 2v8", "M5 3v5", "M9 3v5", "M17 21V3c-2 1-3 4-3 7h3"],
  cup: ["M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z", "M17 10h2a2 2 0 0 1 0 4h-2"],
  moon: ["M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"],
  plus: ["M12 5v14M5 12h14"],
  lock: ["M5 11h14v10H5z", "M8 11V7a4 4 0 0 1 8 0v4"],
  check: ["M5 12l4 4 10-10"],
  close: ["M6 6l12 12M18 6L6 18"],
  download: ["M12 3v12", "M7 10l5 5 5-5", "M4 21h16"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 13h10l1-13"],
  info: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 11v6", "M12 7v.5"],
  doc: ["M6 3h9l4 4v14H6z", "M14 3v5h5", "M9 13h6M9 17h6"],
  shield: ["M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"],
  card: ["M3 6h18v12H3z", "M3 10h18", "M7 15h4"],
  award: ["M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12z", "M9 14l-2 7 5-2 5 2-2-7"],
  calc: ["M5 3h14v18H5z", "M8 7h8", "M8 12h2M14 12h2M8 16h2M14 16h2"],
  logout: ["M15 4h4v16h-4", "M10 8l-4 4 4 4", "M6 12h9"],
  mail: ["M3 5h18v14H3z", "M3 7l9 6 9-6"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21a8 8 0 0 1 16 0"],
  camera: ["M4 7h4l2-3h4l2 3h4v12H4z", "M12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  chart: ["M4 20V10M10 20V4M16 20v-7M22 20H2"],
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  chevron: ["M9 6l6 6-6 6"],
  trend: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
  bell: ["M6 16V11a6 6 0 0 1 12 0v5l2 2H4z", "M10 20a2 2 0 0 0 4 0"],
};

export function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof PATHS | string; className?: string }) {
  const paths = PATHS[name] ?? [];
  return (
    <svg viewBox="0 0 24 24" className={`fill-none stroke-current ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
