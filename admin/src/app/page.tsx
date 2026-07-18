"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

import HoyPage from "@/components/HoyPage";
import ConversacionesPage from "@/components/ConversacionesPage";
import PipelinePage from "@/components/PipelinePage";
import LeadsPage from "@/components/LeadsPage";
import SeguimientoPage from "@/components/SeguimientoPage";
import EnviarPropiedadPage from "@/components/EnviarPropiedadPage";
import PropiedadesPage from "@/components/PropiedadesPage";
import MapaPage from "@/components/MapaPage";
import PropietariosPage from "@/components/PropietariosPage";
import ContratosPage from "@/components/ContratosPage";
import VisitasPage from "@/components/VisitasPage";
import AgentesPage from "@/components/AgentesPage";
import AutomatizacionesPage from "@/components/AutomatizacionesPage";
import MetricasPage from "@/components/MetricasPage";

/** Cada vista responde una pregunta que el dueño se hace todos los días. */
const META: Record<string, { title: string; subtitle: string }> = {
  hoy: { title: "Hoy", subtitle: "Jueves 16 de julio · qué entró y qué necesita tu decisión" },
  conversaciones: { title: "Conversaciones", subtitle: "Bandeja unificada · WhatsApp, Instagram, Zonaprop, Facebook y web" },
  pipeline: { title: "Pipeline", subtitle: "¿Quién está caliente y cuánta comisión hay en juego?" },
  leads: { title: "Leads", subtitle: "Todos los interesados, su score y qué va a hacer la IA con cada uno" },
  seguimiento: { title: "Seguimiento", subtitle: "El que se interesó y no compró: recuperalo antes de que se lo lleve otro" },
  enviar: { title: "Enviar propiedad", subtitle: "Mandale una propiedad al cliente con todas sus fotos, por WhatsApp" },
  propiedades: { title: "Propiedades", subtitle: "Tu cartera publicada y cuánto interés genera cada una" },
  mapa: { title: "Mapa", subtitle: "Tu cartera ubicada en Catamarca — el mismo mapa que ve el cliente" },
  propietarios: { title: "Propietarios", subtitle: "El activo más descuidado: quién te confía su propiedad y cómo está" },
  contratos: { title: "Contratos y alquileres", subtitle: "¿Quién me debe, qué contrato vence y cuánto liquido?" },
  visitas: { title: "Visitas", subtitle: "¿Qué visita tengo y quién la confirmó?" },
  agentes: { title: "Equipo", subtitle: "Quién recibe las calientes y qué hace con ellas" },
  automatizaciones: { title: "Automatizaciones", subtitle: "Lo que el sistema hace solo mientras vos trabajás" },
  metricas: { title: "Métricas y facturación", subtitle: "¿Cuánto entró, cuánto se fugó y cuánto se facturó?" },
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState("hoy");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const meta = META[currentPage] ?? META.hoy;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 lg:ml-[260px] min-h-screen min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setSidebarOpen(true)} />

        {/* key fuerza el remount → dispara la animación de fade en cada cambio de vista */}
        <div key={currentPage}>
          {currentPage === "hoy" && <HoyPage onNavigate={setCurrentPage} />}
          {currentPage === "conversaciones" && <ConversacionesPage />}
          {currentPage === "pipeline" && <PipelinePage />}
          {currentPage === "leads" && <LeadsPage />}
          {currentPage === "seguimiento" && <SeguimientoPage />}
          {currentPage === "enviar" && <EnviarPropiedadPage />}
          {currentPage === "propiedades" && <PropiedadesPage />}
          {currentPage === "mapa" && <MapaPage />}
          {currentPage === "propietarios" && <PropietariosPage />}
          {currentPage === "contratos" && <ContratosPage />}
          {currentPage === "visitas" && <VisitasPage />}
          {currentPage === "agentes" && <AgentesPage />}
          {currentPage === "automatizaciones" && <AutomatizacionesPage />}
          {currentPage === "metricas" && <MetricasPage />}
        </div>
      </div>
    </div>
  );
}
