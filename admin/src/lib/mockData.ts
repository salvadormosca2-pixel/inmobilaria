/**
 * Cero Fugas — CRM Inmobiliario
 * Fuente única de verdad del demo.
 *
 * Contexto: inmobiliaria de San Fernando del Valle de Catamarca.
 * HOY = jueves 16/07/2026. Calendario: vie 17, sáb 18, dom 19, lun 20, mar 21, mié 22.
 *
 * Coherencia (verificada a mano):
 *   CALIENTES_MES 47 = FUNNEL[2] = KPIS_MES = suma de AGENTES.calientes (18+16+13)
 *                    = CALIENTES_ACEPTADAS 43 + CALIENTES_REVISION 4
 *   FUNNEL cierres 6 = suma de AGENTES.cierres (3+2+1)
 *   USD 12.760 cerrados = suma de AGENTES.comision (6320+3210+3230)
 *   FUNNEL visitas 31  = suma de AGENTES.visitas (13+11+7)
 *   CANALES suma 342   = FUNNEL[0]
 *   MOTIVOS_PERDIDA suma 100%
 *   COBRANZAS: cobrado+pendiente+moroso = suma de los 6 alquileres vigentes
 *
 * Cartera: PROPIEDADES son las DISPONIBLES (se publican y se muestran).
 * CONTRATOS son las ADMINISTRADAS (ya alquiladas). Son conjuntos distintos.
 */

/* ============================ Constantes de negocio ============================ */

/** Tipo de cambio usado para expresar comisiones de alquiler en USD. */
export const TC = 1200;

/** Ancla de coherencia: funnel = KPI = facturación. */
export const CALIENTES_MES = 47;
export const CALIENTES_ACEPTADAS = 43;
export const CALIENTES_REVISION = 4; // 43 + 4 = 47
export const TARIFA_CALIENTE = 25000; // ARS por caliente entregada
export const FACTURADO_MES = CALIENTES_ACEPTADAS * TARIFA_CALIENTE; // $1.075.000

export type Temp = "caliente" | "tibio" | "frio";
export type Canal = "whatsapp" | "instagram" | "zonaprop" | "facebook" | "web";

/**
 * La inmobiliaria trabaja con DOS áreas de negocio separadas, con economías
 * muy distintas:
 *   - Ventas: poco volumen, comisión alta (4% sobre USD 60-95k → USD 2.400-3.800).
 *   - Alquileres: mucho volumen, comisión chica (un mes → USD 292-433) pero deja
 *     administración recurrente.
 * Cada lead pertenece a un área y se asigna a un agente de esa área.
 */
export type Area = "ventas" | "alquileres";

export const AREA_LABEL: Record<Area, string> = {
  ventas: "Ventas",
  alquileres: "Alquileres",
};

export const CANAL_LABEL: Record<Canal, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  zonaprop: "Zonaprop",
  facebook: "Facebook",
  web: "Web propia",
};

/* ============================ Formateo ============================ */

export const fmtARS = (n: number) => "$" + n.toLocaleString("es-AR");
export const fmtUSD = (n: number) => "USD " + n.toLocaleString("es-AR");

/** Chatwoot devuelve todos los tiempos en segundos. */
export const fmtDur = (s: number | null) => {
  if (s === null) return "—";
  if (s < 60) return `${s} seg`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  if (s < 86400) return `${(s / 3600).toFixed(1).replace(".0", "")} h`;
  return `${(s / 86400).toFixed(1).replace(".0", "")} d`;
};

/* ============================ Chatwoot ============================ */

/** El tipo y la clasificación viven en lib/chatwoot.ts. Acá solo los valores demo. */
export type { ChatwootAgentReport } from "./chatwoot";
import type { ChatwootAgentReport } from "./chatwoot";

/** Base de la instancia. En producción sale de env (CHATWOOT_URL). */
export const CHATWOOT_BASE = "https://chatwoot.josegreco.com.ar";
export const CHATWOOT_ACCOUNT_ID = 1;

/** Contraseña de la puerta de Conversaciones. Rutea a cada uno a lo suyo. */
export const DEMO_PASS = "demo1234";

export interface Usuario {
  id: string;
  nombre: string;
  avatar: string;
  rol: string;
  tipo: "dueno" | "agente";
  /** id del agente en AGENTES. null para el dueño. */
  agenteId: string | null;
}

export const USUARIOS: Usuario[] = [
  { id: "u0", nombre: "José Greco", avatar: "JG", rol: "Dueño · ve todo", tipo: "dueno", agenteId: null },
  { id: "u1", nombre: "Lucas Agüero", avatar: "LA", rol: "Ventas · B° Norte · Piedra Blanca", tipo: "agente", agenteId: "ag1" },
  { id: "u2", nombre: "Rocío Nieva", avatar: "RN", rol: "Alquileres · Comercial", tipo: "agente", agenteId: "ag2" },
  { id: "u3", nombre: "Nahuel Paz", avatar: "NP", rol: "Ventas · Valle Viejo · Choya · Centro", tipo: "agente", agenteId: "ag3" },
];

/* ============================ 1. Hoy / Dashboard ============================ */

export const KPIS_HOY = [
  { label: "Consultas hoy", valor: 18, detalle: "+3 vs. ayer", tono: "blue" as const },
  { label: "Respondidas por IA", valor: 17, detalle: "94% · 1ª respuesta 28 seg", tono: "blue" as const },
  { label: "Calientes hoy", valor: 3, detalle: "Marina, Sebastián y Diego", tono: "hot" as const },
  { label: "Visitas de hoy", valor: 4, detalle: "3 ya confirmadas por bot", tono: "success" as const },
];

export interface Alerta {
  id: string;
  tipo: "contraoferta" | "contrato" | "precio" | "reclamo";
  titulo: string;
  detalle: string;
  cta: string;
  urgencia: "alta" | "media";
}

export const ALERTAS: Alerta[] = [
  {
    id: "a1",
    tipo: "contraoferta",
    titulo: "Contraoferta recibida — Casa c/ pileta, Valle Viejo",
    detalle:
      "Andrés Figueroa ofrece USD 88.000 sobre los USD 95.000 publicados. Paga contado y escritura en 30 días. La propietaria (Mirta Ferreyra) todavía no lo sabe.",
    cta: "Responder contraoferta",
    urgencia: "alta",
  },
  {
    id: "a2",
    tipo: "contrato",
    titulo: "Contrato vence en 15 días — Depto 2 dorm, B° Norte",
    detalle:
      "Paula Nieva vence el 31/07 y todavía no confirmó si renueva. El aumento por ICL del próximo período ya está calculado: $487.200.",
    cta: "Gestionar renovación",
    urgencia: "alta",
  },
  {
    id: "a3",
    tipo: "precio",
    titulo: "Propietario pide bajar precio — Depto 2 amb, Centro",
    detalle:
      "Ernesto Vildoza quiere pasar de USD 62.000 a USD 57.000. Lleva 74 días publicado, 9 interesados y 2 visitas. Necesita tu OK.",
    cta: "Ver informe y decidir",
    urgencia: "media",
  },
  {
    id: "a4",
    tipo: "reclamo",
    titulo: "Reclamo sin resolver hace 6 días — Local, Av. Güemes",
    detalle:
      "Sebastián Vergara reportó una filtración en el techo del depósito el 10/07. El plomero todavía no confirmó visita. Es el ticket abierto más viejo.",
    cta: "Ver ticket #418",
    urgencia: "alta",
  },
];

export interface AgendaItem {
  hora: string;
  titulo: string;
  detalle: string;
  tipo: "visita" | "tasacion" | "firma" | "llamado";
  estado: string;
}

export const AGENDA_HOY: AgendaItem[] = [
  { hora: "09:30", titulo: "Visita — Casa 3 dorm, Piedra Blanca", detalle: "Florencia Agüero · Lucas Agüero", tipo: "visita", estado: "✓ confirmó por bot" },
  { hora: "11:00", titulo: "Visita — Depto 2 amb, Centro", detalle: "Martín Olivera · Nahuel Paz", tipo: "visita", estado: "✓ confirmó por bot" },
  { hora: "13:00", titulo: "Firma de reserva — Casa 3 dorm, B° Norte", detalle: "Ramiro Bulacio · seña USD 5.000", tipo: "firma", estado: "Escribanía Sarmiento 340" },
  { hora: "16:30", titulo: "Visita — Casa 2 dorm, Choya", detalle: "Silvina Costa · Nahuel Paz", tipo: "visita", estado: "recordatorio 2 h antes" },
  { hora: "18:00", titulo: "Visita — Local comercial, Centro", detalle: "Sebastián Herrera · Rocío Nieva", tipo: "visita", estado: "✓ confirmó por bot" },
];

/** Ingresos proyectados de la inmobiliaria este mes. */
export const FACTURACION_PROYECTADA = {
  adminAlquileres: 198_000, // ARS/mes — 8% sobre los 6 contratos administrados
  cerradoMes: 12_760, // USD ya cerrados en julio (= suma de AGENTES.comision)
};

/* ============================ 2. Conversaciones ============================ */

export interface Mensaje {
  autor: "lead" | "ia" | "humano";
  texto: string;
  hora: string;
}

export interface Criterio {
  label: string;
  ok: boolean;
  valor: string;
}

export interface Conversacion {
  id: string;
  nombre: string;
  handle: string;
  canal: Canal;
  area: Area;
  /**
   * Agente que la tiene. Solo las calientes se asignan a un humano (round robin
   * por área y zona); las tibias y frías quedan en null y las sigue la IA.
   */
  asignadoA: { nombre: string; avatar: string; rol: string } | null;
  score: number;
  temp: Temp;
  hora: string;
  preview: string;
  noLeidos: number;
  fugaEvitada?: boolean;
  captacion?: boolean;
  entregada?: boolean;
  criterios: Criterio[];
  propiedadInteres: string;
  precioInteres: string;
  comisionEstimada: string;
  mensajes: Mensaje[];
}

