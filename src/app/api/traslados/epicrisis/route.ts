import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

// PUT - Guardar epicrisis
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, epicrisis } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del traslado es requerido' },
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

    // Actualizar epicrisis
    const trasladoActualizado = await prisma.traslado.update({
      where: { id },
      data: {
        epicrisis,
        updatedAt: new Date()
      }
    });

    // Crear seguimiento de la epicrisis
    await prisma.seguimiento.create({
      data: {
        trasladoId: id,
        usuarioId: traslado.usuarioAsignadoId || traslado.usuarioCreadorId,
        tipo: 'OBSERVACION_MEDICA',
        descripcion: 'Epicrisis actualizada',
        observaciones: 'Resumen final del traslado completado',
      }
    });

    console.log(`📝 Epicrisis guardada: ${traslado.numeroTraslado}`);

    return NextResponse.json({
      message: 'Epicrisis guardada exitosamente',
      traslado: trasladoActualizado
    });

  } catch (error) {
    console.error('Error guardando epicrisis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}