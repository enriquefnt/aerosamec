import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { resolveUserByToken } from "@/lib/auth/resolveUserByToken";

export async function POST(req: NextRequest) {
  try {                                                            
    const { token, newPassword } = await req.json();

    console.log("🔑 POST /reset-password");

    if (!token || !newPassword || newPassword.length < 6) {
      console.warn("⚠️ Datos inválidos");
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const resolved = await resolveUserByToken(token);

    if (!resolved) {
      console.warn("❌ Reset rechazado: token inválido");
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    const { usuario, context } = resolved;

    console.log("🔄 Actualizando contraseña", {
      userId: usuario.id,
      email: usuario.email,
      context,
    });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: passwordHash,
        passwordTemporal: false,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        tokenVerificacion: null,
      },
    });

    console.log("✅ Contraseña actualizada correctamente", {
      userId: usuario.id,
    });

    return NextResponse.json({
      message: "Contraseña actualizada correctamente",
    });

  } catch (error) {
    console.error("🔥 Error en reset-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
