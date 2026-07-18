"use client";

import { useState } from "react";
import { TempChip, Toast } from "@/components/ui";
import {
  PIPELINE,
  ETAPAS,
  comisionPipelineTotal,
  fmtUSD,
  type PipelineCard,
  type Etapa,
} from "@/lib/mockData";

export default function PipelinePage() {
  const [cards, setCards] = useState<PipelineCard[]>(PIPELINE);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Etapa | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const total = comisionPipelineTotal(cards);
  const porEtapa = (e: Etapa) => cards.filter((c) => c.etapa === e);
  const sumaEtapa = (e: Etapa) => porEtapa(e).reduce((a, c) => a + c.comision, 0);

  const soltar = (etapa: Etapa) => {
    setOverCol(null);
    if (!dragId) return;
    const card = cards.find((c) => c.id === dragId);
    setDragId(null);
    if (!card || card.etapa === etapa) return;

    setCards((cs) => cs.map((c) => (c.id === dragId ? { ...c, etapa } : c)));

    const label = ETAPAS.find((e) => e.key === etapa)!.label;
    if (etapa === "caliente") {
      setToast(`${card.nombre} pasó a Caliente entregada. Se registró para facturar.`);
    } else if (etapa === "cerrado") {
      setToast(`${card.nombre} cerró — ${fmtUSD(card.comision)} de comisión.`);
    } else {
      setToast(`${card.nombre} pasó a ${label}.`);
    }
  };

  return (
    <div className="view-fade p-5 lg:p-6">
      {/* Resumen */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">
            Comisión proyectada del pipeline
          </div>
          <div
            className="mono font-bold leading-none mt-1"
            style={{
              fontSize: 30,
              background: "linear-gradient(90deg,#2563EB,#00A3FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {fmtUSD(total)}
          </div>
          <div className="text-[11.5px] text-muted mt-1">
            <span className="mono">{cards.filter((c) => c.etapa !== "cerrado").length}</span> operaciones abiertas ·
            los cerrados no suman
          </div>
        </div>
        <div className="text-[11px] text-muted flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
            <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
          </svg>
          Arrastrá las tarjetas para mover de etapa
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-3">
        {ETAPAS.map((et) => {
          const items = porEtapa(et.key);
          const isOver = overCol === et.key;
          return (
            <div
              key={et.key}
              className={`kanban-col rounded-xl shrink-0 w-[254px] flex flex-col transition-colors ${isOver ? "drag-over" : ""}`}
              style={{
                background: isOver ? "#EEF4FF" : et.hot ? "#FFF8F6" : "#F7F9FC",
                border: `1px solid ${isOver ? "#2563EB" : et.hot ? "#FFD9D0" : "#E5EAF2"}`,
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(et.key);
              }}
              onDragLeave={() => setOverCol((c) => (c === et.key ? null : c))}
              onDrop={() => soltar(et.key)}
            >
              {/* Header de columna */}
              <div
                className="px-3 py-2.5 flex items-center justify-between gap-2"
                style={{ borderBottom: `1px solid ${et.hot ? "#FFD9D0" : "#E5EAF2"}` }}
              >
                <span
                  className="text-[12px] font-semibold truncate"
                  style={{ color: et.hot ? "#FF4D2E" : "#0F1B2D" }}
                >
                  {et.label}
                </span>
                <span
                  className="chip mono shrink-0"
                  style={{
                    background: et.hot ? "#FFF0ED" : "#EEF4FF",
                    color: et.hot ? "#FF4D2E" : "#2563EB",
                  }}
                >
                  {items.length}
                </span>
              </div>

              {/* Suma de la columna */}
              <div className="px-3 py-1.5 text-[10.5px] text-muted" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <span className="mono">{fmtUSD(sumaEtapa(et.key))}</span> en comisiones
              </div>

              {/* Tarjetas */}
              <div className="p-2 flex flex-col gap-2 min-h-[120px] flex-1">
                {items.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    className={`kanban-card card p-2.5 cursor-grab active:cursor-grabbing ${dragId === c.id ? "dragging" : ""}`}
                  >
                    <div className="text-[12.5px] font-semibold leading-snug">{c.nombre}</div>
                    <div className="text-[11px] text-muted leading-snug mt-0.5">{c.propiedad}</div>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <TempChip temp={c.temp} score={c.score} />
                      <span className="mono text-[12px] font-bold" style={{ color: "#0BA45C" }}>
                        {fmtUSD(c.comision)}
                      </span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-[11px] text-muted text-center px-2">
                    Soltá una tarjeta acá
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
