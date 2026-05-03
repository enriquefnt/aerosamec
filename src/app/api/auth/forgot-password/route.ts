import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendEmail } from "@/lib/emailer"; // 👈 CLAVE

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email requerido" },
        { status: 400 }
      );
    }

    // 🔍 Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // ⚠️ No revelar si existe o no
    if (!usuario) {
      return NextResponse.json({ ok: true });
    }

    // 🔐 Token seguro
    const token = crypto.randomBytes(32).toString("hex");
    const expiracion = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    // 💾 Guardar token
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expiracion,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // ✉️ Enviar email (USANDO EL EMAILER)
    try {
      await sendEmail({
        to: usuario.email,
        subject: "Recuperación de contraseña",
        html: `
          <p>Hola ${usuario.nombre},</p>
          <p>Solicitaste restablecer tu contraseña.</p>
          <p>
            <a href="${resetUrl}">
              👉 Hacé clic acá para crear una nueva contraseña
            </a>
          </p>
          <p>Este enlace vence en 1 hora.</p>
          <p>Si no solicitaste este cambio, ignorá este correo.</p>
        `,
      });
    } catch (mailError) {
      console.error("Forgot password mail error:", mailError);
      // Respuesta genérica para no filtrar detalles ni romper UX por SMTP
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
