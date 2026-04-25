import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/emailer";
import crypto from "crypto";

// GET - Listar usuarios
export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        dni: true,
        telefono: true,
        rol: true,
        funcion: true,
        activo: true,
        emailVerificado: true,
        passwordTemporal: true,
        ultimoLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombre, apellido, dni, telefono, rol, funcion } = body;

    /* =========================
       Validaciones básicas
       ========================= */
    if (!email || !nombre || !apellido || !dni || !rol || !funcion) {
      return NextResponse.json(
        { error: "Campos obligatorios incompletos" },
        { status: 400 }
      );
    }

    /* =========================
       Validaciones de unicidad
       ========================= */
    const [emailExistente, dniExistente] = await Promise.all([
      prisma.usuario.findUnique({ where: { email } }),
      prisma.usuario.findUnique({ where: { dni } }),
    ]);

    if (emailExistente) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este email" },
        { status: 400 }
      );
    }

    if (dniExistente) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este DNI" },
        { status: 400 }
      );
    }

    /* =========================
       Credenciales temporales
       ========================= */
    const passwordTemporal = crypto.randomBytes(4).toString("hex");
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);

    const tokenVerificacion = crypto.randomBytes(24).toString("hex");

    /* =========================
       Crear usuario
       ========================= */
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email,
        password: passwordHash,
        nombre,
        apellido,
        dni,
        telefono,
        rol,
        funcion,
        tokenVerificacion,
        passwordTemporal: true,
        emailVerificado: false,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        funcion: true,
        createdAt: true,
      },
    });

    /* =========================
       Envío de email
       ========================= */
    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const verificationUrl = `${baseUrl}/verificar-email?token=${tokenVerificacion}`;

    await sendEmail({
      to: email,
      subject: "Acceso a AeroSAMEC – Verificación de cuenta",
      html: `
        <p>Hola <strong>${nombre}</strong>,</p>

        <p>Tu usuario fue creado en el sistema <strong>AeroSAMEC</strong>.</p>

        <p>
          <strong>Contraseña temporal:</strong><br/>
          <code>${passwordTemporal}</code>
        </p>

        <p>
          Para activar tu cuenta, hacé clic en el siguiente enlace:
        </p>

        <p>
          <a href="${verificationUrl}">
            Verificar cuenta
          </a>
        </p>

        <p>
          Por seguridad, deberás cambiar tu contraseña al primer ingreso.
        </p>

        <hr/>
        <p style="font-size:12px;color:#666">
          Si no solicitaste este acceso, ignorá este mensaje.
        </p>
      `,
    });

    return NextResponse.json({
      message: "Usuario creado y email enviado correctamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error("Error creando usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