export const CONVERSACIONES: Conversacion[] = [
  {
    id: "c1",
    nombre: "Marina Quiroga",
    handle: "+54 383 415-2280",
    canal: "whatsapp",
    area: "ventas",
    asignadoA: { nombre: "Lucas Agüero", avatar: "LA", rol: "Ventas · B° Norte" },
    score: 92,
    temp: "caliente",
    hora: "09:12",
    preview: "Mañana a las 10 perfecto",
    noLeidos: 0,
    entregada: true,
    propiedadInteres: "Casa 3 dorm — B° Norte",
    precioInteres: "USD 89.000",
    comisionEstimada: "USD 3.560",
    criterios: [
      { label: "Presupuesto", ok: true, valor: "USD 85–90k" },
      { label: "Operación", ok: true, valor: "Compra para vivir" },
      { label: "Zona", ok: true, valor: "B° Norte" },
      { label: "Urgencia", ok: true, valor: "2 meses (vence alquiler)" },
      { label: "Financiación", ok: true, valor: "Pre-aprobado Bco. Nación" },
      { label: "Visita", ok: true, valor: "Vie 17/07 · 10:00" },
    ],
    mensajes: [
      { autor: "lead", texto: "Hola! Vi la casa del B° Norte en Zonaprop, sigue disponible?", hora: "09:04" },
      { autor: "ia", texto: "¡Hola Marina! Sí, sigue disponible 🙌 Es la casa de 3 dormitorios en B° Norte, 142 m² cubiertos, con cochera para 2 autos. Está en USD 89.000. ¿La estás buscando para vivir vos o como inversión?", hora: "09:04" },
      { autor: "lead", texto: "Para vivir. Somos 4, necesitamos 3 dorm sí o sí", hora: "09:06" },
      { autor: "ia", texto: "Perfecto, entonces esta te calza justo. ¿Tenés un presupuesto aproximado en mente? Así te muestro solo lo que entra y no te hago perder tiempo.", hora: "09:06" },
      { autor: "lead", texto: "Hasta 90 mil más o menos. Tenemos crédito pre aprobado del Banco Nación", hora: "09:08" },
      { autor: "ia", texto: "Buenísimo, con el pre-aprobado ganás muchísimo tiempo 💪 ¿Para cuándo necesitarías mudarte?", hora: "09:08" },
      { autor: "lead", texto: "En 2 meses se nos vence el alquiler así que corre", hora: "09:09" },
      { autor: "ia", texto: "Entendido, hay urgencia real. Te paso la ficha completa con las fotos y el plano 👇", hora: "09:10" },
      { autor: "ia", texto: "📄 Ficha — Casa 3 dorm · B° Norte · 142 m² · cochera doble · USD 89.000", hora: "09:10" },
      { autor: "lead", texto: "Me encanta. Se puede ver esta semana?", hora: "09:11" },
      { autor: "ia", texto: "Obvio. Tengo mañana viernes 17 a las 10:00, o el lunes 20 a las 16:30. ¿Cuál te queda mejor?", hora: "09:11" },
      { autor: "lead", texto: "Mañana a las 10 perfecto", hora: "09:12" },
      { autor: "ia", texto: "Listo Marina, agendado: viernes 17/07 a las 10:00, Av. Belgrano 1240, B° Norte. Te va a atender Lucas Agüero. Te mando un recordatorio hoy a la tarde y otro 2 h antes. ¡Nos vemos! 🏡", hora: "09:12" },
    ],
  },
  {
    id: "c2",
    nombre: "Sebastián Herrera",
    handle: "sherrera@gmail.com",
    canal: "web",
    area: "alquileres",
    asignadoA: { nombre: "Rocío Nieva", avatar: "RN", rol: "Alquileres · Comercial" },
    score: 88,
    temp: "caliente",
    hora: "10:50",
    preview: "Hoy 18 me sirve",
    noLeidos: 0,
    entregada: true,
    propiedadInteres: "Local comercial — Centro",
    precioInteres: "$520.000/mes",
    comisionEstimada: "USD 433",
    criterios: [
      { label: "Presupuesto", ok: true, valor: "Hasta $550.000/mes" },
      { label: "Operación", ok: true, valor: "Alquiler comercial" },
      { label: "Zona", ok: true, valor: "Centro" },
      { label: "Urgencia", ok: true, valor: "Abrir antes de fin de año" },
      { label: "Garantía", ok: true, valor: "Caución Sancor vigente" },
      { label: "Visita", ok: true, valor: "Hoy 16/07 · 18:00" },
    ],
    mensajes: [
      { autor: "lead", texto: "Buen día, consulto por el local de calle Rivadavia. Sigue en alquiler?", hora: "10:38" },
      { autor: "ia", texto: "¡Buen día Sebastián! Sí, sigue disponible. Es el local de 95 m² sobre Rivadavia al 800, pleno Centro, con vidriera a la calle y baño. $520.000 por mes. ¿Qué rubro tenés pensado?", hora: "10:38" },
      { autor: "lead", texto: "Cafetería de especialidad. Tiene salida de humos?", hora: "10:41" },
      { autor: "ia", texto: "Sí, tiene salida de humos habilitada y trifásica instalada 👌 De hecho antes funcionaba una rotisería, así que para gastronómico estás bien parado.", hora: "10:41" },
      { autor: "lead", texto: "Perfecto. Cuánto piden de garantía?", hora: "10:43" },
      { autor: "ia", texto: "Para comercial pedimos seguro de caución o garantía propietaria de Catamarca. ¿Ya tenés alguna definida?", hora: "10:43" },
      { autor: "lead", texto: "Tengo caución con Sancor, ya la usé en otro local", hora: "10:45" },
      { autor: "ia", texto: "Impecable, eso acelera todo 🚀 ¿Para cuándo querrías arrancar?", hora: "10:45" },
      { autor: "lead", texto: "Quiero abrir antes de fin de año, así que cuanto antes", hora: "10:47" },
      { autor: "ia", texto: "Entendido. ¿Querés verlo hoy mismo a las 18:00, o mañana viernes a las 11:00?", hora: "10:47" },
      { autor: "lead", texto: "Hoy 18 me sirve", hora: "10:49" },
      { autor: "ia", texto: "Listo Sebastián, agendado: hoy jueves 16/07 a las 18:00, Rivadavia 812. Te atiende Rocío Nieva. ¡Nos vemos! ☕", hora: "10:50" },
    ],
  },
  {
    id: "c3",
    nombre: "Héctor Balmaceda",
    handle: "+54 383 462-1109",
    canal: "whatsapp",
    area: "ventas",
    asignadoA: { nombre: "Marcos Toledo", avatar: "MT", rol: "Tasador" },
    score: 78,
    temp: "tibio",
    hora: "11:40",
    preview: "Dale, perfecto",
    noLeidos: 0,
    captacion: true,
    propiedadInteres: "Captación — Los Nogales 480, Valle Viejo",
    precioInteres: "Expectativa USD 100.000",
    comisionEstimada: "USD 4.000 si se capta",
    criterios: [
      { label: "Es propietario", ok: true, valor: "Titular único" },
      { label: "Dirección", ok: true, valor: "Los Nogales 480" },
      { label: "Metros", ok: true, valor: "600 m² terreno / 180 cub." },
      { label: "Fotos", ok: true, valor: "4 recibidas" },
      { label: "Expectativa", ok: true, valor: "USD 100.000" },
      { label: "Exclusiva", ok: false, valor: "A negociar en la visita" },
    ],
    mensajes: [
      { autor: "lead", texto: "Buenas, quería saber cuánto puede valer mi casa en Valle Viejo", hora: "11:31" },
      { autor: "ia", texto: "¡Hola Héctor! Claro que sí. Te hago tres preguntas rápidas y te paso una estimación, y si querés coordinamos una tasación presencial sin cargo. ¿Cuál es la dirección?", hora: "11:31" },
      { autor: "lead", texto: "Calle Los Nogales 480, Valle Viejo", hora: "11:33" },
      { autor: "ia", texto: "Perfecto. ¿Cuántos m² tiene el terreno y cuántos cubiertos, aproximadamente?", hora: "11:33" },
      { autor: "lead", texto: "El terreno son 600, construidos como 180. 3 dormitorios, pileta", hora: "11:35" },
      { autor: "ia", texto: "Excelente. ¿Me podés mandar 3 o 4 fotos? Frente, living, cocina y la pileta si se puede 📸", hora: "11:35" },
      { autor: "lead", texto: "📎 4 fotos", hora: "11:38" },
      { autor: "ia", texto: "¡Gracias! Con esos datos, propiedades similares en Valle Viejo se están publicando entre USD 92.000 y USD 105.000. La tasación presencial ajusta bastante. ¿Tenés una expectativa de precio?", hora: "11:38" },
      { autor: "lead", texto: "Yo pensaba 100 mil", hora: "11:39" },
      { autor: "ia", texto: "Está dentro de rango 👌 Ya le cargué todos los datos al tasador. ¿Te queda bien que te visite el lunes 20 a las 17:00?", hora: "11:39" },
      { autor: "lead", texto: "Dale, perfecto", hora: "11:40" },
      { autor: "ia", texto: "Listo Héctor, agendado. Va Marcos Toledo, nuestro tasador. Te llega un recordatorio el domingo. ¡Gracias por confiar! 🙌", hora: "11:40" },
    ],
  },
  {
    id: "c4",
    nombre: "Rodrigo Paz",
    handle: "Zonaprop · ID 51204887",
    canal: "zonaprop",
    area: "ventas",
    asignadoA: null,
    score: 71,
    temp: "tibio",
    hora: "03:17",
    preview: "Increíble que respondan a esta hora jaja",
    noLeidos: 0,
    fugaEvitada: true,
    propiedadInteres: "Casa 3 dorm — Piedra Blanca",
    precioInteres: "USD 78.000",
    comisionEstimada: "USD 3.120",
    criterios: [
      { label: "Presupuesto", ok: true, valor: "USD 70–85k" },
      { label: "Operación", ok: true, valor: "Compra para vivir" },
      { label: "Zona", ok: true, valor: "Piedra Blanca" },
      { label: "Urgencia", ok: false, valor: "Septiembre (media)" },
      { label: "Financiación", ok: false, valor: "Sin definir" },
      { label: "Visita", ok: false, valor: "Cuando viaje a Catamarca" },
    ],
    mensajes: [
      { autor: "lead", texto: "Hola, la casa de Piedra Blanca tiene gas natural?", hora: "03:12" },
      { autor: "ia", texto: "¡Hola Rodrigo! Sí, tiene gas natural conectado, y también agua de red y cloacas. Es la casa de 3 dormitorios en Piedra Blanca, 118 m², a USD 78.000. ¿Es para vivienda o inversión?", hora: "03:12" },
      { autor: "lead", texto: "Para vivir. Estoy mirando desde Buenos Aires, me vuelvo a Catamarca en septiembre", hora: "03:14" },
      { autor: "ia", texto: "¡Qué bueno, volver a casa! 🙌 Tenés tiempo para organizarte bien entonces. ¿Tenés un rango de presupuesto? Así te armo una selección de lo que hay en Piedra Blanca y alrededores.", hora: "03:14" },
      { autor: "lead", texto: "Entre 70 y 85 mil", hora: "03:15" },
      { autor: "ia", texto: "Perfecto, entrás justo. Te dejo la ficha completa, y en unas horas cuando abramos te mando 2 opciones más que te pueden gustar. Cuando vengas coordinamos las visitas todas juntas 👇", hora: "03:15" },
      { autor: "ia", texto: "📄 Ficha — Casa 3 dorm · Piedra Blanca · 118 m² · gas natural · USD 78.000", hora: "03:15" },
      { autor: "lead", texto: "Buenísimo gracias! Increíble que respondan a esta hora jaja", hora: "03:17" },
      { autor: "ia", texto: "Estamos 24/7 😄 Escribime cuando quieras, Rodrigo. ¡Buenas noches!", hora: "03:17" },
    ],
  },
  {
    id: "c5",
    nombre: "Carolina Sosa",
    handle: "Facebook · Carolina Sosa",
    canal: "facebook",
    area: "alquileres",
    asignadoA: null,
    score: 54,
    temp: "tibio",
    hora: "14:21",
    preview: "Uh, garantía no tengo. El seguro ese cómo es?",
    noLeidos: 1,
    propiedadInteres: "Depto 2 dorm — B° Norte",
    precioInteres: "$420.000/mes",
    comisionEstimada: "USD 350",
    criterios: [
      { label: "Presupuesto", ok: true, valor: "Hasta $450.000/mes" },
      { label: "Operación", ok: true, valor: "Alquiler vivienda" },
      { label: "Zona", ok: true, valor: "B° Norte" },
      { label: "Urgencia", ok: false, valor: "Octubre (baja)" },
      { label: "Garantía", ok: false, valor: "No tiene — evaluando caución" },
      { label: "Visita", ok: false, valor: "No pedida" },
    ],
    mensajes: [
      { autor: "lead", texto: "Hola, el depto del B° Norte de 2 dormitorios está en alquiler?", hora: "14:15" },
      { autor: "ia", texto: "¡Hola Carolina! Sí, está disponible. Es un 2 dormitorios en B° Norte, 68 m², con balcón y cochera. $420.000 por mes + expensas. ¿Para cuándo lo necesitarías?", hora: "14:15" },
      { autor: "lead", texto: "Para octubre más o menos", hora: "14:18" },
      { autor: "ia", texto: "Bien, hay tiempo entonces. Para alquiler pedimos garantía propietaria de Catamarca o seguro de caución. ¿Con cuál de las dos irías?", hora: "14:18" },
      { autor: "lead", texto: "Uh, garantía no tengo. El seguro ese cómo es?", hora: "14:21" },
      { autor: "ia", texto: "Tranqui, es la opción más elegida hoy 🙂 Es un seguro que reemplaza a la garantía: pagás una cuota mensual (aprox. 5% del alquiler) y listo. Lo tramitamos nosotros en 48 h. ¿Querés que te pase el detalle y los requisitos?", hora: "14:21" },
    ],
  },
  {
    id: "c6",
    nombre: "@juanma_ctk",
    handle: "Instagram · @juanma_ctk",
    canal: "instagram",
    area: "ventas",
    asignadoA: null,
    score: 18,
    temp: "frio",
    hora: "16:05",
    preview: "la de la pileta",
    noLeidos: 0,
    propiedadInteres: "Casa c/ pileta — Valle Viejo",
    precioInteres: "USD 95.000",
    comisionEstimada: "USD 3.800",
    criterios: [
      { label: "Presupuesto", ok: false, valor: "Sin declarar" },
      { label: "Operación", ok: false, valor: "Sin definir" },
      { label: "Zona", ok: false, valor: "Sin definir" },
      { label: "Urgencia", ok: false, valor: "Sin señales" },
      { label: "Financiación", ok: false, valor: "Sin declarar" },
      { label: "Visita", ok: false, valor: "No pedida" },
    ],
    mensajes: [
      { autor: "lead", texto: "precio?", hora: "16:04" },
      { autor: "ia", texto: "¡Hola! 👋 ¿Cuál de las propiedades te interesa? Si me pasás el nombre o el link del posteo te digo el precio al toque.", hora: "16:04" },
      { autor: "lead", texto: "la de la pileta", hora: "16:05" },
      { autor: "ia", texto: "Esa es la casa de Valle Viejo con pileta: 3 dormitorios, 165 m² cubiertos y terreno de 600 m². Está en USD 95.000 💰 ¿La buscás para vivir o como inversión?", hora: "16:05" },
    ],
  },
];

