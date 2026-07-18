import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardN8n } from "@/lib/n8n";
import { leerEvolutionConfig, enviarImagen, enviarTexto } from "@/lib/evolution";

/**
 * Manda por WhatsApp la FICHA de una propiedad: sus FOTOS + toda la info
 * (precio, características, zona). Este es el tool `enviar_propiedad` del Cerebro
 * IA, y también lo puede usar la app (EnviarPropiedad) para mandar una ficha a
 * mano.
 *
 * Body: { telefono, propertyId, nota? }
 *
 * La primera foto va con el caption completo (título, precio, detalle); las
 * demás fotos van sueltas para que se vean todas en el chat.
 */
export async function POST(req: NextRequest) {
  const no = guardN8n(req);
  if (no) return no;

  const cfg = leerEvolutionConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "Evolution no configurado" },
      { status: 503 }
    );
  }

  const { telefono, propertyId, nota } = await req.json();
  if (!telefono || !propertyId) {
    return NextResponse.json({ error: "telefono y propertyId requeridos" }, { status: 400 });
  }

  const prop = await prisma.property.findUnique({ where: { id: Number(propertyId) } });
  if (!prop) {
    return NextResponse.json({ error: "propiedad no encontrada" }, { status: 404 });
  }

  // imagenes es un JSON array de URLs guardado como texto.
  let imagenes: string[] = [];
  try {
    const parsed = JSON.parse(prop.imagenes || "[]");
    if (Array.isArray(parsed)) imagenes = parsed.filter((u) => typeof u === "string");
  } catch {
    imagenes = [];
  }

  const moneda = prop.operacion === "alquiler" ? "$/mes" : "USD";
  const precio = prop.operacion === "alquiler"
    ? `$${prop.precio.toLocaleString("es-AR")}/mes`
    : `${moneda} ${prop.precio.toLocaleString("es-AR")}`;

  const detalle = [
    prop.dormitorios ? `${prop.dormitorios} dorm` : null,
    prop.banos ? `${prop.banos} baños` : null,
    prop.superficie ? `${prop.superficie} m²` : null,
  ].filter(Boolean).join(" · ");

  const caption =
    `🏠 *${prop.titulo}*\n` +
    `📍 ${prop.ubicacion}\n` +
    `💰 ${precio}\n` +
    (detalle ? `📐 ${detalle}\n` : "") +
    (prop.descripcion ? `\n${prop.descripcion}\n` : "") +
    (nota ? `\n${nota}` : "");

  try {
    if (imagenes.length === 0) {
      // Sin fotos: mandamos al menos la ficha en texto.
      await enviarTexto(cfg, telefono, caption);
    } else {
      // Primera con caption, el resto sueltas. En serie para respetar el orden.
      await enviarImagen(cfg, telefono, imagenes[0], caption);
      for (const url of imagenes.slice(1)) {
        await enviarImagen(cfg, telefono, url);
      }
    }
    return NextResponse.json({ ok: true, propiedad: prop.titulo, fotos: imagenes.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
  }
}
