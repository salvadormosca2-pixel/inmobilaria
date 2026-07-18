"use client";

import { motion } from "framer-motion";
import type { Contrato, Reclamo } from "@/lib/mockData";
import { CONTRATOS, COBRANZAS, LIQUIDACIONES, RECLAMOS, fmtARS } from "@/lib/mockData";
import { PageWrap, SectionTitle, KpiCard } from "@/components/ui";

/* ---------- Paleta ---------- */

const C = {
  blue: "#2563EB",
  activo: "#EEF4FF",
  violeta: "#7C3AED",
  violetaBg: "#F3EEFF",
  hot: "#FF4D2E",
  hotBg: "#FFF0ED",
  warm: "#F59E0B",
  warmBg: "#FEF5E4",
  cold: "#94A3B8",
  coldBg: "#F1F5F9",
  ok: "#0BA45C",
  okBg: "#E7F8F0",
  ink: "#0F1B2D",
  muted: "#64748B",
  border: "#E5EAF2",
  bg2: "#F7F9FC",
};

/* ---------- Derivados de CONTRATOS ---------- */

const HONORARIOS_PCT = 0.08;

const masaMensual = CONTRATOS.reduce((a, c) => a + c.monto, 0);
const honorariosMes = Math.round(masaMensual * HONORARIOS_PCT);
const porVencer = CONTRATOS.filter((c) => c.diasVenc <= 90);
const proximoAVencer = [...CONTRATOS].sort((a, b) => a.diasVenc - b.diasVenc)[0];
const propietariosUnicos = new Set(CONTRATOS.map((c) => c.propietario)).size;

const pctAumento = (c: Contrato) => Math.round(((c.montoNuevo - c.monto) / c.monto) * 100);

/* ---------- Derivados de COBRANZAS ---------- */

const totalCobranzas = COBRANZAS.cobrado + COBRANZAS.pendiente + COBRANZAS.moroso;
const pctSobreTotal = (n: number) => Math.round((n / totalCobranzas) * 100);
const contarEstado = (estado: string) => COBRANZAS.items.filter((i) => i.estado === estado).length;

/* ---------- Chips ---------- */

function Chip({ fg, bg, children }: { fg: string; bg: string; children: React.ReactNode }) {
  return (
    <span className="chip" style={{ background: bg, color: fg }}>
      {children}
    </span>
  );
}

function IndiceChip({ indice }: { indice: Contrato["indice"] }) {
  const s =
    indice === "ICL"
      ? { fg: C.blue, bg: C.activo }
      : { fg: C.violeta, bg: C.violetaBg };
  return (
    <span className="chip mono" style={{ background: s.bg, color: s.fg, fontSize: 10 }}>
      {indice}
    </span>
  );
}

const ESTADO_COBRO: Record<string, { fg: string; bg: string; label: string }> = {
  cobrado: { fg: C.ok, bg: C.okBg, label: "Cobrado" },
  pendiente: { fg: C.warm, bg: C.warmBg, label: "Pendiente" },
  moroso: { fg: C.hot, bg: C.hotBg, label: "Moroso" },
};

const ESTADO_RECLAMO: Record<Reclamo["estado"], { fg: string; bg: string; label: string }> = {
  abierto: { fg: C.hot, bg: C.hotBg, label: "Abierto" },
  "en curso": { fg: C.warm, bg: C.warmBg, label: "En curso" },
  resuelto: { fg: C.ok, bg: C.okBg, label: "Resuelto" },
};

function estiloLiquidacion(estado: string) {
  if (estado.startsWith("Transferido")) return { fg: C.ok, bg: C.okBg };
  if (estado.startsWith("Pendiente") || estado.startsWith("Esperando")) return { fg: C.warm, bg: C.warmBg };
  return { fg: C.muted, bg: C.coldBg };
}

/* ============================================================ */

