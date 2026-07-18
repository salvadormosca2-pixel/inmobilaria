"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageWrap, SectionTitle, KpiCard, Modal, Toast } from "@/components/ui";
import { PROPIEDADES, type Propiedad } from "@/lib/mockData";

/* ---------- Derivados de PROPIEDADES (nada hardcodeado) ---------- */

const totalPublicadas = PROPIEDADES.length;
const totalExclusivas = PROPIEDADES.filter((p) => p.exclusiva).length;
const totalInteresados = PROPIEDADES.reduce((a, p) => a + p.interesados, 0);
const totalCalientes = PROPIEDADES.reduce((a, p) => a + p.calientes, 0);

const BARRIOS = Array.from(new Set(PROPIEDADES.map((p) => p.barrio)));

/* ---------- Helpers de presentación ---------- */

/** Emoji según el tipo de propiedad y la operación. Sin imágenes externas. */
function emojiDe(p: Propiedad) {
  const t = p.titulo.toLowerCase();
  if (t.includes("terreno")) return "🏞️";
  if (t.includes("local")) return "🏪";
  if (t.includes("departamento") || t.includes("depto")) return "🏢";
  return p.operacion === "Alquiler" ? "🏠" : "🏡";
}

const sinInforme = (informe: string) => informe.startsWith("Sin informe");

/* ---------- Iconos inline ---------- */

function IconRayo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
      <path d="M13 2L4.5 13.2h6L11 22l8.5-11.2h-6L13 2z" />
    </svg>
  );
}

function IconEstrella() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
      <path d="M12 1.8l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.56l-6.18 3.25L7 13.94l-5-4.87 6.91-1L12 1.8z" />
    </svg>
  );
}

/* ---------- Card de propiedad ---------- */

