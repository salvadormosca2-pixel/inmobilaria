"use client";

import { useState } from "react";
import { PageWrap, SectionTitle, KpiCard, Bar, Toggle, AreaChip } from "@/components/ui";
import { AGENTES, fmtUSD, fmtDur, CHATWOOT_ACCOUNT_ID, pendientesDe } from "@/lib/mockData";
import type { Agente } from "@/lib/mockData";
import { clasificar, NIVEL_META, PESOS } from "@/lib/chatwoot";

/* ---------- Paleta ---------- */

const BLUE = "#2563EB";
const ACENTO = "#00A3FF";
const ACTIVO = "#EEF4FF";
const INK = "#0F1B2D";
const MUTED = "#64748B";
const BORDE = "#E5EAF2";
const BG2 = "#F7F9FC";
const HOT = "#FF4D2E";
const HOTBG = "#FFF0ED";
const WARM = "#F59E0B";
const SUCCESS = "#0BA45C";

/** A partir de acá el lead ya se enfrió esperando respuesta. */
const UMBRAL_RESPUESTA = 15;

/* ---------- Totales del equipo (todo derivado de AGENTES) ---------- */

const TOTAL_CALIENTES = AGENTES.reduce((a, g) => a + g.calientes, 0);
const TOTAL_VISITAS = AGENTES.reduce((a, g) => a + g.visitas, 0);
const TOTAL_CIERRES = AGENTES.reduce((a, g) => a + g.cierres, 0);
const TOTAL_COMISION = AGENTES.reduce((a, g) => a + g.comision, 0);

const pctVisitas = Math.round((TOTAL_VISITAS / TOTAL_CALIENTES) * 100);
const pctCierres = Math.round((TOTAL_CIERRES / TOTAL_CALIENTES) * 100);

/** Tasa caliente → cierre de cada agente. */
const conversion = (a: Agente) => Math.round((a.cierres / a.calientes) * 100);

/* ---------- Íconos ---------- */

function IconPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 shrink-0"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconAlerta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 shrink-0"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconFlecha() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 shrink-0"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconRayo({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

/* ---------- Piezas de la card ---------- */

function Avatar({ iniciales }: { iniciales: string }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: 44,
        height: 44,
        background: `linear-gradient(135deg, ${BLUE}, ${ACENTO})`,
      }}
      aria-hidden="true"
    >
      <span className="mono font-bold text-white text-[14px] tracking-wide">{iniciales}</span>
    </div>
  );
}

function Metrica({
  label,
  valor,
  color = INK,
  icono,
}: {
  label: string;
  valor: string;
  color?: string;
  icono?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wide font-semibold" style={{ color: MUTED }}>
        {label}
      </div>
      <div className="mono font-bold text-[17px] leading-none mt-1 flex items-center gap-1" style={{ color }}>
        {icono}
        {valor}
      </div>
    </div>
  );
}