export default function ContratosPage() {
  return (
    <PageWrap>
      {/* ============ SECCIÓN 1 — Contratos vigentes ============ */}

      <SectionTitle right={<span className="text-[11px] text-muted">Cartera administrada · julio 2026</span>}>
        Contratos vigentes
      </SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <KpiCard
          label="Contratos vigentes"
          valor={CONTRATOS.length}
          detalle={`${propietariosUnicos} propietarios · ${CONTRATOS.length} propiedades`}
          tono="blue"
        />
        <KpiCard
          label="Vencen en 90 días o menos"
          valor={porVencer.length}
          detalle={`El más próximo: ${proximoAVencer.inquilino} — ${proximoAVencer.vencimiento}`}
          tono="hot"
        />
        <KpiCard
          label="Alquiler mensual administrado"
          valor={fmtARS(masaMensual)}
          detalle={`Honorarios al 8% → ${fmtARS(honorariosMes)} por mes`}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Inquilino</th>
                <th>Propiedad</th>
                <th>Propietario</th>
                <th>Monto actual</th>
                <th>Índice</th>
                <th>Próximo aumento</th>
                <th>Vence el contrato</th>
                <th>Garantía</th>
              </tr>
            </thead>
            <tbody>
              {CONTRATOS.map((c) => {
                const alerta = c.diasVenc <= 90;
                const critico = c.diasVenc <= 30;
                return (
                  <tr key={c.id}>
                    <td className="font-semibold whitespace-nowrap">{c.inquilino}</td>
                    <td className="whitespace-nowrap">{c.propiedad}</td>
                    <td className="text-muted whitespace-nowrap">{c.propietario}</td>
                    <td className="mono font-semibold whitespace-nowrap">{fmtARS(c.monto)}</td>
                    <td>
                      <IndiceChip indice={c.indice} />
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="mono text-[12px]">{c.proximoAumento}</div>
                      <div className="mono text-[12px] font-semibold mt-0.5" style={{ color: C.ok }}>
                        ↑ {fmtARS(c.montoNuevo)}{" "}
                        <span style={{ opacity: 0.75 }}>+{pctAumento(c)}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="mono text-[12px]" style={{ color: alerta ? C.ink : C.muted }}>
                        {c.vencimiento}
                      </div>
                      {alerta ? (
                        <div className="mt-1">
                          <Chip fg={critico ? C.hot : C.warm} bg={critico ? C.hotBg : C.warmBg}>
                            <span className="mono">{c.diasVenc}</span> días
                          </Chip>
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted mt-0.5">
                          en <span className="mono">{c.diasVenc}</span> días
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="chip" style={{ background: C.coldBg, color: C.muted }}>
                        {c.garantia}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-muted mt-2">
        La alerta de renovación se dispara sola <span className="mono">90</span> días antes del vencimiento y le avisa
        al inquilino y a vos. El aumento por índice se notifica a las dos partes el día que corresponde.
      </p>

      {/* ============ SECCIÓN 2 — Cobranzas del mes ============ */}

      <div className="mt-8">
        <SectionTitle right={<span className="text-[11px] text-muted">Julio 2026 · al jue 16/07</span>}>
          Cobranzas del mes
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              key: "cobrado",
              label: "Cobrado",
              monto: COBRANZAS.cobrado,
              fg: C.ok,
              bg: C.okBg,
              nota: "Ya acreditado en la cuenta",
            },
            {
              key: "pendiente",
              label: "Pendiente",
              monto: COBRANZAS.pendiente,
              fg: C.warm,
              bg: C.warmBg,
              nota: "Dentro del plazo, sin atraso",
            },
            {
              key: "moroso",
              label: "Moroso",
              monto: COBRANZAS.moroso,
              fg: C.hot,
              bg: C.hotBg,
              nota: "Vencido, con recordatorios enviados",
            },
          ].map((t) => (
            <div key={t.key} className="rounded-[12px] p-5" style={{ background: t.bg, border: `1px solid ${C.border}` }}>
              <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: t.fg }}>
                {t.label}
              </div>
              <div className="mono font-bold mt-2 leading-none" style={{ fontSize: 28, color: t.fg }}>
                {fmtARS(t.monto)}
              </div>
              <div className="text-[12px] mt-2" style={{ color: C.ink }}>
                <span className="mono font-semibold">{pctSobreTotal(t.monto)}%</span> del total del mes ·{" "}
                <span className="mono">{contarEstado(t.key)}</span> de{" "}
                <span className="mono">{COBRANZAS.items.length}</span> alquileres
              </div>
              <div className="text-[11px] mt-1" style={{ color: C.muted }}>
                {t.nota}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted mt-3 mb-2">
          El recordatorio de pago sale solo por WhatsApp los primeros <span className="mono">5</span> días del mes. Si
          el inquilino no paga, la IA reintenta y recién ahí te avisa. Total del mes:{" "}
          <span className="mono font-semibold" style={{ color: C.ink }}>
            {fmtARS(totalCobranzas)}
          </span>
          .
        </p>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Inquilino</th>
                  <th>Propiedad</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {COBRANZAS.items.map((i) => {
                  const e = ESTADO_COBRO[i.estado];
                  return (
                    <tr key={i.inquilino + i.propiedad}>
                      <td className="font-semibold whitespace-nowrap">{i.inquilino}</td>
                      <td className="whitespace-nowrap">{i.propiedad}</td>
                      <td className="mono font-semibold whitespace-nowrap">{fmtARS(i.monto)}</td>
                      <td>
                        <Chip fg={e.fg} bg={e.bg}>
                          {e.label}
                        </Chip>
                      </td>
                      <td className="text-muted">{i.fecha}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============ SECCIÓN 3 — Liquidaciones a propietarios ============ */}

      <div className="mt-8">
        <SectionTitle right={<span className="text-[11px] text-muted">Honorarios de administración: 8%</span>}>
          Liquidaciones a propietarios
        </SectionTitle>

        <p className="text-[11px] text-muted mb-2">
          La cuenta es siempre la misma: <span style={{ color: C.ink }}>alquiler cobrado − honorarios = a transferir</span>.
          Mientras el inquilino no pague no hay plata para liquidar, y esa fila queda esperando.
        </p>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Propiedad</th>
                  <th>Alquiler cobrado</th>
                  <th>Honorarios (8%)</th>
                  <th>A transferir</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {LIQUIDACIONES.map((l) => {
                  const sinCobrar = l.cobrado === 0;
                  const e = estiloLiquidacion(l.estado);
                  return (
                    <tr key={l.propietario + l.propiedad}>
                      <td className="font-semibold whitespace-nowrap">{l.propietario}</td>
                      <td className="whitespace-nowrap">{l.propiedad}</td>
                      <td className="mono whitespace-nowrap" style={{ color: sinCobrar ? C.cold : C.ink }}>
                        {sinCobrar ? "—" : fmtARS(l.cobrado)}
                      </td>
                      <td className="mono whitespace-nowrap" style={{ color: C.hot }}>
                        −{fmtARS(l.honorarios)}
                      </td>
                      <td
                        className="mono font-bold whitespace-nowrap"
                        style={{ color: sinCobrar ? C.muted : C.ink }}
                      >
                        {fmtARS(l.transferir)}
                      </td>
                      <td>
                        <Chip fg={e.fg} bg={e.bg}>
                          {l.estado}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============ SECCIÓN 4 — Reclamos de mantenimiento ============ */}

      <div className="mt-8">
        <SectionTitle
          right={
            <span className="text-[11px] text-muted">
              <span className="mono">{RECLAMOS.filter((r) => r.estado !== "resuelto").length}</span> sin resolver
            </span>
          }
        >
          Reclamos de mantenimiento
        </SectionTitle>

        <p className="text-[11px] text-muted mb-3">
          El inquilino reporta el problema por WhatsApp y el ticket se abre solo, con la propiedad y el propietario ya
          asociados. Vos solo asignás al proveedor y cerrás.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {RECLAMOS.map((r, idx) => {
            const e = ESTADO_RECLAMO[r.estado];
            const abierto = r.estado !== "resuelto";
            const durmiendo = abierto && r.dias >= 5;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[12px] font-semibold" style={{ color: C.muted }}>
                      #{r.id}
                    </span>
                    <span className="font-semibold text-[13px]">{r.inquilino}</span>
                  </div>
                  <Chip fg={e.fg} bg={e.bg}>
                    {e.label}
                  </Chip>
                </div>

                <div className="text-[12px] text-muted mt-1">{r.propiedad}</div>
                <div className="text-[13px] mt-2">{r.detalle}</div>

                <div
                  className="flex items-center justify-between mt-3 pt-2.5 text-[11px]"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <span className="text-muted">
                    Reportado el <span className="mono">{r.fecha}</span>
                  </span>
                  {abierto ? (
                    <span
                      className={durmiendo ? "font-semibold" : ""}
                      style={{ color: durmiendo ? C.hot : C.muted }}
                    >
                      <span className="mono">{r.dias}</span> días abierto{r.dias === 1 ? "" : "s"}
                      {durmiendo && " — se está durmiendo"}
                    </span>
                  ) : (
                    <span style={{ color: C.ok }}>✓ Cerrado</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrap>
  );
}