/** Automatizaciones que se prenden/apagan por lead, desde la ficha. */
export const AUTOM_LEAD = [
  { id: "seg", label: "Seguimiento si no contesta", desc: "24 h / 72 h / 7 d" },
  { id: "sim", label: "Ofrecer similares", desc: "Cuando entra una que matchea" },
  { id: "vis", label: "Confirmar visita", desc: "Día antes + 2 h antes" },
  { id: "doc", label: "Pedir documentación", desc: "Checklist según operación" },
];

export const RESPUESTAS_RAPIDAS = [
  { label: "Enviar ficha", texto: "Te paso la ficha completa con fotos, plano y ubicación 👇" },
  { label: "Proponer visita", texto: "¿Querés verla esta semana? Tengo mañana viernes 17 a las 10:00, o el lunes 20 a las 16:30. ¿Cuál te sirve?" },
  { label: "Pedir documentación", texto: "Para avanzar necesitaría: DNI, últimos 3 recibos de sueldo y los datos de la garantía o caución. ¿Los tenés a mano?" },
  { label: "Ofrecer similares", texto: "Tengo 2 opciones más que entran en tu presupuesto y están en la misma zona. ¿Te las mando?" },
];

/* ============================ 3. Pipeline ============================ */

export type Etapa = "nuevo" | "calificando" | "caliente" | "visita" | "reserva" | "cerrado";

export interface PipelineCard {
  id: string;
  nombre: string;
  propiedad: string;
  temp: Temp;
  score: number;
  comision: number; // USD
  etapa: Etapa;
}

export const ETAPAS: { key: Etapa; label: string; hot?: boolean }[] = [
  { key: "nuevo", label: "Nuevo" },
  { key: "calificando", label: "Calificando IA" },
  { key: "caliente", label: "🔥 Caliente entregada", hot: true },
  { key: "visita", label: "Visita agendada" },
  { key: "reserva", label: "Reserva / Negociación" },
  { key: "cerrado", label: "Cerrado" },
];

export const PIPELINE: PipelineCard[] = [
  { id: "p1", nombre: "Juan Manuel Coria", propiedad: "Depto 2 amb · Centro", temp: "frio", score: 18, comision: 2480, etapa: "nuevo" },
  { id: "p2", nombre: "Lucía Ferreyra", propiedad: "Casa 2 dorm · Choya", temp: "frio", score: 24, comision: 2840, etapa: "nuevo" },
  { id: "p3", nombre: "Emiliano Ruiz", propiedad: "Terreno 400 m² · Valle Viejo", temp: "frio", score: 31, comision: 2400, etapa: "nuevo" },
  { id: "p4", nombre: "Natalia Ibarra", propiedad: "Depto 2 dorm · B° Norte (alq.)", temp: "frio", score: 22, comision: 350, etapa: "nuevo" },

  { id: "p5", nombre: "Carolina Sosa", propiedad: "Depto 2 dorm · B° Norte (alq.)", temp: "tibio", score: 54, comision: 350, etapa: "calificando" },
  { id: "p6", nombre: "Gastón Vera", propiedad: "Casa 2 dorm · Choya", temp: "tibio", score: 61, comision: 2840, etapa: "calificando" },
  { id: "p7", nombre: "Rodrigo Paz", propiedad: "Casa 3 dorm · Piedra Blanca", temp: "tibio", score: 71, comision: 3120, etapa: "calificando" },
  { id: "p8", nombre: "Verónica Luna", propiedad: "Depto 1 amb · Centro (alq.)", temp: "tibio", score: 48, comision: 292, etapa: "calificando" },

  { id: "p9", nombre: "Marina Quiroga", propiedad: "Casa 3 dorm · B° Norte", temp: "caliente", score: 92, comision: 3560, etapa: "caliente" },
  { id: "p10", nombre: "Sebastián Herrera", propiedad: "Local comercial · Centro (alq.)", temp: "caliente", score: 88, comision: 433, etapa: "caliente" },
  { id: "p11", nombre: "Diego Maldonado", propiedad: "Casa c/ pileta · Valle Viejo", temp: "caliente", score: 85, comision: 3800, etapa: "caliente" },

  { id: "p12", nombre: "Florencia Agüero", propiedad: "Casa 3 dorm · Piedra Blanca", temp: "caliente", score: 90, comision: 3120, etapa: "visita" },
  { id: "p13", nombre: "Martín Olivera", propiedad: "Depto 2 amb · Centro", temp: "caliente", score: 83, comision: 2480, etapa: "visita" },
  { id: "p14", nombre: "Silvina Costa", propiedad: "Casa 2 dorm · Choya", temp: "tibio", score: 68, comision: 2840, etapa: "visita" },

  { id: "p15", nombre: "Andrés Figueroa", propiedad: "Casa c/ pileta · Valle Viejo", temp: "caliente", score: 94, comision: 3800, etapa: "reserva" },
  { id: "p16", nombre: "Paula Nieva", propiedad: "Depto 2 dorm · B° Norte (renovación)", temp: "caliente", score: 87, comision: 350, etapa: "reserva" },

  { id: "p17", nombre: "Ramiro Bulacio", propiedad: "Casa 3 dorm · B° Norte", temp: "caliente", score: 96, comision: 3560, etapa: "cerrado" },
  { id: "p18", nombre: "Cecilia Toledo", propiedad: "Depto 1 amb · Centro (alq.)", temp: "caliente", score: 89, comision: 292, etapa: "cerrado" },
];

/** Comisión proyectada: todo lo que todavía no cerró. */
export const comisionPipelineTotal = (cards: PipelineCard[]) =>
  cards.filter((c) => c.etapa !== "cerrado").reduce((a, c) => a + c.comision, 0);

/* ============================ 4. Leads ============================ */

export interface LeadRow {
  id: string;
  nombre: string;
  canal: Canal;
  busca: string;
  score: number;
  temp: Temp;
  estado: string;
  proximaAccion: string;
}

export const LEADS: LeadRow[] = [
  { id: "l1", nombre: "Marina Quiroga", canal: "whatsapp", busca: "Casa 3 dorm · B° Norte · hasta USD 90k", score: 92, temp: "caliente", estado: "Visita agendada", proximaAccion: "Recordatorio hoy 18:00 + 2 h antes de la visita" },
  { id: "l2", nombre: "Sebastián Herrera", canal: "web", busca: "Local comercial · Centro · hasta $550k/mes", score: 88, temp: "caliente", estado: "Visita agendada", proximaAccion: "Pedir documentación de la caución" },
  { id: "l3", nombre: "Diego Maldonado", canal: "zonaprop", busca: "Casa c/ pileta · Valle Viejo · hasta USD 95k", score: 85, temp: "caliente", estado: "Caliente entregada", proximaAccion: "Asignar agente y proponer visita" },
  { id: "l4", nombre: "Héctor Balmaceda", canal: "whatsapp", busca: "Captación · tasar casa en Valle Viejo", score: 78, temp: "tibio", estado: "Tasación agendada", proximaAccion: "Recordatorio al tasador — lun 20/07 17:00" },
  { id: "l5", nombre: "Rodrigo Paz", canal: "zonaprop", busca: "Casa 3 dorm · Piedra Blanca · USD 70–85k", score: 71, temp: "tibio", estado: "Calificando", proximaAccion: "Enviar 2 propiedades que matchean (hoy 09:00)" },
  { id: "l6", nombre: "Silvina Costa", canal: "facebook", busca: "Casa 2 dorm · Choya · hasta USD 75k", score: 68, temp: "tibio", estado: "Visita agendada", proximaAccion: "Confirmación de visita 2 h antes" },
  { id: "l7", nombre: "Gastón Vera", canal: "whatsapp", busca: "Casa 2 dorm · Choya · hasta USD 72k", score: 61, temp: "tibio", estado: "Calificando", proximaAccion: "Seguimiento 24 h si no contesta" },
  { id: "l8", nombre: "Carolina Sosa", canal: "facebook", busca: "Depto 2 dorm · B° Norte · hasta $450k/mes", score: 54, temp: "tibio", estado: "Calificando", proximaAccion: "Enviar requisitos del seguro de caución" },
  { id: "l9", nombre: "Verónica Luna", canal: "instagram", busca: "Depto 1 amb · Centro · hasta $380k/mes", score: 48, temp: "tibio", estado: "Calificando", proximaAccion: "Seguimiento 72 h — no contestó el 1º" },
  { id: "l10", nombre: "Emiliano Ruiz", canal: "zonaprop", busca: "Terreno · Valle Viejo · hasta USD 60k", score: 31, temp: "frio", estado: "Nuevo", proximaAccion: "Calificación automática en curso" },
  { id: "l11", nombre: "Lucía Ferreyra", canal: "instagram", busca: "Casa 2 dorm · Choya · sin presupuesto declarado", score: 24, temp: "frio", estado: "Nuevo", proximaAccion: "Reactivación a los 60 días" },
  { id: "l12", nombre: "Natalia Ibarra", canal: "whatsapp", busca: "Depto 2 dorm · B° Norte (alq.) · sin garantía", score: 22, temp: "frio", estado: "Nuevo", proximaAccion: "Seguimiento 24 h si no contesta" },
  { id: "l13", nombre: "Juan Manuel Coria", canal: "instagram", busca: "Consulta suelta · sin definir", score: 18, temp: "frio", estado: "Nuevo", proximaAccion: "Reactivación con 2 propiedades nuevas" },
];

