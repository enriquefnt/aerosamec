import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { formatearFechaHoraLocal } from '@/lib/timezone';

type Params = {
  params: Promise<{ id: string }>;
};

function escapeHtml(value: unknown): string {
  const str = value == null ? '' : String(value);
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#39;');
}

function valor(value: unknown): string {
  const text = value == null || value === '' ? '—' : String(value);
  return escapeHtml(text);
}

function formatearEdadReporte(anios?: number | null, meses?: number | null, dias?: number | null): string {
  const a = anios ?? 0;
  const m = meses ?? 0;
  const d = dias ?? 0;

  if (a > 0) {
    return `${a}A ${m}M`;
  }

  return `${m}M ${d}D`;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const token = await getToken({
      req: _request as unknown as Parameters<typeof getToken>[0]['req'],
      secret: process.env.NEXTAUTH_SECRET || 'tu-secreto-super-seguro-aqui'
    });

    if (!token?.sub || !(token as { rol?: string }).rol) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const traslado = await prisma.traslado.findUnique({
      where: { id },
      include: {
        hospitalOrigen: { select: { nombre: true, ciudad: true } },
        hospitalDestino: { select: { nombre: true, ciudad: true } },
        usuarioCreador: { select: { nombre: true, apellido: true } },
        usuarioAsignado: { select: { id: true, nombre: true, apellido: true } },
        medicaciones: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { fechaHora: 'desc' }
        },
        procedimientos: {
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
          orderBy: { fechaHora: 'asc' }
        }
      }
    });

    if (!traslado) {
      return NextResponse.json({ error: 'Traslado no encontrado' }, { status: 404 });
    }

    const rol = (token as { rol?: string }).rol || '';
    const userId = token.sub;
    const isAdminOrCoord = rol === 'ADMIN' || rol === 'COORDINADOR';
    const isAssignedOperario = rol === 'OPERARIO' && traslado.usuarioAsignado?.id === userId;

    if (!isAdminOrCoord && !isAssignedOperario) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const eventosClinicos: Array<{
      fecha: Date;
      tipo: string;
      detalle: string;
      observaciones: string;
      usuario: string;
    }> = [];

    (traslado.medicaciones || []).forEach((m) => {
      const autor = `${m.usuario?.nombre || ''} ${m.usuario?.apellido || ''}`.trim() || '—';
      eventosClinicos.push({
        fecha: m.fechaHora,
        tipo: 'MEDICACIÓN',
        detalle: `${m.medicamento} · Dosis: ${m.dosis} · Vía: ${m.via}`,
        observaciones: m.observaciones || '—',
        usuario: autor
      });
    });

    (traslado.procedimientos || []).forEach((p) => {
      const autor = `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.trim() || '—';
      eventosClinicos.push({
        fecha: p.fechaHora,
        tipo: `PROCEDIMIENTO (${p.tipo})`,
        detalle: p.descripcion || '—',
        observaciones: p.observaciones || '—',
        usuario: autor
      });
    });

    (traslado.controlesSignos || []).forEach((s) => {
      const autor = `${s.usuario?.nombre || ''} ${s.usuario?.apellido || ''}`.trim() || '—';
      const presion =
        s.presionArterialSist != null || s.presionArterialDiast != null
          ? `${s.presionArterialSist ?? '—'}/${s.presionArterialDiast ?? '—'}`
          : '—';

      const detalle = `FC: ${s.frecuenciaCardiaca ?? '—'} · PA: ${presion} · Temp: ${s.temperatura ?? '—'} · Sat O₂: ${s.saturacionO2 ?? '—'} · FR: ${s.frecuenciaRespiratoria ?? '—'}`;

      eventosClinicos.push({
        fecha: s.fechaHora,
        tipo: 'SIGNOS VITALES',
        detalle,
        observaciones: s.observaciones || '—',
        usuario: autor
      });
    });

    eventosClinicos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    const filasEvaluacionInicial = (traslado.evaluacionesIniciales || [])
      .map((ev) => {
        return `<tr>
          <td>${valor(formatearFechaHoraLocal(ev.fechaHora))}</td>
          <td>${valor(ev.diagnostico)}</td>
          <td>${valor(ev.viaAerea)}</td>
          <td>${valor(ev.respiracion)}</td>
          <td>${valor(ev.hemodinamia)}</td>
          <td>${valor(ev.neurologico)}</td>
        </tr>`;
      })
      .join('');

    const filasEvolucion = eventosClinicos
      .map((e) => {
        return `<tr>
          <td>${valor(formatearFechaHoraLocal(e.fecha))}</td>
          <td>${valor(e.tipo)}</td>
          <td>${valor(e.detalle)}</td>
          <td>${valor(e.observaciones)}</td>
          <td>${valor(e.usuario)}</td>
        </tr>`;
      })
      .join('');

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte Traslado ${escapeHtml(traslado.numeroTraslado)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page { size: legal; margin: 14mm; }
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 0; padding: 0; }
    .screen-actions { display: flex; gap: 8px; margin: 12px 0 18px; }
    .btn { border: 1px solid #d1d5db; background: white; border-radius: 6px; padding: 8px 12px; font-size: 12px; cursor: pointer; }
    .btn:hover { background: #f9fafb; }
    .page { border: 1px solid #d1d5db; border-radius: 6px; padding: 10px; }
    h1 { margin: 0 0 2px; font-size: 16px; letter-spacing: .2px; }
    h2 { margin: 10px 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; color: #374151; }
    .muted { color: #6b7280; font-size: 10px; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px 10px; }
    .item { font-size: 10px; line-height: 1.25; border: 1px solid #e5e7eb; padding: 4px 6px; border-radius: 2px; min-height: 36px; }
    .label { font-weight: 700; color: #111827; display: block; margin-bottom: 1px; font-size: 9px; text-transform: uppercase; }
    .full { grid-column: 1 / -1; }
    .footer { margin-top: 10px; font-size: 9px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 6px; }
    .table-wrap { margin-top: 4px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; }
    th, td { border: 1px solid #d1d5db; padding: 4px 5px; vertical-align: top; text-align: left; }
    th { background: #f3f4f6; color: #111827; font-weight: 700; font-size: 9px; text-transform: uppercase; }
    @media print {
      .screen-actions { display: none !important; }
      .page { border: none; padding: 0; }
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="screen-actions">
    <button class="btn" onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>

  <div class="page">
    <h1>Reporte Individual de Traslado</h1>
    <div class="muted">N° ${valor(traslado.numeroTraslado)} · Fecha solicitud: ${valor(formatearFechaHoraLocal(traslado.fechaSolicitud))}</div>

    <h2>Paciente</h2>
    <div class="grid">
      <div class="item"><span class="label">Nombre y Apellido</span>${valor(`${traslado.pacienteNombre} ${traslado.pacienteApellido}`)}</div>
      <div class="item"><span class="label">DNI</span>${valor(traslado.pacienteDni)}</div>
      <div class="item"><span class="label">Fecha Nacimiento</span>${valor(formatearFechaHoraLocal(traslado.pacienteFechaNac))}</div>
      <div class="item"><span class="label">Sexo</span>${valor(traslado.pacienteSexo)}</div>
      <div class="item"><span class="label">Edad</span>${valor(formatearEdadReporte(traslado.pacienteEdadAnios, traslado.pacienteEdadMeses, traslado.pacienteEdadDias))}</div>
      <div class="item"><span class="label">Domicilio</span>${valor(traslado.pacienteDomicilio)}</div>
      <div class="item"><span class="label">Localidad</span>${valor(traslado.pacienteLocalidad)}</div>
    </div>

    <h2>Solicitud</h2>
    <div class="grid">
      <div class="item"><span class="label">Institución Solicitante</span>${valor(traslado.institucionSolicitante)}</div>
      <div class="item"><span class="label">Profesional</span>${valor(traslado.profesionalNombre)}</div>
      <div class="item"><span class="label">Celular Profesional</span>${valor(traslado.profesionalCelular)}</div>
      <div class="item"><span class="label">Código Traslado</span>${valor(traslado.codigoTraslado)}</div>
      <div class="item full"><span class="label">Motivo</span>${valor(traslado.motivoPedido)}</div>
      <div class="item full"><span class="label">Diagnósticos</span>${valor(traslado.diagnosticos)}</div>
    </div>

    <h2>Datos de traslado</h2>
    <div class="grid">
      <div class="item"><span class="label">Hospital Origen</span>${valor(traslado.hospitalOrigen?.nombre)}</div>
      <div class="item"><span class="label">Hospital Destino</span>${valor(traslado.hospitalDestino?.nombre)}</div>
      <div class="item"><span class="label">Estado</span>${valor(traslado.estado)}</div>
      <div class="item"><span class="label">Prioridad</span>${valor(traslado.prioridad)}</div>
      <div class="item"><span class="label">Categoría</span>${valor(traslado.categoriaPaciente)}</div>
      <div class="item"><span class="label">Complejidad</span>${valor(traslado.tipoComplejidad)}</div>
      <div class="item"><span class="label">Médico</span>${valor(traslado.medicoNombre)}</div>
      <div class="item"><span class="label">Enfermero</span>${valor(traslado.enfermeroNombre)}</div>
      <div class="item"><span class="label">Piloto</span>${valor(traslado.pilotoNombre)}</div>
      <div class="item"><span class="label">Matrícula Aeronave</span>${valor(traslado.matriculaAeronave)}</div>
      <div class="item"><span class="label">Horario salida</span>${valor(traslado.horarioSalida ? formatearFechaHoraLocal(traslado.horarioSalida) : '—')}</div>
      <div class="item"><span class="label">Usuario creador</span>${valor(`${traslado.usuarioCreador?.nombre || ''} ${traslado.usuarioCreador?.apellido || ''}`)}</div>
    </div>

    <h2>Evaluación inicial</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width: 16%;">Fecha/Hora</th>
            <th style="width: 18%;">Diagnóstico</th>
            <th style="width: 16%;">Vía aérea</th>
            <th style="width: 16%;">Respiración</th>
            <th style="width: 17%;">Cardiovascular</th>
            <th style="width: 17%;">Neurológico</th>
          </tr>
        </thead>
        <tbody>
          ${filasEvaluacionInicial || '<tr><td colspan="6">Sin evaluación inicial registrada</td></tr>'}
        </tbody>
      </table>
    </div>

    <h2>Evolución clínica (medicación / procedimientos / signos vitales)</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width: 17%;">Fecha/Hora</th>
            <th style="width: 18%;">Tipo</th>
            <th style="width: 35%;">Detalle</th>
            <th style="width: 18%;">Observaciones</th>
            <th style="width: 12%;">Usuario</th>
          </tr>
        </thead>
        <tbody>
          ${filasEvolucion || '<tr><td colspan="5">Sin registros clínicos durante el traslado</td></tr>'}
        </tbody>
      </table>
    </div>

    <h2>Epicrisis</h2>
    <div class="grid">
      <div class="item full"><span class="label">Resumen clínico</span>${valor((traslado as { epicrisis?: string }).epicrisis || 'Sin epicrisis registrada')}</div>
    </div>

    <div class="footer">
      Emitido por AeroSAMEC · ${escapeHtml(new Date().toLocaleString('es-AR'))}
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error generando reporte de traslado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
