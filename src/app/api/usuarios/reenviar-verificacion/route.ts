import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/emailer";
import crypto from "crypto";

const REENVIO_MINUTOS = 10;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario inválido" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (usuario.emailVerificado) {
      return NextResponse.json(
        { error: "El email ya está verificado" },
        { status: 400 }
      );
    }

    // ⏱ Rate limit
    if (usuario.ultimoReenvioEmail) {
      const ahora = new Date();
      const diffMs = ahora.getTime() - usuario.ultimoReenvioEmail.getTime();
      const diffMin = diffMs / 1000 / 60;

      if (diffMin < REENVIO_MINUTOS) {
        return NextResponse.json(
          {
            error: `Debes esperar ${Math.ceil(
              REENVIO_MINUTOS - diffMin
            )} minutos antes de reenviar`,
          },
          { status: 429 }
        );
      }
    }

    // Nuevo token
    const tokenVerificacion = crypto.randomBytes(24).toString("hex");

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        tokenVerificacion,
        ultimoReenvioEmail: new Date(),
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const verificationUrl = `${baseUrl}/verificar-email?token=${tokenVerificacion}`;

    await sendEmail({
      to: usuario.email,
      subject: "Reenvío de verificación – AeroSAMEC",
      html: `
        <p>Hola <strong>${usuario.nombre}</strong>,</p>
        <p>Te reenviamos el enlace para verificar tu cuenta:</p>
        <p>
          <a href="${verificationUrl}">Verificar cuenta</a>
        </p>
        <p style="font-size:12px;color:#666">
          Si ya verificaste tu cuenta, podés ignorar este mensaje.
        </p>
      `,
    });

    return NextResponse.json({
      message: "Email reenviado correctamente",
    });
  } catch (error) {
    console.error("Error reenviando verificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