/* ============================ 5. Propiedades (disponibles) ============================ */

export interface Propiedad {
  id: string;
  titulo: string;
  barrio: string;
  precio: string;
  operacion: "Venta" | "Alquiler";
  dorm: number;
  banos: number;
  m2: number;
  interesados: number;
  calientes: number;
  exclusiva: boolean;
  matching: string;
  informe: string;
  dias: number;
}

export const PROPIEDADES: Propiedad[] = [
  { id: "pr1", titulo: "Casa 3 dorm c/ cochera doble", barrio: "B° Norte", precio: "USD 89.000", operacion: "Venta", dorm: 3, banos: 2, m2: 142, interesados: 14, calientes: 3, exclusiva: true, matching: "Se envió a 11 leads compatibles al publicarse", informe: "Informe semanal enviado — lun 13/07", dias: 23 },
  { id: "pr2", titulo: "Casa c/ pileta y quincho", barrio: "Valle Viejo", precio: "USD 95.000", operacion: "Venta", dorm: 3, banos: 3, m2: 165, interesados: 19, calientes: 4, exclusiva: true, matching: "Se envió a 8 leads compatibles al publicarse", informe: "Informe semanal enviado — lun 13/07", dias: 41 },
  { id: "pr3", titulo: "Casa 3 dorm c/ gas natural", barrio: "Piedra Blanca", precio: "USD 78.000", operacion: "Venta", dorm: 3, banos: 2, m2: 118, interesados: 11, calientes: 2, exclusiva: true, matching: "Se envió a 9 leads compatibles al publicarse", informe: "Informe semanal enviado — lun 13/07", dias: 17 },
  { id: "pr4", titulo: "Departamento 2 amb a estrenar", barrio: "Centro", precio: "USD 62.000", operacion: "Venta", dorm: 1, banos: 1, m2: 48, interesados: 9, calientes: 1, exclusiva: false, matching: "Se envió a 6 leads compatibles al publicarse", informe: "Sin informe — no tiene exclusiva", dias: 74 },
  { id: "pr5", titulo: "Casa 2 dorm c/ patio", barrio: "Choya", precio: "USD 71.000", operacion: "Venta", dorm: 2, banos: 1, m2: 96, interesados: 8, calientes: 2, exclusiva: false, matching: "Se envió a 7 leads compatibles al publicarse", informe: "Sin informe — no tiene exclusiva", dias: 52 },
  { id: "pr6", titulo: "Terreno 400 m² c/ escritura", barrio: "Valle Viejo", precio: "USD 60.000", operacion: "Venta", dorm: 0, banos: 0, m2: 400, interesados: 5, calientes: 0, exclusiva: true, matching: "Se envió a 4 leads compatibles al publicarse", informe: "Informe semanal enviado — lun 13/07", dias: 88 },
  { id: "pr7", titulo: "Local comercial c/ vidriera", barrio: "Centro", precio: "$520.000/mes", operacion: "Alquiler", dorm: 0, banos: 1, m2: 95, interesados: 12, calientes: 2, exclusiva: true, matching: "Se envió a 5 leads compatibles al publicarse", informe: "Informe semanal enviado — lun 13/07", dias: 12 },
  { id: "pr8", titulo: "Departamento 2 dorm c/ balcón", barrio: "B° Norte", precio: "$420.000/mes", operacion: "Alquiler", dorm: 2, banos: 1, m2: 68, interesados: 16, calientes: 3, exclusiva: false, matching: "Se envió a 13 leads compatibles al publicarse", informe: "Sin informe — no tiene exclusiva", dias: 9 },
  { id: "pr9", titulo: "Departamento 1 amb amoblado", barrio: "Centro", precio: "$350.000/mes", operacion: "Alquiler", dorm: 1, banos: 1, m2: 34, interesados: 10, calientes: 1, exclusiva: false, matching: "Se envió a 8 leads compatibles al publicarse", informe: "Sin informe — no tiene exclusiva", dias: 6 },
];

/* ============================ 6. Propietarios ============================ */

export interface Propietario {
  id: string;
  nombre: string;
  telefono: string;
  cartera: string;
  cantidad: number;
  exclusiva: boolean;
  vencimiento: string;
  ultimoInforme: string;
  estado: "conforme" | "pide bajar precio" | "por renovar exclusiva";
}

export const PROPIETARIOS: Propietario[] = [
  { id: "o1", nombre: "Mirta Ferreyra", telefono: "+54 383 441-8820", cartera: "Casa c/ pileta · Valle Viejo", cantidad: 1, exclusiva: true, vencimiento: "12/09/2026", ultimoInforme: "lun 13/07 — 19 interesados, 4 calientes, 3 visitas", estado: "conforme" },
  { id: "o2", nombre: "Ernesto Vildoza", telefono: "+54 383 456-2214", cartera: "Depto 2 amb · Centro", cantidad: 1, exclusiva: false, vencimiento: "—", ultimoInforme: "Sin informe — no tiene exclusiva", estado: "pide bajar precio" },
  { id: "o3", nombre: "Familia Agüero Bazán", telefono: "+54 383 415-7703", cartera: "Casa 3 dorm · B° Norte + Terreno 400 m² · Valle Viejo", cantidad: 2, exclusiva: true, vencimiento: "02/08/2026", ultimoInforme: "lun 13/07 — 19 interesados, 3 calientes, 5 visitas", estado: "por renovar exclusiva" },
  { id: "o4", nombre: "Raúl Sarmiento", telefono: "+54 383 470-1156", cartera: "Casa 3 dorm · Piedra Blanca", cantidad: 1, exclusiva: true, vencimiento: "28/10/2026", ultimoInforme: "lun 13/07 — 11 interesados, 2 calientes, 2 visitas", estado: "conforme" },
  { id: "o5", nombre: "Nélida Carrizo", telefono: "+54 383 432-9087", cartera: "Local · Rivadavia (Centro) + Local 60 m² · Av. Güemes", cantidad: 2, exclusiva: true, vencimiento: "05/12/2026", ultimoInforme: "lun 13/07 — 12 interesados, 2 calientes, 1 visita", estado: "conforme" },
  { id: "o6", nombre: "Osvaldo Brizuela", telefono: "+54 383 448-3391", cartera: "Casa 2 dorm · Choya + Casa 3 dorm · Choya (alquilada)", cantidad: 2, exclusiva: false, vencimiento: "—", ultimoInforme: "Sin informe — no tiene exclusiva", estado: "pide bajar precio" },
  { id: "o7", nombre: "Graciela Moreno", telefono: "+54 383 421-6674", cartera: "Depto 2 dorm · B° Norte + Depto 1 amb · Centro (ambos alquilados)", cantidad: 2, exclusiva: false, vencimiento: "—", ultimoInforme: "Sin informe — no tiene exclusiva", estado: "por renovar exclusiva" },
];

export interface Tasacion {
  id: string;
  propietario: string;
  direccion: string;
  m2: string;
  fotos: number;
  expectativa: string;
  agendada: string;
}

export const TASACIONES: Tasacion[] = [
  { id: "t1", propietario: "Héctor Balmaceda", direccion: "Los Nogales 480, Valle Viejo", m2: "600 terreno / 180 cub.", fotos: 4, expectativa: "USD 100.000", agendada: "lun 20/07 · 17:00 · Marcos Toledo" },
  { id: "t2", propietario: "Alicia Guzmán", direccion: "Sarmiento 1155, Centro", m2: "180 terreno / 110 cub.", fotos: 6, expectativa: "USD 68.000", agendada: "mar 21/07 · 10:00 · Marcos Toledo" },
  { id: "t3", propietario: "Julio Ocampo", direccion: "Los Álamos 92, Choya", m2: "450 terreno / 130 cub.", fotos: 3, expectativa: "USD 82.000", agendada: "Pendiente de agendar" },
  { id: "t4", propietario: "Rosa Villagra", direccion: "Maipú 640, B° Norte", m2: "300 terreno / 145 cub.", fotos: 5, expectativa: "USD 91.000", agendada: "mié 22/07 · 16:30 · Marcos Toledo" },
];

/* ============================ 7. Contratos y alquileres (cartera administrada) ============================ */

export interface Contrato {
  id: string;
  inquilino: string;
  propiedad: string;
  propietario: string;
  monto: number;
  indice: "ICL" | "IPC";
  proximoAumento: string;
  montoNuevo: number;
  vencimiento: string;
  diasVenc: number;
  garantia: string;
}

export const CONTRATOS: Contrato[] = [
  { id: "k1", inquilino: "Paula Nieva", propiedad: "Depto 2 dorm · B° Norte", propietario: "Graciela Moreno", monto: 420000, indice: "ICL", proximoAumento: "01/08/2026", montoNuevo: 487200, vencimiento: "31/07/2026", diasVenc: 15, garantia: "Caución Sancor" },
  { id: "k5", inquilino: "Antonella Ríos", propiedad: "Depto 2 amb · B° Norte", propietario: "Rosa Villagra", monto: 445000, indice: "IPC", proximoAumento: "01/08/2026", montoNuevo: 516200, vencimiento: "15/10/2026", diasVenc: 91, garantia: "Caución Sancor" },
  { id: "k6", inquilino: "Fernando Quiroga", propiedad: "Casa 3 dorm · Valle Viejo", propietario: "Julio Ocampo", monto: 495000, indice: "ICL", proximoAumento: "01/12/2026", montoNuevo: 569250, vencimiento: "30/11/2026", diasVenc: 137, garantia: "Garantía propietaria" },
  { id: "k4", inquilino: "Marcos Ledesma", propiedad: "Casa 3 dorm · Choya", propietario: "Osvaldo Brizuela", monto: 385000, indice: "ICL", proximoAumento: "01/11/2026", montoNuevo: 442750, vencimiento: "31/01/2027", diasVenc: 199, garantia: "Garantía propietaria" },
  { id: "k2", inquilino: "Sebastián Vergara", propiedad: "Local 60 m² · Av. Güemes", propietario: "Nélida Carrizo", monto: 380000, indice: "IPC", proximoAumento: "01/09/2026", montoNuevo: 440800, vencimiento: "31/03/2027", diasVenc: 258, garantia: "Garantía propietaria" },
  { id: "k3", inquilino: "Cecilia Toledo", propiedad: "Depto 1 amb · Centro", propietario: "Graciela Moreno", monto: 350000, indice: "ICL", proximoAumento: "01/10/2026", montoNuevo: 402500, vencimiento: "15/07/2029", diasVenc: 1095, garantia: "Caución Sancor" },
];

