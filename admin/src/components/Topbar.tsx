"use client";

interface TopbarProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}

export default function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-5 lg:px-6 py-3 border-b border-border bg-white/85 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted hover:text-ink transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="min-w-0 leading-tight">
          <h1 className="text-[17px] font-semibold truncate">{title}</h1>
          <p className="text-[12px] text-muted truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div
          className="hidden sm:flex items-center gap-1.5 chip"
          style={{ background: "#E7F8F0", color: "#0BA45C", padding: "4px 10px" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0BA45C" }} />
          IA activa 24/7
        </div>
        <button className="btn" style={{ padding: "7px 10px" }} aria-label="Notificaciones">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
