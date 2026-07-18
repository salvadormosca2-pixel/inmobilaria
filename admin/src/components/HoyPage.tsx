"use client";

import { PageWrap, SectionTitle, KpiCard } from "@/components/ui";
import {
  KPIS_HOY,
  ALERTAS,
  AGENDA_HOY,
  FACTURACION_PROYECTADA,
  PIPELINE,
  comisionPipelineTotal,
  fmtARS,
  fmtUSD,
  type Alerta,
} from "@/lib/mockData";

const ALERTA_ICON: Record<Alerta["tipo"], string> = {
  contraoferta: "💰",
  contrato: "📄",
  precio: "📉",
  reclamo: "🔧",
};

const TIPO_STYLE: Record<string, { bg: string; fg: string }> = {
  visita: { bg: "#EEF4FF", fg: "#2563EB" },
  firma: { bg: "#E7F8F0", fg: "#0BA45C" },
  tasacion: { bg: "#FEF5E4", fg: "#F59E0B" },
  llamado: { bg: "#F1F5F9", fg: "#64748B" },
};

export default function HoyPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const comisionPipeline = comisionPipelineTotal(PIPELINE);
  const alertasAltas = ALERTAS.filter((a) => a.urgencia === "alta").length;

  return (
    <PageWrap>
      {/* KPIs del día */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {KPIS_HOY.map((k) => (
          <KpiCard key={k.label} label={k.label} valor={k.valor} detalle={k.detalle} tono={k.tono} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 mt-6">
        {/* Alertas — lo que necesita SU decisión */}
        <div>
          <SectionTitle
            right={
              <span className="chip" style={{ background: "#FFF0ED", color: "#FF4D2E" }}>
                <span className="mono">{alertasAltas}</span> urgentes
              </span>
            }
          >
            Necesita tu decisión
          </SectionTitle>
          <p className="text-[12px] text-muted -mt-1 mb-3">
            La IA resuelve sola todo lo demás. Esto no lo puede decidir por vos.
          </p>

          <div className="flex flex-col gap-3">
            {ALERTAS.map((a) => {
              const alta = a.urgencia === "alta";
              return (
                <div key={a.id} className={alta ? "card-hot p-4" : "card p-4"}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-[16px] shrink-0"
                      style={{ background: alta ? "#FFF0ED" : "#F7F9FC" }}
                    >
                      {ALERTA_ICON[a.tipo]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[13.5px] font-semibold leading-snug">{a.titulo}</h3>
                        <span
                          className="chip shrink-0"
                          style={
                            alta
                              ? { background: "#FFF0ED", color: "#FF4D2E" }
                              : { background: "#FEF5E4", color: "#F59E0B" }
                          }
                        >
                          {alta ? "Urgente" : "Media"}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-muted mt-1 leading-relaxed">{a.detalle}</p>
                      <button
                        className="btn mt-2.5"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                        onClick={() =>
                          onNavigate(
                            a.tipo === "contrato" || a.tipo === "reclamo"
                              ? "contratos"
                              : a.tipo === "precio"
                              ? "propietarios"
                              : "pipeline"
                          )
                        }
                      >
                        {a.cta}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-5">
          {/* Agenda del día */}
          <div>
            <SectionTitle
              right={
                <button
                  onClick={() => onNavigate("visitas")}
                  className="text-[12px] font-semibold"
                  style={{ color: "#2563EB" }}
                >
                  Ver todas
                </button>
              }
            >
              Tu agenda de hoy
            </SectionTitle>
            <div className="card p-1.5">
              {AGENDA_HOY.map((it, i) => {
                const st = TIPO_STYLE[it.tipo];
                return (
                  <div
                    key={i}
                    className="flex gap-3 p-2.5 rounded-lg"
                    style={{ borderBottom: i < AGENDA_HOY.length - 1 ? "1px solid #F1F5F9" : "none" }}
                  >
                    <div className="mono text-[12px] font-semibold shrink-0 w-[38px] pt-0.5" style={{ color: st.fg }}>
                      {it.hora}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium leading-snug">{it.titulo}</div>
                      <div className="text-[11px] text-muted mt-0.5 truncate">{it.detalle}</div>
                      <span
                        className="chip mt-1.5"
                        style={{ background: st.bg, color: st.fg, fontSize: 10 }}
                      >
                        {it.estado}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Facturación proyectada */}
          <div>
            <SectionTitle>Tu facturación de julio</SectionTitle>
            <div className="card p-4">
              <div className="pb-3" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                  Comisiones en pipeline
                </div>
                <div
                  className="mono font-bold leading-none mt-1.5"
                  style={{ fontSize: 26, color: "#0F1B2D" }}
                >
                  {fmtUSD(comisionPipeline)}
                </div>
                <div className="text-[11px] text-muted mt-1">
                  {PIPELINE.filter((c) => c.etapa !== "cerrado").length} operaciones abiertas
                </div>
              </div>

              <div className="py-3" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                  Administración de alquileres
                </div>
                <div className="mono font-semibold leading-none mt-1.5" style={{ fontSize: 18 }}>
                  {fmtARS(FACTURACION_PROYECTADA.adminAlquileres)}
                  <span className="text-[11px] text-muted font-normal"> /mes</span>
                </div>
                <div className="text-[11px] text-muted mt-1">Honorarios 8% sobre 6 contratos</div>
              </div>

              <div className="pt-3">
                <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                  Ya cerrado este mes
                </div>
                <div
                  className="mono font-semibold leading-none mt-1.5"
                  style={{ fontSize: 18, color: "#0BA45C" }}
                >
                  {fmtUSD(FACTURACION_PROYECTADA.cerradoMes)}
                </div>
                <div className="text-[11px] text-muted mt-1">6 cierres · 47 calientes entregadas</div>
              </div>

              <button
                onClick={() => onNavigate("metricas")}
                className="btn btn-primary w-full mt-4"
                style={{ fontSize: 12 }}
              >
                Ver métricas y facturación
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}
