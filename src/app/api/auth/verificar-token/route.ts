import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario con el token
    const usuario = await prisma.usuario.findFirst({
      where: {
        tokenVerificacion: token,
        activo: true
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        funcion: true,
        emailVerificado: true,
        passwordTemporal: true,
        createdAt: true
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Verificar que el token no sea muy antiguo (24 horas)
    const tokenAge = Date.now() - new Date(usuario.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { error: 'Token expirado. Solicite un nuevo enlace de verificación.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Token válido',
      usuario
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}