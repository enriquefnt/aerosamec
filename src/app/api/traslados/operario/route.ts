import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

// GET - Listar traslados para operarios (solo los asignados)
export async function GET() {
  try {
    // Por ahora, devolver todos los traslados activos
    // TODO: Filtrar por usuario asignado cuando tengamos autenticación completa
    const traslados = await prisma.traslado.findMany({
      where: {
        estado: {
          in: ['ASIGNADO', 'EN_PREPARACION', 'EN_CURSO']
        }
      },
      include: {
        hospitalOrigen: {
          select: { nombre: true }
        },
        hospitalDestino: {
          select: { nombre: true }
        },
        usuarioCreador: {
          select: { nombre: true, apellido: true }
        },
        usuarioAsignado: {
          select: { nombre: true, apellido: true }
        },
        procedimientos: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { fechaHora: 'desc' }
        },
        medicaciones: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { fechaHora: 'desc' }
        },
        controlesSignos: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { fechaHora: 'desc' }
        }
      },
      orderBy: {
        fechaSolicitud: 'desc'
      }
    });

    return NextResponse.json({ traslados });
  } catch (error) {
    console.error('Error obteniendo traslados para operario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}