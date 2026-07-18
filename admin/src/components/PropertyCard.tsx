"use client";

import { motion } from "framer-motion";
import type { Property } from "@/lib/types";

const opColors: Record<string, string> = {
  venta: "bg-gold/10 text-gold border-gold/20",
  alquiler: "bg-green/10 text-green border-green/20",
  "obra-nueva": "bg-blue/10 text-blue border-blue/20",
};
const opLabels: Record<string, string> = {
  venta: "En venta",
  alquiler: "En alquiler",
  "obra-nueva": "Obra nueva",
};
const estadoColors: Record<string, string> = {
  disponible: "bg-green/10 text-green",
  reservada: "bg-gold/10 text-gold",
  vendida: "bg-red/10 text-red",
};

function formatPrice(price: number, op: string) {
  if (op === "alquiler") return `USD ${price.toLocaleString("es-AR")}/mes`;
  if (op === "obra-nueva") return `Desde USD ${price.toLocaleString("es-AR")}`;
  return `USD ${price.toLocaleString("es-AR")}`;
}

interface Props {
  property: Property;
  onEdit: (p: Property) => void;
  onDelete: (id: number) => void;
  index: number;
}

export default function PropertyCard({ property, onEdit, onDelete, index }: Props) {
  const images: string[] = JSON.parse(property.imagenes || "[]");
  const img = images[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-gold/30 hover:-translate-y-1 transition-all duration-500 group"
    >
      {/* Image */}
      <div className="h-48 relative overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={property.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-surface2 flex items-center justify-center text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase font-medium border ${opColors[property.operacion] || "bg-gold/10 text-gold border-gold/20"}`}>
            {opLabels[property.operacion] || property.operacion}
          </span>
        </div>
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase font-medium ${estadoColors[property.estado] || "bg-muted/10 text-muted"}`}>
          {property.estado}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-gold text-[11px] tracking-widest uppercase mb-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {property.ubicacion}
        </div>
        <h3 className="font-[Cormorant_Garamond,serif] text-xl font-light mb-3">{property.titulo}</h3>

        <div className="flex gap-4 mb-4 text-muted text-sm">
          {property.dormitorios > 0 && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M2 7v10" /><path d="M6 5v14" /><path d="M2 12h20" /><path d="M18 5v14" /><path d="M22 7v10" /><rect x="8" y="7" width="8" height="5" rx="1" />
              </svg>
              {property.dormitorios}
            </span>
          )}
          {property.banos > 0 && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" /><path d="M6 12V5a2 2 0 0 1 2-2h3v2H8v7" />
              </svg>
              {property.banos}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            {property.superficie.toLocaleString("es-AR")} m²
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="font-[Cormorant_Garamond,serif] text-xl text-gold font-light">
            {formatPrice(property.precio, property.operacion)}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(property)}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all"
              title="Editar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-muted hover:text-gold">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(property.id)}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-red hover:bg-red/10 transition-all"
              title="Eliminar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-muted hover:text-red">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
