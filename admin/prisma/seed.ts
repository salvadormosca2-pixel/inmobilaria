import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const properties = [
  {
    titulo: "Residencia Las Pirquitas",
    descripcion: "Imponente residencia con diseño contemporáneo en barrio privado. Piscina climatizada, quincho con parrilla y jardín parquizado de 600m².",
    precio: 285000,
    categoria: "casa",
    operacion: "venta",
    estado: "disponible",
    dormitorios: 4,
    banos: 3,
    superficie: 320,
    ubicacion: "Valle Viejo",
    imagenes: JSON.stringify(["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"]),
    etiqueta: "Nueva",
  },
  {
    titulo: "Penthouse Centro Histórico",
    descripcion: "Penthouse con terraza panorámica y vista a las sierras. Doble altura, pisos de porcelanato y cocina premium totalmente equipada.",
    precio: 195000,
    categoria: "departamento",
    operacion: "venta",
    estado: "disponible",
    dormitorios: 3,
    banos: 2,
    superficie: 180,
    ubicacion: "Centro",
    imagenes: JSON.stringify(["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"]),
    etiqueta: "Exclusiva",
  },
  {
    titulo: "Quinta del Ambato",
    descripcion: "Espectacular quinta rodeada de naturaleza con pileta, casa de huéspedes independiente y galería con vista al cerro Ambato.",
    precio: 420000,
    categoria: "casa",
    operacion: "venta",
    estado: "reservada",
    dormitorios: 5,
    banos: 4,
    superficie: 680,
    ubicacion: "Ambato",
    imagenes: JSON.stringify(["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"]),
    etiqueta: "Exclusiva",
  },
  {
    titulo: "Duplex San Fernando",
    descripcion: "Duplex a estrenar en zona residencial consolidada. Cochera doble, patio con asador y terminaciones de primera calidad.",
    precio: 165000,
    categoria: "departamento",
    operacion: "venta",
    estado: "disponible",
    dormitorios: 3,
    banos: 2,
    superficie: 210,
    ubicacion: "Capital",
    imagenes: JSON.stringify(["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80"]),
    etiqueta: "Nueva",
  },
  {
    titulo: "Terreno Vista Serrana",
    descripcion: "Lote premium con vista panorámica a las sierras. Todos los servicios, escritura inmediata y aptitud para construcción residencial.",
    precio: 75000,
    categoria: "terreno",
    operacion: "venta",
    estado: "disponible",
    dormitorios: 0,
    banos: 0,
    superficie: 1500,
    ubicacion: "Fray M. Esquiú",
    imagenes: JSON.stringify(["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80"]),
    etiqueta: "Nueva",
  },
  {
    titulo: "Depto Amoblado Centro",
    descripcion: "Departamento completamente amoblado y equipado. Ideal profesionales. Incluye expensas, internet de alta velocidad y cochera.",
    precio: 450,
    categoria: "departamento",
    operacion: "alquiler",
    estado: "disponible",
    dormitorios: 1,
    banos: 1,
    superficie: 55,
    ubicacion: "Centro",
    imagenes: JSON.stringify(["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80"]),
    etiqueta: "Alquiler",
  },
  {
    titulo: "Casa Quinta Temporal",
    descripcion: "Hermosa casa quinta para alquiler temporal o permanente. Piscina, cancha de paddle y amplio parque con frutales.",
    precio: 1200,
    categoria: "casa",
    operacion: "alquiler",
    estado: "disponible",
    dormitorios: 4,
    banos: 3,
    superficie: 380,
    ubicacion: "Ambato",
    imagenes: JSON.stringify(["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80"]),
    etiqueta: "Alquiler",
  },
  {
    titulo: "Complejo Solares del Valle",
    descripcion: "Departamentos en pozo con financiación directa. Amenities completos: pileta, solarium, sum y laundry. Entrega estimada 2025.",
    precio: 120000,
    categoria: "departamento",
    operacion: "obra-nueva",
    estado: "disponible",
    dormitorios: 2,
    banos: 1,
    superficie: 75,
    ubicacion: "Valle Viejo",
    imagenes: JSON.stringify(["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"]),
    etiqueta: "Obra nueva",
  },
];

const leads = [
  {
    nombre: "María González",
    telefono: "+54 383 456-7890",
    resumenIA: "Interesada en casas de 3+ dormitorios en Valle Viejo. Presupuesto entre USD 200.000 y USD 300.000. Busca barrio cerrado con pileta. Familia de 4. Quiere mudarse antes de fin de año.",
    estado: "nuevo",
    atendido: false,
    notaVendedor: "",
  },
  {
    nombre: "Carlos Martínez",
    telefono: "+54 383 555-1234",
    resumenIA: "Consulta por el Penthouse Centro Histórico. Inversor, tiene 2 propiedades en Córdoba. Preguntó por rentabilidad de alquiler temporario. Interesado también en unidades de obra nueva.",
    estado: "contactado",
    atendido: true,
    notaVendedor: "Se envió brochure del penthouse y de Torres Mirador. Coordinar visita para el viernes.",
  },
  {
    nombre: "Ana Lucía Pérez",
    telefono: "+54 383 444-9876",
    resumenIA: "Busca departamento en alquiler en zona centro. Profesional médica, se muda a Catamarca por trabajo. Necesita 1-2 ambientes amoblado. Presupuesto hasta USD 500/mes.",
    estado: "en_seguimiento",
    atendido: true,
    notaVendedor: "Le ofrecí el depto amoblado de Centro. Quiere verlo el lunes. Confirmar horario.",
  },
  {
    nombre: "Roberto Sánchez",
    telefono: "+54 383 678-3456",
    resumenIA: "Pregunta por terrenos en Fray M. Esquiú y Valle Viejo. Quiere construir casa de fin de semana. Presupuesto flexible. Preguntó por financiación.",
    estado: "nuevo",
    atendido: false,
    notaVendedor: "",
  },
  {
    nombre: "Luciana Torres",
    telefono: "+54 383 321-6543",
    resumenIA: "Quiere vender su casa en Capital. 3 dormitorios, 200m². Pide tasación. También preguntó por el Complejo Solares del Valle para comprar una unidad.",
    estado: "contactado",
    atendido: true,
    notaVendedor: "Agendar tasación para la semana que viene. Enviar info de Solares del Valle.",
  },
];

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.lead.deleteMany();
  await prisma.property.deleteMany();

  console.log("Insertando propiedades...");
  for (const p of properties) {
    await prisma.property.create({ data: p });
  }

  console.log("Insertando leads...");
  for (const l of leads) {
    await prisma.lead.create({ data: l });
  }

  console.log(`Seed completado: ${properties.length} propiedades, ${leads.length} leads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
