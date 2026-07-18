"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, CanalBadge, AreaChip } from "@/components/ui";
import { CONVERSACIONES } from "@/lib/mockData";
import type { PropiedadFull } from "@/lib/mockData";

/**
 * Modal para enviarle una propiedad (todas sus fotos) a uno o varios clientes.
 * El envío sale por WhatsApp vía Evolution API — hoy simulado (sin credenciales).
 * Pensado para cuando el lead ya se derivó a un vendedor.
 */
export function EnviarModal({
  propiedad,
  open,
  onClose,
  onSent,
}: {
  propiedad: PropiedadFull | null;
  open: boolean;
  onClose: () => void;
  onSent: (msg: string) => void;
}) {
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (open && propiedad) {
      setSel([]);
      setQ("");
      setMensaje(
        `Hola! Te comparto esta propiedad de Jose Greco: ${propiedad.titulo} — ${propiedad.barrio}, ${propiedad.precio}. Te mando las fotos 👇`
      );
    }
  }, [open, propiedad]);

  const clientes = useMemo(() => {
    const t = q.trim().toLowerCase();
    return CONVERSACIONES.filter((c) => !t || c.nombre.toLowerCase().includes(t));
  }, [q]);

  function toggle(id: string) {
    setSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function enviar() {
    if (!propiedad || sel.length === 0) return;
    const nombres = sel
      .map((id) => CONVERSACIONES.find((c) => c.id === id)?.nombre)
      .filter(Boolean) as string[];
    const dest = nombres.length === 1 ? nombres[0] : `${nombres.length} clientes`;
    onSent(`${propiedad.imagenes.length} fotos de “${propiedad.titulo}” enviadas a ${dest} por WhatsApp`);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Enviar propiedad a un cliente" width={600}>
      {propiedad && (
        <div>
          {/* Propiedad + fotos que se envían */}
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: "#F1F5F9" }}>
              {propiedad.imagenes[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={propiedad.imagenes[0]} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[13.5px] truncate">{propiedad.titulo}</div>
              <div className="text-[12px] text-muted">
                {propiedad.barrio} · <span className="mono">{propiedad.precio}</span>
              </div>
              <div className="text-[11.5px] mt-0.5" style={{ color: "#2563EB" }}>
                Se enviarán {propiedad.imagenes.length} fotos
              </div>
            </div>
          </div>

          {/* Miniaturas de lo que va */}
          <div className="flex gap-1.5 mt-3">
            {propiedad.imagenes.map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={u}
                alt=""
                className="w-12 h-10 rounded object-cover border border-border"
              />
            ))}
          </div>

          {/* Mensaje */}
          <label className="text-[11px] uppercase tracking-wide text-muted font-semibold block mt-4">
            Mensaje
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={3}
            className="input-field mt-1.5 w-full"
            style={{ resize: "vertical", lineHeight: 1.5 }}
          />

          {/* Selección de clientes */}
          <div className="flex items-center justify-between mt-4 mb-2">
            <label className="text-[11px] uppercase tracking-wide text-muted font-semibold">
              Elegí el / los clientes
            </label>
            <span className="text-[11.5px] mono" style={{ color: sel.length ? "#2563EB" : "#94A3B8" }}>
              {sel.length} seleccionado{sel.length === 1 ? "" : "s"}
            </span>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar cliente…"
            className="input-field w-full mb-2"
          />
          <div className="max-h-[220px] overflow-y-auto flex flex-col gap-1.5 pr-1">
            {clientes.map((c) => {
              const activo = sel.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="flex items-center gap-3 p-2 rounded-lg text-left transition-colors"
                  style={{
                    border: `1px solid ${activo ? "#2563EB" : "#E5EAF2"}`,
                    background: activo ? "#EEF4FF" : "#fff",
                  }}
                >
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0 text-white text-[10px]"
                    style={{ background: activo ? "#2563EB" : "#E5EAF2" }}
                  >
                    {activo ? "✓" : ""}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate">{c.nombre}</div>
                    <div className="text-[11px] text-muted truncate">
                      {c.asignadoA ? `Derivado a ${c.asignadoA.nombre}` : "Sin asignar · lo sigue la IA"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <CanalBadge canal={c.canal} />
                    <AreaChip area={c.area} mini />
                  </div>
                </button>
              );
            })}
            {clientes.length === 0 && (
              <div className="text-center text-[12px] text-muted py-6">No hay clientes con ese nombre.</div>
            )}
          </div>

          {/* Nota Evolution API */}
          <div
            className="mt-3 rounded-lg px-3 py-2 text-[11.5px] flex items-center gap-2"
            style={{ background: "#E7F8F0", color: "#0BA45C" }}
          >
            <span style={{ fontSize: 13 }}>✓</span>
            Las fotos salen por WhatsApp vía Evolution API desde el número de la inmobiliaria.
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ color: "#64748B", borderColor: "#E5EAF2" }}
            >
              Cancelar
            </button>
            <button type="button" onClick={enviar} className="btn btn-primary" disabled={sel.length === 0}>
              Enviar por WhatsApp
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
