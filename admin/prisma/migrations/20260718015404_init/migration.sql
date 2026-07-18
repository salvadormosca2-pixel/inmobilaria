-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "operacion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'disponible',
    "dormitorios" INTEGER NOT NULL DEFAULT 0,
    "banos" INTEGER NOT NULL DEFAULT 0,
    "superficie" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ubicacion" TEXT NOT NULL,
    "imagenes" TEXT NOT NULL DEFAULT '[]',
    "etiqueta" TEXT NOT NULL DEFAULT 'Nueva',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "resumenIA" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT 'nuevo',
    "atendido" BOOLEAN NOT NULL DEFAULT false,
    "notaVendedor" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
