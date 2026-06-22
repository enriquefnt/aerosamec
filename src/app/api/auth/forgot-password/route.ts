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

    const appUrlCandidates = {
      APP_URL: process.env.APP_URL?.trim(),
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL?.trim(),
      NEXTAUTH_URL: process.env.NEXTAUTH_URL?.trim(),
      VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim(),
      VERCEL_URL: process.env.VERCEL_URL?.trim(),
    };

    const resolvedRawBaseUrl =
      appUrlCandidates.APP_URL ||
      appUrlCandidates.NEXT_PUBLIC_APP_URL ||
      appUrlCandidates.NEXTAUTH_URL ||
      appUrlCandidates.VERCEL_PROJECT_PRODUCTION_URL ||
      appUrlCandidates.VERCEL_URL ||
      "http://localhost:3000";

    const normalizedBaseUrl = /^https?:\/\//i.test(resolvedRawBaseUrl)
      ? resolvedRawBaseUrl
      : `https://${resolvedRawBaseUrl}`;

    const appUrl = normalizedBaseUrl.replace(/\/$/, "");
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    console.info("[forgot-password] URL resolution", {
      selectedBaseUrl: appUrl,
      has_APP_URL: !!appUrlCandidates.APP_URL,
      has_NEXT_PUBLIC_APP_URL: !!appUrlCandidates.NEXT_PUBLIC_APP_URL,
      has_NEXTAUTH_URL: !!appUrlCandidates.NEXTAUTH_URL,
      has_VERCEL_PROJECT_PRODUCTION_URL: !!appUrlCandidates.VERCEL_PROJECT_PRODUCTION_URL,
      has_VERCEL_URL: !!appUrlCandidates.VERCEL_URL,
    });

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
      console.error("Forgot password mail error:", {
        message: (mailError as { message?: string })?.message,
        code: (mailError as { code?: string })?.code,
        responseCode: (mailError as { responseCode?: number })?.responseCode,
        command: (mailError as { command?: string })?.command,
      });
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
