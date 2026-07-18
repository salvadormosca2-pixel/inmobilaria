"use client";

import { useState } from "react";
import { PageWrap, SectionTitle, KpiCard, Bar, Modal } from "@/components/ui";
import {
  KPIS_MES,
  FUNNEL,
  CANALES,
  MOTIVOS_PERDIDA,
  REGISTRO_CALIENTES,
  CALIENTES_MES,
  CALIENTES_ACEPTADAS,
  CALIENTES_REVISION,
  TARIFA_CALIENTE,
  FACTURADO_MES,
  CONVERSACIONES,
  fmtARS,
  type RegistroCaliente,
} from "@/lib/mockData";

const CANAL_COLOR: Record<string, string> = {
  WhatsApp: "#0BA45C",
  Zonaprop: "#2563EB",
  Instagram: "#C13584",
  Facebook: "#1877F2",
  "Web propia": "#64748B",
};

export default function MetricasPage() {
  const [transcript, setTranscript] = useState<RegistroCaliente | null>(null);

  const maxFunnel = FUNNEL[0].valor;
  const totalCanales = CANALES.reduce((a, c) => a + c.valor, 0);

  /** Los transcripts reales que tenemos cargados, por nombre de lead. */
  const convDe = (lead: string) => CONVERSACIONES.find((c) => c.nombre === lead);

  return (
    <PageWrap>
      {/* ---------- Métricas ---------- */}
      <SectionTitle>Métricas de julio</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPIS_MES.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            valor={k.valor}
            detalle={k.detalle}
            tono={k.label.includes("Calientes") ? "hot" : k.label === "Cierres" ? "success" : "blue"}
          />
        ))}
      </div>

      {/* Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 mt-6">
        <div className="card p-4">
          <h3 className="text-[13px] font-semibold mb-0.5">De la consulta al cierre</h3>
          <p className="text-[11.5px] text-muted mb-4">
            Cada etapa sobre el total de consultas del mes.
          </p>
          <div className="flex flex-col gap-3">
            {FUNNEL.map((f) => {
              const pct = (f.valor / maxFunnel) * 100;
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: f.hot ? "#FF4D2E" : "#0F1B2D" }}
                    >
                      {f.label}
                    </span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="mono text-[13px] font-bold">{f.valor}</span>
                      <span className="mono text-[10px] text-muted">{Math.round(pct)}%</span>
                    </span>
                  </div>
                  <Bar pct={pct} color={f.hot ? "#FF4D2E" : "#2563EB"} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Canales */}
          <div className="card p-4">
            <h3 className="text-[13px] font-semibold mb-0.5">Consultas por canal</h3>
            <p className="text-[11.5px] text-muted mb-3">
              <span className="mono">{totalCanales}</span> consultas en total.
            </p>
            <div className="flex flex-col gap-2.5">
              {CANALES.map((c) => (
                <div key={c.canal}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px]">{c.canal}</span>
                    <span className="mono text-[11.5px] font-semibold">{c.valor}</span>
                  </div>
                  <Bar pct={(c.valor / totalCanales) * 100} color={CANAL_COLOR[c.canal]} />
                </div>
              ))}
            </div>
          </div>

          {/* Motivos de pérdida */}
          <div className="card p-4">
            <h3 className="text-[13px] font-semibold mb-0.5">Por qué se pierden</h3>
            <p className="text-[11.5px] text-muted mb-3">Sobre los leads que no avanzaron.</p>
            <div className="flex flex-col gap-2.5">
              {MOTIVOS_PERDIDA.map((m) => (
                <div key={m.motivo}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px]">{m.motivo}</span>
                    <span className="mono text-[11.5px] font-semibold">{m.pct}%</span>
                  </div>
                  <Bar pct={m.pct} color="#94A3B8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Facturación ---------- */}
      <div className="mt-8">
        <SectionTitle
          right={
            <span className="chip" style={{ background: "#FFF0ED", color: "#FF4D2E" }}>
              Lo que te factura ecosystem.ar
            </span>
          }
        >
          🔥 Calientes entregadas — facturación
        </SectionTitle>

        <div className="card-hot p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                Calientes del mes
              </div>
              <div className="mono font-bold leading-none mt-1.5" style={{ fontSize: 30, color: "#FF4D2E" }}>
                {CALIENTES_MES}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                Aceptadas / en revisión
              </div>
              <div className="mono font-bold leading-none mt-1.5" style={{ fontSize: 30 }}>
                <span style={{ color: "#0BA45C" }}>{CALIENTES_ACEPTADAS}</span>
                <span className="text-muted"> / </span>
                <span style={{ color: "#F59E0B" }}>{CALIENTES_REVISION}</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                Tarifa por caliente
              </div>
              <div className="mono font-bold leading-none mt-1.5" style={{ fontSize: 22 }}>
                {fmtARS(TARIFA_CALIENTE)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                Total facturado
              </div>
              <div className="mono font-bold leading-none mt-1.5" style={{ fontSize: 22, color: "#0BA45C" }}>
                {fmtARS(FACTURADO_MES)}
              </div>
              <div className="mono text-[10px] text-muted mt-1">
                {CALIENTES_ACEPTADAS} × {fmtARS(TARIFA_CALIENTE)}
              </div>
            </div>
          </div>

          {/* La regla */}
          <div className="card p-3 mt-4" style={{ background: "#F7F9FC" }}>
            <p className="text-[11.5px] text-muted leading-relaxed">
              <strong className="text-ink">Cómo se cuenta una caliente.</strong> Solo se factura si cumple los criterios
              pactados: presupuesto, zona y urgencia verificados, y visita pedida o agendada. Cada registro guarda el
              transcript completo de la conversación como evidencia, así no hay disputas sobre qué se entregó. Las que
              no llegan a los 4 criterios quedan <strong className="text-ink">en revisión</strong> y no se cobran hasta
              que las apruebes.
            </p>
          </div>
        </div>

        {/* Registro */}
        <div className="card overflow-hidden mt-4">
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid #E5EAF2" }}>
            <h3 className="text-[13px] font-semibold">Registro de entregas</h3>
            <span className="text-[11px] text-muted">
              Últimas <span className="mono">{REGISTRO_CALIENTES.length}</span> de{" "}
              <span className="mono">{CALIENTES_MES}</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Lead</th>
                  <th>Operación</th>
                  <th>Criterios</th>
                  <th>Evidencia</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {REGISTRO_CALIENTES.map((r) => {
                  const aceptada = r.estado === "aceptada";
                  const completo = r.criterios === "6/6";
                  return (
                    <tr key={r.id}>
                      <td className="mono text-[12px] text-muted whitespace-nowrap">{r.fecha}</td>
                      <td className="font-semibold whitespace-nowrap">{r.lead}</td>
                      <td className="text-muted whitespace-nowrap">{r.operacion}</td>
                      <td>
                        <span
                          className="chip mono"
                          style={{
                            background: completo ? "#E7F8F0" : "#FEF5E4",
                            color: completo ? "#0BA45C" : "#F59E0B",
                          }}
                        >
                          {r.criterios}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setTranscript(r)}
                          className="text-[12px] font-semibold whitespace-nowrap"
                          style={{ color: "#2563EB" }}
                        >
                          Ver transcript
                        </button>
                      </td>
                      <td>
                        <span
                          className="chip"
                          style={{
                            background: aceptada ? "#E7F8F0" : "#FEF5E4",
                            color: aceptada ? "#0BA45C" : "#F59E0B",
                          }}
                        >
                          {aceptada ? "✓ Aceptada" : "En revisión"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de transcript */}
      <Modal
        open={!!transcript}
        onClose={() => setTranscript(null)}
        title={`Transcript — ${transcript?.lead ?? ""}`}
        width={620}
      >
        {transcript && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="chip" style={{ background: "#F1F5F9", color: "#64748B" }}>
                <span className="mono">{transcript.fecha}</span>
              </span>
              <span className="chip" style={{ background: "#EEF4FF", color: "#2563EB" }}>
                {transcript.operacion}
              </span>
              <span
                className="chip mono"
                style={{
                  background: transcript.criterios === "6/6" ? "#E7F8F0" : "#FEF5E4",
                  color: transcript.criterios === "6/6" ? "#0BA45C" : "#F59E0B",
                }}
              >
                {transcript.criterios} criterios
              </span>
            </div>

            {(() => {
              const c = convDe(transcript.lead);
              if (!c) {
                return (
                  <div className="card p-4 text-center" style={{ background: "#F7F9FC" }}>
                    <p className="text-[12.5px] text-muted leading-relaxed">
                      El transcript completo de esta entrega está archivado. En el demo solo cargamos las
                      conversaciones de la bandeja: probá con Marina Quiroga o Sebastián Herrera para ver una
                      evidencia real.
                    </p>
                  </div>
                );
              }
              return (
                <div
                  className="flex flex-col gap-2 max-h-[380px] overflow-y-auto p-3 rounded-lg"
                  style={{ background: "#F7F9FC", border: "1px solid #E5EAF2" }}
                >
                  {c.mensajes.map((m, i) => {
                    const esLead = m.autor === "lead";
                    return (
                      <div key={i} className={`flex flex-col max-w-[85%] ${esLead ? "self-start" : "self-end items-end"}`}>
                        {!esLead && (
                          <span className="chip mb-1" style={{ background: "#EEF4FF", color: "#2563EB", fontSize: 9 }}>
                            🤖 IA
                          </span>
                        )}
                        <div
                          className="px-3 py-2 text-[12px] leading-relaxed"
                          style={{
                            background: esLead ? "#fff" : "#2563EB",
                            color: esLead ? "#0F1B2D" : "#fff",
                            border: esLead ? "1px solid #E5EAF2" : "none",
                            borderRadius: esLead ? "12px 12px 12px 3px" : "12px 12px 3px 12px",
                          }}
                        >
                          {m.texto}
                        </div>
                        <span className="mono text-[9.5px] text-muted mt-0.5">{m.hora}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <p className="text-[11px] text-muted mt-3 leading-relaxed">
              Esta conversación es la evidencia de la entrega. Queda guardada tal cual, sin editar, y es lo que se
              mira si alguna vez discutimos si una caliente se cobraba o no.
            </p>
          </>
        )}
      </Modal>
    </PageWrap>
  );
}
