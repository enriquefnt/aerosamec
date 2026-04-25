import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../../../../lib/db';

const normalizar = (valor?: string | null) =>
  (valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

// GET - Listar traslados para operarios (solo los asignados)
export async function GET(request: Request) {
  try {
    const token = await getToken({
      req: request as unknown as Parameters<typeof getToken>[0]['req'],
      secret: process.env.NEXTAUTH_SECRET || 'tu-secreto-super-seguro-aqui'
    });

    const userId = token?.sub;
    const userFuncion = normalizar((token as { funcion?: string } | null)?.funcion);

    const usuario = userId
      ? await prisma.usuario.findUnique({
          where: { id: userId },
          select: { funcion: true }
        })
      : null;

    const funcionFinal = normalizar(usuario?.funcion || userFuncion);

    const trasladosActivos = await prisma.traslado.findMany({
      select: {
        id: true,
        numeroTraslado: true,
        estado: true,
        codigoTraslado: true,
        pacienteNombre: true,
        pacienteApellido: true,
        pacienteDni: true,
        pacienteSexo: true,
        pacienteDomicilio: true,
        pacienteLocalidad: true,
        pacienteEdadAnios: true,
        pacienteEdadMeses: true,
        pacienteEdadDias: true,
        diagnosticos: true,
        epicrisis: true,
        fechaSolicitud: true,
        medicoUsuarioId: true,
        enfermeroUsuarioId: true,
        hospitalOrigen: {
          select: { nombre: true }
        },
        hospitalDestino: {
          select: { nombre: true }
        },
        usuarioCreador: {
          select: { nombre: true, apellido: true }
        },
        usuarioAsignado: {
          select: { nombre: true, apellido: true }
        },
        procedimientos: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { fechaHora: 'desc' }
        },
        medicaciones: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { fechaHora: 'desc' }
        },
        controlesSignos: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { fechaHora: 'desc' }
        }
      },
      orderBy: {
        fechaSolicitud: 'desc'
      }
    });

    const traslados = trasladosActivos.filter((t) => {
      if (!userId) return false;

      if (funcionFinal.includes('MEDIC')) {
        return t.medicoUsuarioId === userId;
      }

      if (funcionFinal.includes('ENFERMER')) {
        return t.enfermeroUsuarioId === userId;
      }

      return t.medicoUsuarioId === userId || t.enfermeroUsuarioId === userId;
    });

    console.log('[operario] filtro traslados', {
      userId,
      funcionFinal,
      totalActivos: trasladosActivos.length,
      totalFiltrados: traslados.length
    });

    return NextResponse.json({ traslados });
  } catch (error) {
    console.error('Error obteniendo traslados para operario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