/** cobrado + pendiente + moroso = 2.475.000 = suma de los 6 alquileres vigentes. */
export const COBRANZAS = {
  cobrado: 1_645_000,
  pendiente: 445_000,
  moroso: 385_000,
  items: [
    { inquilino: "Sebastián Vergara", propiedad: "Local 60 m² · Av. Güemes", monto: 380000, estado: "cobrado", fecha: "02/07 — transferencia" },
    { inquilino: "Paula Nieva", propiedad: "Depto 2 dorm · B° Norte", monto: 420000, estado: "cobrado", fecha: "03/07 — transferencia" },
    { inquilino: "Fernando Quiroga", propiedad: "Casa 3 dorm · Valle Viejo", monto: 495000, estado: "cobrado", fecha: "04/07 — transferencia" },
    { inquilino: "Cecilia Toledo", propiedad: "Depto 1 amb · Centro", monto: 350000, estado: "cobrado", fecha: "15/07 — 1er mes + depósito" },
    { inquilino: "Antonella Ríos", propiedad: "Depto 2 amb · B° Norte", monto: 445000, estado: "pendiente", fecha: "Recordatorio automático enviado 05/07" },
    { inquilino: "Marcos Ledesma", propiedad: "Casa 3 dorm · Choya", monto: 385000, estado: "moroso", fecha: "12 días de atraso · 3 recordatorios" },
  ],
};

/** Honorarios 8%. Suman los 198.000/mes de FACTURACION_PROYECTADA.adminAlquileres. */
export const LIQUIDACIONES = [
  { propietario: "Nélida Carrizo", propiedad: "Local 60 m² · Av. Güemes", cobrado: 380000, honorarios: 30400, transferir: 349600, estado: "Transferido 08/07" },
  { propietario: "Graciela Moreno", propiedad: "Depto 2 dorm · B° Norte", cobrado: 420000, honorarios: 33600, transferir: 386400, estado: "Transferido 08/07" },
  { propietario: "Julio Ocampo", propiedad: "Casa 3 dorm · Valle Viejo", cobrado: 495000, honorarios: 39600, transferir: 455400, estado: "Transferido 09/07" },
  { propietario: "Graciela Moreno", propiedad: "Depto 1 amb · Centro", cobrado: 350000, honorarios: 28000, transferir: 322000, estado: "Pendiente de transferir" },
  { propietario: "Rosa Villagra", propiedad: "Depto 2 amb · B° Norte", cobrado: 0, honorarios: 35600, transferir: 409400, estado: "Esperando cobro del inquilino" },
  { propietario: "Osvaldo Brizuela", propiedad: "Casa 3 dorm · Choya", cobrado: 0, honorarios: 30800, transferir: 354200, estado: "Retenido — inquilino moroso" },
];

export interface Reclamo {
  id: string;
  inquilino: string;
  propiedad: string;
  detalle: string;
  estado: "abierto" | "en curso" | "resuelto";
  fecha: string;
  dias: number;
}

export const RECLAMOS: Reclamo[] = [
  { id: "418", inquilino: "Sebastián Vergara", propiedad: "Local 60 m² · Av. Güemes", detalle: "Filtración en el techo del depósito", estado: "abierto", fecha: "10/07", dias: 6 },
  { id: "421", inquilino: "Paula Nieva", propiedad: "Depto 2 dorm · B° Norte", detalle: "El termotanque no calienta", estado: "en curso", fecha: "13/07", dias: 3 },
  { id: "423", inquilino: "Marcos Ledesma", propiedad: "Casa 3 dorm · Choya", detalle: "Cerradura de la puerta del patio trabada", estado: "en curso", fecha: "14/07", dias: 2 },
  { id: "415", inquilino: "Cecilia Toledo", propiedad: "Depto 1 amb · Centro", detalle: "Pérdida en la canilla de la cocina", estado: "resuelto", fecha: "08/07", dias: 0 },
  { id: "412", inquilino: "Fernando Quiroga", propiedad: "Casa 3 dorm · Valle Viejo", detalle: "Reemplazo del tablero eléctrico", estado: "resuelto", fecha: "05/07", dias: 0 },
];

/* ============================ 8. Visitas ============================ */

export interface Visita {
  id: string;
  dia: string;
  hora: string;
  lead: string;
  propiedad: string;
  agente: string;
  confirmacion: string;
  tipo: "confirmada" | "recordatorio" | "reprogramada" | "pendiente";
}

/** Las 4 de "Hoy 16/07" cuadran con KPIS_HOY (3 confirmadas por bot + 1 con recordatorio). */
export const VISITAS: Visita[] = [
  { id: "v1", dia: "Hoy · jue 16/07", hora: "09:30", lead: "Florencia Agüero", propiedad: "Casa 3 dorm · Piedra Blanca", agente: "Lucas Agüero", confirmacion: "✓ confirmó por bot", tipo: "confirmada" },
  { id: "v2", dia: "Hoy · jue 16/07", hora: "11:00", lead: "Martín Olivera", propiedad: "Depto 2 amb · Centro", agente: "Nahuel Paz", confirmacion: "✓ confirmó por bot", tipo: "confirmada" },
  { id: "v3", dia: "Hoy · jue 16/07", hora: "16:30", lead: "Silvina Costa", propiedad: "Casa 2 dorm · Choya", agente: "Nahuel Paz", confirmacion: "recordatorio 2 h antes", tipo: "recordatorio" },
  { id: "v4", dia: "Hoy · jue 16/07", hora: "18:00", lead: "Sebastián Herrera", propiedad: "Local comercial · Centro", agente: "Rocío Nieva", confirmacion: "✓ confirmó por bot", tipo: "confirmada" },
  { id: "v5", dia: "Vie 17/07", hora: "10:00", lead: "Marina Quiroga", propiedad: "Casa 3 dorm · B° Norte", agente: "Lucas Agüero", confirmacion: "recordatorio el día antes", tipo: "recordatorio" },
  { id: "v6", dia: "Vie 17/07", hora: "15:00", lead: "Diego Maldonado", propiedad: "Casa c/ pileta · Valle Viejo", agente: "Nahuel Paz", confirmacion: "reprogramó solo → nuevo horario", tipo: "reprogramada" },
  { id: "v7", dia: "Vie 17/07", hora: "16:30", lead: "Gastón Vera", propiedad: "Casa 2 dorm · Choya", agente: "Nahuel Paz", confirmacion: "pendiente de confirmar", tipo: "pendiente" },
  { id: "v8", dia: "Sáb 18/07", hora: "10:00", lead: "Verónica Luna", propiedad: "Depto 1 amb · Centro", agente: "Rocío Nieva", confirmacion: "✓ confirmó por bot", tipo: "confirmada" },
  { id: "v9", dia: "Lun 20/07", hora: "11:00", lead: "Carolina Sosa", propiedad: "Depto 2 dorm · B° Norte", agente: "Rocío Nieva", confirmacion: "pendiente de confirmar", tipo: "pendiente" },
];

/* ============================ 9. Agentes ============================ */

export interface Agente {
  id: string;
  nombre: string;
  area: Area;
  zona: string;
  leads: number;
  calientes: number;
  visitas: number;
  cierres: number;
  comision: number; // USD del mes
  tiempoRespuesta: string;
  avatar: string;
  /** Actividad real en su bandeja de Chatwoot. Ver ChatwootAgentReport. */
  chatwoot: ChatwootAgentReport;
}

/**
 * calientes suman 47, visitas 31, cierres 6, comisión USD 12.760.
 *
 * Ojo con la asimetría entre áreas, que es el punto: Rocío (Alquileres) recibe
 * casi tantas calientes como Lucas (16 vs 18) pero genera USD 700 contra USD
 * 9.240, porque un cierre de alquiler deja un mes de comisión (~USD 350) y uno
 * de venta deja el 4% de la operación (~USD 3.000).
 */
export const AGENTES: Agente[] = [
  {
    id: "ag1", nombre: "Lucas Agüero", area: "ventas", zona: "B° Norte · Piedra Blanca",
    leads: 42, calientes: 18, visitas: 13, cierres: 3, comision: 9240,
    tiempoRespuesta: "4 min", avatar: "LA",
    chatwoot: {
      id: 3,
      conversations_count: 42, // = leads asignados
      resolved_conversations_count: 38,
      avg_first_response_time: 245, // 4 min
      avg_reply_time: 420,
      avg_resolution_time: 172800, // 2 d
      messages_sent: 386,
      messages_received: 412,
      trend_pct: 12,
    },
  },
  {
    id: "ag2", nombre: "Rocío Nieva", area: "alquileres", zona: "Todas las zonas · Comercial",
    leads: 38, calientes: 16, visitas: 11, cierres: 2, comision: 700,
    tiempoRespuesta: "7 min", avatar: "RN",
    chatwoot: {
      id: 4,
      conversations_count: 38,
      resolved_conversations_count: 33,
      avg_first_response_time: 415, // 7 min
      avg_reply_time: 560,
      avg_resolution_time: 129600, // 1,5 d
      messages_sent: 341,
      messages_received: 388,
      trend_pct: 5,
    },
  },
  {
    // El caso que el dueño necesita ver: recibe 302 mensajes y contesta 198.
    // Tarda 19 min en la primera respuesta contra los 4 de Lucas, y resuelve
    // 22 de 31. Ahí se le están enfriando los leads.
    id: "ag3", nombre: "Nahuel Paz", area: "ventas", zona: "Valle Viejo · Choya · Centro",
    leads: 31, calientes: 13, visitas: 7, cierres: 1, comision: 2820,
    tiempoRespuesta: "19 min", avatar: "NP",
    chatwoot: {
      id: 5,
      conversations_count: 31,
      resolved_conversations_count: 22,
      avg_first_response_time: 1140, // 19 min
      avg_reply_time: 1620, // 27 min
      avg_resolution_time: 302400, // 3,5 d
      messages_sent: 198,
      messages_received: 302,
      trend_pct: -8,
    },
  },
];

/* ============================ 9b. Cartera del vendedor ============================ */

/**
 * Lo que el vendedor maneja y carga él mismo. Es SU herramienta: su cartera, su
 * agenda y sus notas. Lo usa porque le sirve, no porque el jefe se lo pida.
 *
 * Distinción que sostiene todo el módulo Equipo:
 *   MEDIDO   → viene de Chatwoot (tiempos, mensajes, chats resueltos).
 *              El vendedor no lo puede tocar.
 *   DECLARADO→ lo carga el vendedor (visita hecha, cierre, monto, notas).
 *              Alimenta el funnel y las comisiones.
 *
 * Lo DECLARADO nunca entra en la clasificación: si el score dependiera de lo que
 * el propio evaluado carga, se infla solo. Ver clasificar() en lib/chatwoot.ts.
 */

export interface NotaVendedor {
  fecha: string;
  texto: string;
}

export interface Reunion {
  fecha: string;
  hora: string;
  tipo: "visita" | "reunión" | "llamado" | "firma" | "tasación";
  lugar: string;
}

/** Visita que ya pasó y todavía no tiene resultado cargado. */
export interface Pendiente {
  fecha: string;
  propiedad: string;
}

export interface ClienteCartera {
  id: string;
  agenteId: string;
  nombre: string;
  telefono: string;
  area: Area;
  temp: Temp;
  score: number;
  propiedad: string;
  estado: string;
  proxima: Reunion | null;
  pendiente: Pendiente | null;
  notas: NotaVendedor[];
}

