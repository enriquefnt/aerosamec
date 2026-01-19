import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar usuario con el token
    const usuario = await prisma.usuario.findFirst({
      where: {
        tokenVerificacion: token,
        activo: true
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

    // Hash de la nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar usuario
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: passwordHash,
        emailVerificado: true,
        passwordTemporal: false,
        tokenVerificacion: null, // Limpiar el token usado
        updatedAt: new Date()
      }
    });

    console.log(`✅ Contraseña cambiada exitosamente para: ${usuario.email}`);

    return NextResponse.json({
      message: 'Contraseña cambiada exitosamente. Ya puede iniciar sesión con su nueva contraseña.'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}