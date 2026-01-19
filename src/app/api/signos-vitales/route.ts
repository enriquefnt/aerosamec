import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// POST - Registrar signos vitales
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trasladoId,
      usuarioId,
      frecuenciaCardiaca,
      frecuenciaRespiratoria,
      presionArterialSist,
      presionArterialDiast,
      temperatura,
      saturacionO2,
      escalaGlasgow,
      observaciones,
      fechaHora
    } = body;

    // Validaciones básicas
    if (!trasladoId) {
      return NextResponse.json(
        { error: 'Traslado es obligatorio' },
        { status: 400 }
      );
    }

    // Si no hay usuarioId, usar el creador del traslado
    let finalUsuarioId = usuarioId;
    if (!finalUsuarioId) {
      const traslado = await prisma.traslado.findUnique({
        where: { id: trasladoId }
      });
      finalUsuarioId = traslado?.usuarioAsignadoId || traslado?.usuarioCreadorId;
    }

    // Verificar que el traslado existe
    const traslado = await prisma.traslado.findUnique({
      where: { id: trasladoId }
    });

    if (!traslado) {
      return NextResponse.json(
        { error: 'Traslado no encontrado' },
        { status: 404 }
      );
    }

    // Crear control de signos vitales
    const nuevoControl = await prisma.controlSignosVitales.create({
      data: {
        trasladoId,
        usuarioId: finalUsuarioId,
        frecuenciaCardiaca: frecuenciaCardiaca ? parseInt(frecuenciaCardiaca) : null,
        frecuenciaRespiratoria: frecuenciaRespiratoria ? parseInt(frecuenciaRespiratoria) : null,
        presionArterialSist: presionArterialSist ? parseInt(presionArterialSist) : null,
        presionArterialDiast: presionArterialDiast ? parseInt(presionArterialDiast) : null,
        temperatura: temperatura ? parseFloat(temperatura) : null,
        saturacionO2: saturacionO2 ? parseInt(saturacionO2) : null,
        escalaGlasgow: escalaGlasgow ? parseInt(escalaGlasgow) : null,
        observaciones,
        fechaHora: fechaHora ? new Date(fechaHora) : new Date()
      },
      include: {
        usuario: {
          select: { nombre: true, apellido: true }
        },
        traslado: {
          select: { numeroTraslado: true }
        }
      }
    });

    console.log(`📊 Signos vitales registrados: ${traslado.numeroTraslado}`);

    return NextResponse.json({
      message: 'Signos vitales registrados exitosamente',
      control: nuevoControl
    });

  } catch (error) {
    console.error('Error registrando signos vitales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}