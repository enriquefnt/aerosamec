import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // 🔍 Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // ⚠️ Mensaje genérico (no revelar si existe o no)
    if (!usuario || !usuario.password) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (!usuario.activo) {
      return NextResponse.json(
        { error: "Usuario inactivo" },
        { status: 403 }
      );
    }

    // 🔐 Comparar contraseña
    const passwordOk = await bcrypt.compare(password, usuario.password);

    if (!passwordOk) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // ✅ Login OK
    // (por ahora solo devolvemos ok, después podés agregar JWT / cookie)
    return NextResponse.json({
      ok: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        funcion: usuario.funcion,
        rol: usuario.rol,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
