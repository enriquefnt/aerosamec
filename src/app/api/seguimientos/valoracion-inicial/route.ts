import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const OPCIONES_VIA_AEREA = ['Permeable', 'Obstruida', 'Asegurada (TET)'] as const;
const OPCIONES_RESPIRACION = ['Normal', 'Dificultad', 'Asistida', 'Apnea'] as const;
const OPCIONES_HEMODINAMIA = ['Estable', 'Inestable', 'Shock', 'PCR'] as const;
const OPCIONES_NEUROLOGICO = ['Alerta', 'Verbal', 'Dolor', 'No responde'] as const;

function parseDatetimeLocalArgentinaToUTC(fechaHora?: string): Date {
  if (!fechaHora) return new Date();

  const match = fechaHora.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return new Date(fechaHora);

  const [, y, m, d, hh, mm] = match;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh) + 3, Number(mm), 0, 0));
}

function esStringNoVacio(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.trim() !== '';
}

function validarOpcion(valor: string, opciones: readonly string[]): boolean {
  return opciones.includes(valor);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      trasladoId,
      usuarioId,
      fechaHora,
      diagnosticosIniciales,
      viaAerea,
      respiracion,
      hemodinamia,
      neurologico
    } = body as {
      trasladoId?: string;
      usuarioId?: string;
      fechaHora?: string;
      diagnosticosIniciales?: string;
      viaAerea?: string;
      respiracion?: string;
      hemodinamia?: string;
      neurologico?: string;
    };

    if (!esStringNoVacio(trasladoId)) {
      return NextResponse.json({ error: 'ID del traslado es requerido' }, { status: 400 });
    }

    if (!esStringNoVacio(usuarioId)) {
      return NextResponse.json({ error: 'ID del usuario es requerido' }, { status: 400 });
    }

    if (!esStringNoVacio(diagnosticosIniciales)) {
      return NextResponse.json({ error: 'Diagnósticos es obligatorio' }, { status: 400 });
    }

    if (!esStringNoVacio(viaAerea) || !validarOpcion(viaAerea, OPCIONES_VIA_AEREA)) {
      return NextResponse.json({ error: 'Vía Aérea inválida' }, { status: 400 });
    }

    if (!esStringNoVacio(respiracion) || !validarOpcion(respiracion, OPCIONES_RESPIRACION)) {
      return NextResponse.json({ error: 'Respiración inválida' }, { status: 400 });
    }

    if (!esStringNoVacio(hemodinamia) || !validarOpcion(hemodinamia, OPCIONES_HEMODINAMIA)) {
      return NextResponse.json({ error: 'Hemodinamia inválida' }, { status: 400 });
    }

    if (!esStringNoVacio(neurologico) || !validarOpcion(neurologico, OPCIONES_NEUROLOGICO)) {
      return NextResponse.json({ error: 'Neurológico inválido' }, { status: 400 });
    }

    const traslado = await prisma.traslado.findUnique({
      where: { id: trasladoId }
    });

    if (!traslado) {
      return NextResponse.json({ error: 'Traslado no encontrado' }, { status: 404 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const seguimiento = await prisma.seguimiento.create({
      data: {
        trasladoId,
        usuarioId,
        tipo: 'VALORACION_INICIAL',
        descripcion: 'Valoración inicial del paciente',
        observaciones: null,
        diagnosticosIniciales: diagnosticosIniciales.trim(),
        viaAerea,
        respiracion,
        hemodinamia,
        neurologico,
        fechaHora: parseDatetimeLocalArgentinaToUTC(fechaHora)
      }
    });

    return NextResponse.json({
      message: 'Valoración inicial registrada exitosamente',
      seguimiento
    });
  } catch (error) {
    console.error('Error registrando valoración inicial:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
