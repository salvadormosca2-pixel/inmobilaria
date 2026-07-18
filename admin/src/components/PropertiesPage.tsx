"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { Property } from "@/lib/types";
import { CATEGORIAS, OPERACIONES, ESTADOS_PROPIEDAD } from "@/lib/types";
import PropertyCard from "./PropertyCard";
import PropertyModal from "./PropertyModal";
import ConfirmDialog from "./ConfirmDialog";
import Toast from "./Toast";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterOp, setFilterOp] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProp, setEditProp] = useState<Property | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState({ message: "", visible: false });

  const fetchProps = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filterCat) params.set("categoria", filterCat);
    if (filterOp) params.set("operacion", filterOp);
    if (filterEstado) params.set("estado", filterEstado);
    const res = await fetch(`/api/properties?${params}`);
    const data = await res.json();
    setProperties(data);
    setLoading(false);
  }, [search, filterCat, filterOp, filterEstado]);

  useEffect(() => {
    fetchProps();
  }, [fetchProps]);

  function showToast(msg: string) {
    setToast({ message: msg, visible: true });
  }

  async function handleSave(data: Partial<Property>) {
    if (editProp) {
      await fetch(`/api/properties/${editProp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      showToast("Propiedad actualizada");
    } else {
      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      showToast("Propiedad creada");
    }
    setModalOpen(false);
    setEditProp(null);
    fetchProps();
  }

  async function handleDelete() {
    if (deleteId === null) return;
    await fetch(`/api/properties/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    showToast("Propiedad eliminada");
    fetchProps();
  }

  const activeFilters = [filterCat, filterOp, filterEstado].filter(Boolean).length;

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg flex-1 max-w-sm focus-within:border-gold transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted shrink-0">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar propiedad..."
              className="bg-transparent border-none outline-none text-white text-sm w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-field !py-2.5 !text-sm !w-auto">
              <option value="">Categoría</option>
              {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={filterOp} onChange={(e) => setFilterOp(e.target.value)} className="input-field !py-2.5 !text-sm !w-auto">
              <option value="">Operación</option>
              {OPERACIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="input-field !py-2.5 !text-sm !w-auto">
              <option value="">Estado</option>
              {ESTADOS_PROPIEDAD.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {activeFilters > 0 && (
              <button
                onClick={() => { setFilterCat(""); setFilterOp(""); setFilterEstado(""); }}
                className="px-3 py-2 text-xs text-red hover:bg-red/10 rounded-lg transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => { setEditProp(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-bg text-sm tracking-wider uppercase font-medium rounded-lg hover:bg-gold-hover transition-all shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva propiedad
        </button>
      </div>

      {/* Count */}
      <div className="text-sm text-muted mb-4">
        {properties.length} propiedad{properties.length !== 1 ? "es" : ""}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-muted"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-border">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p>No se encontraron propiedades</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties.map((p, i) => (
            <PropertyCard
              key={p.id}
              property={p}
              index={i}
              onEdit={(prop) => { setEditProp(prop); setModalOpen(true); }}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <PropertyModal
        isOpen={modalOpen}
        property={editProp}
        onClose={() => { setModalOpen(false); setEditProp(null); }}
        onSave={handleSave}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Eliminar propiedad"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Toast message={toast.message} visible={toast.visible} onHide={() => setToast({ ...toast, visible: false })} />
    </div>
  );
}
