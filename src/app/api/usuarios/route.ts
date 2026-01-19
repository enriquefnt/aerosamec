import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/db';

// GET - Listar usuarios (solo para admins)
export async function GET() {
  try {
    // Por ahora, simplificamos sin verificación de sesión para testing
    // TODO: Agregar verificación de admin después

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
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario (solo para admins)
export async function POST(request: NextRequest) {
  try {
    // Por ahora, simplificamos sin verificación de sesión para testing
    // TODO: Agregar verificación de admin después

    const body = await request.json();
    const { 
      email, 
      nombre, 
      apellido, 
      dni, 
      telefono, 
      rol, 
      funcion 
    } = body;

    // Validaciones básicas
    if (!email || !nombre || !apellido || !dni || !rol || !funcion) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      );
    }

    // Verificar si el DNI ya existe
    const dniExistente = await prisma.usuario.findUnique({
      where: { dni }
    });

    if (dniExistente) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este DNI' },
        { status: 400 }
      );
    }

    // Generar contraseña temporal
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);
    
    // Generar token de verificación simple
    const tokenVerificacion = Math.random().toString(36).slice(-16);

    // Crear usuario
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
        dni: true,
        telefono: true,
        rol: true,
        funcion: true,
        activo: true,
        emailVerificado: true,
        passwordTemporal: true,
        createdAt: true,
      }
    });

    // Generar URL de verificación para mostrar al admin
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verificar-email?token=${tokenVerificacion}`;

    console.log(`📧 Usuario creado: ${email}`);
    console.log(`🔑 Password temporal: ${passwordTemporal}`);
    console.log(`🔗 URL verificación: ${verificationUrl}`);

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      usuario: nuevoUsuario,
      passwordTemporal, // Solo para mostrar al admin
      emailInfo: {
        success: true,
        verificationUrl,
        message: 'Email de verificación generado (ver detalles abajo)'
      }
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}