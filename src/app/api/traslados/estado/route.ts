import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// PUT - Cambiar estado del traslado
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json(
        { error: 'ID y estado son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el traslado existe
    const traslado = await prisma.traslado.findUnique({
      where: { id }
    });

    if (!traslado) {
      return NextResponse.json(
        { error: 'Traslado no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar estado
    const trasladoActualizado = await prisma.traslado.update({
      where: { id },
      data: { 
        estado,
        updatedAt: new Date()
      },
      include: {
        hospitalOrigen: { select: { nombre: true } },
        hospitalDestino: { select: { nombre: true } },
        usuarioCreador: { select: { nombre: true, apellido: true } }
      }
    });

    // Crear seguimiento del cambio de estado
    await prisma.seguimiento.create({
      data: {
        trasladoId: id,
        usuarioId: traslado.usuarioCreadorId, // TODO: Usar usuario actual de la sesión
        tipo: 'CAMBIO_ESTADO',
        descripcion: `Estado cambiado a: ${estado}`,
        observaciones: `Estado anterior: ${traslado.estado}`,
      }
    });

    console.log(`📊 Estado cambiado: ${traslado.numeroTraslado} → ${estado}`);

    return NextResponse.json({
      message: 'Estado actualizado exitosamente',
      traslado: trasladoActualizado
    });

  } catch (error) {
    console.error('Error cambiando estado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}