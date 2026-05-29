import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../../../../lib/db';

const normalizar = (valor?: string | null) =>
  (valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

const limpiarId = (valor?: string | null) => (valor || '').trim();

type OperarioInput = {
  userId: string;
  userFuncion: string;
};

async function resolverOperarioDesdeRequest(request: Request): Promise<OperarioInput | null> {
  const token = await getToken({
    req: request as unknown as Parameters<typeof getToken>[0]['req'],
    secret: process.env.NEXTAUTH_SECRET || 'tu-secreto-super-seguro-aqui'
  });

  const tokenUserId = limpiarId(token?.sub);
  const tokenFuncion = normalizar((token as { funcion?: string } | null)?.funcion);

  let requestUserId = '';
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);
    requestUserId = limpiarId(searchParams.get('operarioId') || searchParams.get('userId'));
  }

  if (request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as { operarioId?: string; userId?: string };
    requestUserId = limpiarId(body.operarioId || body.userId);
  }

  const userId = limpiarId(requestUserId || tokenUserId);
  if (!userId) return null;

  return {
    userId,
    userFuncion: tokenFuncion
  };
}

async function obtenerTrasladosOperario(request: Request) {
  const operario = await resolverOperarioDesdeRequest(request);

  if (!operario?.userId) {
    return NextResponse.json(
      { error: 'operarioId/userId es requerido' },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: operario.userId },
    select: { funcion: true }
  });

  const funcionFinal = normalizar(usuario?.funcion || operario.userFuncion);

  const whereByFuncion = funcionFinal.includes('MEDIC')
    ? { medicoUsuarioId: operario.userId }
    : funcionFinal.includes('ENFERMER')
      ? { enfermeroUsuarioId: operario.userId }
      : {
          OR: [
            { medicoUsuarioId: operario.userId },
            { enfermeroUsuarioId: operario.userId }
          ]
        };

  const traslados = await prisma.traslado.findMany({
    where: whereByFuncion,
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
      },
      evaluacionesIniciales: {
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

  console.log('[operario] filtro traslados', {
    userId: operario.userId,
    funcionFinal,
    whereByFuncion,
    totalFiltrados: traslados.length
  });

  return NextResponse.json({ traslados });
}

// GET - Listar traslados para operarios (solo los asignados)
export async function GET(request: Request) {
  try {
    return await obtenerTrasladosOperario(request);
  } catch (error) {
    console.error('Error obteniendo traslados para operario (GET):', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Listar traslados para operario enviando identificador en body
export async function POST(request: Request) {
  try {
    return await obtenerTrasladosOperario(request);
  } catch (error) {
    console.error('Error obteniendo traslados para operario (POST):', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
