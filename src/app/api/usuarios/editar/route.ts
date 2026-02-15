import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// PUT - Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      nombre: nombreRaw, 
      apellido: apellidoRaw, 
      dni: dniRaw, 
      telefono: telefonoRaw, 
      rol, 
      funcion, 
      activo 
    } = body;

    // Formatear y limpiar datos automáticamente
    const nombre = nombreRaw ? capitalizarNombre(nombreRaw) : undefined;
    const apellido = apellidoRaw ? capitalizarNombre(apellidoRaw) : undefined;
    const dni = dniRaw ? formatearDNI(dniRaw) : undefined;
    const telefono = telefonoRaw !== undefined ? (telefonoRaw ? formatearTelefono(telefonoRaw) : null) : undefined;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Verificar si el DNI ya existe en otro usuario
    if (dni) {
      const dniExistente = await prisma.usuario.findFirst({
        where: { 
          dni,
          id: { not: id }
        }
      });

      if (dniExistente) {
        return NextResponse.json(
          { error: 'Ya existe otro usuario con este DNI' },
          { status: 400 }
        );
      }
    }

    const updateData: {
      nombre?: string;
      apellido?: string;
      dni?: string;
      telefono?: string | null;
      rol?: string;
      funcion?: string;
      activo?: boolean;
    } = {};
    
    // Admin puede actualizar todos los campos (excepto email y password)
    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (dni) updateData.dni = dni;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (rol) updateData.rol = rol;
    if (funcion) updateData.funcion = funcion;
    if (activo !== undefined) updateData.activo = activo;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: updateData,
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
      }
    });

    console.log(`✏️ Usuario actualizado: ${usuarioActualizado.email}`);

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
function capitalizarNombre(apellidoRaw: string | number | null | undefined): string {
  const raw = String(apellidoRaw ?? '').trim();
  if (!raw) return '';

  const locale = 'es-ES';
  return raw
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word =>
      word
        .split('-')
        .map(part =>
          part
            .split("'")
            .map(seg =>
              seg ? seg.charAt(0).toLocaleUpperCase(locale) + seg.slice(1).toLocaleLowerCase(locale) : seg
            )
            .join("'")
        )
        .join('-')
    )
    .join(' ');
}
function formatearDNI(dniRaw: string | number | null | undefined): string {
  const raw = String(dniRaw ?? '').trim();
  if (!raw) return '';

  // Normalizar: conservar solo dígitos
  const digits = raw.replace(/\D+/g, '');

  // Validación mínima: DNI argentino suele tener 7 u 8 dígitos.
  // Si no cumple, devolvemos la cadena de dígitos (vacía si no hay dígitos).
  if (digits.length === 0) return '';

  // Formatear con puntos como separadores de miles: 12345678 -> 12.345.678
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function formatearTelefono(telefonoRaw: string | number | null | undefined): string {
  const raw = String(telefonoRaw ?? '').trim();
  if (!raw) return '';

  const hadPlus = raw.startsWith('+');
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';

  // If original had a plus sign, return E.164-like string
  if (hadPlus) return `+${digits}`;

  // Common 10-digit formatting: (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // If looks like an international number (longer than 11 digits) or explicit country code, return with plus
  if (digits.length > 11) return `+${digits}`;

  // For other lengths, format by grouping last 4 digits and space-separating preceding groups of up to 3
  const last4 = digits.slice(-4);
  const rest = digits.slice(0, -4);
  const restGroups = rest.match(/\d{1,3}/g) || [];
  return [...restGroups, last4].filter(Boolean).join(' ');
}

