import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token requerido' },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findFirst({
    where: {
      tokenVerificacion: token,
      emailVerificado: false,
    },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: 'Token inválido o ya utilizado' },
      { status: 400 }
    );
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      emailVerificado: true,
    },
  });

  return NextResponse.json({
    message: 'Email verificado correctamente',
  });
}