function AgenteCard({ agente }: { agente: Agente }) {
  const minutos = parseInt(agente.tiempoRespuesta);
  const lento = minutos >= UMBRAL_RESPUESTA;
  const pct = conversion(agente);
  const sinCargar = pendientesDe(agente.id).length;

  return (
    <div className="card p-4 flex flex-col">
      {/* Identidad */}
      <div className="flex items-center gap-3">
        <Avatar iniciales={agente.avatar} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[14px] leading-tight truncate">{agente.nombre}</span>
            <AreaChip area={agente.area} mini />
          </div>
          <div className="text-[11.5px] mt-1 flex items-center gap-1" style={{ color: MUTED }}>
            <IconPin />
            <span className="truncate">{agente.zona}</span>
          </div>
        </div>
      </div>

      {/* Métricas del mes */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 mt-4 pt-4" style={{ borderTop: `1px solid ${BORDE}` }}>
        <Metrica label="Leads asignados" valor={String(agente.leads)} />
        <Metrica label="Calientes" valor={`🔥 ${agente.calientes}`} color={HOT} />
        <Metrica label="Visitas hechas" valor={String(agente.visitas)} />
        <Metrica label="Cierres" valor={String(agente.cierres)} />
        <Metrica label="Comisión generada" valor={fmtUSD(agente.comision)} color={SUCCESS} />
        <Metrica
          label="Responde en"
          valor={agente.tiempoRespuesta}
          color={lento ? WARM : SUCCESS}
          icono={lento ? <IconAlerta /> : undefined}
        />
      </div>

      {/* Conversión caliente → cierre */}
      <div className="mt-4 pt-3.5" style={{ borderTop: `1px solid ${BORDE}` }}>
        <div className="flex items-center gap-2.5">
          <Bar pct={pct} />
          <span className="mono font-bold text-[12px] shrink-0" style={{ color: INK }}>
            {pct}%
          </span>
        </div>
        <div className="text-[11px] mt-1.5" style={{ color: MUTED }}>
          <span className="mono font-semibold" style={{ color: INK }}>
            {pct}%
          </span>{" "}
          de sus calientes terminó en venta
        </div>
      </div>

      {/* Lo que no cargó. No se puede falsear por omisión: si no cargás, se ve. */}
      {sinCargar > 0 && (
        <div
          className="mt-3 rounded-lg px-2.5 py-2 text-[11.5px] flex items-center gap-1.5"
          style={{ background: sinCargar >= 3 ? HOTBG : "#FEF5E4", color: sinCargar >= 3 ? HOT : WARM }}
        >
          <IconAlerta />
          <span>
            <span className="mono font-semibold">{sinCargar}</span>{" "}
            {sinCargar === 1 ? "visita sin cargar" : "visitas sin cargar"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- Asignación automática ---------- */

function Ruteo({ activa }: { activa: boolean }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDE}` }}>
      {AGENTES.map((a, i) => (
        <div
          key={a.id}
          className="flex items-center gap-3 px-3.5 py-2.5"
          style={{
            borderTop: i === 0 ? undefined : `1px solid ${BORDE}`,
            background: i % 2 === 0 ? undefined : BG2,
            opacity: activa ? 1 : 0.5,
          }}
        >
          <span className="chip" style={{ background: ACTIVO, color: BLUE }}>
            {a.zona}
          </span>
          <span style={{ color: MUTED }}>
            <IconFlecha />
          </span>
          <span className="text-[12.5px] font-medium truncate">{a.nombre}</span>
          <span className="mono text-[11px] ml-auto shrink-0" style={{ color: MUTED }}>
            {a.calientes} este mes
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AgentesPage() {
  const [autoAsignacion, setAutoAsignacion] = useState(true);

  return (
    <PageWrap>
      {/* ---------- Encabezado ---------- */}
      <div className="mb-4">
        <h1 className="text-[20px] font-semibold">Equipo</h1>
        <p className="text-[13px] text-muted mt-0.5">
          Quién recibe las calientes y qué hace con ellas. La IA las reparte sola por zona y rubro: vos mirás quién
          convierte y quién se está quedando atrás.
        </p>
      </div>

      {/* ---------- KPIs del equipo ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard
          label="🔥 Calientes recibidas"
          valor={TOTAL_CALIENTES}
          detalle={`Repartidas entre ${AGENTES.length} agentes · julio 2026`}
          tono="hot"
        />
        <KpiCard
          label="Visitas hechas"
          valor={TOTAL_VISITAS}
          detalle={`${pctVisitas}% de las calientes llegó a visita`}
          tono="blue"
        />
        <KpiCard label="Cierres" valor={TOTAL_CIERRES} detalle={`${pctCierres}% de conversión caliente → cierre`} />
        <KpiCard
          label="Comisión del mes"
          valor={fmtUSD(TOTAL_COMISION)}
          detalle="julio 2026, al día 16"
          tono="success"
        />
      </div>

      {/* ---------- Agentes ---------- */}
      <SectionTitle
        right={
          <span className="text-[12px] text-muted">
            Rendimiento de <span className="mono font-semibold text-ink">julio 2026</span>
          </span>
        }
      >
        Agentes
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENTES.map((a) => (
          <AgenteCard key={a.id} agente={a} />
        ))}
      </div>

      {/* ---------- Actividad en Chatwoot ---------- */}
      <div className="mt-8">
        <SectionTitle
          right={
            <span className="chip" style={{ background: ACTIVO, color: BLUE }}>
              vía Chatwoot
            </span>
          }
        >
          Cómo trabajan por WhatsApp
        </SectionTitle>
        <p className="text-[12.5px] text-muted -mt-1 mb-3 max-w-[820px] leading-relaxed">
          Cada vendedor contesta desde su propia bandeja de Chatwoot. Estas son sus métricas de atención, medidas{" "}
          <strong className="text-ink">solo en horario laboral</strong> — si no, las consultas de la madrugada que
          contesta la IA les arruinarían el promedio. Acá <strong className="text-ink">resolver un chat es cerrar la
          conversación</strong>, no vender: son cosas distintas y no hay que confundirlas con los cierres de arriba.
        </p>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th>Chats</th>
                  <th>Chats resueltos</th>
                  <th>1ª respuesta</th>
                  <th>Respuesta prom.</th>
                  <th>Tiempo hasta resolver</th>
                  <th>Mensajes</th>
                  <th>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {AGENTES.map((a) => {
                  const c = a.chatwoot;
                  const lento = (c.avg_first_response_time ?? 0) >= UMBRAL_RESPUESTA * 60;
                  const pctResuelto = Math.round(
                    (c.resolved_conversations_count / c.conversations_count) * 100
                  );
                  // Contesta menos de lo que le escriben → se le están cayendo.
                  const ratio = c.messages_sent / c.messages_received;
                  const pocoResponde = ratio < 0.8;
                  const sube = c.trend_pct >= 0;

                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${BLUE}, ${ACENTO})` }}
                          >
                            <span className="mono text-white text-[9px] font-bold">{a.avatar}</span>
                          </div>
                          <div className="leading-tight">
                            <div className="font-semibold whitespace-nowrap">{a.nombre}</div>
                            <div className="text-[10.5px]" style={{ color: MUTED }}>
                              {a.area === "ventas" ? "Ventas" : "Alquileres"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="mono">{c.conversations_count}</td>
                      <td>
                        <span className="mono">{c.resolved_conversations_count}</span>
                        <span className="mono text-[10.5px] ml-1" style={{ color: MUTED }}>
                          {pctResuelto}%
                        </span>
                      </td>
                      <td>
                        <span
                          className="chip mono"
                          style={
                            lento
                              ? { background: "#FEF5E4", color: WARM }
                              : { background: "#E7F8F0", color: SUCCESS }
                          }
                        >
                          {lento && <IconAlerta />}
                          {fmtDur(c.avg_first_response_time)}
                        </span>
                      </td>
                      <td className="mono" style={{ color: MUTED }}>
                        {fmtDur(c.avg_reply_time)}
                      </td>
                      <td className="mono" style={{ color: MUTED }}>
                        {fmtDur(c.avg_resolution_time)}
                      </td>
                      <td>
                        <span className="mono whitespace-nowrap" style={{ color: pocoResponde ? HOT : INK }}>
                          ↑{c.messages_sent} ↓{c.messages_received}
                        </span>
                        {pocoResponde && (
                          <div className="text-[10px]" style={{ color: HOT }}>
                            contesta {Math.round(ratio * 100)}% de lo que recibe
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className="chip mono"
                          style={
                            sube
                              ? { background: "#E7F8F0", color: SUCCESS }
                              : { background: HOTBG, color: HOT }
                          }
                        >
                          {sube ? "↑" : "↓"} {Math.abs(c.trend_pct)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- La clasificación ---------- */}
        <div className="mt-6">
          <SectionTitle
            right={
              <span className="text-[11.5px] text-muted">
                Velocidad {PESOS.velocidad * 100}% · Constancia {PESOS.constancia * 100}% · Resolución{" "}
                {PESOS.resolucion * 100}% · Tendencia {PESOS.tendencia * 100}%
              </span>
            }
          >
            Clasificación de cada empleado
          </SectionTitle>
          <p className="text-[12.5px] text-muted -mt-1 mb-3 max-w-[820px] leading-relaxed">
            Sale sola de los datos de Chatwoot. La velocidad pesa el doble que el resto a propósito: el lead escribe
            a tres inmobiliarias a la vez y se queda con la que contesta primero, así que un vendedor prolijo pero
            lento pierde igual. <strong className="text-ink">No compara Ventas contra Alquileres</strong>: mide cómo
            atiende cada uno, no cuánta plata genera.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AGENTES.map((a) => {
              const cl = clasificar(a.chatwoot);
              const meta = NIVEL_META[cl.nivel];
              return (
                <div key={a.id} className="card p-4 flex flex-col" style={{ borderColor: meta.bg }}>
                  {/* Cabecera con el veredicto */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${BLUE}, ${ACENTO})` }}
                      >
                        <span className="mono text-white text-[11px] font-bold">{a.avatar}</span>
                      </div>
                      <div className="min-w-0 leading-tight">
                        <div className="font-semibold text-[13px] truncate">{a.nombre}</div>
                        <div className="text-[10.5px]" style={{ color: MUTED }}>
                          {a.area === "ventas" ? "Ventas" : "Alquileres"}
                        </div>
                      </div>
                    </div>
                    <div
                      className="mono font-bold text-[22px] leading-none shrink-0"
                      style={{ color: meta.fg }}
                    >
                      {cl.nivel === "sindatos" ? "—" : cl.score}
                    </div>
                  </div>

                  <div
                    className="chip mt-2.5 self-start"
                    style={{ background: meta.bg, color: meta.fg, fontSize: 11 }}
                  >
                    {meta.icon} {meta.label}
                  </div>

                  {/* Los cuatro ejes */}
                  <div className="flex flex-col gap-2 mt-3.5 pt-3.5" style={{ borderTop: `1px solid ${BORDE}` }}>
                    {cl.ejes.map((e) => (
                      <div key={e.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11.5px] font-medium">{e.label}</span>
                          <span className="mono text-[11px]" style={{ color: MUTED }}>
                            {e.puntaje}
                          </span>
                        </div>
                        <Bar
                          pct={e.puntaje}
                          color={e.puntaje >= 85 ? SUCCESS : e.puntaje >= 60 ? BLUE : e.puntaje >= 40 ? WARM : HOT}
                        />
                        <div className="text-[10px] mt-0.5" style={{ color: MUTED }}>
                          {e.detalle}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Qué hay que ir a corregir */}
                  <div className="mt-3.5 pt-3 flex-1" style={{ borderTop: `1px solid ${BORDE}` }}>
                    {cl.nivel === "sindatos" ? (
                      <div className="text-[11.5px]" style={{ color: MUTED }}>
                        Todavía no atendió ninguna conversación en el período. No se lo puntúa hasta que haya algo
                        que medir.
                      </div>
                    ) : cl.senales.length === 0 ? (
                      <div className="text-[11.5px] flex items-center gap-1.5" style={{ color: SUCCESS }}>
                        ✓ Sin nada que corregir
                      </div>
                    ) : (
                      <>
                        <div
                          className="text-[10.5px] uppercase tracking-wide font-semibold mb-1.5"
                          style={{ color: MUTED }}
                        >
                          Para hablar con él
                        </div>
                        <ul className="flex flex-col gap-1">
                          {cl.senales.map((s) => (
                            <li key={s} className="text-[11.5px] flex items-start gap-1.5" style={{ color: HOT }}>
                              <span className="mt-[3px] shrink-0">
                                <IconAlerta />
                              </span>
                              <span style={{ color: INK }}>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* La advertencia que evita la conclusión equivocada */}
          <div className="card-hot p-4 mt-4">
            <h3 className="text-[13px] font-semibold flex items-center gap-1.5">
              <span style={{ color: HOT }}>
                <IconAlerta />
              </span>
              Antes de sacar conclusiones
            </h3>
            <p className="text-[12.5px] text-muted mt-1.5 leading-relaxed max-w-[880px]">
              <strong className="text-ink">Rocío</strong> genera <span className="mono font-semibold">USD 700</span>{" "}
              contra los <span className="mono font-semibold">USD 9.240</span> de Lucas, pero eso{" "}
              <strong className="text-ink">no la hace peor empleada</strong>: es Alquileres, donde un cierre deja un
              mes de comisión y no el 4% de una venta. Por eso la clasificación mide atención y no facturación. Para
              comparar plata, compará dentro de la misma área.
            </p>
          </div>
        </div>

        {/* De dónde salen los números */}
        <details className="mt-3">
          <summary className="text-[11.5px] cursor-pointer" style={{ color: MUTED }}>
            De dónde salen estos números
          </summary>
          <div className="card p-3 mt-2" style={{ background: BG2 }}>
            <p className="text-[11.5px] leading-relaxed" style={{ color: MUTED }}>
              Del reporte por agente de Chatwoot:
            </p>
            <code className="mono text-[10.5px] block mt-1.5 break-all" style={{ color: INK }}>
              GET /api/v2/accounts/{CHATWOOT_ACCOUNT_ID}/summary_reports/agent?since=…&until=…&business_hours=true
            </code>
            <p className="text-[11.5px] leading-relaxed mt-2" style={{ color: MUTED }}>
              Devuelve por agente: <span className="mono">conversations_count</span>,{" "}
              <span className="mono">resolved_conversations_count</span>,{" "}
              <span className="mono">avg_first_response_time</span>, <span className="mono">avg_reply_time</span> y{" "}
              <span className="mono">avg_resolution_time</span> (todos en segundos). Los mensajes enviados/recibidos
              y la tendencia salen del panel de reportes.
            </p>
            <p className="text-[11.5px] leading-relaxed mt-2" style={{ color: WARM }}>
              <strong>Demo:</strong> los valores de acá son inventados pero coherentes. No hay instancia de Chatwoot
              conectada — los nombres de campo son los reales para que enchufarla sea sólo cambiar la fuente.
            </p>
          </div>
        </details>
      </div>

      {/* ---------- Asignación automática ---------- */}
      <div className="mt-8" />
      <SectionTitle>Cómo se reparten las calientes</SectionTitle>

      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 max-w-[560px]">
            <h3 className="text-[14px] font-semibold flex items-center gap-1.5">
              <span style={{ color: BLUE }}>
                <IconRayo />
              </span>
              Asignación automática de calientes
            </h3>
            <p className="text-[12.5px] text-muted mt-1.5 leading-relaxed">
              Cuando un lead llega a caliente, la IA lo asigna sola: mira la zona y el rubro de la consulta, busca al
              agente que cubre esa zona y se la entrega por round robin, para que el reparto quede parejo. Nadie tiene
              que estar repartiendo leads a mano ni decidiendo a quién le toca.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[12.5px] font-medium" style={{ color: autoAsignacion ? INK : MUTED }}>
              Asignación automática activada
            </span>
            <Toggle on={autoAsignacion} onChange={setAutoAsignacion} />
          </div>
        </div>

        {/* Mapeo zona → agente */}
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-wide font-semibold mb-2" style={{ color: MUTED }}>
            Zona → agente
          </div>
          <Ruteo activa={autoAsignacion} />
        </div>

        {/* Estado */}
        <div
          className="mt-4 rounded-lg px-3.5 py-2.5 text-[12px] flex items-start gap-2"
          style={
            autoAsignacion
              ? { background: ACTIVO, color: BLUE }
              : { background: HOTBG, color: HOT }
          }
        >
          {autoAsignacion ? (
            <>
              <IconRayo className="w-3.5 h-3.5 mt-[1px]" />
              <span>
                Activa. Las <span className="mono font-semibold">{TOTAL_CALIENTES}</span> calientes de julio se
                asignaron solas, en promedio <span className="mono font-semibold">28 seg</span> después de que el lead
                llegó al score.
              </span>
            </>
          ) : (
            <>
              <IconAlerta />
              <span>
                Apagada. Las calientes nuevas quedan en la bandeja sin dueño hasta que alguien las reparta a mano, y
                cada minuto que pasa el lead se enfría.
              </span>
            </>
          )}
        </div>
      </div>

      {/* ---------- Nota al pie ---------- */}
      <p className="text-[11.5px] text-muted mt-3 flex items-start gap-1.5">
        <span style={{ color: WARM }}>
          <IconAlerta />
        </span>
        Un agente que tarda más de <span className="mono font-semibold">{UMBRAL_RESPUESTA} min</span> en tomar la
        conversación aparece marcado en naranja: para cuando contesta, el lead ya escribió a otra inmobiliaria.
      </p>
    </PageWrap>
  );
}
