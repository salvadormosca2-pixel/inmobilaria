"use client";

/**
 * Panel del vendedor. Es SU herramienta, no un formulario para el jefe: su
 * cartera, su agenda, sus notas y su comisión. Carga porque le sirve.
 *
 * Dos tipos de dato conviven acá y no se mezclan:
 *   MEDIDO    → Chatwoot. No lo puede tocar. Alimenta su clasificación.
 *   DECLARADO → lo carga él. Alimenta el funnel y su comisión, NUNCA el score.
 *
 * El botón a Chatwoot no redirige en la demo: no hay instancia. En producción
 * el link sale de /platform/api/v1/users/{id}/login (SSO, un solo uso).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChip, TempChip, Toast } from "@/components/ui";
import {
  AGENTES,
  CHATWOOT_BASE,
  CHATWOOT_ACCOUNT_ID,
  MOTIVOS_CHIP,
  carteraDe,
  fmtDur,
  fmtUSD,
  type Usuario,
  type ClienteCartera,
  type NotaVendedor,
} from "@/lib/mockData";

type Resultado = "vino" | "planton" | "cerro";

export default function PanelEmpleado({ u, onSalir }: { u: Usuario; onSalir: () => void }) {
  const agente = AGENTES.find((a) => a.id === u.agenteId);
  const [cartera, setCartera] = useState<ClienteCartera[]>(() => carteraDe(u.agenteId ?? ""));
  const [extra, setExtra] = useState(0); // comisión sumada al cargar cierres
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [cargando, setCargando] = useState<string | null>(null); // id con el form de resultado abierto
  const [toast, setToast] = useState<string | null>(null);

  if (!agente) return null;
  const cw = agente.chatwoot;
  const pendientes = cartera.filter((c) => c.pendiente);
  const ssoUrl = `${CHATWOOT_BASE}/app/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`;

  const resolver = (c: ClienteCartera, r: Resultado, motivo?: string) => {
    let msg = "";
    let suma = 0;
    if (r === "cerro") {
      // Comisión estimada: 4% de venta, o un mes si es alquiler.
      suma = c.area === "ventas" ? 3000 : 350;
      msg = `Cierre cargado — ${c.nombre}. Se sumaron ${fmtUSD(suma)} a tu comisión.`;
    } else if (r === "planton") {
      msg = `Anotado: ${c.nombre.split(" ")[0]} no se presentó.`;
    } else {
      msg = motivo
        ? `Cargado — ${c.nombre}: ${motivo.toLowerCase()}.`
        : `Visita cargada — ${c.nombre} sigue interesado.`;
    }
    setExtra((e) => e + suma);
    setCartera((cs) =>
      cs.map((x) =>
        x.id === c.id
          ? {
              ...x,
              pendiente: null,
              estado: r === "cerro" ? "Cerrado" : r === "planton" ? "Plantón — reprogramar" : x.estado,
            }
          : x
      )
    );
    setCargando(null);
    setToast(msg);
  };

  const agregarNota = (c: ClienteCartera) => {
    const t = nota.trim();
    if (!t) return;
    const ahora = new Date();
    const f = `${String(ahora.getDate()).padStart(2, "0")}/${String(ahora.getMonth() + 1).padStart(2, "0")} · ${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
    const nueva: NotaVendedor = { fecha: f, texto: t };
    setCartera((cs) => cs.map((x) => (x.id === c.id ? { ...x, notas: [...x.notas, nueva] } : x)));
    setNota("");
    setToast("Nota guardada.");
  };

  return (
    <div className="view-fade p-5 lg:p-6 max-w-[1100px] mx-auto">
      {/* ---------- Cabecera ---------- */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[15px] font-semibold shrink-0"
          style={{ background: "linear-gradient(135deg,#2563EB,#00A3FF)" }}
        >
          {u.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-semibold truncate">Hola, {u.nombre.split(" ")[0]}</h2>
            <AreaChip area={agente.area} />
          </div>
          <div className="text-[11.5px] text-muted truncate">{agente.zona}</div>
        </div>
        <a
          href={ssoUrl}
          onClick={(e) => {
            e.preventDefault();
            setToast("Demo: no hay instancia de Chatwoot conectada.");
          }}
          className="btn btn-primary"
          style={{ fontSize: 12 }}
        >
          Abrir mi Chatwoot
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
        <button onClick={onSalir} className="btn" style={{ fontSize: 12 }}>
          Salir
        </button>
      </div>

      {/* ---------- Su comisión + sus métricas ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="card p-4" style={{ borderColor: extra > 0 ? "#0BA45C" : undefined }}>
          <div className="text-[10.5px] uppercase tracking-wide text-muted font-semibold">Tu comisión de julio</div>
          <motion.div
            key={extra}
            initial={{ scale: extra > 0 ? 1.12 : 1 }}
            animate={{ scale: 1 }}
            className="mono font-bold leading-none mt-1.5"
            style={{ fontSize: 22, color: "#0BA45C" }}
          >
            {fmtUSD(agente.comision + extra)}
          </motion.div>
          <div className="text-[10.5px] text-muted mt-1">
            {extra > 0 ? `+${fmtUSD(extra)} de lo que cargaste recién` : `${agente.cierres} cierres este mes`}
          </div>
        </div>
        {[
          { l: "Conversaciones", v: String(cw.conversations_count), d: "asignadas este mes" },
          { l: "Tu 1ª respuesta", v: fmtDur(cw.avg_first_response_time), d: "promedio en horario laboral" },
          { l: "Resueltas", v: `${cw.resolved_conversations_count}/${cw.conversations_count}`, d: "chats cerrados" },
        ].map((k) => (
          <div key={k.l} className="card p-4">
            <div className="text-[10.5px] uppercase tracking-wide text-muted font-semibold">{k.l}</div>
            <div className="mono font-bold leading-none mt-1.5" style={{ fontSize: 22 }}>
              {k.v}
            </div>
            <div className="text-[10.5px] text-muted mt-1">{k.d}</div>
          </div>
        ))}
      </div>
      <p className="text-[10.5px] text-muted mt-1.5">
        Estos tres salen solos de tu Chatwoot. No los carga nadie a mano.
      </p>

      {/* ---------- Cargá lo que pasó ---------- */}
      {pendientes.length > 0 && (
        <div className="card-hot p-4 mt-5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-[14px] font-semibold">Cargá lo que pasó</h3>
            <span className="chip mono" style={{ background: "#FFF0ED", color: "#FF4D2E" }}>
              {pendientes.length} sin cargar
            </span>
          </div>
          <p className="text-[12px] text-muted mb-3">
            Visitas tuyas que ya pasaron y no tienen resultado. Un toque y listo.
          </p>

          <div className="flex flex-col gap-2">
            {pendientes.map((c) => (
              <div key={c.id} className="card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{c.nombre}</div>
                    <div className="text-[11px] text-muted">
                      {c.pendiente!.propiedad} · <span className="mono">{c.pendiente!.fecha}</span>
                    </div>
                  </div>
                  {cargando !== c.id && (
                    <div className="flex gap-1.5 flex-wrap">
                      <button className="btn" style={{ fontSize: 12 }} onClick={() => setCargando(c.id)}>
                        Se presentó
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: 12, color: "#64748B" }}
                        onClick={() => resolver(c, "planton")}
                      >
                        No vino
                      </button>
                      <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => resolver(c, "cerro")}>
                        Cerró
                      </button>
                    </div>
                  )}
                </div>

                {/* Si vino: ¿avanza o se cae? */}
                <AnimatePresence>
                  {cargando === c.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
                        <div className="text-[11.5px] font-medium mb-2">Vino. ¿Sigue interesado?</div>
                        <div className="flex gap-1.5 flex-wrap mb-2.5">
                          <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => resolver(c, "vino")}>
                            Sí, sigue
                          </button>
                          <button className="btn" style={{ fontSize: 12 }} onClick={() => setCargando(null)}>
                            Cancelar
                          </button>
                        </div>
                        <div className="text-[11px] text-muted mb-1.5">O se cayó por…</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {MOTIVOS_CHIP.map((m) => (
                            <button
                              key={m}
                              onClick={() => resolver(c, "vino", m)}
                              className="chip"
                              style={{ background: "#F7F9FC", color: "#64748B", border: "1px solid #E5EAF2", cursor: "pointer" }}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Mi cartera ---------- */}
      <div className="flex items-center justify-between mt-6 mb-1">
        <h3 className="text-[15px] font-semibold">Mi cartera</h3>
        <span className="text-[11.5px] text-muted">
          <span className="mono">{cartera.length}</span> clientes
        </span>
      </div>
      <p className="text-[12px] text-muted mb-3">
        Tus clientes, tus notas y lo que tenés agendado con cada uno.
      </p>

      <div className="card overflow-hidden">
        {cartera.map((c, i) => {
          const open = abierto === c.id;
          return (
            <div key={c.id} style={{ borderTop: i === 0 ? "none" : "1px solid #F1F5F9" }}>
              <button
                onClick={() => {
                  setAbierto(open ? null : c.id);
                  setNota("");
                }}
                className="w-full text-left p-3 flex flex-wrap items-center gap-2 hover:bg-[#FAFBFD] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-semibold">{c.nombre}</span>
                    <TempChip temp={c.temp} score={c.score} />
                    {c.pendiente && (
                      <span className="chip" style={{ background: "#FFF0ED", color: "#FF4D2E", fontSize: 9 }}>
                        sin cargar
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted truncate mt-0.5">{c.propiedad}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11.5px] font-medium">{c.estado}</div>
                  {c.proxima ? (
                    <div className="text-[10.5px]" style={{ color: "#2563EB" }}>
                      {c.proxima.tipo} · <span className="mono">{c.proxima.fecha} {c.proxima.hora}</span>
                    </div>
                  ) : (
                    <div className="text-[10.5px] text-muted">sin nada agendado</div>
                  )}
                </div>

                <span className="text-muted shrink-0 ml-1">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3.5 h-3.5 transition-transform"
                    style={{ transform: open ? "rotate(90deg)" : "none" }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-4" style={{ background: "#F7F9FC" }}>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 pt-3">
                        {/* Notas */}
                        <div>
                          <div className="text-[10.5px] uppercase tracking-wide text-muted font-semibold mb-2">
                            Tus notas
                          </div>
                          {c.notas.length === 0 ? (
                            <p className="text-[11.5px] text-muted mb-2">
                              Todavía no anotaste nada de este cliente.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2 mb-2">
                              {c.notas.map((n, j) => (
                                <div key={j} className="card p-2.5">
                                  <div className="mono text-[10px] text-muted">{n.fecha}</div>
                                  <p className="text-[12px] mt-0.5 leading-relaxed">{n.texto}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              className="input-field"
                              placeholder="Anotá algo de este cliente…"
                              value={nota}
                              onChange={(e) => setNota(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && agregarNota(c)}
                            />
                            <button className="btn btn-primary" onClick={() => agregarNota(c)} disabled={!nota.trim()}>
                              Guardar
                            </button>
                          </div>
                        </div>

                        {/* Agenda + contacto */}
                        <div>
                          <div className="text-[10.5px] uppercase tracking-wide text-muted font-semibold mb-2">
                            Agendado
                          </div>
                          {c.proxima ? (
                            <div className="card p-2.5">
                              <div className="text-[12px] font-semibold capitalize">{c.proxima.tipo}</div>
                              <div className="mono text-[11.5px]" style={{ color: "#2563EB" }}>
                                {c.proxima.fecha} · {c.proxima.hora}
                              </div>
                              <div className="text-[11px] text-muted mt-0.5">{c.proxima.lugar}</div>
                            </div>
                          ) : (
                            <button
                              className="btn w-full"
                              style={{ fontSize: 12 }}
                              onClick={() => setToast("Demo: acá se agenda la próxima reunión.")}
                            >
                              + Agendar reunión
                            </button>
                          )}
                          <div className="text-[10.5px] uppercase tracking-wide text-muted font-semibold mt-3 mb-1">
                            Contacto
                          </div>
                          <div className="mono text-[11.5px]">{c.telefono}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
