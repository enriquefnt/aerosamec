import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Listar hospitales
export async function GET() {
  try {
    const hospitales = await prisma.hospital.findMany({
      where: {
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        ciudad: true,
        provincia: true,
        telefono: true,
        email: true,
        tipo: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json({ hospitales });
  } catch (error) {
    console.error('Error obteniendo hospitales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}