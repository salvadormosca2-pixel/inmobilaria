"use client";

import { motion } from "framer-motion";
import { PageWrap, SectionTitle, KpiCard } from "@/components/ui";
import { VISITAS } from "@/lib/mockData";
import type { Visita } from "@/lib/mockData";

/* ---------- Paleta ---------- */

const BLUE = "#2563EB";
const ACENTO = "#00A3FF";
const ACTIVO = "#EEF4FF";
const INK = "#0F1B2D";
const MUTED = "#64748B";
const BORDE = "#E5EAF2";
const BG2 = "#F7F9FC";
const EXITO = "#0BA45C";
const EXITO_BG = "#E7F8F0";

/* ---------- Estado de la confirmación automática ---------- */

const TIPO_STYLE: Record<Visita["tipo"], { bg: string; fg: string }> = {
  confirmada: { bg: EXITO_BG, fg: EXITO },
  recordatorio: { bg: ACTIVO, fg: BLUE },
  reprogramada: { bg: "#FEF5E4", fg: "#F59E0B" },
  pendiente: { bg: "#F1F5F9", fg: "#94A3B8" },
};

function ConfirmChip({ visita }: { visita: Visita }) {
  const s = TIPO_STYLE[visita.tipo];
  return (
    <span className="chip whitespace-nowrap" style={{ background: s.bg, color: s.fg }}>
      {visita.confirmacion}
    </span>
  );
}

/* ---------- Avatar de iniciales del agente ---------- */

function AgenteAvatar({ nombre }: { nombre: string }) {
  const iniciales = nombre
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        className="mono inline-flex items-center justify-center rounded-full font-bold shrink-0"
        style={{ width: 26, height: 26, background: ACTIVO, color: BLUE, fontSize: 10 }}
        aria-hidden="true"
      >
        {iniciales}
      </span>
      <span className="text-[12.5px] font-medium">{nombre}</span>
    </span>
  );
}

/* ---------- Agrupado por día, respetando el orden cronológico del array ---------- */

const GRUPOS = VISITAS.reduce<{ dia: string; visitas: Visita[] }[]>((acc, v) => {
  const grupo = acc.find((g) => g.dia === v.dia);
  if (grupo) grupo.visitas.push(v);
  else acc.push({ dia: v.dia, visitas: [v] });
  return acc;
}, []);

const esHoy = (dia: string) => dia.startsWith("Hoy");

/* ---------- Números derivados de VISITAS ---------- */

const TOTAL = VISITAS.length;
const CONFIRMADAS = VISITAS.filter((v) => v.tipo === "confirmada").length;
const PENDIENTES = VISITAS.filter((v) => v.tipo === "pendiente").length;
const REPROGRAMADAS = VISITAS.filter((v) => v.tipo === "reprogramada").length;
const HOY = VISITAS.filter((v) => esHoy(v.dia)).length;
const PCT_CONFIRMADAS = Math.round((CONFIRMADAS / TOTAL) * 100);

/* ---------- Cómo lo logra el bot ---------- */

const PASOS = [
  "Confirmación el día antes",
  "Recordatorio 2 h antes",
  "Reprograma solo, sin llamados",
];