/**
 * Ojo con Nahuel: tiene 4 visitas sin cargar contra 1 de Lucas y 0 de Rocío.
 * Ese contador es la parte más honesta del módulo — no se puede falsear por
 * omisión: si no cargás, se nota que no cargaste.
 */
export const CARTERA: ClienteCartera[] = [
  /* ---- Lucas Agüero · Ventas · B° Norte · Piedra Blanca ---- */
  {
    id: "cc1", agenteId: "ag1", nombre: "Marina Quiroga", telefono: "+54 383 415-2280",
    area: "ventas", temp: "caliente", score: 92,
    propiedad: "Casa 3 dorm · B° Norte · USD 89.000",
    estado: "Visita agendada",
    proxima: { fecha: "vie 17/07", hora: "10:00", tipo: "visita", lugar: "Av. Belgrano 1240, B° Norte" },
    pendiente: null,
    notas: [
      { fecha: "16/07 · 09:20", texto: "Crédito pre-aprobado del Nación, no tiene que juntar papeles. Se le vence el alquiler en 2 meses: corre de verdad." },
      { fecha: "16/07 · 09:35", texto: "Le mandé la ficha con el plano. Muy entusiasmada, preguntó por la cochera doble." },
    ],
  },
  {
    id: "cc2", agenteId: "ag1", nombre: "Florencia Agüero", telefono: "+54 383 428-9014",
    area: "ventas", temp: "caliente", score: 90,
    propiedad: "Casa 3 dorm · Piedra Blanca · USD 78.000",
    estado: "Visita hecha",
    proxima: null,
    pendiente: { fecha: "hoy 16/07 · 09:30", propiedad: "Casa 3 dorm · Piedra Blanca" },
    notas: [
      { fecha: "15/07 · 17:30", texto: "Confirmó la visita de mañana 09:30 por el bot. Viene con el marido." },
    ],
  },
  {
    id: "cc3", agenteId: "ag1", nombre: "Ramiro Bulacio", telefono: "+54 383 471-2265",
    area: "ventas", temp: "caliente", score: 96,
    propiedad: "Casa 3 dorm · B° Norte · USD 89.000",
    estado: "Cerrado",
    proxima: { fecha: "hoy 16/07", hora: "13:00", tipo: "firma", lugar: "Escribanía Sarmiento 340" },
    pendiente: null,
    notas: [
      { fecha: "14/07 · 16:10", texto: "Arrancó ofreciendo 85. Cerramos en 89 con la cochera incluida. Seña USD 5.000." },
      { fecha: "15/07 · 11:00", texto: "Escribana confirmó para el jueves 13:00. Avisar a la familia Agüero Bazán." },
    ],
  },
  {
    id: "cc4", agenteId: "ag1", nombre: "Rodrigo Paz", telefono: "Zonaprop · ID 51204887",
    area: "ventas", temp: "tibio", score: 71,
    propiedad: "Casa 3 dorm · Piedra Blanca · USD 78.000",
    estado: "Calificando",
    proxima: null,
    pendiente: null,
    notas: [
      { fecha: "16/07 · 08:10", texto: "Escribió a las 3 de la mañana, le contestó la IA. Está en Buenos Aires, se vuelve en septiembre. Cuando venga, juntarle 3 visitas el mismo día." },
    ],
  },

  /* ---- Rocío Nieva · Alquileres ---- */
  {
    id: "cc5", agenteId: "ag2", nombre: "Sebastián Herrera", telefono: "sherrera@gmail.com",
    area: "alquileres", temp: "caliente", score: 88,
    propiedad: "Local comercial · Centro · $520.000/mes",
    estado: "Visita agendada",
    proxima: { fecha: "hoy 16/07", hora: "18:00", tipo: "visita", lugar: "Rivadavia 812, Centro" },
    pendiente: null,
    notas: [
      { fecha: "16/07 · 10:50", texto: "Cafetería de especialidad. Ya tiene caución de Sancor de otro local, así que la garantía está resuelta. Quiere abrir antes de fin de año." },
    ],
  },
  {
    id: "cc6", agenteId: "ag2", nombre: "Carolina Sosa", telefono: "Facebook · Carolina Sosa",
    area: "alquileres", temp: "tibio", score: 54,
    propiedad: "Depto 2 dorm · B° Norte · $420.000/mes",
    estado: "Calificando",
    proxima: { fecha: "lun 20/07", hora: "11:00", tipo: "visita", lugar: "Maipú 210, B° Norte" },
    pendiente: null,
    notas: [
      { fecha: "16/07 · 14:25", texto: "No tiene garantía propietaria. Le expliqué la caución, quedó en pensarlo. Mandarle los requisitos el viernes si no escribe." },
    ],
  },
  {
    id: "cc7", agenteId: "ag2", nombre: "Verónica Luna", telefono: "Instagram · @vero.luna",
    area: "alquileres", temp: "tibio", score: 48,
    propiedad: "Depto 1 amb · Centro · $350.000/mes",
    estado: "Visita agendada",
    proxima: { fecha: "sáb 18/07", hora: "10:00", tipo: "visita", lugar: "San Martín 45, Centro" },
    pendiente: null,
    notas: [
      { fecha: "14/07 · 12:00", texto: "No contestó el primer seguimiento. La IA reintenta a las 72 h." },
    ],
  },
  {
    id: "cc8", agenteId: "ag2", nombre: "Cecilia Toledo", telefono: "+54 383 449-3312",
    area: "alquileres", temp: "caliente", score: 89,
    propiedad: "Depto 1 amb · Centro · $350.000/mes",
    estado: "Cerrado",
    proxima: null,
    pendiente: null,
    notas: [
      { fecha: "15/07 · 16:40", texto: "Firmó por 3 años con caución Sancor. Pagó primer mes + depósito. Liquidar a Graciela Moreno." },
    ],
  },

  /* ---- Nahuel Paz · Ventas · Valle Viejo · Choya · Centro ---- */
  {
    id: "cc9", agenteId: "ag3", nombre: "Andrés Figueroa", telefono: "+54 383 462-7781",
    area: "ventas", temp: "caliente", score: 94,
    propiedad: "Casa c/ pileta · Valle Viejo · USD 95.000",
    estado: "Reserva / Negociación",
    proxima: { fecha: "vie 17/07", hora: "09:00", tipo: "llamado", lugar: "Teléfono" },
    pendiente: null,
    notas: [
      { fecha: "14/07 · 20:13", texto: "Ofrece USD 88.000 contado, escritura en 30 días. Hay que hablarlo con Mirta Ferreyra, todavía no sabe nada." },
    ],
  },
  {
    id: "cc10", agenteId: "ag3", nombre: "Diego Maldonado", telefono: "Zonaprop · ID 51338902",
    area: "ventas", temp: "caliente", score: 85,
    propiedad: "Casa c/ pileta · Valle Viejo · USD 95.000",
    estado: "Visita agendada",
    proxima: { fecha: "vie 17/07", hora: "15:00", tipo: "visita", lugar: "Los Nogales 210, Valle Viejo" },
    pendiente: null,
    notas: [
      { fecha: "16/07 · 08:05", texto: "Reprogramó solo por el bot, de las 11 a las 15." },
    ],
  },
  {
    id: "cc11", agenteId: "ag3", nombre: "Martín Olivera", telefono: "+54 383 433-1190",
    area: "ventas", temp: "caliente", score: 83,
    propiedad: "Depto 2 amb · Centro · USD 62.000",
    estado: "Visita hecha",
    proxima: null,
    pendiente: { fecha: "hoy 16/07 · 11:00", propiedad: "Depto 2 amb · Centro" },
    notas: [],
  },
  {
    id: "cc12", agenteId: "ag3", nombre: "Silvina Costa", telefono: "Facebook · Silvina Costa",
    area: "ventas", temp: "tibio", score: 68,
    propiedad: "Casa 2 dorm · Choya · USD 71.000",
    estado: "Visita agendada",
    proxima: { fecha: "hoy 16/07", hora: "16:30", tipo: "visita", lugar: "Los Álamos 88, Choya" },
    pendiente: null,
    notas: [],
  },
  {
    id: "cc13", agenteId: "ag3", nombre: "Emiliano Ruiz", telefono: "Zonaprop · ID 51102244",
    area: "ventas", temp: "frio", score: 31,
    propiedad: "Terreno 400 m² · Valle Viejo · USD 60.000",
    estado: "Visita hecha",
    proxima: null,
    pendiente: { fecha: "lun 13/07 · 17:00", propiedad: "Terreno 400 m² · Valle Viejo" },
    notas: [],
  },
  {
    id: "cc14", agenteId: "ag3", nombre: "Lucía Ferreyra", telefono: "Instagram · @luciaf",
    area: "ventas", temp: "frio", score: 24,
    propiedad: "Casa 2 dorm · Choya · USD 71.000",
    estado: "Visita hecha",
    proxima: null,
    pendiente: { fecha: "mar 14/07 · 10:30", propiedad: "Casa 2 dorm · Choya" },
    notas: [],
  },
  {
    id: "cc15", agenteId: "ag3", nombre: "Gastón Vera", telefono: "+54 383 456-8823",
    area: "ventas", temp: "tibio", score: 61,
    propiedad: "Casa 2 dorm · Choya · USD 71.000",
    estado: "Visita hecha",
    proxima: { fecha: "vie 17/07", hora: "16:30", tipo: "visita", lugar: "Los Álamos 88, Choya" },
    pendiente: { fecha: "mié 15/07 · 11:00", propiedad: "Casa 2 dorm · Choya" },
    notas: [],
  },
];

export const carteraDe = (agenteId: string) => CARTERA.filter((c) => c.agenteId === agenteId);
export const pendientesDe = (agenteId: string) => carteraDe(agenteId).filter((c) => c.pendiente);

/** Motivos que se le ofrecen al vendedor cuando la visita no avanza. */
export const MOTIVOS_CHIP = [
  "Presupuesto no alcanza",
  "Buscaba otra zona",
  "No consiguió garantía",
  "No le gustó la propiedad",
  "Se fue con otra inmobiliaria",
];

/* ============================ 10. Automatizaciones ============================ */

export interface Automatizacion {
  id: string;
  nombre: string;
  desc: string;
  metrica: string;
  on: boolean;
}

