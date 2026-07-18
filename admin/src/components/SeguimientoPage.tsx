"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PageWrap,
  SectionTitle,
  KpiCard,
  CanalBadge,
  AreaChip,
  Asignado,
  Toggle,
  Modal,
  Toast,
} from "@/components/ui";
import {
  SEGUIMIENTOS,
  SEG_META,
  comisionEnJuego,
  fmtUSD,
} from "@/lib/mockData";
import type { SeguimientoLead, SegEstado, SegEvento } from "@/lib/mockData";

/* ---------- Constantes de demo ---------- */
const HOY_LABEL = "hoy 16/07";

/* Color por autor del evento en la línea de tiempo. */
const EVENTO_COLOR: Record<SegEvento["tipo"], string> = {
  auto: "#2563EB", // la IA
  humano: "#0BA45C", // una persona del equipo
  lead: "#94A3B8", // el cliente
};
const EVENTO_LABEL: Record<SegEvento["tipo"], string> = {
  auto: "IA",
  humano: "Equipo",
  lead: "Cliente",
};

/* ---------- Etiqueta de estado del seguimiento ---------- */
function EstadoTag({ estado }: { estado: SegEstado }) {
  const m = SEG_META[estado];
  return (
    <span className="chip" style={{ background: m.bg, color: m.fg }}>
      <span style={{ fontSize: 10 }}>{m.icon}</span> {m.label}
    </span>
  );
}

/* ---------- Segmentos (filtro por estado) ---------- */
const SEGMENTOS: { key: "todos" | SegEstado; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendiente", label: "Pendientes" },
  { key: "enviado", label: "Enviados" },
  { key: "respondio", label: "Respondieron" },
  { key: "recuperado", label: "Recuperados" },
  { key: "sin_respuesta", label: "Sin respuesta" },
];

/* ---------- Acción primaria según el estado ---------- */
function accionDe(estado: SegEstado): { label: string; siguiente: SegEstado } | null {
  switch (estado) {
    case "pendiente":
      return { label: "Enviar seguimiento", siguiente: "enviado" };
    case "sin_respuesta":
      return { label: "Reactivar", siguiente: "enviado" };
    case "enviado":
      return { label: "Registrar respuesta", siguiente: "respondio" };
    case "respondio":
      return { label: "Marcar recuperado", siguiente: "recuperado" };
    default:
      return null; // recuperado: sin acción
  }
}

