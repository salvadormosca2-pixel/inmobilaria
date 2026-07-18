"use client";

import { motion, AnimatePresence } from "framer-motion";

const I = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    {d}
  </svg>
);

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  hot?: boolean;
}

export const NAV_GROUPS: { grupo: string; items: NavItem[] }[] = [
  {
    grupo: "Captación y venta",
    items: [
      { key: "hoy", label: "Hoy", icon: I(<><path d="M3 12l9-9 9 9" /><path d="M5 10v10h14V10" /></>), badge: 4 },
      { key: "conversaciones", label: "Conversaciones", icon: I(<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l2-4.6A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />), badge: 1 },
      { key: "pipeline", label: "Pipeline", icon: I(<><rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="10" rx="1" /><rect x="17" y="4" width="4" height="7" rx="1" /></>) },
      { key: "leads", label: "Leads", icon: I(<><circle cx="9" cy="7" r="3.5" /><path d="M2 21v-1.5A5.5 5.5 0 0 1 7.5 14h3A5.5 5.5 0 0 1 16 19.5V21" /><path d="M17 8h5M19.5 5.5v5" /></>) },
      { key: "seguimiento", label: "Seguimiento", icon: I(<><path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-7 3.3" /><path d="M3 4.3V7.5h3.2" /><path d="M12 8v4l3 2" /></>), badge: 2 },
      { key: "enviar", label: "Enviar propiedad", icon: I(<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>) },
    ],
  },
  {
    grupo: "Cartera",
    items: [
      { key: "propiedades", label: "Propiedades", icon: I(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>) },
      { key: "mapa", label: "Mapa", icon: I(<><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>) },
      { key: "propietarios", label: "Propietarios", icon: I(<><path d="M12 2l9 6v12a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V8z" /><circle cx="12" cy="11" r="1.5" /></>) },
    ],
  },
  {
    grupo: "Administración",
    items: [
      { key: "contratos", label: "Contratos y alquileres", icon: I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></>), badge: 2 },
      { key: "visitas", label: "Visitas", icon: I(<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>) },
      { key: "agentes", label: "Equipo", icon: I(<><circle cx="9" cy="7" r="3.5" /><path d="M2 21v-1.5A5.5 5.5 0 0 1 7.5 14h3a5.5 5.5 0 0 1 5.5 5.5V21" /><path d="M16 3.5a3.5 3.5 0 0 1 0 7" /><path d="M22 21v-1.5a5.5 5.5 0 0 0-4-5.3" /></>) },
    ],
  },
  {
    grupo: "Sistema",
    items: [
      { key: "automatizaciones", label: "Automatizaciones", icon: I(<><path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4M4.9 19.1l2.9-2.9M16.2 7.8l2.9-2.9" /><circle cx="12" cy="12" r="3" /></>) },
      { key: "metricas", label: "Métricas y facturación", icon: I(<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>), hot: true },
    ],
  },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(15,27,45,.4)" }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 bottom-0 w-[260px] bg-white border-r border-border z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Marca */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[13px]"
              style={{ background: "linear-gradient(135deg,#2563EB,#00A3FF)" }}
            >
              🔥
            </div>
            <div className="leading-tight">
              <div className="font-[family-name:var(--font-display)] text-[15px] font-bold tracking-tight">
                Cero Fugas
              </div>
              <div className="text-[10px] text-muted -mt-0.5">CRM Inmobiliario</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_GROUPS.map((g) => (
            <div key={g.grupo} className="mb-1">
              <div className="px-5 pt-2 pb-1.5 text-[10px] uppercase tracking-[0.08em] text-muted font-semibold">
                {g.grupo}
              </div>
              {g.items.map((item) => {
                const active = currentPage === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onNavigate(item.key);
                      onClose();
                    }}
                    className="relative flex items-center gap-2.5 w-full text-left pl-5 pr-3 py-2 text-[13px] transition-colors duration-150"
                    style={{
                      background: active ? "#EEF4FF" : "transparent",
                      color: active ? "#2563EB" : "#64748B",
                      fontWeight: active ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = "#F7F9FC";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {active && <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: "#2563EB" }} />}
                    {item.icon}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className="chip mono"
                        style={{
                          background: item.key === "hoy" ? "#FFF0ED" : "#EEF4FF",
                          color: item.key === "hoy" ? "#FF4D2E" : "#2563EB",
                          fontSize: 10,
                          padding: "1px 6px",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Pie */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ background: "#F7F9FC" }}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
              style={{ background: "#0F1B2D" }}
            >
              JG
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-[12px] font-semibold truncate">José Greco</div>
              <div className="text-[10px] text-muted truncate">Inmobiliaria · Catamarca</div>
            </div>
          </div>
          <div className="text-[10px] text-muted text-center mt-2.5">
            por{" "}
            <a href="https://ecosystem.ar" target="_blank" rel="noopener" className="font-semibold" style={{ color: "#2563EB" }}>
              ecosystem.ar
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