export const AUTOMATIZACIONES: Automatizacion[] = [
  { id: "au1", nombre: "Respuesta 24/7", desc: "La IA contesta todos los canales al instante, a cualquier hora.", metrica: "1ª respuesta: 28 seg", on: true },
  { id: "au2", nombre: "Calificación automática", desc: "Score 0-100 según presupuesto, zona, urgencia y financiación.", metrica: "198 leads calificados este mes", on: true },
  { id: "au3", nombre: "Seguimiento 24 h / 72 h / 7 d", desc: "Si el lead no contesta, la IA reintenta con otro ángulo.", metrica: "34 leads recuperados este mes", on: true },
  { id: "au4", nombre: "Confirmación de visitas", desc: "Recordatorio el día antes y 2 h antes, con opción de reprogramar.", metrica: "Plantones -63%", on: true },
  { id: "au5", nombre: "Matching propiedad ↔ lead", desc: "Al publicar una propiedad se envía sola a los leads que matchean.", metrica: "71 envíos automáticos este mes", on: true },
  { id: "au6", nombre: "Informe semanal al propietario", desc: "Cada lunes: interesados, visitas y consultas de su propiedad.", metrica: "La herramienta #1 para ganar exclusivas", on: true },
  { id: "au7", nombre: "Pre-carga de tasaciones", desc: "El bot junta dirección, m², fotos y expectativa antes de que vaya el tasador.", metrica: "4 tasaciones pre-cargadas", on: true },
  { id: "au8", nombre: "Pedido de documentación", desc: "Checklist automático según sea venta, alquiler o comercial.", metrica: "Ahorra 2,5 h por operación", on: true },
  { id: "au9", nombre: "Alerta de renovación de contratos", desc: "Aviso 90 días antes del vencimiento, a vos y al inquilino.", metrica: "2 contratos por vencer", on: true },
  { id: "au10", nombre: "Aviso de aumento de alquiler", desc: "Notifica el nuevo monto por ICL/IPC al inquilino y al propietario.", metrica: "2 aumentos el 01/08", on: true },
  { id: "au11", nombre: "Recordatorio de cobranza", desc: "WhatsApp automático los primeros 5 días del mes.", metrica: "Morosidad: 12% → 4%", on: true },
  { id: "au12", nombre: "Reactivación de leads fríos", desc: "A los 60 días, con las propiedades nuevas que matchean.", metrica: "9 leads reactivados este mes", on: false },
];

/* ============================ 11. Métricas + Facturación ============================ */

export const KPIS_MES = [
  { label: "Consultas del mes", valor: "342", detalle: "julio 2026, al día 16" },
  { label: "Respondidas por IA", valor: "94%", detalle: "322 de 342" },
  { label: "1ª respuesta", valor: "28 seg", detalle: "antes: 3 h 42 min" },
  { label: "Fugas evitadas", valor: "128", detalle: "consultas fuera de horario capturadas" },
  { label: "🔥 Calientes entregadas", valor: "47", detalle: "43 aceptadas · 4 en revisión" },
  { label: "Cierres", valor: "6", detalle: "USD 12.760 en comisiones" },
];

export const FUNNEL = [
  { label: "Consultas recibidas", valor: 342 },
  { label: "Calificados por IA", valor: 198 },
  { label: "🔥 Calientes entregadas", valor: 47, hot: true },
  { label: "Visitas concretadas", valor: 31 },
  { label: "Reservas / negociación", valor: 11 },
  { label: "Cierres", valor: 6 },
];

/** Suma 342 = FUNNEL[0]. */
export const CANALES = [
  { canal: "WhatsApp", valor: 178 },
  { canal: "Zonaprop", valor: 71 },
  { canal: "Instagram", valor: 54 },
  { canal: "Facebook", valor: 22 },
  { canal: "Web propia", valor: 17 },
];

/** Suma 100%. */
export const MOTIVOS_PERDIDA = [
  { motivo: "Presupuesto no alcanza", pct: 38 },
  { motivo: "Se fue con otra inmobiliaria", pct: 22 },
  { motivo: "Buscaba otra zona", pct: 17 },
  { motivo: "No consiguió garantía", pct: 13 },
  { motivo: "Dejó de responder", pct: 10 },
];

export interface RegistroCaliente {
  id: string;
  fecha: string;
  lead: string;
  operacion: string;
  criterios: string;
  estado: "aceptada" | "en revisión";
}

/** Muestra de los 47 registros del mes (12 más recientes). */
export const REGISTRO_CALIENTES: RegistroCaliente[] = [
  { id: "h47", fecha: "16/07 · 10:50", lead: "Sebastián Herrera", operacion: "Alquiler comercial · Centro", criterios: "6/6", estado: "aceptada" },
  { id: "h46", fecha: "16/07 · 09:12", lead: "Marina Quiroga", operacion: "Venta · B° Norte", criterios: "6/6", estado: "aceptada" },
  { id: "h45", fecha: "16/07 · 08:04", lead: "Diego Maldonado", operacion: "Venta · Valle Viejo", criterios: "5/6", estado: "en revisión" },
  { id: "h44", fecha: "15/07 · 17:22", lead: "Florencia Agüero", operacion: "Venta · Piedra Blanca", criterios: "6/6", estado: "aceptada" },
  { id: "h43", fecha: "15/07 · 12:40", lead: "Martín Olivera", operacion: "Venta · Centro", criterios: "6/6", estado: "aceptada" },
  { id: "h42", fecha: "15/07 · 09:55", lead: "Paula Nieva", operacion: "Renovación alquiler · B° Norte", criterios: "6/6", estado: "aceptada" },
  { id: "h41", fecha: "14/07 · 20:13", lead: "Andrés Figueroa", operacion: "Venta · Valle Viejo", criterios: "6/6", estado: "aceptada" },
  { id: "h40", fecha: "14/07 · 16:08", lead: "Ramiro Bulacio", operacion: "Venta · B° Norte", criterios: "6/6", estado: "aceptada" },
  { id: "h39", fecha: "14/07 · 11:31", lead: "Cecilia Toledo", operacion: "Alquiler · Centro", criterios: "5/6", estado: "en revisión" },
  { id: "h38", fecha: "13/07 · 22:47", lead: "Gonzalo Herrera", operacion: "Venta · Choya", criterios: "6/6", estado: "aceptada" },
  { id: "h37", fecha: "13/07 · 15:19", lead: "Mariela Acosta", operacion: "Alquiler · B° Norte", criterios: "6/6", estado: "aceptada" },
  { id: "h36", fecha: "12/07 · 03:52", lead: "Ignacio Robledo", operacion: "Venta · Piedra Blanca", criterios: "5/6", estado: "en revisión" },
];

/* ============================ 12. Seguimiento / Recuperación ============================
 *
 * El problema que resuelve: el interesado que consultó, capaz visitó, y NO cerró.
 * Antes se perdía en un cuaderno. Acá cada uno queda con una etiqueta de seguimiento,
 * un mensaje listo para salir (por Evolution API) y el registro de qué se hizo y quién,
 * para que el dueño vea la finalización de cada gestión.
 *
 * Los mensajes salen por WhatsApp vía Evolution API (no Cloud API de Meta).
 */

export type SegEstado = "pendiente" | "enviado" | "respondio" | "recuperado" | "sin_respuesta";

export const SEG_META: Record<SegEstado, { label: string; bg: string; fg: string; icon: string }> = {
  pendiente:    { label: "Pendiente de seguimiento", bg: "#FFF0ED", fg: "#FF4D2E", icon: "●" },
  enviado:      { label: "Mensaje enviado",          bg: "#EEF4FF", fg: "#2563EB", icon: "➤" },
  respondio:    { label: "Respondió",                bg: "#FEF5E4", fg: "#F59E0B", icon: "↩" },
  recuperado:   { label: "Recuperado",               bg: "#E7F8F0", fg: "#0BA45C", icon: "✓" },
  sin_respuesta:{ label: "Sin respuesta",            bg: "#F1F5F9", fg: "#94A3B8", icon: "—" },
};

export interface SegEvento {
  hora: string;
  texto: string;
  tipo: "auto" | "humano" | "lead";
}

export interface SeguimientoLead {
  id: string;
  nombre: string;
  telefono: string;
  canal: Canal;
  area: Area;
  busca: string;
  propiedad: string;
  /** Comisión estimada que sigue en juego si se recupera (USD). */
  comision: number;
  /** Por qué se enfrió / en qué etapa se cayó. */
  motivo: string;
  diasSinContacto: number;
  /** Quién lo sigue. null = lo trabaja la IA sola. */
  agente: { nombre: string; avatar: string; rol: string } | null;
  estado: SegEstado;
  /** Seguimiento automático activo para este lead (24 h / 72 h / 7 d). */
  auto: boolean;
  proximoToque: string;
  /** Mensaje que sale por Evolution API. Se personaliza con el nombre. */
  plantilla: string;
  historial: SegEvento[];
}

