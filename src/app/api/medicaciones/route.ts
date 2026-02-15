import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Registrar nueva medicación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trasladoId,
      usuarioId,
      medicamento: medicamentoRaw,
      dosis: dosisRaw,
      via,
      observaciones: observacionesRaw,
      fechaHora
    } = body;

    // Formatear y limpiar datos automáticamente
    const medicamento = formatearMedicamento(medicamentoRaw);
    const dosis = limpiarTexto(dosisRaw);
    const observaciones = observacionesRaw ? limpiarTexto(observacionesRaw) : null;

    // Validaciones básicas
    if (!trasladoId || !medicamento || !dosis || !via) {
      return NextResponse.json(
        { error: 'Traslado, medicamento, dosis y vía son obligatorios' },
        { status: 400 }
      );
    }

    // Si no hay usuarioId, usar el creador del traslado
    let finalUsuarioId = usuarioId;
    if (!finalUsuarioId) {
      const traslado = await prisma.traslado.findUnique({
        where: { id: trasladoId }
      });
      finalUsuarioId = traslado?.usuarioAsignadoId || traslado?.usuarioCreadorId;
    }

    // Verificar que el traslado existe
    const traslado = await prisma.traslado.findUnique({
      where: { id: trasladoId }
    });

    if (!traslado) {
      return NextResponse.json(
        { error: 'Traslado no encontrado' },
        { status: 404 }
      );
    }

    // Crear medicación
    const nuevaMedicacion = await prisma.medicacion.create({
      data: {
        trasladoId,
        usuarioId: finalUsuarioId,
        medicamento,
        dosis,
        via,
        observaciones,
        fechaHora: fechaHora ? new Date(fechaHora) : new Date()
      },
      include: {
        usuario: {
          select: { nombre: true, apellido: true }
        },
        traslado: {
          select: { numeroTraslado: true }
        }
      }
    });

    console.log(`💊 Medicación registrada: ${medicamento} - ${traslado.numeroTraslado}`);

    return NextResponse.json({
      message: 'Medicación registrada exitosamente',
      medicacion: nuevaMedicacion
    });

  } catch (error) {
    console.error('Error registrando medicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
function formatearMedicamento(medicamentoRaw: unknown): string | null {
  if (medicamentoRaw == null) return null;

  let raw: string;
  if (typeof medicamentoRaw === 'string') {
    raw = medicamentoRaw;
  } else if (typeof medicamentoRaw === 'object') {
    // aceptar varias posibles claves que el cliente pueda enviar
    raw = (medicamentoRaw as Record<string, unknown>).nombre as string ||
          (medicamentoRaw as Record<string, unknown>).name as string ||
          (medicamentoRaw as Record<string, unknown>).medicamento as string ||
          '';
  } else {
    raw = String(medicamentoRaw);
  }

  // Eliminar etiquetas HTML y caracteres de control, colapsar espacios
  raw = raw.replace(/<\/?[^>]+(>|$)/g, '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!raw) return null;

  // Limitar longitud razonable
  if (raw.length > 200) raw = raw.slice(0, 200).trim();

  // Normalizar capitalización: mantener siglas comunes en mayúsculas (IV, IM, SC, PO, O2, etc.)
  const upperExceptions = new Set(['IV', 'IM', 'SC', 'PO', 'PR', 'O2', 'O₂']);
  const formatted = raw
    .split(' ')
    .map((word) => {
      const up = word.toUpperCase();
      if (upperExceptions.has(up) || /^[A-Z0-9\/\-]+$/.test(word)) return up;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return formatted;
}
function limpiarTexto(dosisRaw: unknown): string | null {
  if (dosisRaw == null) return null;

  let texto: string;

  if (typeof dosisRaw === 'string') {
    texto = dosisRaw;
  } else if (typeof dosisRaw === 'number' || typeof dosisRaw === 'boolean') {
    texto = String(dosisRaw);
  } else if (Array.isArray(dosisRaw)) {
    texto = dosisRaw.join(' ');
  } else if (typeof dosisRaw === 'object') {
    // aceptar varias claves comunes o concatenar valores útiles
    const obj = dosisRaw as Record<string, unknown>;
    texto =
      (obj.text as string) ||
      (obj.valor as string) ||
      (obj.value as string) ||
      (obj.descripcion as string) ||
      (obj.desc as string) ||
      Object.values(obj).map(String).join(' ');
  } else {
    texto = String(dosisRaw);
  }

  // Eliminar etiquetas HTML, caracteres de control y normalizar espacios
  texto = texto.replace(/<\/?[^>]+(>|$)/g, ' ')
               .replace(/[\u0000-\u001F\u007F\r\n\t]+/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();

  if (!texto) return null;

  // Limitar longitud razonable para dosis/observaciones
  const MAX_LENGTH = 500;
  if (texto.length > MAX_LENGTH) texto = texto.slice(0, MAX_LENGTH).trim();

  return texto;
}

