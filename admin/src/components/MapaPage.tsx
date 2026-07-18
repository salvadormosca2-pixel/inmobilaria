"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Toast } from "@/components/ui";
import { EnviarModal } from "@/components/EnviarModal";
import { PROPIEDADES_FULL, precioCorto } from "@/lib/mockData";
import type { PropiedadFull } from "@/lib/mockData";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ---------- Carga de Leaflet por CDN (una sola vez) ---------- */
function useLeaflet() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if ((window as any).L) {
      setReady(true);
      return;
    }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    let s = document.getElementById("leaflet-js") as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement("script");
      s.id = "leaflet-js";
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.async = true;
      document.body.appendChild(s);
    }
    const onLoad = () => setReady(true);
    if ((s as any)._loaded) setReady(true);
    else s.addEventListener("load", onLoad);
    return () => s?.removeEventListener("load", onLoad);
  }, []);
  return ready;
}

/* ---------- Zonas derivadas ---------- */
const ZONAS = PROPIEDADES_FULL.reduce<string[]>((acc, p) => {
  if (!acc.includes(p.barrio)) acc.push(p.barrio);
  return acc;
}, []);

const mapsLink = (p: PropiedadFull) => `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;

export default function MapaPage() {
  const ready = useLeaflet();
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const [op, setOp] = useState<"todas" | "Venta" | "Alquiler">("todas");
  const [zona, setZona] = useState<string>("todas");
  const [selId, setSelId] = useState<string | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [enviarProp, setEnviarProp] = useState<PropiedadFull | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const matches = useMemo(
    () => (p: PropiedadFull) =>
      (op === "todas" || p.operacion === op) && (zona === "todas" || p.barrio === zona),
    [op, zona]
  );

  const visibles = useMemo(() => PROPIEDADES_FULL.filter(matches), [matches]);
  const sel = selId ? PROPIEDADES_FULL.find((p) => p.id === selId) ?? null : null;

  /* Init del mapa */
  useEffect(() => {
    if (!ready || !mapEl.current || mapRef.current) return;
    const L = (window as any).L;
    const map = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: true }).setView(
      [-28.462, -65.771],
      13
    );
    map.zoomControl.setPosition("topright");
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map);
    mapRef.current = map;

    PROPIEDADES_FULL.forEach((p) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="crm-pin op-${p.operacion.toLowerCase()}" data-id="${p.id}"><div class="crm-pin-tag">${precioCorto(
          p.precio
        )}</div></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      const m = L.marker([p.lat, p.lng], { icon, riseOnHover: true }).addTo(map);
      m.on("click", () => openDetalle(p.id));
      markersRef.current[p.id] = m;
    });

    setTimeout(() => map.invalidateSize(), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* Filtrado → mostrar/ocultar pines + encuadre */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const L = (window as any).L;
    const pts: [number, number][] = [];
    PROPIEDADES_FULL.forEach((p) => {
      const vis = matches(p);
      const m = markersRef.current[p.id];
      if (m && m._icon) m._icon.style.display = vis ? "" : "none";
      if (vis) pts.push([p.lat, p.lng]);
    });
    if (pts.length) map.flyToBounds(L.latLngBounds(pts).pad(0.3), { duration: 0.5, maxZoom: 15 });
  }, [matches, ready]);

  /* Resaltar pin seleccionado */
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, m]: [string, any]) => {
      const pin = m._icon?.querySelector(".crm-pin");
      if (pin) pin.classList.toggle("active", id === selId);
    });
  }, [selId]);

  function openDetalle(id: string) {
    setSelId(id);
    setHeroIdx(0);
    const p = PROPIEDADES_FULL.find((x) => x.id === id);
    const map = mapRef.current;
    if (p && map) map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 15), { duration: 0.5 });
  }

  return (
    <div className="view-fade p-5 lg:p-6 max-w-[1500px] mx-auto">
      {/* Estilos de los pines (globales) */}
      <style>{`
        .crm-pin{display:inline-block;transform:translate(-50%,-100%);cursor:pointer}
        .crm-pin-tag{display:inline-block;position:relative;font-family:'Space Mono',ui-monospace,monospace;font-size:11.5px;font-weight:600;color:#fff;background:#2563EB;padding:4px 9px;border-radius:6px;white-space:nowrap;box-shadow:0 3px 10px rgba(15,27,45,.25);border:1.5px solid #2563EB;transition:transform .15s}
        .crm-pin-tag::after{content:'';position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #2563EB}
        .crm-pin:hover .crm-pin-tag{transform:scale(1.07)}
        .crm-pin.op-alquiler .crm-pin-tag{background:#7C3AED;border-color:#7C3AED}
        .crm-pin.op-alquiler .crm-pin-tag::after{border-top-color:#7C3AED}
        .crm-pin.active .crm-pin-tag{background:#0F1B2D;border-color:#0F1B2D;transform:scale(1.07)}
        .crm-pin.active .crm-pin-tag::after{border-top-color:#0F1B2D}
      `}</style>

      {/* Intro */}
      <div className="mb-4 max-w-[820px]">
        <h1 className="text-[20px] font-semibold leading-tight" style={{ color: "#0F1B2D" }}>
          Tu cartera en el mapa
        </h1>
        <p className="text-[12.5px] mt-1.5" style={{ color: "#64748B" }}>
          Las mismas propiedades del CRM, ubicadas en Catamarca. Filtrá por zona, tocá una para ver sus fotos y
          detalles, y mandásela al cliente en dos toques. Es el mismo mapa que puede ver el cliente desde la web.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-4">
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
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setZona("todas")}
            className="btn"
            style={
              zona === "todas"
                ? { background: "#EEF4FF", borderColor: "#2563EB", color: "#2563EB" }
                : { color: "#64748B", borderColor: "#E5EAF2" }
            }
          >
            Todas las zonas
          </button>
          {ZONAS.map((z) => {
            const activo = zona === z;
            return (
              <button
                key={z}
                type="button"
                onClick={() => setZona(z)}
                className="btn"
                style={
                  activo
                    ? { background: "#EEF4FF", borderColor: "#2563EB", color: "#2563EB" }
                    : { color: "#64748B", borderColor: "#E5EAF2" }
                }
              >
                {z}
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout: lista + mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* Lista */}
        <div className="flex flex-col gap-2.5 lg:max-h-[72vh] lg:overflow-y-auto lg:pr-1">
          <div className="text-[12px] text-muted mb-0.5">
            <span className="mono font-semibold" style={{ color: "#0F1B2D" }}>
              {visibles.length}
            </span>{" "}
            {visibles.length === 1 ? "propiedad" : "propiedades"}
          </div>
          {visibles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => openDetalle(p.id)}
              className="card overflow-hidden text-left transition-transform hover:-translate-y-0.5"
              style={{ borderColor: selId === p.id ? "#2563EB" : undefined }}
            >
              <div className="flex gap-3 p-2.5">
                <div className="w-24 h-[70px] rounded-lg overflow-hidden shrink-0" style={{ background: "#F1F5F9" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imagenes[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="chip"
                      style={
                        p.operacion === "Venta"
                          ? { background: "#EEF4FF", color: "#2563EB" }
                          : { background: "#F3EEFF", color: "#7C3AED" }
                      }
                    >
                      {p.operacion}
                    </span>
                    {p.exclusiva && (
                      <span className="chip" style={{ background: "#FEF5E4", color: "#F59E0B" }}>
                        Exclusiva
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] font-semibold mt-1 leading-snug truncate">{p.titulo}</div>
                  <div className="text-[11.5px] text-muted">{p.barrio}</div>
                  <div className="mono font-bold text-[13px] mt-0.5" style={{ color: "#0F1B2D" }}>
                    {p.precio}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Mapa */}
        <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: "72vh", minHeight: 420 }}>
          <div ref={mapEl} className="absolute inset-0" style={{ background: "#EAF0F6" }} />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-[13px] text-muted">
              Cargando mapa…
            </div>
          )}
        </div>
      </div>

      {/* Detalle */}
      <Modal open={sel !== null} onClose={() => setSelId(null)} title={sel ? sel.titulo : ""} width={640}>
        {sel && (
          <div>
            {/* Galería */}
            <div className="rounded-xl overflow-hidden" style={{ background: "#F1F5F9", aspectRatio: "16/10" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sel.imagenes[heroIdx]} alt={sel.titulo} className="w-full h-full object-cover" />
            </div>
            {sel.imagenes.length > 1 && (
              <div className="flex gap-2 mt-2">
                {sel.imagenes.map((u, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHeroIdx(i)}
                    className="w-16 h-12 rounded-lg overflow-hidden shrink-0"
                    style={{ border: `2px solid ${i === heroIdx ? "#2563EB" : "transparent"}`, opacity: i === heroIdx ? 1 : 0.6 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Encabezado */}
            <div className="flex items-start justify-between gap-3 mt-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted">{sel.barrio} · Catamarca</div>
                <div className="text-[18px] font-semibold" style={{ color: "#0F1B2D" }}>
                  {sel.titulo}
                </div>
              </div>
              <div className="mono font-bold text-[18px] shrink-0" style={{ color: sel.operacion === "Venta" ? "#2563EB" : "#7C3AED" }}>
                {sel.precio}
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { v: sel.dorm > 0 ? sel.dorm : "—", l: "Dormitorios" },
                { v: sel.banos > 0 ? sel.banos : "—", l: "Baños" },
                { v: sel.m2, l: "m²" },
              ].map((s, i) => (
                <div key={i} className="rounded-lg text-center py-3" style={{ background: "#F7F9FC" }}>
                  <div className="mono font-bold text-[18px]" style={{ color: "#0F1B2D" }}>
                    {s.v}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Descripción */}
            <p className="text-[13px] leading-relaxed mt-4" style={{ color: "#475569" }}>
              {sel.descripcion}
            </p>

            {/* Contexto CRM */}
            <div className="flex items-center gap-4 mt-4 text-[12px]">
              <span style={{ color: "#64748B" }}>
                <span className="mono font-semibold" style={{ color: "#0F1B2D" }}>
                  {sel.interesados}
                </span>{" "}
                interesados
              </span>
              <span style={{ color: "#64748B" }}>
                <span className="mono font-semibold" style={{ color: "#FF4D2E" }}>
                  {sel.calientes}
                </span>{" "}
                calientes
              </span>
              <span className="text-muted">· publicada hace {sel.dias} días</span>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  const p = sel;
                  setSelId(null);
                  setEnviarProp(p);
                }}
                className="btn btn-primary flex-1 justify-center"
              >
                Enviar a un cliente
              </button>
              <a
                href={mapsLink(sel)}
                target="_blank"
                rel="noopener"
                className="btn justify-center"
                style={{ color: "#64748B", borderColor: "#E5EAF2" }}
              >
                Cómo llegar
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Enviar */}
      <EnviarModal
        propiedad={enviarProp}
        open={enviarProp !== null}
        onClose={() => setEnviarProp(null)}
        onSent={(m) => setToast(m)}
      />

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