export const SEGUIMIENTOS: SeguimientoLead[] = [
  {
    id: "sg1", nombre: "Silvina Costa", telefono: "+54 383 466-2231", canal: "facebook", area: "ventas",
    busca: "Casa 2 dorm · Choya · hasta USD 75k", propiedad: "Casa 2 dorm c/ patio · Choya",
    comision: 2840, motivo: "Visitó y le gustó, pero quedó comparando con otra opción",
    diasSinContacto: 2, agente: { nombre: "Nahuel Paz", avatar: "NP", rol: "Ventas · Choya" },
    estado: "pendiente", auto: true, proximoToque: "Hoy — pasaron 48 h de la visita",
    plantilla: "Hola Silvina! ¿Qué te quedó pensando de la casa de Choya que viste? Si querés la comparamos con otra que entró justo en tu presupuesto. Sin apuro, cuando puedas 🙂",
    historial: [
      { hora: "14/07 · 16:30", texto: "Visitó la propiedad con Nahuel", tipo: "humano" },
      { hora: "14/07 · 18:00", texto: "IA la marcó para seguimiento a 48 h", tipo: "auto" },
    ],
  },
  {
    id: "sg2", nombre: "Rodrigo Paz", telefono: "+54 383 462-1109", canal: "zonaprop", area: "ventas",
    busca: "Casa 3 dorm · Piedra Blanca · USD 70–85k", propiedad: "Casa 3 dorm c/ gas natural · Piedra Blanca",
    comision: 3120, motivo: "Compra desde Buenos Aires, se muda en septiembre",
    diasSinContacto: 5, agente: null,
    estado: "enviado", auto: true, proximoToque: "Reintento a 72 h si no responde",
    plantilla: "Hola Rodrigo! Te escribo de Jose Greco. Se sumaron 2 casas en Piedra Blanca dentro de tu presupuesto. Te las agendo para cuando viajes en septiembre y las vemos todas juntas. ¿Te sirve?",
    historial: [
      { hora: "16/07 · 09:00", texto: "IA envió 2 propiedades que matchean (Evolution API)", tipo: "auto" },
      { hora: "12/07 · 03:17", texto: "Consultó por Zonaprop de madrugada — la atendió la IA", tipo: "lead" },
    ],
  },
  {
    id: "sg3", nombre: "Carolina Sosa", telefono: "+54 383 431-7742", canal: "facebook", area: "alquileres",
    busca: "Depto 2 dorm · B° Norte · hasta $450k/mes", propiedad: "Depto 2 dorm c/ balcón · B° Norte",
    comision: 350, motivo: "No tiene garantía — se le ofreció seguro de caución",
    diasSinContacto: 1, agente: { nombre: "Rocío Nieva", avatar: "RN", rol: "Alquileres · Comercial" },
    estado: "respondio", auto: true, proximoToque: "Rocío la retoma — pidió requisitos de caución",
    plantilla: "Hola Carolina! Te paso los requisitos del seguro de caución para el depto de B° Norte: DNI, último recibo de sueldo y listo, lo tramitamos nosotros en 48 h. ¿Arrancamos?",
    historial: [
      { hora: "15/07 · 14:21", texto: "Preguntó cómo funciona el seguro de caución", tipo: "lead" },
      { hora: "15/07 · 14:21", texto: "IA envió el detalle del seguro (Evolution API)", tipo: "auto" },
      { hora: "16/07 · 10:05", texto: "Respondió: “dale, mandame los requisitos”", tipo: "lead" },
    ],
  },
  {
    id: "sg4", nombre: "Gastón Vera", telefono: "+54 383 415-9980", canal: "whatsapp", area: "ventas",
    busca: "Casa 2 dorm · Choya · hasta USD 72k", propiedad: "Casa 2 dorm c/ patio · Choya",
    comision: 2840, motivo: "Dejó de responder después de pedir la ficha",
    diasSinContacto: 4, agente: null,
    estado: "pendiente", auto: false, proximoToque: "Sin seguimiento activo — decidí vos",
    plantilla: "Hola Gastón! ¿Pudiste ver la ficha de la casa de Choya? Si te cerró, tengo este viernes o el lunes para mostrártela. ¿Cuál te queda mejor?",
    historial: [
      { hora: "12/07 · 11:40", texto: "IA le envió la ficha completa", tipo: "auto" },
      { hora: "12/07 · 11:41", texto: "No volvió a responder", tipo: "lead" },
    ],
  },
  {
    id: "sg5", nombre: "Verónica Luna", telefono: "+54 383 470-3388", canal: "instagram", area: "alquileres",
    busca: "Depto 1 amb · Centro · hasta $380k/mes", propiedad: "Depto 1 amb amoblado · Centro",
    comision: 292, motivo: "No contestó el primer seguimiento",
    diasSinContacto: 3, agente: null,
    estado: "enviado", auto: true, proximoToque: "Reintento a 7 días con otro ángulo",
    plantilla: "Hola Verónica! El monoambiente del Centro sigue disponible y amoblado, listo para entrar. Si todavía lo estás buscando, te reservo una visita esta semana. ¿Te interesa?",
    historial: [
      { hora: "13/07 · 10:00", texto: "IA reintentó a las 72 h (Evolution API)", tipo: "auto" },
      { hora: "10/07 · 19:30", texto: "Consultó por Instagram, no definió presupuesto", tipo: "lead" },
    ],
  },
  {
    id: "sg6", nombre: "Diego Maldonado", telefono: "+54 383 421-5567", canal: "zonaprop", area: "ventas",
    busca: "Casa c/ pileta · Valle Viejo · hasta USD 95k", propiedad: "Casa c/ pileta y quincho · Valle Viejo",
    comision: 3800, motivo: "Reprogramó la visita dos veces",
    diasSinContacto: 1, agente: { nombre: "Nahuel Paz", avatar: "NP", rol: "Ventas · Valle Viejo" },
    estado: "respondio", auto: true, proximoToque: "Confirmar nueva visita — vie 17/07 15:00",
    plantilla: "Hola Diego! Te confirmo la visita a la casa con pileta de Valle Viejo para el viernes 17 a las 15:00. Te mando la ubicación y un recordatorio 2 h antes. ¿Todo ok?",
    historial: [
      { hora: "15/07 · 12:00", texto: "Reprogramó la visita por segunda vez", tipo: "lead" },
      { hora: "16/07 · 08:30", texto: "IA propuso nuevo horario (Evolution API)", tipo: "auto" },
      { hora: "16/07 · 09:10", texto: "Respondió: “el viernes 15 hs me viene bien”", tipo: "lead" },
    ],
  },
  {
    id: "sg7", nombre: "Ramiro Bulacio", telefono: "+54 383 400-1220", canal: "whatsapp", area: "ventas",
    busca: "Casa 3 dorm · B° Norte · USD 89k", propiedad: "Casa 3 dorm c/ cochera doble · B° Norte",
    comision: 3560, motivo: "Venía frío, el seguimiento lo reactivó y firmó reserva",
    diasSinContacto: 0, agente: { nombre: "Lucas Agüero", avatar: "LA", rol: "Ventas · B° Norte" },
    estado: "recuperado", auto: true, proximoToque: "Cerrado — firmó reserva (seña USD 5.000)",
    plantilla: "Hola Ramiro! Volvió a bajar de precio la casa de B° Norte que te gustaba. ¿La reactivamos? Tengo lugar para mostrártela mañana.",
    historial: [
      { hora: "09/07 · 10:00", texto: "Estaba frío — sin respuesta hace 20 días", tipo: "lead" },
      { hora: "10/07 · 09:00", texto: "IA lo reactivó con novedad de precio (Evolution API)", tipo: "auto" },
      { hora: "11/07 · 17:00", texto: "Respondió y agendó visita con Lucas", tipo: "humano" },
      { hora: "16/07 · 13:00", texto: "Firmó reserva — seña USD 5.000", tipo: "humano" },
    ],
  },
  {
    id: "sg8", nombre: "Juan Manuel Coria", telefono: "+54 383 466-8891", canal: "instagram", area: "ventas",
    busca: "Consulta suelta · sin definir", propiedad: "Depto 2 amb a estrenar · Centro",
    comision: 2480, motivo: "Consulta fría, nunca declaró presupuesto",
    diasSinContacto: 12, agente: null,
    estado: "sin_respuesta", auto: false, proximoToque: "Reactivación a los 60 días con propiedades nuevas",
    plantilla: "Hola Juan Manuel! Entraron departamentos nuevos en el Centro desde USD 62.000. Si seguís interesado te paso las fichas. ¿Va?",
    historial: [
      { hora: "04/07 · 16:05", texto: "Consultó “precio?” por Instagram", tipo: "lead" },
      { hora: "05/07 · 09:00", texto: "IA intentó calificar, no respondió", tipo: "auto" },
    ],
  },
];

/** Comisión total en juego entre los seguimientos que todavía no cerraron ni se perdieron. */
export const comisionEnJuego = (items: SeguimientoLead[]) =>
  items.filter((s) => s.estado !== "recuperado" && s.estado !== "sin_respuesta").reduce((a, s) => a + s.comision, 0);

/* ============================ 13. Geo + galería de propiedades ============================
 *
 * Ubicación, fotos y descripción de cada propiedad de la cartera. Se mantiene aparte
 * para no tocar la estructura original de PROPIEDADES: el mapa y la sección de envío
 * consumen PROPIEDADES_FULL, que es PROPIEDADES + esto.
 *
 * Coordenadas reales de San Fernando del Valle de Catamarca y alrededores.
 */

export interface PropGeo {
  lat: number;
  lng: number;
  imagenes: string[];
  descripcion: string;
}

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=1000&q=80`;

export const PROP_GEO: Record<string, PropGeo> = {
  pr1: {
    lat: -28.4538, lng: -65.7802,
    imagenes: [IMG("1600596542815-ffad4c1539a9"), IMG("1600607687939-ce8a6c25118c"), IMG("1600585154526-990dced4db0d")],
    descripcion:
      "Casa moderna en uno de los barrios más buscados de la Capital. Tres dormitorios amplios, living-comedor integrado con mucha luz natural, cochera cubierta para dos autos y patio con parrilla. Terminaciones de primera y lista para habitar.",
  },
  pr2: {
    lat: -28.4718, lng: -65.7415,
    imagenes: [IMG("1600585154340-be6161a56a0c"), IMG("1613490493576-7fde63acd811"), IMG("1600566753190-17f0baa2a6c3")],
    descripcion:
      "Espectacular casa con pileta y quincho independiente, ideal para disfrutar todo el año. Tres dormitorios, tres baños, cocina equipada y galería con vista al parque. Terreno de 600 m² parquizado en zona residencial tranquila.",
  },
  pr3: {
    lat: -28.4548, lng: -65.7502,
    imagenes: [IMG("1600585154526-990dced4db0d"), IMG("1600047509807-ba8f99d2cdde"), IMG("1600573472550-8090b5e0745e")],
    descripcion:
      "Casa consolidada con gas natural, agua de red y cloacas. Tres dormitorios, dos baños completos, cocina-comedor y patio con espacio para cochera. Excelente opción para primera vivienda familiar, a minutos del centro.",
  },
  pr4: {
    lat: -28.4658, lng: -65.7742,
    imagenes: [IMG("1600607687939-ce8a6c25118c"), IMG("1600210492486-724fe5c67fb0"), IMG("1600566753190-17f0baa2a6c3")],
    descripcion:
      "Departamento a estrenar en pleno centro, a pasos de todo. Un dormitorio, cocina integrada, balcón y muy buena ventilación. Ideal para inversión con renta o primera vivienda de un profesional.",
  },
  pr5: {
    lat: -28.4035, lng: -65.7618,
    imagenes: [IMG("1600047509807-ba8f99d2cdde"), IMG("1600596542815-ffad4c1539a9"), IMG("1600585154340-be6161a56a0c")],
    descripcion:
      "Casa acogedora con patio amplio en zona de barrios tranquilos. Dos dormitorios, baño completo, living-comedor y cocina. Espacio para ampliar o sumar cochera. Entorno familiar y buena conectividad.",
  },
  pr6: {
    lat: -28.4742, lng: -65.7448,
    imagenes: [IMG("1600566753086-00f18fb6b3ea"), IMG("1500382017468-9049fed747ef")],
    descripcion:
      "Lote de 400 m² con escritura inmediata y todos los servicios en zona de expansión residencial. Ideal para construir tu casa a medida. Frente amplio, apto crédito, en un barrio en pleno crecimiento.",
  },
  pr7: {
    lat: -28.4720, lng: -65.7770,
    imagenes: [IMG("1497366216548-37526070297c"), IMG("1441986300917-64674bd600d8"), IMG("1497366811353-6870744d04b2")],
    descripcion:
      "Local comercial sobre calle de alto tránsito, con gran vidriera a la calle, salida de humos habilitada y baño. 95 m² ideales para gastronomía o comercio. Excelente visibilidad en el corazón comercial de la ciudad.",
  },
  pr8: {
    lat: -28.4600, lng: -65.7875,
    imagenes: [IMG("1600573472550-8090b5e0745e"), IMG("1600607687939-ce8a6c25118c"), IMG("1600210492486-724fe5c67fb0")],
    descripcion:
      "Departamento luminoso de dos dormitorios con balcón y cochera. Cocina integrada, ventilación cruzada y muy buen estado general. En un barrio residencial seguro y bien ubicado. Se solicita garantía o seguro de caución.",
  },
  pr9: {
    lat: -28.4695, lng: -65.7848,
    imagenes: [IMG("1600566753190-17f0baa2a6c3"), IMG("1600585154526-990dced4db0d"), IMG("1618221195710-dd6b41faaea6")],
    descripcion:
      "Monoambiente amoblado y equipado, listo para entrar a vivir. Incluye muebles, cocina y baño completo. Ideal para profesionales o estudiantes. Ubicación inmejorable, a pasos de la peatonal y el transporte.",
  },
};

const GEO_FALLBACK: PropGeo = { lat: -28.4696, lng: -65.7852, imagenes: [], descripcion: "" };

export type PropiedadFull = Propiedad & PropGeo;

/** Fuente única para el mapa y la sección de envío: cartera + geo + fotos. */
export const PROPIEDADES_FULL: PropiedadFull[] = PROPIEDADES.map((p) => ({
  ...p,
  ...(PROP_GEO[p.id] ?? GEO_FALLBACK),
}));

/** "USD 89.000" → "USD 89k" · "$520.000/mes" → "$520k". Para los pines del mapa. */
export function precioCorto(precio: string): string {
  const moneda = precio.trim().startsWith("USD") ? "USD " : "$";
  const num = parseInt(precio.replace(/[^\d]/g, ""), 10) || 0;
  return `${moneda}${Math.round(num / 1000)}k`;
}
