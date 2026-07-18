"use client";

import { motion } from "framer-motion";
import { PROPIETARIOS, TASACIONES } from "@/lib/mockData";
import type { Propietario } from "@/lib/mockData";
import { PageWrap, SectionTitle, KpiCard } from "@/components/ui";

/* ---------- Estilos por estado del propietario ---------- */

const ESTADO_STYLE: Record<Propietario["estado"], { bg: string; fg: string; label: string }> = {
  conforme: { bg: "#E7F8F0", fg: "#0BA45C", label: "Conforme" },
  "pide bajar precio": { bg: "#FEF5E4", fg: "#F59E0B", label: "Pide bajar precio" },
  "por renovar exclusiva": { bg: "#FFF0ED", fg: "#FF4D2E", label: "Por renovar exclusiva" },
};

/**
 * Exclusivas que vencen dentro de los próximos 30 días (hoy: 16/07/2026).
 * Sólo se alerta lo que está por vencer; el resto muestra la fecha tal cual.
 */
const ALERTA_VENCIMIENTO: Record<string, number> = {
  o3: 17, // Familia Agüero Bazán — vence 02/08/2026
};

/* ---------- Íconos ---------- */

function IconCamara() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.04 2h-.01C6.5 2 2.02 6.48 2.02 12c0 1.77.46 3.42 1.27 4.86L2 22l5.29-1.26A9.93 9.93 0 0 0 12.04 22C17.57 22 22.05 17.52 22.05 12S17.57 2 12.04 2m0 18.17c-1.6 0-3.1-.44-4.38-1.2l-.31-.19-3.14.75.76-3.06-.2-.32a8.12 8.12 0 0 1-1.26-4.35c0-4.5 3.66-8.16 8.17-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.17-8.17 8.17" />
    </svg>
  );
}

/* ---------- Página ---------- */

