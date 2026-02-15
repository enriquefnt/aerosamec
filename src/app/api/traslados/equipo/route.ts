import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// PUT - Asignar equipo al traslado
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      horarioSalida, 
      medicoNombre, 
      enfermeroNombre, 
      pilotoNombre, 
      matriculaAeronave 
    } = body;

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

    // Preparar datos de actualización
    interface UpdateData {
  updatedAt: Date;
  horarioSalida?: Date;
  medicoNombre?: string;
  enfermeroNombre?: string;
  pilotoNombre?: string;
  matriculaAeronave?: string;
  observaciones?: string;
}

const updateData: UpdateData = {
  updatedAt: new Date()
};

    if (horarioSalida) updateData.horarioSalida = new Date(horarioSalida);
    if (medicoNombre) updateData.medicoNombre = medicoNombre;
    if (enfermeroNombre) updateData.enfermeroNombre = enfermeroNombre;
    if (pilotoNombre) updateData.pilotoNombre = pilotoNombre;
    if (matriculaAeronave) updateData.matriculaAeronave = matriculaAeronave;

    // Actualizar traslado
    const trasladoActualizado = await prisma.traslado.update({
      where: { id },
      data: updateData,
      include: {
        hospitalOrigen: { select: { nombre: true } },
        hospitalDestino: { select: { nombre: true } },
        usuarioCreador: { select: { nombre: true, apellido: true } }
      }
    });

    // Crear seguimiento de la asignación
    await prisma.seguimiento.create({
      data: {
        trasladoId: id,
        usuarioId: traslado.usuarioCreadorId, // TODO: Usar usuario actual de la sesión
        tipo: 'EVENTO_TECNICO',
        descripcion: 'Equipo médico asignado',
        observaciones: `Médico: ${medicoNombre || 'No asignado'}, Enfermero: ${enfermeroNombre || 'No asignado'}, Piloto: ${pilotoNombre || 'No asignado'}, Aeronave: ${matriculaAeronave || 'No asignada'}`,
      }
    });

    console.log(`👥 Equipo asignado: ${traslado.numeroTraslado}`);

    return NextResponse.json({
      message: 'Equipo asignado exitosamente',
      traslado: trasladoActualizado
    });

  } catch (error) {
    console.error('Error asignando equipo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}