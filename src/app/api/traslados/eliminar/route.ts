import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// DELETE - Eliminar traslado
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

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

    // No permitir eliminar traslados en curso o completados
    if (traslado.estado === 'EN_CURSO' || traslado.estado === 'COMPLETADO') {
      return NextResponse.json(
        { error: 'No se puede eliminar un traslado en curso o completado' },
        { status: 400 }
      );
    }

    // Eliminar traslado (esto eliminará automáticamente los registros relacionados por CASCADE)
    await prisma.traslado.delete({
      where: { id }
    });

    console.log(`🗑️ Traslado eliminado: ${traslado.numeroTraslado}`);

    return NextResponse.json({
      message: 'Traslado eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando traslado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}