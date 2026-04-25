import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Ajusta la ruta si es diferente

// Función utilitaria para limpiar texto (trim y uppercase), con manejo de undefined
function limpiarTexto(texto: string | undefined | null): string {
  if (typeof texto !== 'string' || texto === null || texto === undefined) {
    return ''; // Devuelve cadena vacía si no es un string válido
  }
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

    // Validaciones iniciales
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

    // Validar que tipoRaw y descripcionRaw sean strings (requeridos)
    if (typeof tipoRaw !== 'string' || tipoRaw.trim() === '') {
      return NextResponse.json(
        { error: 'Tipo es requerido y debe ser un string no vacío' },
        { status: 400 }
      );
    }

    if (typeof descripcionRaw !== 'string' || descripcionRaw.trim() === '') {
      return NextResponse.json(
        { error: 'Descripción es requerida y debe ser un string no vacío' },
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

    // Formatear y limpiar datos automáticamente (ahora seguro)
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