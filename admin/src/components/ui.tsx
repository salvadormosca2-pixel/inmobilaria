"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Temp, Canal, Area } from "@/lib/mockData";
import { CANAL_LABEL, AREA_LABEL } from "@/lib/mockData";

/* ---------- Temperatura ---------- */

const TEMP_STYLE: Record<Temp, { bg: string; fg: string; label: string }> = {
  caliente: { bg: "#FFF0ED", fg: "#FF4D2E", label: "Caliente" },
  tibio: { bg: "#FEF5E4", fg: "#F59E0B", label: "Tibio" },
  frio: { bg: "#F1F5F9", fg: "#94A3B8", label: "Frío" },
};

export function TempChip({ temp, score }: { temp: Temp; score?: number }) {
  const s = TEMP_STYLE[temp];
  return (
    <span className="chip" style={{ background: s.bg, color: s.fg }}>
      {temp === "caliente" && "🔥"}
      {s.label}
      {score !== undefined && (
        <span className="mono" style={{ opacity: 0.75 }}>
          {score}
        </span>
      )}
    </span>
  );
}

export function tempColor(temp: Temp) {
  return TEMP_STYLE[temp].fg;
}

/* ---------- Área de negocio ---------- */

const AREA_STYLE: Record<Area, { bg: string; fg: string; icon: string }> = {
  ventas: { bg: "#EEF4FF", fg: "#2563EB", icon: "🏠" },
  alquileres: { bg: "#F3EEFF", fg: "#7C3AED", icon: "🔑" },
};

export function AreaChip({ area, mini = false }: { area: Area; mini?: boolean }) {
  const s = AREA_STYLE[area];
  return (
    <span className="chip" style={{ background: s.bg, color: s.fg, fontSize: mini ? 9 : 11 }}>
      {s.icon} {AREA_LABEL[area]}
    </span>
  );
}

export function areaColor(area: Area) {
  return AREA_STYLE[area];
}

/* ---------- Agente asignado ---------- */

export function Asignado({
  a,
  size = 24,
}: {
  a: { nombre: string; avatar: string; rol: string } | null;
  size?: number;
}) {
  if (!a) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{ width: size, height: size, background: "#F1F5F9", color: "#94A3B8", fontSize: size * 0.42 }}
        >
          🤖
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-[12px] font-medium" style={{ color: "#64748B" }}>
            Sin asignar
          </div>
          <div className="text-[10.5px] text-muted">La sigue trabajando la IA</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center shrink-0 text-white font-semibold"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg,#2563EB,#00A3FF)",
          fontSize: size * 0.38,
        }}
      >
        {a.avatar}
      </div>
      <div className="min-w-0 leading-tight">
        <div className="text-[12px] font-semibold truncate">{a.nombre}</div>
        <div className="text-[10.5px] text-muted truncate">{a.rol}</div>
      </div>
    </div>
  );
}

/* ---------- Canal ---------- */

const CANAL_STYLE: Record<Canal, { bg: string; fg: string; icon: string }> = {
  whatsapp: { bg: "#E7F8F0", fg: "#0BA45C", icon: "WA" },
  instagram: { bg: "#FDF0F7", fg: "#C13584", icon: "IG" },
  zonaprop: { bg: "#EEF4FF", fg: "#2563EB", icon: "ZP" },
  facebook: { bg: "#EFF4FF", fg: "#1877F2", icon: "FB" },
  web: { bg: "#F1F5F9", fg: "#64748B", icon: "WEB" },
};

export function CanalBadge({ canal, full = false }: { canal: Canal; full?: boolean }) {
  const s = CANAL_STYLE[canal];
  return (
    <span className="chip mono" style={{ background: s.bg, color: s.fg, fontSize: 10 }}>
      {full ? CANAL_LABEL[canal] : s.icon}
    </span>
  );
}

/* ---------- Anillo de score ---------- */

export function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const temp: Temp = score >= 80 ? "caliente" : score >= 45 ? "tibio" : "frio";
  const color = TEMP_STYLE[temp].fg;
  const stroke = size * 0.09;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (score / 100) * c }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="mono font-bold" style={{ fontSize: size * 0.28, color }}>
          {score}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-muted mt-0.5">score</span>
      </div>
    </div>
  );
}

/* ---------- Layout ---------- */

export function PageWrap({ children }: { children: ReactNode }) {
  return <div className="view-fade p-5 lg:p-6 max-w-[1500px] mx-auto">{children}</div>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-1">
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {right}
    </div>
  );
}

/* ---------- KPI ---------- */

const TONO: Record<string, string> = {
  blue: "#2563EB",
  hot: "#FF4D2E",
  warm: "#F59E0B",
  cold: "#94A3B8",
  success: "#0BA45C",
  ink: "#0F1B2D",
};

export function KpiCard({
  label,
  valor,
  detalle,
  tono = "ink",
}: {
  label: string;
  valor: string | number;
  detalle?: string;
  tono?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">{label}</div>
      <div className="mono font-bold mt-1.5 leading-none" style={{ fontSize: 26, color: TONO[tono] ?? TONO.ink }}>
        {valor}
      </div>
      {detalle && <div className="text-[11px] text-muted mt-1.5">{detalle}</div>}
    </div>
  );
}

/* ---------- Barra horizontal ---------- */

export function Bar({ pct, color = "#2563EB" }: { pct: number; color?: string }) {
  return (
    <div className="h-2 rounded-full bg-[#F1F5F9] overflow-hidden flex-1">
      <div
        className="h-full rounded-full bar-grow"
        style={{
          width: `${pct}%`,
          background: color === "#2563EB" ? "linear-gradient(90deg,#2563EB,#00A3FF)" : color,
        }}
      />
    </div>
  );
}

/* ---------- Toggle ---------- */

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className="toggle"
      data-on={on}
      aria-pressed={on}
      onClick={() => onChange(!on)}
    />
  );
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(15,27,45,.4)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="card w-full overflow-hidden"
            style={{ maxWidth: width }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-[15px] font-semibold">{title}</h3>
              <button onClick={onClose} className="text-muted hover:text-ink transition-colors" aria-label="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Toast ---------- */

export function Toast({ msg, onDone }: { msg: string | null; onDone: () => void }) {
  useEffect(() => {
    if (msg) {
      const t = setTimeout(onDone, 3200);
      return () => clearTimeout(t);
    }
  }, [msg, onDone]);

  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[110] card px-4 py-2.5 text-[13px] font-medium flex items-center gap-2"
          style={{ boxShadow: "0 8px 24px rgba(15,27,45,.12)" }}
        >
          <span style={{ color: "#0BA45C" }}>✓</span>
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
