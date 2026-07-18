"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageWrap, SectionTitle, KpiCard, TempChip, CanalBadge, tempColor } from "@/components/ui";
import { LEADS } from "@/lib/mockData";
import type { LeadRow, Temp } from "@/lib/mockData";

/* ---------- Paleta ---------- */

const BLUE = "#2563EB";
const ACTIVO = "#EEF4FF";
const BORDE = "#E5EAF2";
const MUTED = "#64748B";

/* ---------- Estado del lead ---------- */

const ESTADO_STYLE: Record<string, { bg: string; fg: string }> = {
  "Caliente entregada": { bg: "#FFF0ED", fg: "#FF4D2E" },
  "Visita agendada": { bg: "#E7F8F0", fg: "#0BA45C" },
  "Tasación agendada": { bg: "#FEF5E4", fg: "#F59E0B" },
  Calificando: { bg: "#EEF4FF", fg: "#2563EB" },
  Nuevo: { bg: "#F1F5F9", fg: "#94A3B8" },
};

function EstadoChip({ estado }: { estado: string }) {
  const s = ESTADO_STYLE[estado] ?? { bg: "#F1F5F9", fg: "#94A3B8" };
  return (
    <span className="chip" style={{ background: s.bg, color: s.fg }}>
      {estado}
    </span>
  );
}

/* ---------- Próxima acción automática (la estrella del módulo) ---------- */

function AccionAuto({ accion }: { accion: string }) {
  return (
    <span className="inline-flex items-start gap-1.5" style={{ color: BLUE }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 shrink-0 mt-[3px]"
        aria-hidden="true"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
      <span className="text-[12.5px] font-medium leading-snug">{accion}</span>
    </span>
  );
}

/* ---------- Filtros ---------- */

type Filtro = "todas" | Temp;

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "caliente", label: "🔥 Calientes" },
  { key: "tibio", label: "Tibios" },
  { key: "frio", label: "Fríos" },
];

/** Marcas diacríticas combinantes (U+0300–U+036F) que deja NFD al descomponer. */
const DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "g");

/** Saca tildes para que "Veronica" encuentre a "Verónica". */
const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(DIACRITICOS, "");

/* ---------- Conteos derivados de LEADS ---------- */

const TOTAL = LEADS.length;
const CONTEO: Record<Temp, number> = {
  caliente: LEADS.filter((l) => l.temp === "caliente").length,
  tibio: LEADS.filter((l) => l.temp === "tibio").length,
  frio: LEADS.filter((l) => l.temp === "frio").length,
};
const pct = (n: number) => Math.round((n / TOTAL) * 100);

export default function LeadsPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const leads: LeadRow[] = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return LEADS.filter((l) => {
      const porTemp = filtro === "todas" || l.temp === filtro;
      const porNombre = q === "" || normalizar(l.nombre).includes(q);
      return porTemp && porNombre;
    });
  }, [busqueda, filtro]);

  const contarFiltro = (f: Filtro) => (f === "todas" ? TOTAL : CONTEO[f]);
  const hayFiltroActivo = filtro !== "todas" || busqueda.trim() !== "";

  return (
    <PageWrap>
      {/* ---------- Encabezado ---------- */}
      <div className="mb-4">
        <h1 className="text-[20px] font-semibold">Leads</h1>
        <p className="text-[13px] text-muted mt-0.5">
          Todas las consultas que entraron, calificadas por la IA con un score de 0 a 100. Cada una ya tiene su próxima
          acción programada: no se te escapa ninguna.
        </p>
      </div>

      {/* ---------- KPIs ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard
          label="Leads totales"
          valor={TOTAL}
          detalle="Todos los canales · julio 2026"
        />
        <KpiCard
          label="Calientes"
          valor={CONTEO.caliente}
          detalle={`${pct(CONTEO.caliente)}% del total · listas para cerrar`}
          tono="hot"
        />
        <KpiCard
          label="Tibios"
          valor={CONTEO.tibio}
          detalle={`${pct(CONTEO.tibio)}% del total · la IA los sigue calificando`}
          tono="blue"
        />
        <KpiCard
          label="Fríos"
          valor={CONTEO.frio}
          detalle={`${pct(CONTEO.frio)}% del total · entran a reactivación`}
        />
      </div>

      {/* ---------- Filtros ---------- */}
      <SectionTitle
        right={
          <span className="text-[12px] text-muted">
            Mostrando <span className="mono font-semibold text-ink">{leads.length}</span> de{" "}
            <span className="mono">{TOTAL}</span>
          </span>
        }
      >
        Todos los leads
      </SectionTitle>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-3">
        {/* Buscador */}
        <div className="relative sm:w-[280px]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: MUTED }}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre…"
            aria-label="Buscar lead por nombre"
            className="input-field"
            style={{ paddingLeft: 32 }}
          />
        </div>

        {/* Botones por temperatura */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTROS.map((f) => {
            const activo = filtro === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFiltro(f.key)}
                aria-pressed={activo}
                className="btn"
                style={
                  activo
                    ? { background: ACTIVO, borderColor: BLUE, color: BLUE }
                    : { color: MUTED, borderColor: BORDE }
                }
              >
                {f.label}
                <span className="mono text-[11px]" style={{ opacity: 0.7 }}>
                  {contarFiltro(f.key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Tabla ---------- */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ minWidth: 150 }}>Lead</th>
                <th>Canal</th>
                <th style={{ minWidth: 230 }}>Qué busca</th>
                <th style={{ minWidth: 130 }}>Score</th>
                <th style={{ minWidth: 130 }}>Estado</th>
                <th style={{ minWidth: 260 }}>
                  <span className="inline-flex items-center gap-1" style={{ color: BLUE }}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3"
                      aria-hidden="true"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    Próxima acción automática
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l, i) => (
                <motion.tr
                  key={l.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.25) }}
                >
                  <td className="font-medium">{l.nombre}</td>
                  <td>
                    <CanalBadge canal={l.canal} />
                  </td>
                  <td className="text-muted text-[12.5px]">{l.busca}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="mono font-bold text-[14px]" style={{ color: tempColor(l.temp) }}>
                        {l.score}
                      </span>
                      <TempChip temp={l.temp} />
                    </div>
                  </td>
                  <td>
                    <EstadoChip estado={l.estado} />
                  </td>
                  <td>
                    <AccionAuto accion={l.proximaAccion} />
                  </td>
                </motion.tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="text-center py-12">
                      <p className="text-[13px] font-medium">No hay leads que coincidan</p>
                      <p className="text-[12px] text-muted mt-1">
                        Probá con otro nombre o sacá el filtro de temperatura.
                      </p>
                      {hayFiltroActivo && (
                        <button
                          type="button"
                          onClick={() => {
                            setBusqueda("");
                            setFiltro("todas");
                          }}
                          className="btn btn-primary mt-3"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Nota al pie ---------- */}
      <p className="text-[11.5px] text-muted mt-3 flex items-center gap-1.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3 shrink-0"
          style={{ color: BLUE }}
          aria-hidden="true"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        Las acciones en azul las ejecuta la IA sola, sin que toques nada. Vos solo entrás cuando el lead ya está
        caliente.
      </p>
    </PageWrap>
  );
}
