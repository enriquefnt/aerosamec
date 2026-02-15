import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { token, newPassword } = await request.json();

  if (!token || newPassword.length < 6) {
    return NextResponse.json(
      { error: 'Datos inválidos' },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findFirst({
    where: {
      tokenVerificacion: token,
      emailVerificado: true,
    },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: 'Token inválido o expirado' },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      password: passwordHash,
      passwordTemporal: false,
      tokenVerificacion: null,
    },
  });

  return NextResponse.json({
    message: 'Contraseña establecida correctamente',
  });
}
