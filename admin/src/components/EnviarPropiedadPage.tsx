"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Toast } from "@/components/ui";
import { EnviarModal } from "@/components/EnviarModal";
import { PROPIEDADES_FULL } from "@/lib/mockData";
import type { PropiedadFull } from "@/lib/mockData";

/**
 * Sección para que el vendedor le mande una propiedad (todas sus fotos) a un cliente.
 * Flujo: elegís la propiedad → se juntan todas sus imágenes → Enviar → elegís el/los
 * clientes → sale por WhatsApp (Evolution API). Pensado para leads ya derivados.
 */
export default function EnviarPropiedadPage() {
  const [q, setQ] = useState("");
  const [op, setOp] = useState<"todas" | "Venta" | "Alquiler">("todas");
  const [selId, setSelId] = useState<string | null>(PROPIEDADES_FULL[0]?.id ?? null);
  const [enviarOpen, setEnviarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return PROPIEDADES_FULL.filter(
      (p) =>
        (op === "todas" || p.operacion === op) &&
        (!t || p.titulo.toLowerCase().includes(t) || p.barrio.toLowerCase().includes(t))
    );
  }, [q, op]);

  const sel: PropiedadFull | null = selId
    ? PROPIEDADES_FULL.find((p) => p.id === selId) ?? null
    : null;

  return (
    <div className="view-fade p-5 lg:p-6 max-w-[1500px] mx-auto">
      {/* Intro */}
      <div className="mb-4 max-w-[820px]">
        <h1 className="text-[20px] font-semibold leading-tight" style={{ color: "#0F1B2D" }}>
          Mandale la propiedad al cliente, con todas las fotos
        </h1>
        <p className="text-[12.5px] mt-1.5" style={{ color: "#64748B" }}>
          Elegí una propiedad, mirá todas sus imágenes juntas y enviásela al cliente por WhatsApp en dos toques.
          Ideal cuando el lead ya se derivó y el vendedor está hablando con él — sin buscar las fotos en ningún lado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Lista de propiedades */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            {(["todas", "Venta", "Alquiler"] as const).map((o) => {
              const activo = op === o;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOp(o)}
                  className="btn"
                  style={
                    activo
                      ? { background: "#EEF4FF", borderColor: "#2563EB", color: "#2563EB" }
                      : { color: "#64748B", borderColor: "#E5EAF2" }
                  }
                >
                  {o === "todas" ? "Todas" : o}
                </button>
              );
            })}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar propiedad…"
            className="input-field w-full"
          />
          <div className="flex flex-col gap-2 lg:max-h-[64vh] lg:overflow-y-auto lg:pr-1">
            {lista.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelId(p.id)}
                className="card overflow-hidden text-left transition-transform hover:-translate-y-0.5"
                style={{ borderColor: selId === p.id ? "#2563EB" : undefined }}
              >
                <div className="flex gap-3 p-2.5">
                  <div className="w-20 h-[62px] rounded-lg overflow-hidden shrink-0" style={{ background: "#F1F5F9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imagenes[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold leading-snug truncate">{p.titulo}</div>
                    <div className="text-[11.5px] text-muted">{p.barrio}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="mono font-bold text-[12.5px]" style={{ color: "#0F1B2D" }}>
                        {p.precio}
                      </span>
                      <span className="text-[10.5px] text-muted">· {p.imagenes.length} fotos</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {lista.length === 0 && (
              <div className="card p-6 text-center text-[12.5px] text-muted">No hay propiedades con ese filtro.</div>
            )}
          </div>
        </div>

        {/* Propiedad seleccionada + galería */}
        <div className="card p-5">
          {sel ? (
            <motion.div key={sel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted">{sel.barrio} · Catamarca</div>
                  <h2 className="text-[20px] font-semibold" style={{ color: "#0F1B2D" }}>
                    {sel.titulo}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="chip"
                      style={
                        sel.operacion === "Venta"
                          ? { background: "#EEF4FF", color: "#2563EB" }
                          : { background: "#F3EEFF", color: "#7C3AED" }
                      }
                    >
                      {sel.operacion}
                    </span>
                    <span className="mono font-bold text-[16px]" style={{ color: "#0F1B2D" }}>
                      {sel.precio}
                    </span>
                    <span className="text-[12px] text-muted">
                      · {sel.dorm > 0 ? `${sel.dorm} dorm · ` : ""}
                      {sel.banos > 0 ? `${sel.banos} baños · ` : ""}
                      {sel.m2} m²
                    </span>
                  </div>
                </div>
                <button type="button" onClick={() => setEnviarOpen(true)} className="btn btn-primary">
                  Enviar a un cliente
                </button>
              </div>

              {/* Galería: todas las imágenes juntas */}
              <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mt-5 mb-2">
                {sel.imagenes.length} fotos — se envían todas
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {sel.imagenes.map((u, i) => (
                  <div
                    key={i}
                    className="rounded-lg overflow-hidden"
                    style={{ background: "#F1F5F9", aspectRatio: "4/3" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt={`${sel.titulo} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>

              <p className="text-[13px] leading-relaxed mt-4" style={{ color: "#475569" }}>
                {sel.descripcion}
              </p>
            </motion.div>
          ) : (
            <div className="text-center py-16 text-muted">
              <p className="text-[13px] font-medium">Elegí una propiedad de la izquierda</p>
              <p className="text-[12px] mt-1">Vas a ver todas sus fotos listas para enviar.</p>
            </div>
          )}
        </div>
      </div>

      <EnviarModal
        propiedad={sel}
        open={enviarOpen}
        onClose={() => setEnviarOpen(false)}
        onSent={(m) => setToast(m)}
      />

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
