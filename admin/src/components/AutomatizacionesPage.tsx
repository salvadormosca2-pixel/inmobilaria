"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { AUTOMATIZACIONES, CALIENTES_MES, KPIS_MES } from "@/lib/mockData";
import type { Automatizacion } from "@/lib/mockData";
import { PageWrap, SectionTitle, KpiCard, Toggle, Toast } from "@/components/ui";

/* ---------- Datos derivados del mes (misma fuente que Métricas) ---------- */

/** 128 — consultas fuera de horario capturadas este mes. */
const FUGAS_EVITADAS = KPIS_MES.find((k) => k.label === "Fugas evitadas")?.valor ?? "128";

/* ---------- Íconos ---------- */

function IconRayo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />
    </svg>
  );
}

function IconReloj() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Métrica de impacto ----------
 * Los números van en .mono; el texto alrededor queda en la tipografía normal.
 * Ej: "Plantones -63%" · "Morosidad: 12% → 4%" · "La herramienta #1 para ganar exclusivas"
 */
function Metrica({ texto }: { texto: string }) {
  const partes = texto.split(/(-?\d+(?:[.,]\d+)?%?)/g);
  return (
    <>
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="mono">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/* ---------- Página ---------- */

export default function AutomatizacionesPage() {
  /* Estado real: arranca desde el campo `on` de cada automatización. */
  const [estado, setEstado] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(AUTOMATIZACIONES.map((a) => [a.id, a.on]))
  );
  const [toast, setToast] = useState<string | null>(null);

  const cerrarToast = useCallback(() => setToast(null), []);

  const alternar = (a: Automatizacion, valor: boolean) => {
    setEstado((prev) => ({ ...prev, [a.id]: valor }));
    setToast(`${a.nombre} ${valor ? "activada" : "pausada"}`);
  };

  /* KPIs derivados del estado actual — cambian cuando togglés. */
  const total = AUTOMATIZACIONES.length;
  const activas = AUTOMATIZACIONES.filter((a) => estado[a.id]).length;
  const pausadas = total - activas;

  return (
    <PageWrap>
      {/* ============ Intro ============ */}
      <div className="mb-5 max-w-[820px]">
        <h1 className="text-[20px] font-semibold leading-tight" style={{ color: "#0F1B2D" }}>
          Esto trabaja mientras dormís
        </h1>
        <p className="text-[12.5px] mt-1.5" style={{ color: "#64748B" }}>
          Cada una de estas automatizaciones corre sola: nadie aprieta un botón, nadie se acuerda de mandar el
          recordatorio, nadie se queda hasta las 3 de la mañana contestando Zonaprop. Prendé y apagá lo que quieras —
          al lado de cada una vas a ver lo que te está dando hoy.
        </p>
      </div>

      {/* ============ KPIs ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <KpiCard
          label="Automatizaciones activas"
          valor={`${activas} de ${total}`}
          detalle={pausadas === 0 ? "Está todo corriendo" : `${pausadas} en pausa — las estás dejando sobre la mesa`}
          tono="blue"
        />
        <KpiCard label="1ª respuesta" valor="28 seg" detalle="Antes: 3 h 42 min" tono="success" />
        <KpiCard label="Plantones" valor="-63%" detalle="Desde que el bot confirma las visitas" tono="ink" />
      </div>

      {/* ============ Grid de automatizaciones ============ */}
      <SectionTitle
        right={
          <span className="text-[12px]" style={{ color: "#64748B" }}>
            <span className="mono">{activas}</span> de <span className="mono">{total}</span> corriendo ahora
          </span>
        }
      >
        Automatizaciones
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {AUTOMATIZACIONES.map((a, i) => {
          const on = estado[a.id];

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              className="card p-4 h-full flex flex-col"
            >
              {/* La atenuación va acá adentro para no pelearse con la animación de entrada */}
              <div
                className="h-full flex flex-col transition-opacity duration-200"
                style={{ opacity: on ? 1 : 0.55 }}
              >
                {/* Header: nombre + toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-[13.5px] leading-snug" style={{ color: "#0F1B2D" }}>
                    {a.nombre}
                  </div>
                  <Toggle on={on} onChange={(v) => alternar(a, v)} />
                </div>

                {/* Descripción */}
                <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "#64748B" }}>
                  {a.desc}
                </p>

                {/* Métrica de impacto — siempre pegada abajo */}
                <div className="mt-auto pt-4">
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors duration-200"
                    style={{
                      background: on ? "#EEF4FF" : "#F1F5F9",
                      color: on ? "#2563EB" : "#94A3B8",
                    }}
                  >
                    <IconRayo />
                    <span className="text-[12.5px] font-semibold leading-tight">
                      <Metrica texto={a.metrica} />
                    </span>
                  </div>
                  {!on && (
                    <div className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "#94A3B8" }}>
                      En pausa — esto no está corriendo
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ============ Lo que significa en plata ============ */}
      <div className="card-hot p-5 flex flex-col sm:flex-row gap-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#FFF0ED", color: "#FF4D2E" }}
        >
          <IconReloj />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold" style={{ color: "#0F1B2D" }}>
            Lo que esto significa en tu facturación
          </div>
          <p className="text-[12.5px] mt-1.5 leading-relaxed max-w-[820px]" style={{ color: "#64748B" }}>
            Este mes se capturaron <span className="mono font-semibold" style={{ color: "#FF4D2E" }}>{FUGAS_EVITADAS}</span>{" "}
            consultas que entraron fuera de horario: de madrugada, un domingo, un feriado. Antes esas consultas se
            perdían enteras — nadie las contestaba, y cuando abrías la oficina el lead ya estaba hablando con la
            inmobiliaria de enfrente. De ahí salieron parte de las{" "}
            <span className="mono font-semibold" style={{ color: "#FF4D2E" }}>{CALIENTES_MES}</span> calientes que se te
            entregaron en julio.
          </p>
        </div>
      </div>

      <Toast msg={toast} onDone={cerrarToast} />
    </PageWrap>
  );
}
