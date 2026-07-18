export interface Property {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  categoria: string;
  operacion: string;
  estado: string;
  dormitorios: number;
  banos: number;
  superficie: number;
  ubicacion: string;
  imagenes: string;
  etiqueta: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  nombre: string;
  telefono: string;
  resumenIA: string;
  estado: string;
  atendido: boolean;
  notaVendedor: string;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIAS = [
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "terreno", label: "Terreno" },
  { value: "local", label: "Local comercial" },
];

export const OPERACIONES = [
  { value: "venta", label: "En venta" },
  { value: "alquiler", label: "En alquiler" },
  { value: "obra-nueva", label: "Obra nueva" },
];

export const ESTADOS_PROPIEDAD = [
  { value: "disponible", label: "Disponible" },
  { value: "reservada", label: "Reservada" },
  { value: "vendida", label: "Vendida" },
];

export const ESTADOS_LEAD = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "en_seguimiento", label: "En seguimiento" },
  { value: "cerrado", label: "Cerrado" },
  { value: "descartado", label: "Descartado" },
];

export const ETIQUETAS = ["Nueva", "Exclusiva", "Alquiler", "Obra nueva", "Oportunidad"];
