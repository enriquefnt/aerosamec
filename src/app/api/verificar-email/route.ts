import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token requerido" },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findFirst({
    where: {
      tokenVerificacion: token,
      emailVerificado: false,
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      rol: true,
      funcion: true,
    },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: "Token inválido o ya utilizado" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    usuario,
  });
}