function PropiedadCard({ p, i }: { p: Propiedad; i: number }) {
  const informeGris = sinInforme(p.informe);
  const muchoTiempo = p.dias > 60;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="card overflow-hidden flex flex-col"
    >
      {/* Foto placeholder */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: 140,
          background: "linear-gradient(135deg, #EEF4FF 0%, #F7F9FC 100%)",
          borderBottom: "1px solid #E5EAF2",
        }}
      >
        <span style={{ fontSize: 52, lineHeight: 1 }}>{emojiDe(p)}</span>
        <span
          className="chip absolute top-2.5 right-2.5"
          style={{
            background: p.operacion === "Venta" ? "#EEF4FF" : "#E7F8F0",
            color: p.operacion === "Venta" ? "#2563EB" : "#0BA45C",
          }}
        >
          {p.operacion}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {/* Exclusiva */}
        {p.exclusiva && (
          <span className="chip self-start" style={{ background: "#EEF4FF", color: "#2563EB" }}>
            <IconEstrella />
            EXCLUSIVA
          </span>
        )}

        {/* Título + barrio */}
        <div>
          <h3 className="text-[14px] font-semibold leading-snug" style={{ color: "#0F1B2D" }}>
            {p.titulo}
          </h3>
          <div className="text-[12px] mt-0.5" style={{ color: "#64748B" }}>
            {p.barrio}
          </div>
        </div>

        {/* Precio */}
        <div className="mono font-bold leading-none" style={{ fontSize: 21, color: "#0F1B2D" }}>
          {p.precio}
        </div>

        {/* Dorm / baños / m² */}
        <div className="flex items-center gap-3 text-[12px]" style={{ color: "#64748B" }}>
          {p.dorm > 0 && (
            <span>
              <span className="mono font-semibold" style={{ color: "#0F1B2D" }}>
                {p.dorm}
              </span>{" "}
              dorm
            </span>
          )}
          {p.banos > 0 && (
            <span>
              <span className="mono font-semibold" style={{ color: "#0F1B2D" }}>
                {p.banos}
              </span>{" "}
              {p.banos === 1 ? "baño" : "baños"}
            </span>
          )}
          <span>
            <span className="mono font-semibold" style={{ color: "#0F1B2D" }}>
              {p.m2}
            </span>{" "}
            m²
          </span>
        </div>

        {/* Interesados y calientes — el dato que más importa */}
        <div
          className="flex items-center gap-3 rounded-lg px-3 py-2"
          style={{ background: "#F7F9FC", border: "1px solid #E5EAF2" }}
        >
          <span className="text-[12px] font-semibold" style={{ color: "#FF4D2E" }}>
            🔥 <span className="mono">{p.calientes}</span>{" "}
            {p.calientes === 1 ? "caliente" : "calientes"}
          </span>
          <span style={{ color: "#E5EAF2" }}>·</span>
          <span className="text-[12px]" style={{ color: "#64748B" }}>
            <span className="mono font-semibold">{p.interesados}</span>{" "}
            {p.interesados === 1 ? "interesado" : "interesados"}
          </span>
        </div>

        {/* Matching automático */}
        <div className="flex items-start gap-1.5 text-[11px]" style={{ color: "#2563EB" }}>
          <span className="mt-[3px]">
            <IconRayo />
          </span>
          <span>{p.matching}</span>
        </div>

        {/* Informe al propietario */}
        <div
          className="flex items-start gap-1.5 text-[11px]"
          style={{ color: informeGris ? "#94A3B8" : "#0BA45C" }}
        >
          {!informeGris && <span className="mt-[1px]">✓</span>}
          <span>{p.informe}</span>
        </div>

        {/* Días publicados */}
        <div className="mt-auto pt-2 text-[11px]" style={{ borderTop: "1px solid #E5EAF2" }}>
          <span style={{ color: muchoTiempo ? "#F59E0B" : "#94A3B8" }}>
            <span className="mono font-semibold">{p.dias}</span> días publicada
            {muchoTiempo && " · lleva mucho sin venderse"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- Página ---------- */

export default function PropiedadesPage() {
  const [openModal, setOpenModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [operacion, setOperacion] = useState<"Venta" | "Alquiler">("Venta");
  const [barrio, setBarrio] = useState(BARRIOS[0]);

  const publicar = () => {
    setOpenModal(false);
    setToast("Propiedad publicada en web + Zonaprop. Se envió a 9 leads compatibles.");
    setTitulo("");
    setPrecio("");
    setOperacion("Venta");
    setBarrio(BARRIOS[0]);
  };

  return (
    <PageWrap>
      <SectionTitle
        right={
          <span className="text-[12px]" style={{ color: "#64748B" }}>
            Cartera disponible · Catamarca
          </span>
        }
      >
        Propiedades
      </SectionTitle>

      {/* KPIs derivados */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Publicadas"
          valor={totalPublicadas}
          detalle="Disponibles en web + portales"
          tono="ink"
        />
        <KpiCard
          label="En exclusiva"
          valor={totalExclusivas}
          detalle={`de ${totalPublicadas} · reciben informe semanal`}
          tono="blue"
        />
        <KpiCard
          label="Interesados totales"
          valor={totalInteresados}
          detalle="Consultas activas sobre la cartera"
          tono="ink"
        />
        <KpiCard
          label="🔥 Calientes totales"
          valor={totalCalientes}
          detalle="Calificadas por la IA, listas para visita"
          tono="hot"
        />
      </div>

      {/* Grid de propiedades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {PROPIEDADES.map((p, i) => (
          <PropiedadCard key={p.id} p={p} i={i} />
        ))}

        {/* Card de carga */}
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="flex flex-col items-center justify-center text-center gap-2 p-6 min-h-[320px] transition-colors"
          style={{
            border: "1px dashed #CBD5E1",
            borderRadius: 12,
            background: "#fff",
            boxShadow: "none",
            cursor: "pointer",
          }}
        >
          <span
            className="flex items-center justify-center rounded-full"
            style={{ width: 46, height: 46, background: "#EEF4FF", color: "#2563EB", fontSize: 26, lineHeight: 1 }}
          >
            +
          </span>
          <span className="text-[14px] font-semibold" style={{ color: "#0F1B2D" }}>
            Cargar propiedad
          </span>
          <span className="text-[12px] max-w-[220px]" style={{ color: "#64748B" }}>
            Se publica en tu web + portales en 1 clic y dispara el matching automático
          </span>
        </button>
      </div>

      {/* Modal de carga */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Cargar propiedad">
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "#0F1B2D" }}>
              Título
            </label>
            <input
              className="input-field"
              placeholder="Casa 3 dorm c/ cochera doble"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "#0F1B2D" }}>
                Precio
              </label>
              <input
                className="input-field mono"
                placeholder="USD 89.000"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "#0F1B2D" }}>
                Operación
              </label>
              <select
                className="input-field"
                value={operacion}
                onChange={(e) => setOperacion(e.target.value as "Venta" | "Alquiler")}
              >
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "#0F1B2D" }}>
              Barrio
            </label>
            <select className="input-field" value={barrio} onChange={(e) => setBarrio(e.target.value)}>
              {BARRIOS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div
            className="flex items-start gap-1.5 text-[11px] rounded-lg px-3 py-2"
            style={{ background: "#EEF4FF", color: "#2563EB" }}
          >
            <span className="mt-[3px]">
              <IconRayo />
            </span>
            <span>
              Al publicarla, la IA la manda sola a todos los leads que matchean con el precio y la zona.
              No tenés que avisarle a nadie.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn" onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={publicar}>
              Publicar y disparar matching
            </button>
          </div>
        </div>
      </Modal>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </PageWrap>
  );
}
