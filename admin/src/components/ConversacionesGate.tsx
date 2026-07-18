"use client";

/**
 * Puerta de entrada de Conversaciones: cada uno se identifica y va a lo suyo.
 * El empleado cae en su bandeja de Chatwoot; el dueño, en la unificada.
 *
 * Es ruteo por identidad, no control de acceso: la validación pasa en el
 * browser. Alcanza para lo que se necesita acá. Si algún día tiene que proteger
 * datos de verdad, hay que moverla a una sesión server-side.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { USUARIOS, DEMO_PASS, type Usuario } from "@/lib/mockData";

export default function ConversacionesGate({ onEntrar }: { onEntrar: (u: Usuario) => void }) {
  const [sel, setSel] = useState<Usuario>(USUARIOS[0]);
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const entrar = () => {
    if (pass === DEMO_PASS) {
      setError(false);
      onEntrar(sel);
    } else {
      setError(true);
    }
  };

  return (
    <div className="view-fade flex items-start justify-center p-5 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card w-full max-w-[420px] p-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[14px]"
            style={{ background: "linear-gradient(135deg,#2563EB,#00A3FF)" }}
          >
            🔒
          </div>
          <div className="leading-tight">
            <h2 className="text-[15px] font-semibold">Bandeja de conversaciones</h2>
            <p className="text-[11.5px] text-muted">Entrá con tu usuario</p>
          </div>
        </div>

        <p className="text-[12px] text-muted leading-relaxed mt-3 mb-4">
          Cada vendedor entra a <strong className="text-ink">su propia bandeja de Chatwoot</strong>. Todo lo que
          contesta ahí alimenta sus métricas en Equipo. El dueño entra a la bandeja unificada y ve todo junto.
        </p>

        {/* Selector de usuario */}
        <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-2">Usuario</div>
        <div className="flex flex-col gap-1.5 mb-4">
          {USUARIOS.map((u) => {
            const on = sel.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setSel(u);
                  setError(false);
                }}
                className="flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors"
                style={{
                  background: on ? "#EEF4FF" : "#F7F9FC",
                  border: `1px solid ${on ? "#2563EB" : "transparent"}`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                  style={{
                    background:
                      u.tipo === "dueno" ? "#0F1B2D" : "linear-gradient(135deg,#2563EB,#00A3FF)",
                  }}
                >
                  {u.avatar}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[12.5px] font-semibold truncate">{u.nombre}</div>
                  <div className="text-[10.5px] text-muted truncate">{u.rol}</div>
                </div>
                {u.tipo === "dueno" && (
                  <span className="chip shrink-0" style={{ background: "#0F1B2D", color: "#fff", fontSize: 9 }}>
                    DUEÑO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contraseña */}
        <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-2">Contraseña</div>
        <input
          type="password"
          className="input-field"
          placeholder="••••••••"
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          style={error ? { borderColor: "#FF4D2E" } : undefined}
        />
        {error && (
          <p className="text-[11.5px] mt-1.5" style={{ color: "#FF4D2E" }}>
            Contraseña incorrecta.
          </p>
        )}

        <button className="btn btn-primary w-full mt-4" onClick={entrar} disabled={!pass}>
          Entrar
        </button>

        <p className="text-[11px] text-muted text-center mt-3">
          Demo · la contraseña es{" "}
          <code className="mono" style={{ fontSize: 11, color: "#2563EB" }}>
            {DEMO_PASS}
          </code>
        </p>
      </motion.div>
    </div>
  );
}
