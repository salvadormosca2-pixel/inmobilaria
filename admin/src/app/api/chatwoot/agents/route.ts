import { NextResponse } from "next/server";
import { leerConfig, fetchAgentReports, clasificar } from "@/lib/chatwoot";
import { AGENTES } from "@/lib/mockData";

/**
 * LA CONEXIÓN con Chatwoot. Es el único punto del sistema que lee los datos de
 * los que sale la clasificación de cada empleado.
 *
 * Corre en el SERVIDOR a propósito: el api_access_token da acceso a todas las
 * conversaciones de la cuenta. Si esto se leyera desde un componente cliente, el
 * token viajaría en el bundle de JS y quedaría a la vista de cualquiera. Por eso
 * la lectura pasa por acá y el browser solo ve el resultado ya clasificado.
 *
 * Hoy: no hay env vars → devuelve los datos demo, ya clasificados.
 * Mañana: definís estas cuatro y empieza a leer Chatwoot real, sin tocar la UI.
 *
 *   CHATWOOT_URL=https://chatwoot.tuinmobiliaria.com
 *   CHATWOOT_ACCOUNT_ID=1
 *   CHATWOOT_ACCOUNT_TOKEN=<token de perfil, para reportes>
 *   CHATWOOT_PLATFORM_TOKEN=<token del platform app, para los links SSO>
 *
 * El puente entre los dos sistemas es AGENTES[].chatwoot.id, que es el user id
 * del vendedor EN Chatwoot. Si eso no coincide, no hay clasificación que valga.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dias = Number(searchParams.get("dias") ?? 30);
  const hasta = new Date();
  const desde = new Date(hasta.getTime() - dias * 86400_000);

  const cfg = leerConfig();

  // Sin instancia configurada: demo.
  if (!cfg) {
    return NextResponse.json({
      fuente: "demo",
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      agentes: AGENTES.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        area: a.area,
        chatwoot: a.chatwoot,
        clasificacion: clasificar(a.chatwoot),
      })),
    });
  }

  try {
    const reportes = await fetchAgentReports(cfg, desde, hasta);

    // Se cruza por el user id de Chatwoot, no por el nombre: los nombres cambian.
    const agentes = AGENTES.map((a) => {
      const r = reportes.find((x) => x.id === a.chatwoot.id);
      if (!r) return { id: a.id, nombre: a.nombre, area: a.area, chatwoot: null, clasificacion: null };
      return { id: a.id, nombre: a.nombre, area: a.area, chatwoot: r, clasificacion: clasificar(r) };
    });

    return NextResponse.json({
      fuente: "chatwoot",
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      agentes,
    });
  } catch (e) {
    // Si Chatwoot se cae, se dice. No se devuelve el mock haciéndolo pasar por real.
    return NextResponse.json(
      { fuente: "error", error: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    );
  }
}
