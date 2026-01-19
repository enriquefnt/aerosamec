import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }
    
    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar el admin principal
    if (usuario.email === 'admin@salud.gob.ar') {
      return NextResponse.json(
        { error: 'No se puede eliminar el administrador principal del sistema' },
        { status: 400 }
      );
    }

    // Eliminar usuario
    await prisma.usuario.delete({
      where: { id }
    });

    console.log(`🗑️ Usuario eliminado: ${usuario.email}`);

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}