export default function VisitasPage() {
  return (
    <PageWrap>
      {/* ---------- Encabezado ---------- */}
      <div className="mb-4">
        <h1 className="text-[20px] font-semibold">Visitas</h1>
        <p className="text-[13px] text-muted mt-0.5">
          Toda la agenda de la semana con quién confirmó cada visita. El bot avisa el día antes y otra vez 2 h antes: si
          el lead no puede, reprograma solo y vos te enterás acá.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* ================= COLUMNA IZQUIERDA — agenda ================= */}
        <div>
          <SectionTitle
            right={
              <span className="text-[12px] text-muted">
                <span className="mono font-semibold text-ink">{TOTAL}</span> visitas · del{" "}
                <span className="mono">16/07</span> al <span className="mono">20/07</span>
              </span>
            }
          >
            Agenda de visitas
          </SectionTitle>

          <div className="flex flex-col gap-4">
            {GRUPOS.map((grupo, gi) => {
              const hoy = esHoy(grupo.dia);
              return (
                <section key={grupo.dia}>
                  {/* Encabezado del día */}
                  <div
                    className="sticky top-16 z-10 flex items-center justify-between px-3 py-2 rounded-lg mb-2 backdrop-blur"
                    style={{
                      background: hoy ? ACTIVO : "rgba(247,249,252,.9)",
                      border: `1px solid ${hoy ? BLUE : BORDE}`,
                    }}
                  >
                    <span
                      className="text-[12px] font-semibold uppercase tracking-wide"
                      style={{ color: hoy ? BLUE : MUTED }}
                    >
                      {grupo.dia}
                    </span>
                    <span
                      className="mono text-[11px] font-semibold"
                      style={{ color: hoy ? BLUE : MUTED, opacity: hoy ? 1 : 0.8 }}
                    >
                      {grupo.visitas.length} {grupo.visitas.length === 1 ? "visita" : "visitas"}
                    </span>
                  </div>

                  {/* Visitas del día */}
                  <div className="flex flex-col gap-2">
                    {grupo.visitas.map((v, i) => (
                      <motion.div
                        key={v.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(gi * 0.06 + i * 0.03, 0.3) }}
                        className="card p-3.5"
                        style={hoy ? { borderLeft: `3px solid ${BLUE}` } : undefined}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* Hora */}
                          <div className="shrink-0" style={{ width: 60 }}>
                            <div
                              className="mono font-bold leading-none"
                              style={{ fontSize: 19, color: hoy ? BLUE : INK }}
                            >
                              {v.hora}
                            </div>
                          </div>

                          {/* Lead + propiedad */}
                          <div className="min-w-0 flex-1">
                            <div className="text-[13.5px] font-bold truncate">{v.lead}</div>
                            <div className="text-[12px] text-muted truncate mt-0.5">{v.propiedad}</div>
                          </div>

                          {/* Agente */}
                          <div className="sm:w-[150px] shrink-0">
                            <AgenteAvatar nombre={v.agente} />
                          </div>

                          {/* Confirmación automática */}
                          <div className="sm:w-[190px] shrink-0 sm:text-right">
                            <ConfirmChip visita={v} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <p className="text-[11.5px] text-muted mt-3">
            Las visitas de hoy ya están cerradas: <span className="mono font-semibold text-ink">{HOY}</span> agendadas y
            ninguna necesitó que llamaras.
          </p>
        </div>

        {/* ================= COLUMNA DERECHA — impacto ================= */}
        <aside className="lg:sticky lg:top-20 self-start flex flex-col gap-3">
          {/* Card estrella */}
          <div className="card p-5 overflow-hidden relative">
            <div
              className="absolute -top-16 -right-16 rounded-full pointer-events-none"
              style={{
                width: 160,
                height: 160,
                background: `radial-gradient(circle, ${ACTIVO} 0%, transparent 70%)`,
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: MUTED }}>
                Impacto del bot
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mono font-bold leading-none mt-3"
                style={{
                  fontSize: 54,
                  letterSpacing: "-0.03em",
                  backgroundImage: `linear-gradient(135deg, ${BLUE}, ${ACENTO})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                -63%
              </motion.div>

              <div className="text-[13px] font-semibold mt-1.5" style={{ color: INK }}>
                plantones
              </div>

              <p className="text-[12px] text-muted mt-2.5 leading-relaxed">
                El lead recibe la confirmación el día antes y el recordatorio 2 h antes. Si no puede, reprograma él mismo
                desde el WhatsApp. Nadie de tu equipo levanta el teléfono.
              </p>

              <div className="h-px my-4" style={{ background: BORDE }} />

              <ul className="flex flex-col gap-2">
                {PASOS.map((paso) => (
                  <li key={paso} className="flex items-start gap-2">
                    <span
                      className="inline-flex items-center justify-center rounded-full shrink-0 mt-[1px]"
                      style={{ width: 16, height: 16, background: EXITO_BG, color: EXITO, fontSize: 10 }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span className="text-[12.5px] font-medium leading-snug">{paso}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Desglose derivado de VISITAS */}
          <KpiCard label="Visitas esta semana" valor={TOTAL} detalle={`${HOY} son hoy, jue 16/07`} />
          <KpiCard
            label="Confirmadas por bot"
            valor={CONFIRMADAS}
            detalle={`${PCT_CONFIRMADAS}% de la agenda · sin un solo llamado`}
            tono="success"
          />
          <KpiCard
            label="Pendientes de confirmar"
            valor={PENDIENTES}
            detalle="El bot les escribe el día antes"
            tono="blue"
          />

          <div className="card p-3.5" style={{ background: BG2 }}>
            <p className="text-[11.5px] text-muted leading-relaxed">
              Esta semana <span className="mono font-semibold text-ink">{REPROGRAMADAS}</span> visita se reprogramó sola:
              el lead eligió otro horario y el agente ya lo tiene en su agenda.
            </p>
          </div>
        </aside>
      </div>
    </PageWrap>
  );
}
