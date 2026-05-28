import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

const maskDbUrl = (url?: string | null) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname;
    const port = u.port || null;
    const database = u.pathname?.replace('/', '') || null;
    const protocol = u.protocol?.replace(':', '') || null;
    return { protocol, host, port, database };
  } catch {
    return { raw: 'invalid-url' };
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const operarioId = (searchParams.get('operarioId') || '').trim();

    if (!operarioId) {
      return NextResponse.json(
        { error: 'operarioId es requerido' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: operarioId },
      select: { id: true, nombre: true, email: true, funcion: true, rol: true }
    });

    const asignadosComoMedico = await prisma.traslado.count({
      where: { medicoUsuarioId: operarioId }
    });

    const asignadosComoEnfermero = await prisma.traslado.count({
      where: { enfermeroUsuarioId: operarioId }
    });

    const muestraTraslados = await prisma.traslado.findMany({
      where: {
        OR: [
          { medicoUsuarioId: operarioId },
          { enfermeroUsuarioId: operarioId }
        ]
      },
      select: {
        id: true,
        numeroTraslado: true,
        estado: true,
        medicoUsuarioId: true,
        enfermeroUsuarioId: true
      },
      orderBy: { fechaSolicitud: 'desc' },
      take: 10
    });

    return NextResponse.json({
      ok: true,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
        DATABASE_URL: maskDbUrl(process.env.DATABASE_URL || null)
      },
      operario: usuario,
      conteos: {
        asignadosComoMedico,
        asignadosComoEnfermero,
        totalAsignados: asignadosComoMedico + asignadosComoEnfermero
      },
      muestraTraslados
    });
  } catch (error) {
    console.error('[debug/vercel-db] error', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
