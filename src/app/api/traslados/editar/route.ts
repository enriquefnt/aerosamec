import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

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

// Interfaz para los datos de actualización del traslado
interface UpdateTrasladoData {
  updatedAt: Date;
  pacienteEdadAnios?: number;
  pacienteEdadMeses?: number;
  pacienteEdadDias?: number;
  pacienteNombre?: string;
  pacienteApellido?: string;
  pacienteDni?: string;
  pacienteFechaNac?: Date;
  pacienteSexo?: string;
  pacientePeso?: number;
  pacienteAltura?: number;
  pacienteDomicilio?: string;
  pacienteLocalidad?: string;
  tieneCobertura?: boolean;
  numeroObraSocial?: string | null;
  institucionSolicitante?: string;
  profesionalNombre?: string;
  profesionalCelular?: string;
  motivoPedido?: string;
  diagnosticos?: string;
  codigoTraslado?: string;
  tipoComplejidad?: string;
  categoriaPaciente?: string;
  prioridad?: string;
}

// PUT - Editar traslado
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      // Datos del paciente
      pacienteNombre,
      pacienteApellido,
      pacienteDni,
      pacienteFechaNac,
      pacienteSexo,
      pacientePeso,
      pacienteAltura,
      pacienteDomicilio,
      pacienteLocalidad,
      tieneCobertura,
      numeroObraSocial,
      
      // Datos de la solicitud
      institucionSolicitante,
      profesionalNombre,
      profesionalCelular,
      motivoPedido,
      diagnosticos,
      codigoTraslado,
      
      // Datos del traslado
      tipoComplejidad,
      categoriaPaciente,
      prioridad
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del traslado es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el traslado existe
    const trasladoExistente = await prisma.traslado.findUnique({
      where: { id }
    });

    if (!trasladoExistente) {
      return NextResponse.json(
        { error: 'Traslado no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el DNI ya existe en otro paciente
    if (pacienteDni && pacienteDni !== trasladoExistente.pacienteDni) {
      const dniExistente = await prisma.traslado.findFirst({
        where: { 
          pacienteDni,
          id: { not: id }
        }
      });

      if (dniExistente) {
        return NextResponse.json(
          { error: 'Ya existe otro paciente con este DNI' },
          { status: 400 }
        );
      }
    }

    // Calcular edad si cambió la fecha de nacimiento
    let edadData: Partial<Pick<UpdateTrasladoData, 'pacienteEdadAnios' | 'pacienteEdadMeses' | 'pacienteEdadDias'>> = {};
    if (pacienteFechaNac) {
      const fechaNac = new Date(pacienteFechaNac);
      const edad = calcularEdad(fechaNac);
      edadData = {
        pacienteEdadAnios: edad.anios,
        pacienteEdadMeses: edad.meses,
        pacienteEdadDias: edad.dias
      };
    }

    // Preparar datos de actualización
    const updateData: UpdateTrasladoData = {
      updatedAt: new Date(),
      ...edadData
    };

    // Actualizar solo los campos que se enviaron
    if (pacienteNombre) updateData.pacienteNombre = pacienteNombre;
    if (pacienteApellido) updateData.pacienteApellido = pacienteApellido;
    if (pacienteDni) updateData.pacienteDni = pacienteDni;
    if (pacienteFechaNac) updateData.pacienteFechaNac = new Date(pacienteFechaNac);
    if (pacienteSexo) updateData.pacienteSexo = pacienteSexo;
    if (pacientePeso) updateData.pacientePeso = parseFloat(pacientePeso);
    if (pacienteAltura) updateData.pacienteAltura = parseFloat(pacienteAltura);
    if (pacienteDomicilio) updateData.pacienteDomicilio = pacienteDomicilio;
    if (pacienteLocalidad) updateData.pacienteLocalidad = pacienteLocalidad;
    if (tieneCobertura !== undefined) updateData.tieneCobertura = tieneCobertura;
    if (numeroObraSocial !== undefined) updateData.numeroObraSocial = tieneCobertura ? numeroObraSocial : null;
    
    if (institucionSolicitante) updateData.institucionSolicitante = institucionSolicitante;
    if (profesionalNombre) updateData.profesionalNombre = profesionalNombre;
    if (profesionalCelular) updateData.profesionalCelular = profesionalCelular;
    if (motivoPedido) updateData.motivoPedido = motivoPedido;
    if (diagnosticos) updateData.diagnosticos = diagnosticos;
    if (codigoTraslado) updateData.codigoTraslado = codigoTraslado;
    
    if (tipoComplejidad) updateData.tipoComplejidad = tipoComplejidad;
    if (categoriaPaciente) updateData.categoriaPaciente = categoriaPaciente;
    if (prioridad) updateData.prioridad = prioridad;

    // Actualizar traslado
    const trasladoActualizado = await prisma.traslado.update({
      where: { id },
      data: updateData,
      include: {
        hospitalOrigen: { select: { nombre: true } },
        hospitalDestino: { select: { nombre: true } },
        usuarioCreador: { select: { nombre: true, apellido: true } }
      }
    });

    // Crear seguimiento de la edición
    await prisma.seguimiento.create({
      data: {
        trasladoId: id,
        usuarioId: trasladoExistente.usuarioCreadorId, // TODO: Usar usuario actual de la sesión
        tipo: 'OBSERVACION_MEDICA',
        descripcion: 'Traslado editado',
        observaciones: 'Datos del traslado actualizados por coordinador',
      }
    });

    console.log(`✏️ Traslado editado: ${trasladoExistente.numeroTraslado}`);

    return NextResponse.json({
      message: 'Traslado actualizado exitosamente',
      traslado: trasladoActualizado
    });

  } catch (error) {
    console.error('Error editando traslado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}