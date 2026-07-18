"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Property } from "@/lib/types";
import { CATEGORIAS, OPERACIONES, ESTADOS_PROPIEDAD, ETIQUETAS } from "@/lib/types";

interface Props {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
  onSave: (data: Partial<Property>) => void;
}

const empty = {
  titulo: "",
  descripcion: "",
  precio: 0,
  categoria: "casa",
  operacion: "venta",
  estado: "disponible",
  dormitorios: 0,
  banos: 0,
  superficie: 0,
  ubicacion: "",
  imagenes: "[]",
  etiqueta: "Nueva",
};

export default function PropertyModal({ isOpen, property, onClose, onSave }: Props) {
  const [form, setForm] = useState(empty);
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (property) {
      setForm({
        titulo: property.titulo,
        descripcion: property.descripcion,
        precio: property.precio,
        categoria: property.categoria,
        operacion: property.operacion,
        estado: property.estado,
        dormitorios: property.dormitorios,
        banos: property.banos,
        superficie: property.superficie,
        ubicacion: property.ubicacion,
        imagenes: property.imagenes,
        etiqueta: property.etiqueta,
      });
      const imgs = JSON.parse(property.imagenes || "[]");
      setImageUrl(imgs[0] || "");
    } else {
      setForm(empty);
      setImageUrl("");
    }
    setErrors({});
  }, [property, isOpen]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.titulo.trim()) e.titulo = "Requerido";
    if (!form.ubicacion.trim()) e.ubicacion = "Requerido";
    if (!form.precio || form.precio <= 0) e.precio = "Debe ser mayor a 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const imgs = imageUrl.trim() ? JSON.stringify([imageUrl.trim()]) : "[]";
    onSave({ ...form, imagenes: imgs });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-surface border border-border rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-border">
              <h3 className="font-[Cormorant_Garamond,serif] text-xl font-normal">
                {property ? "Editar propiedad" : "Nueva propiedad"}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-red hover:bg-red/10 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Título" error={errors.titulo}>
                  <input
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ej: Residencia Las Pirquitas"
                    className="input-field"
                  />
                </Field>
                <Field label="Ubicación" error={errors.ubicacion}>
                  <input
                    value={form.ubicacion}
                    onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                    placeholder="Ej: Valle Viejo"
                    className="input-field"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Categoría">
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="input-field">
                    {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Operación">
                  <select value={form.operacion} onChange={(e) => setForm({ ...form, operacion: e.target.value })} className="input-field">
                    {OPERACIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Precio (USD)" error={errors.precio}>
                  <input
                    type="number"
                    value={form.precio || ""}
                    onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                    placeholder="285000"
                    className="input-field"
                  />
                </Field>
                <Field label="Dormitorios">
                  <input
                    type="number"
                    value={form.dormitorios || ""}
                    onChange={(e) => setForm({ ...form, dormitorios: Number(e.target.value) })}
                    min={0}
                    className="input-field"
                  />
                </Field>
                <Field label="Baños">
                  <input
                    type="number"
                    value={form.banos || ""}
                    onChange={(e) => setForm({ ...form, banos: Number(e.target.value) })}
                    min={0}
                    className="input-field"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Superficie (m²)">
                  <input
                    type="number"
                    value={form.superficie || ""}
                    onChange={(e) => setForm({ ...form, superficie: Number(e.target.value) })}
                    className="input-field"
                  />
                </Field>
                <Field label="Estado">
                  <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="input-field">
                    {ESTADOS_PROPIEDAD.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Etiqueta">
                  <select value={form.etiqueta} onChange={(e) => setForm({ ...form, etiqueta: e.target.value })} className="input-field">
                    {ETIQUETAS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="URL de imagen">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field"
                />
                {imageUrl && (
                  <div className="mt-2 w-20 h-14 rounded-lg overflow-hidden border border-border">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
              </Field>

              <Field label="Descripción">
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción detallada..."
                  rows={3}
                  className="input-field resize-none"
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-7 py-4 border-t border-border">
              <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-white hover:border-white transition-all">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="px-6 py-2.5 bg-gold text-bg rounded-lg text-sm font-medium tracking-wider uppercase hover:bg-gold-hover transition-all">
                {property ? "Guardar cambios" : "Crear propiedad"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] tracking-widest uppercase text-muted mb-1.5">{label}</label>
      {children}
      {error && <span className="text-red text-xs mt-1 block">{error}</span>}
    </div>
  );
}
