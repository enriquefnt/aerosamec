import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const OPCIONES_VIA_AEREA = ['Permeable', 'Obstruida', 'Asegurada (TET)'] as const;
const OPCIONES_RESPIRACION = ['Normal', 'Dificultad', 'Asistida', 'Apnea'] as const;
const OPCIONES_HEMODINAMIA = ['Estable', 'Inestable', 'Shock', 'PCR'] as const;
const OPCIONES_NEUROLOGICO = ['Alerta', 'Verbal', 'Dolor', 'No responde'] as const;

function esOpcionValida(valor: string, opciones: readonly string[]) {
  return opciones.includes(valor);
}

function limpiarTexto(texto: string | undefined | null): string {
  if (typeof texto !== 'string') return '';
  return texto.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      trasladoId,
      usuarioId,
      diagnostico,
      viaAerea,
      respiracion,
      hemodinamia,
      neurologico
    } = body;

    if (!trasladoId || typeof trasladoId !== 'string') {
      return NextResponse.json({ error: 'trasladoId es requerido' }, { status: 400 });
    }

    if (!usuarioId || typeof usuarioId !== 'string') {
      return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 });
    }

    const diagnosticoLimpio = limpiarTexto(diagnostico);
    const viaAereaLimpia = limpiarTexto(viaAerea);
    const respiracionLimpia = limpiarTexto(respiracion);
    const hemodinamiaLimpia = limpiarTexto(hemodinamia);
    const neurologicoLimpio = limpiarTexto(neurologico);

    if (!diagnosticoLimpio) {
      return NextResponse.json({ error: 'El diagnóstico es requerido' }, { status: 400 });
    }

    if (!esOpcionValida(viaAereaLimpia, OPCIONES_VIA_AEREA)) {
      return NextResponse.json({ error: 'Vía Aérea inválida' }, { status: 400 });
    }

    if (!esOpcionValida(respiracionLimpia, OPCIONES_RESPIRACION)) {
      return NextResponse.json({ error: 'Respiración inválida' }, { status: 400 });
    }

    if (!esOpcionValida(hemodinamiaLimpia, OPCIONES_HEMODINAMIA)) {
      return NextResponse.json({ error: 'Hemodinamia inválida' }, { status: 400 });
    }

    if (!esOpcionValida(neurologicoLimpio, OPCIONES_NEUROLOGICO)) {
      return NextResponse.json({ error: 'Neurológico inválido' }, { status: 400 });
    }

    const [traslado, usuario] = await Promise.all([
      prisma.traslado.findUnique({ where: { id: trasladoId }, select: { id: true } }),
      prisma.usuario.findUnique({ where: { id: usuarioId }, select: { id: true } })
    ]);

    if (!traslado) {
      return NextResponse.json({ error: 'Traslado no encontrado' }, { status: 404 });
    }

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const evaluacionInicial = await prisma.evaluacionInicial.create({
      data: {
        trasladoId,
        usuarioId,
        diagnostico: diagnosticoLimpio,
        viaAerea: viaAereaLimpia,
        respiracion: respiracionLimpia,
        hemodinamia: hemodinamiaLimpia,
        neurologico: neurologicoLimpio
      }
    });

    await prisma.seguimiento.create({
      data: {
        trasladoId,
        usuarioId,
        tipo: 'EVALUACION_INICIAL',
        descripcion: `Evaluación inicial registrada`,
        observaciones: `Dx: ${diagnosticoLimpio} | VA: ${viaAereaLimpia} | Resp: ${respiracionLimpia} | Hemo: ${hemodinamiaLimpia} | Neuro: ${neurologicoLimpio}`
      }
    });

    return NextResponse.json(
      {
        message: 'Evaluación inicial registrada exitosamente',
        evaluacionInicial
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registrando evaluación inicial:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
