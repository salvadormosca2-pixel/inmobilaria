"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TempChip, CanalBadge, ScoreRing, Modal, Toast, AreaChip, Asignado } from "@/components/ui";
import ConversacionesGate from "@/components/ConversacionesGate";
import PanelEmpleado from "@/components/PanelEmpleado";
import {
  CONVERSACIONES,
  AUTOM_LEAD,
  RESPUESTAS_RAPIDAS,
  TARIFA_CALIENTE,
  AREA_LABEL,
  fmtARS,
  type Mensaje,
  type Area,
  type Usuario,
} from "@/lib/mockData";

/** Estado inicial de los toggles por lead: todos prendidos salvo los ya cumplidos. */
const initAutom = () => {
  const m: Record<string, Record<string, boolean>> = {};
  CONVERSACIONES.forEach((c) => {
    m[c.id] = {
      seg: true,
      sim: c.temp !== "caliente",
      vis: c.criterios.some((k) => k.label === "Visita" && k.ok),
      doc: c.temp === "caliente",
    };
  });
  return m;
};

export default function ConversacionesPage() {
  /**
   * Puerta de demo. No es seguridad: ver el aviso en ConversacionesGate.tsx.
   * El empleado cae en su Chatwoot; el dueño entra a la bandeja unificada.
   */
  const [sesion, setSesion] = useState<Usuario | null>(null);

  const [filtroArea, setFiltroArea] = useState<Area | "todas">("todas");
  const [activeId, setActiveId] = useState(CONVERSACIONES[0].id);
  const [hist, setHist] = useState<Record<string, Mensaje[]>>(() =>
    Object.fromEntries(CONVERSACIONES.map((c) => [c.id, c.mensajes]))
  );
  const [takeover, setTakeover] = useState<Record<string, boolean>>({});
  const [autom, setAutom] = useState<Record<string, Record<string, boolean>>>(initAutom);
  const [input, setInput] = useState("");
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [entregadas, setEntregadas] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CONVERSACIONES.filter((c) => c.entregada).map((c) => [c.id, true]))
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const conv = CONVERSACIONES.find((c) => c.id === activeId)!;
  const mensajes = hist[activeId] ?? [];
  const humano = !!takeover[activeId];
  const cumplidos = conv.criterios.filter((k) => k.ok).length;

  const visibles = CONVERSACIONES.filter((c) => filtroArea === "todas" || c.area === filtroArea);
  const cuenta = (a: Area | "todas") =>
    a === "todas" ? CONVERSACIONES.length : CONVERSACIONES.filter((c) => c.area === a).length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes.length, activeId]);

  // Los early returns van acá abajo: después de TODOS los hooks, nunca antes.
  if (!sesion) return <ConversacionesGate onEntrar={setSesion} />;
  if (sesion.tipo === "agente")
    return <PanelEmpleado u={sesion} onSalir={() => setSesion(null)} />;

  const enviar = () => {
    const texto = input.trim();
    if (!texto) return;
    const ahora = new Date();
    const hora = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
    setHist((h) => ({
      ...h,
      [activeId]: [...(h[activeId] ?? []), { autor: humano ? "humano" : "ia", texto, hora }],
    }));
    setInput("");
  };

  const entregar = () => {
    setEntregadas((e) => ({ ...e, [activeId]: true }));
    setModal(false);
    setToast(`Caliente entregada — ${conv.nombre}. Se guardó el transcript como evidencia.`);
  };

  return (
    <div className="view-fade">
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] xl:grid-cols-[270px_1fr_310px] lg:h-[calc(100vh-57px)]">
        {/* ---------- Columna 1: lista ---------- */}
        <div className="border-r border-border bg-white flex flex-col lg:overflow-hidden">
          {/* Sesión activa */}
          <div
            className="px-3 py-2 border-b border-border flex items-center gap-2"
            style={{ background: "#F7F9FC" }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-semibold shrink-0"
              style={{ background: "#0F1B2D" }}
            >
              {sesion.avatar}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[11.5px] font-semibold truncate">{sesion.nombre}</div>
              <div className="text-[10px] text-muted truncate">Bandeja unificada · ve todas las áreas</div>
            </div>
            <button
              onClick={() => setSesion(null)}
              className="text-[11px] font-semibold shrink-0"
              style={{ color: "#64748B" }}
            >
              Salir
            </button>
          </div>

          <div className="px-3 py-2.5 border-b border-border">
            <input className="input-field" placeholder="Buscar conversación…" style={{ fontSize: 12 }} />

            {/* Filtro por área de negocio */}
            <div className="flex gap-1 mt-2">
              {(["todas", "ventas", "alquileres"] as const).map((a) => {
                const on = filtroArea === a;
                const label = a === "todas" ? "Todas" : AREA_LABEL[a];
                const fg = a === "alquileres" ? "#7C3AED" : "#2563EB";
                const bg = a === "alquileres" ? "#F3EEFF" : "#EEF4FF";
                return (
                  <button
                    key={a}
                    onClick={() => setFiltroArea(a)}
                    className="flex-1 rounded-md py-1 text-[11px] font-semibold transition-colors"
                    style={{
                      background: on ? (a === "todas" ? "#0F1B2D" : bg) : "#F7F9FC",
                      color: on ? (a === "todas" ? "#fff" : fg) : "#64748B",
                      border: `1px solid ${on && a !== "todas" ? fg : "transparent"}`,
                    }}
                  >
                    {label} <span className="mono">{cuenta(a)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {visibles.length === 0 && (
              <div className="p-4 text-[12px] text-muted text-center">
                No hay conversaciones en esta área.
              </div>
            )}
            {visibles.map((c) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className="relative w-full text-left px-3 py-2.5 transition-colors"
                  style={{
                    background: active ? "#EEF4FF" : "transparent",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "#FAFBFD";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {active && <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: "#2563EB" }} />}
                  <div className="flex items-center gap-1.5 mb-1">
                    <CanalBadge canal={c.canal} />
                    <span className="text-[12.5px] font-semibold truncate flex-1">{c.nombre}</span>
                    <span className="mono text-[10px] text-muted shrink-0">{c.hora}</span>
                  </div>
                  <p className="text-[11.5px] text-muted truncate mb-1.5">{c.preview}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <AreaChip area={c.area} mini />
                    <TempChip temp={c.temp} score={c.score} />
                    {c.asignadoA && (
                      <span
                        className="chip"
                        style={{ background: "#F7F9FC", color: "#64748B", fontSize: 9, border: "1px solid #E5EAF2" }}
                        title={`Asignada a ${c.asignadoA.nombre}`}
                      >
                        {c.asignadoA.avatar}
                      </span>
                    )}
                    {c.fugaEvitada && (
                      <span className="chip" style={{ background: "#E7F8F0", color: "#0BA45C", fontSize: 9 }}>
                        FUGA EVITADA
                      </span>
                    )}
                    {c.captacion && (
                      <span className="chip" style={{ background: "#EEF4FF", color: "#2563EB", fontSize: 9 }}>
                        CAPTACIÓN
                      </span>
                    )}
                    {c.noLeidos > 0 && (
                      <span
                        className="chip mono ml-auto"
                        style={{ background: "#2563EB", color: "#fff", fontSize: 9, padding: "1px 5px" }}
                      >
                        {c.noLeidos}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Columna 2: chat ---------- */}
        <div className="flex flex-col bg-bg2 lg:overflow-hidden min-w-0">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-border bg-white flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold truncate">{conv.nombre}</h2>
                <AreaChip area={conv.area} />
                {conv.fugaEvitada && (
                  <span className="chip" style={{ background: "#E7F8F0", color: "#0BA45C", fontSize: 9 }}>
                    FUGA EVITADA · 03:12 AM
                  </span>
                )}
              </div>
              <div className="mono text-[11px] text-muted truncate">{conv.handle}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="btn"
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  background: humano ? "#EEF4FF" : "#fff",
                  borderColor: humano ? "#2563EB" : "#E5EAF2",
                  color: humano ? "#2563EB" : "#0F1B2D",
                }}
                onClick={() => {
                  setTakeover((t) => ({ ...t, [activeId]: !t[activeId] }));
                  setToast(
                    humano
                      ? `La IA retomó la conversación con ${conv.nombre}.`
                      : `Tomaste la conversación con ${conv.nombre}. La IA quedó en pausa.`
                  );
                }}
              >
                {humano ? "👤 La tenés vos" : "Tomar conversación"}
              </button>
              {!entregadas[activeId] ? (
                <button className="btn btn-hot" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setModal(true)}>
                  🔥 Entregar caliente
                </button>
              ) : (
                <span className="chip" style={{ background: "#FFF0ED", color: "#FF4D2E", padding: "5px 10px" }}>
                  🔥 Entregada
                </span>
              )}
            </div>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 min-h-[340px] lg:min-h-0">
            {mensajes.map((m, i) => {
              const esLead = m.autor === "lead";
              return (
                <motion.div
                  key={i}
                  initial={i >= conv.mensajes.length ? { opacity: 0, y: 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={`flex flex-col max-w-[78%] ${esLead ? "self-start" : "self-end items-end"}`}
                >
                  {!esLead && (
                    <span
                      className="chip mb-1"
                      style={{
                        background: m.autor === "ia" ? "#EEF4FF" : "#F1F5F9",
                        color: m.autor === "ia" ? "#2563EB" : "#64748B",
                        fontSize: 9,
                      }}
                    >
                      {m.autor === "ia" ? "🤖 IA" : "👤 Vos"}
                    </span>
                  )}
                  <div
                    className="px-3 py-2 text-[12.5px] leading-relaxed"
                    style={{
                      background: esLead ? "#fff" : m.autor === "ia" ? "#2563EB" : "#0F1B2D",
                      color: esLead ? "#0F1B2D" : "#fff",
                      border: esLead ? "1px solid #E5EAF2" : "none",
                      borderRadius: esLead ? "12px 12px 12px 3px" : "12px 12px 3px 12px",
                    }}
                  >
                    {m.texto}
                  </div>
                  <span className="mono text-[9.5px] text-muted mt-0.5">{m.hora}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-white p-3">
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {RESPUESTAS_RAPIDAS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setInput(r.texto)}
                  className="chip"
                  style={{ background: "#F7F9FC", color: "#64748B", border: "1px solid #E5EAF2", cursor: "pointer" }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input-field"
                placeholder={humano ? "Escribí como vendedor…" : "Escribí — sale con el tag de la IA…"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
              />
              <button className="btn btn-primary" onClick={enviar} disabled={!input.trim()}>
                Enviar
              </button>
            </div>
            <div className="text-[10px] text-muted mt-1.5">
              {humano
                ? "Tenés vos la conversación: lo que mandes sale como 👤 Vos."
                : "La IA está respondiendo: lo que mandes sale como 🤖 IA."}
            </div>
          </div>
        </div>

        {/* ---------- Columna 3: ficha del lead ---------- */}
        <div className="border-l border-border bg-white lg:overflow-y-auto xl:block hidden">
          <div className="p-4 flex flex-col items-center border-b border-border">
            <ScoreRing score={conv.score} />
            <div className="mt-2">
              <TempChip temp={conv.temp} />
            </div>
            <div className="mono text-[10px] text-muted mt-1.5">
              {cumplidos}/6 criterios cumplidos
            </div>
          </div>

          {/* Área y asignación */}
          <div className="p-4 border-b border-border">
            <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-2.5">
              Área y asignación
            </div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[12px] text-muted">Área</span>
              <AreaChip area={conv.area} />
            </div>
            <Asignado a={conv.asignadoA} size={30} />
            {!conv.asignadoA && (
              <p className="text-[10.5px] text-muted mt-2 leading-relaxed">
                Se asigna sola a un agente de {AREA_LABEL[conv.area]} cuando llegue a caliente.
              </p>
            )}
          </div>

          {/* Criterios */}
          <div className="p-4 border-b border-border">
            <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-2.5">
              Criterios de calificación
            </div>
            <div className="flex flex-col gap-2">
              {conv.criterios.map((k) => (
                <div key={k.label} className="flex items-start gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 mt-0.5"
                    style={{
                      background: k.ok ? "#E7F8F0" : "#F1F5F9",
                      color: k.ok ? "#0BA45C" : "#94A3B8",
                    }}
                  >
                    {k.ok ? "✓" : "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium leading-tight">{k.label}</div>
                    <div className="text-[11px] text-muted leading-tight">{k.valor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Propiedad de interés */}
          <div className="p-4 border-b border-border">
            <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-2">
              Propiedad de interés
            </div>
            <div className="text-[12.5px] font-semibold leading-snug">{conv.propiedadInteres}</div>
            <div className="mono text-[13px] mt-0.5">{conv.precioInteres}</div>
            <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: "1px solid #F1F5F9" }}>
              <span className="text-[11px] text-muted">Comisión estimada</span>
              <span className="mono text-[13px] font-bold" style={{ color: "#0BA45C" }}>
                {conv.comisionEstimada}
              </span>
            </div>
          </div>

          {/* Automatizaciones por lead */}
          <div className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-2.5">
              Automatizaciones de este lead
            </div>
            <div className="flex flex-col gap-2.5">
              {AUTOM_LEAD.map((a) => {
                const on = autom[activeId]?.[a.id] ?? false;
                return (
                  <div key={a.id} className="flex items-center gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium leading-tight" style={{ opacity: on ? 1 : 0.5 }}>
                        {a.label}
                      </div>
                      <div className="text-[10.5px] text-muted leading-tight">{a.desc}</div>
                    </div>
                    <button
                      type="button"
                      className="toggle"
                      data-on={on}
                      aria-pressed={on}
                      onClick={() =>
                        setAutom((s) => ({
                          ...s,
                          [activeId]: { ...s[activeId], [a.id]: !on },
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de entrega */}
      <Modal open={modal} onClose={() => setModal(false)} title="Entregar como caliente">
        <p className="text-[13px] text-muted leading-relaxed">
          Vas a registrar a <strong className="text-ink">{conv.nombre}</strong> como caliente entregada. Se factura a{" "}
          <span className="mono">{fmtARS(TARIFA_CALIENTE)}</span> y queda guardado el transcript completo como evidencia.
        </p>

        <div className="card p-3 mt-3" style={{ background: "#F7F9FC" }}>
          <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-2">
            Qué se registra
          </div>
          <div className="flex flex-col gap-1.5">
            {conv.criterios.map((k) => (
              <div key={k.label} className="flex items-center gap-2 text-[12px]">
                <span style={{ color: k.ok ? "#0BA45C" : "#94A3B8" }}>{k.ok ? "✓" : "—"}</span>
                <span className="flex-1" style={{ opacity: k.ok ? 1 : 0.55 }}>
                  {k.label}
                </span>
                <span className="text-muted text-[11px] truncate max-w-[150px]">{k.valor}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: "1px solid #E5EAF2" }}>
            <span className="text-[12px] font-semibold">Criterios cumplidos</span>
            <span className="mono text-[13px] font-bold" style={{ color: cumplidos >= 4 ? "#0BA45C" : "#F59E0B" }}>
              {cumplidos}/6
            </span>
          </div>
        </div>

        {cumplidos < 4 && (
          <div className="card p-2.5 mt-3" style={{ background: "#FEF5E4", borderColor: "#F9DFA8" }}>
            <p className="text-[11.5px]" style={{ color: "#B45309" }}>
              Este lead cumple menos de 4 criterios. Se puede entregar igual, pero va a quedar{" "}
              <strong>en revisión</strong> hasta que lo apruebe la agencia.
            </p>
          </div>
        )}

        <p className="text-[11px] text-muted mt-3 leading-relaxed">
          Solo cuenta como caliente si cumple los criterios pactados: presupuesto, zona y urgencia verificados, y visita
          pedida o agendada. Cada registro guarda el transcript completo para evitar disputas.
        </p>

        <div className="flex gap-2 mt-4">
          <button className="btn flex-1" onClick={() => setModal(false)}>
            Cancelar
          </button>
          <button className="btn btn-hot flex-1" onClick={entregar}>
            🔥 Confirmar entrega
          </button>
        </div>
      </Modal>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