export default function PropietariosPage() {
  /* KPIs derivados de PROPIETARIOS — nada hardcodeado */
  const total = PROPIETARIOS.length;
  const conExclusiva = PROPIETARIOS.filter((p) => p.exclusiva).length;
  const informesEnviados = PROPIETARIOS.filter((p) => !p.ultimoInforme.startsWith("Sin informe")).length;
  const pidenBajarPrecio = PROPIETARIOS.filter((p) => p.estado === "pide bajar precio").length;
  const propiedadesEnCartera = PROPIETARIOS.reduce((a, p) => a + p.cantidad, 0);

  return (
    <PageWrap>
      {/* ============ KPIs ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard
          label="Propietarios"
          valor={total}
          detalle={`${propiedadesEnCartera} propiedades en cartera`}
          tono="ink"
        />
        <KpiCard
          label="Con exclusiva"
          valor={conExclusiva}
          detalle={`${total - conExclusiva} sin exclusiva — oportunidad`}
          tono="blue"
        />
        <KpiCard
          label="Informes esta semana"
          valor={informesEnviados}
          detalle="Enviados solos el lun 13/07"
          tono="success"
        />
        <KpiCard
          label="Piden bajar precio"
          valor={pidenBajarPrecio}
          detalle="Mostrales el informe antes de ceder"
          tono="hot"
        />
      </div>

      {/* ============ La idea clave ============ */}
      <div
        className="card p-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-3.5"
        style={{ background: "#EEF4FF", borderColor: "#D6E4FF" }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#2563EB", color: "#fff" }}
        >
          <IconWhatsApp />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold" style={{ color: "#0F1B2D" }}>
            Todos los lunes le llega a cada propietario el informe de SU propiedad, por WhatsApp
          </div>
          <div className="text-[12px] mt-0.5" style={{ color: "#64748B" }}>
            Interesados, visitas y consultas de la semana. Sale solo, sin que lo pidas. Es lo que hace que el
            propietario te renueve la exclusiva en vez de irse a la de enfrente.
          </div>
        </div>
        <button className="btn btn-primary shrink-0" type="button">
          Ver informe de ejemplo
        </button>
      </div>

      {/* ============ SECCIÓN 1 — Tabla de propietarios ============ */}
      <SectionTitle
        right={
          <span className="text-[12px]" style={{ color: "#64748B" }}>
            <span className="mono">{informesEnviados}</span> de <span className="mono">{total}</span> reciben informe
            semanal
          </span>
        }
      >
        Propietarios
      </SectionTitle>

      <div className="card overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Propietario</th>
                <th>Propiedades en cartera</th>
                <th>Exclusiva</th>
                <th>Último informe semanal</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {PROPIETARIOS.map((p) => {
                const est = ESTADO_STYLE[p.estado];
                const sinInforme = p.ultimoInforme.startsWith("Sin informe");
                const diasParaVencer = ALERTA_VENCIMIENTO[p.id];

                return (
                  <tr key={p.id}>
                    {/* Propietario */}
                    <td>
                      <div className="font-semibold text-[13px]" style={{ color: "#0F1B2D" }}>
                        {p.nombre}
                      </div>
                      <div className="mono text-[11px] mt-0.5" style={{ color: "#64748B" }}>
                        {p.telefono}
                      </div>
                    </td>

                    {/* Cartera */}
                    <td>
                      <div className="flex items-start gap-2">
                        <span
                          className="chip mono shrink-0"
                          style={{ background: "#F1F5F9", color: "#64748B" }}
                          title={p.cantidad === 1 ? "1 propiedad" : `${p.cantidad} propiedades`}
                        >
                          {p.cantidad}
                        </span>
                        <span className="text-[12px] max-w-[280px]" style={{ color: "#0F1B2D" }}>
                          {p.cartera}
                        </span>
                      </div>
                    </td>

                    {/* Exclusiva */}
                    <td>
                      {p.exclusiva ? (
                        <div>
                          <span className="chip" style={{ background: "#EEF4FF", color: "#2563EB" }}>
                            Exclusiva
                          </span>
                          <div className="mono text-[11px] mt-1" style={{ color: "#64748B" }}>
                            vence {p.vencimiento}
                          </div>
                          {diasParaVencer !== undefined && (
                            <span
                              className="chip mt-1.5"
                              style={{ background: "#FEF5E4", color: "#F59E0B" }}
                            >
                              ⚠ vence en <span className="mono">{diasParaVencer}</span> días
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="chip" style={{ background: "#F1F5F9", color: "#94A3B8" }}>
                          Sin exclusiva
                        </span>
                      )}
                    </td>

                    {/* Último informe */}
                    <td>
                      <div
                        className="text-[12px] flex items-start gap-1.5 max-w-[300px]"
                        style={{ color: sinInforme ? "#94A3B8" : "#0BA45C" }}
                      >
                        {!sinInforme && <span className="shrink-0">✓</span>}
                        <span>{p.ultimoInforme}</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td>
                      <span className="chip" style={{ background: est.bg, color: est.fg }}>
                        {est.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ SECCIÓN 2 — Tasaciones pre-cargadas ============ */}
      <SectionTitle
        right={
          <span className="text-[12px]" style={{ color: "#64748B" }}>
            <span className="mono">{TASACIONES.length}</span> pre-cargadas
          </span>
        }
      >
        Tasaciones pre-cargadas por el bot
      </SectionTitle>

      <p className="text-[12.5px] mb-4 max-w-[760px]" style={{ color: "#64748B" }}>
        Cuando alguien escribe para tasar, el bot ya le saca dirección, metros, fotos y expectativa de precio antes de
        que vos te enteres. El tasador llega con la ficha hecha: no va a preguntar lo básico, va a cerrar la captación.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TASACIONES.map((t, i) => {
          const pendiente = t.agendada === "Pendiente de agendar";

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="card p-4 flex flex-col"
            >
              {/* Propietario + dirección */}
              <div className="font-semibold text-[13.5px]" style={{ color: "#0F1B2D" }}>
                {t.propietario}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: "#64748B" }}>
                {t.direccion}
              </div>

              {/* Metros + fotos */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="chip" style={{ background: "#F7F9FC", color: "#64748B" }}>
                  m² <span className="mono">{t.m2}</span>
                </span>
                <span className="chip" style={{ background: "#F7F9FC", color: "#64748B" }}>
                  <IconCamara />
                  <span className="mono">{t.fotos}</span> fotos
                </span>
              </div>

              {/* Expectativa */}
              <div className="mt-3.5 pt-3.5" style={{ borderTop: "1px solid #E5EAF2" }}>
                <div className="text-[10.5px] uppercase tracking-wide font-semibold" style={{ color: "#64748B" }}>
                  Expectativa del propietario
                </div>
                <div className="mono font-bold leading-none mt-1.5" style={{ fontSize: 22, color: "#0F1B2D" }}>
                  {t.expectativa}
                </div>
              </div>

              {/* Estado / agenda */}
              <div className="mt-3.5 pt-3.5 flex items-center gap-2" style={{ borderTop: "1px solid #E5EAF2" }}>
                {pendiente ? (
                  <>
                    <span className="text-[12px] font-medium flex-1" style={{ color: "#F59E0B" }}>
                      Pendiente de agendar
                    </span>
                    <button className="btn btn-primary shrink-0" type="button">
                      Agendar tasación
                    </button>
                  </>
                ) : (
                  <span className="text-[12px] font-medium flex items-start gap-1.5" style={{ color: "#0BA45C" }}>
                    <span className="shrink-0">✓</span>
                    <span className="mono">{t.agendada}</span>
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </PageWrap>
  );
}
