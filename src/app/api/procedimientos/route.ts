import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db'; // Ajusta la ruta si es diferente

// Función utilitaria para limpiar texto (trim y uppercase)
function limpiarTexto(texto: string): string {
  return texto.trim().toUpperCase();
}

// POST - Crear procedimiento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      trasladoId,  // Tipado como string
      tipoRaw,
      descripcionRaw,
      observacionesRaw,
      usuarioId  // ID del usuario actual
    } = body;

    if (!trasladoId || typeof trasladoId !== 'string') {
      return NextResponse.json(
        { error: 'ID del traslado es requerido y debe ser un string' },
        { status: 400 }
      );
    }

    if (!usuarioId || typeof usuarioId !== 'string') {
      return NextResponse.json(
        { error: 'ID del usuario es requerido' },
        { status: 400 }
      );
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

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Formatear y limpiar datos automáticamente
    const tipo = limpiarTexto(tipoRaw);
    const descripcion = limpiarTexto(descripcionRaw);
    const observaciones = observacionesRaw ? limpiarTexto(observacionesRaw) : null;

    // Crear procedimiento con relaciones correctas (sin trasladoId directo)
    const procedimiento = await prisma.procedimiento.create({
      data: {
        tipo,
        descripcion,
        observaciones,
        traslado: {
          connect: { id: trasladoId }  // Conectar al traslado
        },
        usuario: {
          connect: { id: usuarioId }  // Conectar al usuario
        }
      }
    });

    // Crear seguimiento
    await prisma.seguimiento.create({
      data: {
        trasladoId,
        usuarioId,
        tipo: 'PROCEDIMIENTO',
        descripcion: `Procedimiento creado: ${tipo}`,
        observaciones: descripcion
      }
    });

    console.log(`🩺 Procedimiento creado: ${tipo}`);

    return NextResponse.json({
      message: 'Procedimiento creado exitosamente',
      procedimiento
    });

  } catch (error) {
    console.error('Error creando procedimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}