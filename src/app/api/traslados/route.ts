import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { capitalizarNombre, formatearDNI, limpiarTexto, formatearInstitucion, formatearTelefono } from '@/lib/formatters';

// Función para calcular edad
function calcularEdad(fechaNacimiento: Date, fechaReferencia: Date = new Date()) {
  const diffMs = fechaReferencia.getTime() - fechaNacimiento.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 365) {
    // Menor de un año: calcular meses y días
    const meses = Math.floor(diffDays / 30);
    const dias = diffDays % 30;
    return { anios: 0, meses, dias };
  } else {
    // Mayor de un año: calcular años y meses
    const anios = Math.floor(diffDays / 365);
    const mesesRestantes = Math.floor((diffDays % 365) / 30);
    return { anios, meses: mesesRestantes, dias: 0 };
  }
}

// Función para generar número de traslado
function generarNumeroTraslado(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `TRA-${year}-${random}`;
}

// GET - Listar traslados
export async function GET() {
  try {
    const traslados = await prisma.traslado.findMany({
      include: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ traslados });
  } catch (error) {
    console.error('Error obteniendo traslados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo traslado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Datos del paciente (raw)
      pacienteNombre: pacienteNombreRaw,
      pacienteApellido: pacienteApellidoRaw,
      pacienteDni: pacienteDniRaw,
      pacienteFechaNac,
      pacienteSexo,
      pacientePeso,
      pacienteAltura,
      pacienteDomicilio: pacienteDomicilioRaw,
      pacienteLocalidad: pacienteLocalidadRaw,
      tieneCobertura,
      numeroObraSocial: numeroObraSocialRaw,
      
      // Datos de la solicitud (raw)
      institucionSolicitante: institucionRaw,
      profesionalNombre: profesionalNombreRaw,
      profesionalCelular: profesionalCelularRaw,
      motivoPedido: motivoPedidoRaw,
      diagnosticos: diagnosticosRaw,
      codigoTraslado,
      
      // Datos del traslado
      hospitalOrigenId,
      hospitalDestinoId,
      tipoComplejidad,
      categoriaPaciente,
      prioridad,
      usuarioCreadorId
    } = body;

    // Formatear y limpiar datos automáticamente
    const pacienteNombre = capitalizarNombre(pacienteNombreRaw);
    const pacienteApellido = capitalizarNombre(pacienteApellidoRaw);
    const pacienteDni = formatearDNI(pacienteDniRaw);
    const pacienteDomicilio = limpiarTexto(pacienteDomicilioRaw);
    const pacienteLocalidad = capitalizarNombre(pacienteLocalidadRaw);
    const numeroObraSocial = numeroObraSocialRaw ? limpiarTexto(numeroObraSocialRaw) : null;
    
    const institucionSolicitante = formatearInstitucion(institucionRaw);
    const profesionalNombre = capitalizarNombre(profesionalNombreRaw);
    const profesionalCelular = formatearTelefono(profesionalCelularRaw);
    const motivoPedido = limpiarTexto(motivoPedidoRaw);
    const diagnosticos = limpiarTexto(diagnosticosRaw);

    // Validaciones básicas
    if (!pacienteNombre || !pacienteApellido || !pacienteDni || !pacienteFechaNac) {
      return NextResponse.json(
        { error: 'Los datos básicos del paciente son obligatorios' },
        { status: 400 }
      );
    }

    if (!institucionSolicitante || !profesionalNombre || !motivoPedido) {
      return NextResponse.json(
        { error: 'Los datos de la solicitud son obligatorios' },
        { status: 400 }
      );
    }

    // Calcular edad automáticamente
    const fechaNac = new Date(pacienteFechaNac);
    const edad = calcularEdad(fechaNac);

    // Generar número de traslado único
    let numeroTraslado = generarNumeroTraslado();
    let numeroExiste = true;
    
    while (numeroExiste) {
      const existente = await prisma.traslado.findUnique({
        where: { numeroTraslado }
      });
      if (existente) {
        numeroTraslado = generarNumeroTraslado();
      } else {
        numeroExiste = false;
      }
    }

    // Crear traslado
    const nuevoTraslado = await prisma.traslado.create({
      data: {
        numeroTraslado,
        
        // Información del paciente
        pacienteNombre,
        pacienteApellido,
        pacienteDni,
        pacienteFechaNac: fechaNac,
        pacienteEdadAnios: edad.anios,
        pacienteEdadMeses: edad.meses,
        pacienteEdadDias: edad.dias,
        pacienteSexo,
        pacientePeso: pacientePeso ? parseFloat(pacientePeso) : null,
        pacienteAltura: pacienteAltura ? parseFloat(pacienteAltura) : null,
        pacienteDomicilio,
        pacienteLocalidad,
        tieneCobertura,
        numeroObraSocial: tieneCobertura ? numeroObraSocial : null,
        
        // Información de la solicitud
        institucionSolicitante,
        profesionalNombre,
        profesionalCelular,
        motivoPedido,
        diagnosticos,
        codigoTraslado,
        
        // Datos del traslado
        hospitalOrigenId,
        hospitalDestinoId,
        tipoComplejidad,
        categoriaPaciente,
        prioridad: prioridad || 'NORMAL',
        usuarioCreadorId,
        
        estado: 'SOLICITADO'
      },
      include: {
        hospitalOrigen: {
          select: { nombre: true }
        },
        hospitalDestino: {
          select: { nombre: true }
        },
        usuarioCreador: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    console.log(`🚁 Traslado creado: ${numeroTraslado} - ${pacienteNombre} ${pacienteApellido}`);

    return NextResponse.json({
      message: 'Traslado creado exitosamente',
      traslado: nuevoTraslado
    });

  } catch (error) {
    console.error('Error creando traslado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}