export default function SeguimientoPage() {
  const [items, setItems] = useState<SeguimientoLead[]>(() =>
    SEGUIMIENTOS.map((s) => ({ ...s, historial: [...s.historial] }))
  );
  const [filtro, setFiltro] = useState<"todos" | SegEstado>("todos");
  const [toast, setToast] = useState<string | null>(null);

  /* Modales */
  const [enviarId, setEnviarId] = useState<string | null>(null);
  const [gestionId, setGestionId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [nota, setNota] = useState("");

  const cerrarToast = useCallback(() => setToast(null), []);

  /* ---------- Derivados ---------- */
  const conteo = useMemo(() => {
    const c: Record<string, number> = { todos: items.length };
    for (const s of items) c[s.estado] = (c[s.estado] ?? 0) + 1;
    return c;
  }, [items]);

  const kpis = useMemo(() => {
    const pendientes = items.filter((s) => s.estado === "pendiente").length;
    const recuperados = items.filter((s) => s.estado === "recuperado");
    const comisionRecuperada = recuperados.reduce((a, s) => a + s.comision, 0);
    return {
      total: items.length,
      pendientes,
      recuperados: recuperados.length,
      comisionRecuperada,
      enJuego: comisionEnJuego(items),
    };
  }, [items]);

  const visibles = useMemo(
    () => (filtro === "todos" ? items : items.filter((s) => s.estado === filtro)),
    [items, filtro]
  );

  const enviarLead = enviarId ? items.find((s) => s.id === enviarId) ?? null : null;
  const gestionLead = gestionId ? items.find((s) => s.id === gestionId) ?? null : null;

  /* ---------- Acciones ---------- */
  function abrirEnviar(s: SeguimientoLead) {
    setEnviarId(s.id);
    setMensaje(s.plantilla);
    setNota("");
  }

  function confirmarEnvio() {
    if (!enviarLead) return;
    const evento: SegEvento = {
      hora: `Ahora · ${HOY_LABEL}`,
      texto: "Seguimiento enviado por WhatsApp (Evolution API)",
      tipo: "humano",
    };
    const eventos: SegEvento[] = [evento];
    if (nota.trim()) {
      eventos.push({ hora: `Ahora · ${HOY_LABEL}`, texto: `Nota: ${nota.trim()}`, tipo: "humano" });
    }
    aplicar(enviarLead.id, "enviado", eventos, "Reintento a 72 h si no responde");
    setToast(`Mensaje enviado a ${enviarLead.nombre} por WhatsApp`);
    setEnviarId(null);
  }

  function avanzar(s: SeguimientoLead) {
    const a = accionDe(s.estado);
    if (!a) return;
    if (a.siguiente === "enviado") {
      abrirEnviar(s);
      return;
    }
    const textos: Record<string, { texto: string; toque: string; msg: string }> = {
      respondio: {
        texto: "El cliente respondió — pasa a un asesor",
        toque: "Un asesor lo retoma",
        msg: `${s.nombre} marcado como “respondió”`,
      },
      recuperado: {
        texto: "Marcado como recuperado — vuelve al pipeline de venta",
        toque: "Cerrado — recuperado",
        msg: `¡${s.nombre} recuperado! Vuelve al pipeline`,
      },
    };
    const t = textos[a.siguiente];
    aplicar(s.id, a.siguiente, [{ hora: `Ahora · ${HOY_LABEL}`, texto: t.texto, tipo: "humano" }], t.toque);
    setToast(t.msg);
  }

  function aplicar(id: string, estado: SegEstado, nuevosEventos: SegEvento[], proximoToque: string) {
    setItems((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, estado, proximoToque, historial: [...nuevosEventos, ...s.historial] }
          : s
      )
    );
  }

  function toggleAuto(id: string, v: boolean) {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, auto: v } : s)));
    const s = items.find((x) => x.id === id);
    setToast(
      v
        ? `Seguimiento automático activado para ${s?.nombre}`
        : `Seguimiento automático pausado — ${s?.nombre} queda en manual`
    );
  }

  /* ---------- Render ---------- */
  return (
    <PageWrap>
      {/* Intro */}
      <div className="mb-5 max-w-[820px]">
        <h1 className="text-[20px] font-semibold leading-tight" style={{ color: "#0F1B2D" }}>
          El que se interesó y no compró, no se pierde más
        </h1>
        <p className="text-[12.5px] mt-1.5" style={{ color: "#64748B" }}>
          Cada persona que consultó o visitó y no cerró queda acá, con su etiqueta de seguimiento y un mensaje
          listo para salir por WhatsApp. La IA reintenta sola; si preferís hacerlo a mano, apretás un botón. Y
          abajo de cada uno queda registrado qué se hizo y quién — para que veas la gestión completa.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="En seguimiento" valor={kpis.total} detalle="Interesados que no cerraron todavía" tono="ink" />
        <KpiCard
          label="Pendientes de contactar"
          valor={kpis.pendientes}
          detalle={kpis.pendientes === 0 ? "Al día — nada sin tocar" : "Esperan el próximo mensaje"}
          tono="hot"
        />
        <KpiCard
          label="Recuperados en julio"
          valor={kpis.recuperados}
          detalle={`${fmtUSD(kpis.comisionRecuperada)} en comisiones rescatadas`}
          tono="success"
        />
        <KpiCard
          label="Comisión en juego"
          valor={fmtUSD(kpis.enJuego)}
          detalle="Lo que hay para ganar si se recuperan"
          tono="blue"
        />
      </div>

      {/* Segmentos */}
      <SectionTitle
        right={
          <span className="text-[12px]" style={{ color: "#64748B" }}>
            Mostrando <span className="mono font-semibold" style={{ color: "#0F1B2D" }}>{visibles.length}</span> de{" "}
            <span className="mono">{items.length}</span>
          </span>
        }
      >
        Cola de seguimiento
      </SectionTitle>

      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {SEGMENTOS.map((seg) => {
          const activo = filtro === seg.key;
          const n = conteo[seg.key] ?? 0;
          return (
            <button
              key={seg.key}
              type="button"
              onClick={() => setFiltro(seg.key)}
              aria-pressed={activo}
              className="btn"
              style={
                activo
                  ? { background: "#EEF4FF", borderColor: "#2563EB", color: "#2563EB" }
                  : { color: "#64748B", borderColor: "#E5EAF2" }
              }
            >
              {seg.label}
              <span className="mono text-[11px]" style={{ opacity: 0.7 }}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de seguimientos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {visibles.map((s, i) => {
          const accion = accionDe(s.estado);
          const cerrado = s.estado === "recuperado";
          const ultimo = s.historial[0];
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(i * 0.03, 0.25), ease: [0.16, 1, 0.3, 1] }}
              className="card p-4 flex flex-col"
              style={cerrado ? { borderColor: "#B7E9CE", background: "#FCFEFD" } : undefined}
            >
              {/* Encabezado: nombre + estado */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[14px]" style={{ color: "#0F1B2D" }}>
                      {s.nombre}
                    </span>
                    <CanalBadge canal={s.canal} />
                    <AreaChip area={s.area} mini />
                  </div>
                  <div className="text-[12px] mt-1" style={{ color: "#64748B" }}>
                    {s.busca}
                  </div>
                </div>
                <EstadoTag estado={s.estado} />
              </div>

              {/* Motivo */}
              <div
                className="mt-3 rounded-lg px-3 py-2 text-[12px] leading-snug"
                style={{ background: "#F7F9FC", color: "#475569" }}
              >
                <span style={{ color: "#94A3B8" }}>Por qué no cerró: </span>
                {s.motivo}
              </div>

              {/* Última gestión */}
              {ultimo && (
                <div className="mt-3 flex items-start gap-2">
                  <span
                    className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: EVENTO_COLOR[ultimo.tipo] }}
                  />
                  <div className="text-[12px] leading-snug" style={{ color: "#475569" }}>
                    {ultimo.texto}
                    <span className="text-muted"> · {ultimo.hora}</span>
                  </div>
                </div>
              )}

              {/* Próximo toque */}
              <div className="mt-2.5 flex items-center gap-1.5 text-[12px]" style={{ color: cerrado ? "#0BA45C" : "#2563EB" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span className="font-medium leading-snug">{s.proximoToque}</span>
              </div>

              {/* Pie: agente + comisión + auto */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3">
                <Asignado a={s.agente} size={26} />
                <div className="text-right shrink-0">
                  <div className="mono font-bold text-[13px]" style={{ color: "#0F1B2D" }}>
                    {fmtUSD(s.comision)}
                  </div>
                  <div className="text-[10px] text-muted">comisión</div>
                </div>
              </div>

              {/* Fila auto + acciones */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Toggle on={s.auto} onChange={(v) => toggleAuto(s.id, v)} />
                  <span className="text-[11.5px]" style={{ color: s.auto ? "#2563EB" : "#94A3B8" }}>
                    {s.auto ? "Seguimiento automático" : "Manual"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGestionId(s.id)}
                    className="btn"
                    style={{ color: "#64748B", borderColor: "#E5EAF2" }}
                  >
                    Ver gestión
                  </button>
                  {accion ? (
                    <button
                      type="button"
                      onClick={() => avanzar(s)}
                      className="btn btn-primary"
                    >
                      {accion.label}
                    </button>
                  ) : (
                    <span className="chip" style={{ background: "#E7F8F0", color: "#0BA45C" }}>
                      ✓ Cerrado
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {visibles.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-[13px] font-medium">No hay leads en este estado</p>
          <p className="text-[12px] text-muted mt-1">Probá con otro segmento.</p>
        </div>
      )}

      {/* ---------- Modal: enviar seguimiento ---------- */}
      <Modal
        open={enviarLead !== null}
        onClose={() => setEnviarId(null)}
        title={enviarLead ? `Enviar seguimiento a ${enviarLead.nombre}` : ""}
        width={560}
      >
        {enviarLead && (
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <CanalBadge canal={enviarLead.canal} full />
              <AreaChip area={enviarLead.area} mini />
              <span className="text-[12px] text-muted">{enviarLead.busca}</span>
            </div>

            <label className="text-[11px] uppercase tracking-wide text-muted font-semibold">Mensaje</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={5}
              className="input-field mt-1.5 w-full"
              style={{ resize: "vertical", lineHeight: 1.5 }}
            />

            <label className="text-[11px] uppercase tracking-wide text-muted font-semibold block mt-3">
              Nota interna (opcional)
            </label>
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: llamó y quedó en pensarlo hasta el finde"
              className="input-field mt-1.5 w-full"
            />

            <div
              className="mt-3 rounded-lg px-3 py-2 text-[11.5px] flex items-center gap-2"
              style={{ background: "#E7F8F0", color: "#0BA45C" }}
            >
              <span style={{ fontSize: 13 }}>✓</span>
              Sale por WhatsApp vía Evolution API al <span className="mono">{enviarLead.telefono}</span>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setEnviarId(null)}
                className="btn"
                style={{ color: "#64748B", borderColor: "#E5EAF2" }}
              >
                Cancelar
              </button>
              <button type="button" onClick={confirmarEnvio} className="btn btn-primary" disabled={!mensaje.trim()}>
                Enviar por WhatsApp
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Modal: ver gestión (historial) ---------- */}
      <Modal
        open={gestionLead !== null}
        onClose={() => setGestionId(null)}
        title={gestionLead ? `Gestión de ${gestionLead.nombre}` : ""}
        width={520}
      >
        {gestionLead && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <EstadoTag estado={gestionLead.estado} />
              <Asignado a={gestionLead.agente} size={26} />
            </div>

            <div className="rounded-lg px-3 py-2 text-[12px] mb-4" style={{ background: "#EEF4FF", color: "#2563EB" }}>
              Próximo paso: {gestionLead.proximoToque}
            </div>

            <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-2">Línea de tiempo</div>
            <div className="relative pl-5">
              <div className="absolute left-[6px] top-1 bottom-1 w-px" style={{ background: "#E5EAF2" }} />
              {gestionLead.historial.map((ev, idx) => (
                <div key={idx} className="relative mb-3 last:mb-0">
                  <span
                    className="absolute -left-5 top-[3px] w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: EVENTO_COLOR[ev.tipo] }}
                  />
                  <div className="text-[12.5px]" style={{ color: "#0F1B2D" }}>
                    {ev.texto}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    <span style={{ color: EVENTO_COLOR[ev.tipo], fontWeight: 600 }}>{EVENTO_LABEL[ev.tipo]}</span> ·{" "}
                    {ev.hora}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Toast msg={toast} onDone={cerrarToast} />
    </PageWrap>
  );
}
