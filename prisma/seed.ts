import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  await prisma.seguimiento.deleteMany()
  await prisma.medicacion.deleteMany()
  await prisma.procedimiento.deleteMany()
  await prisma.traslado.deleteMany()
  await prisma.hospital.deleteMany()
  await prisma.usuario.deleteMany()

  // Hash para contraseñas (Como Hash::make en Laravel)
  const passwordHash = await bcrypt.hash('123456', 10)

  // Crear usuarios del sistema
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@salud.gob.ar',
      password: passwordHash,
      nombre: 'Administrador',
      apellido: 'Sistema',
      dni: '12345678',
      telefono: '+54 11 1234-5678',
      rol: 'ADMIN',
      funcion: 'ADMINISTRATIVO',
      emailVerificado: true,
      passwordTemporal: false,
    },
  })

  const coordinador = await prisma.usuario.create({
    data: {
      email: 'coord@salud.gob.ar',
      password: passwordHash,
      nombre: 'María',
      apellido: 'González',
      dni: '87654321',
      telefono: '+54 11 2345-6789',
      rol: 'COORDINADOR',
      funcion: 'MEDICO',
      emailVerificado: true,
      passwordTemporal: false,
    },
  })

  const operario = await prisma.usuario.create({
    data: {
      email: 'operario@salud.gob.ar',
      password: passwordHash,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      dni: '11223344',
      telefono: '+54 11 3456-7890',
      rol: 'OPERARIO',
      funcion: 'PARAMEDICO',
      emailVerificado: true,
      passwordTemporal: false,
    },
  })

  // Crear hospitales
  const hospitalGarrahan = await prisma.hospital.create({
    data: {
      nombre: 'Hospital de Pediatría SAMIC Prof. Dr. Juan P. Garrahan',
      direccion: 'Combate de los Pozos 1881',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      telefono: '+54 11 4308-4300',
      email: 'info@garrahan.gov.ar',
      tipo: 'PUBLICO',
    },
  })

  const hospitalItaliano = await prisma.hospital.create({
    data: {
      nombre: 'Hospital Italiano de Buenos Aires',
      direccion: 'Perón 4190',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      telefono: '+54 11 4959-0200',
      email: 'info@hospitalitaliano.org.ar',
      tipo: 'PRIVADO',
    },
  })

  const hospitalCordoba = await prisma.hospital.create({
    data: {
      nombre: 'Hospital Nacional de Clínicas',
      direccion: 'Av. Córdoba 2351',
      ciudad: 'Córdoba',
      provincia: 'Córdoba',
      telefono: '+54 351 433-4000',
      email: 'info@hnc.gov.ar',
      tipo: 'PUBLICO',
    },
  })

  const hospitalMendoza = await prisma.hospital.create({
    data: {
      nombre: 'Hospital Central de Mendoza',
      direccion: 'Av. San Martín 965',
      ciudad: 'Mendoza',
      provincia: 'Mendoza',
      telefono: '+54 261 413-3000',
      email: 'info@hospitalcentral.mendoza.gov.ar',
      tipo: 'PUBLICO',
    },
  })

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

  // Crear traslados de ejemplo con información completa
  const fechaNacAna = new Date('2020-03-15');
  const edadAna = calcularEdad(fechaNacAna);
  
  const traslado1 = await prisma.traslado.create({
    data: {
      numeroTraslado: 'TRA-2024-001',
      fechaTraslado: new Date('2024-01-15T10:30:00'),
      
      // Información completa del paciente
      pacienteNombre: 'Ana',
      pacienteApellido: 'Martínez',
      pacienteDni: '12345678',
      pacienteFechaNac: fechaNacAna,
      pacienteEdadAnios: edadAna.anios,
      pacienteEdadMeses: edadAna.meses,
      pacienteEdadDias: edadAna.dias,
      pacienteSexo: 'FEMENINO',
      pacientePeso: 15.5,
      pacienteAltura: 95.0,
      pacienteDomicilio: 'Av. San Martín 1234',
      pacienteLocalidad: 'Córdoba Capital',
      tieneCobertura: true,
      numeroObraSocial: 'OSDE 123456789',
      
      // Información de la solicitud
      institucionSolicitante: 'Hospital Nacional de Clínicas',
      profesionalNombre: 'Dr. Carlos Mendoza',
      profesionalCelular: '+54 351 555-1234',
      motivoPedido: 'Paciente pediátrica con cardiopatía congénita compleja que requiere cirugía especializada no disponible en el centro de origen',
      diagnosticos: 'Cardiopatía congénita compleja, Tetralogía de Fallot, Insuficiencia cardíaca',
      codigoTraslado: 'ROJO',
      
      // Información del equipo
      horarioSalida: new Date('2024-01-15T10:30:00'),
      medicoNombre: 'Dr. Ana Rodríguez',
      enfermeroNombre: 'Enf. Luis García',
      pilotoNombre: 'Piloto Juan Pérez',
      matriculaAeronave: 'LV-ABC123',
      
      tipoComplejidad: 'ALTA',
      categoriaPaciente: 'PEDIATRICO',
      observaciones: 'Paciente estable, requiere monitoreo cardíaco continuo',
      estado: 'COMPLETADO',
      prioridad: 'ALTA',
      hospitalOrigenId: hospitalCordoba.id,
      hospitalDestinoId: hospitalGarrahan.id,
      usuarioCreadorId: coordinador.id,
      usuarioAsignadoId: operario.id,
    },
  })

  const fechaNacRoberto = new Date('1985-07-22');
  const edadRoberto = calcularEdad(fechaNacRoberto);

  const traslado2 = await prisma.traslado.create({
    data: {
      numeroTraslado: 'TRA-2024-002',
      fechaTraslado: new Date('2024-01-16T14:15:00'),
      
      // Información completa del paciente
      pacienteNombre: 'Roberto',
      pacienteApellido: 'Silva',
      pacienteDni: '87654321',
      pacienteFechaNac: fechaNacRoberto,
      pacienteEdadAnios: edadRoberto.anios,
      pacienteEdadMeses: edadRoberto.meses,
      pacienteEdadDias: edadRoberto.dias,
      pacienteSexo: 'MASCULINO',
      pacientePeso: 75.0,
      pacienteAltura: 175.0,
      pacienteDomicilio: 'Calle Belgrano 567',
      pacienteLocalidad: 'Mendoza Capital',
      tieneCobertura: true,
      numeroObraSocial: 'PAMI 987654321',
      
      // Información de la solicitud
      institucionSolicitante: 'Hospital Central de Mendoza',
      profesionalNombre: 'Dr. María Fernández',
      profesionalCelular: '+54 261 444-5678',
      motivoPedido: 'Paciente adulto con traumatismo craneoencefálico severo que requiere neurocirugía de alta complejidad',
      diagnosticos: 'Traumatismo craneoencefálico severo, Hematoma subdural, Edema cerebral',
      codigoTraslado: 'ROJO',
      
      // Información del equipo
      horarioSalida: new Date('2024-01-16T14:15:00'),
      medicoNombre: 'Dr. Pedro Martínez',
      enfermeroNombre: 'Enf. Carmen López',
      pilotoNombre: 'Piloto Roberto Díaz',
      matriculaAeronave: 'LV-DEF456',
      
      tipoComplejidad: 'MEDIANA',
      categoriaPaciente: 'ADULTO',
      observaciones: 'Paciente intubado, requiere UCI',
      estado: 'EN_CURSO',
      prioridad: 'URGENTE',
      hospitalOrigenId: hospitalMendoza.id,
      hospitalDestinoId: hospitalItaliano.id,
      usuarioCreadorId: coordinador.id,
      usuarioAsignadoId: operario.id,
    },
  })

  const fechaNacSofia = new Date('2024-01-10');
  const edadSofia = calcularEdad(fechaNacSofia);

  const traslado3 = await prisma.traslado.create({
    data: {
      numeroTraslado: 'TRA-2024-003',
      
      // Información completa del paciente
      pacienteNombre: 'Sofía',
      pacienteApellido: 'López',
      pacienteDni: '11223344',
      pacienteFechaNac: fechaNacSofia,
      pacienteEdadAnios: edadSofia.anios,
      pacienteEdadMeses: edadSofia.meses,
      pacienteEdadDias: edadSofia.dias,
      pacienteSexo: 'FEMENINO',
      pacientePeso: 2.8,
      pacienteAltura: 48.0,
      pacienteDomicilio: 'Av. Las Heras 890',
      pacienteLocalidad: 'Mendoza Capital',
      tieneCobertura: false,
      numeroObraSocial: null,
      
      // Información de la solicitud
      institucionSolicitante: 'Hospital Central de Mendoza - Neonatología',
      profesionalNombre: 'Dra. Laura Vega',
      profesionalCelular: '+54 261 333-4567',
      motivoPedido: 'Recién nacida prematura con síndrome de dificultad respiratoria que requiere atención en centro de alta complejidad neonatal',
      diagnosticos: 'Síndrome de dificultad respiratoria neonatal, Prematurez, Bajo peso al nacer',
      codigoTraslado: 'ROJO',
      
      // Sin equipo asignado aún
      horarioSalida: null,
      medicoNombre: null,
      enfermeroNombre: null,
      pilotoNombre: null,
      matriculaAeronave: null,
      
      tipoComplejidad: 'ALTA',
      categoriaPaciente: 'NEONATAL',
      observaciones: 'Recién nacida prematura, requiere ventilación asistida',
      estado: 'ASIGNADO',
      prioridad: 'URGENTE',
      hospitalOrigenId: hospitalMendoza.id,
      hospitalDestinoId: hospitalGarrahan.id,
      usuarioCreadorId: coordinador.id,
      usuarioAsignadoId: operario.id,
    },
  })

  // Crear procedimientos de ejemplo
  await prisma.procedimiento.create({
    data: {
      trasladoId: traslado1.id,
      usuarioId: operario.id,
      tipo: 'Monitoreo Cardíaco',
      descripcion: 'Instalación de monitor cardíaco continuo',
      observaciones: 'Ritmo sinusal normal, FC: 110 lpm',
      fechaHora: new Date('2024-01-15T10:45:00'),
    },
  })

  await prisma.procedimiento.create({
    data: {
      trasladoId: traslado2.id,
      usuarioId: operario.id,
      tipo: 'Control Neurológico',
      descripcion: 'Evaluación de escala de Glasgow',
      observaciones: 'Glasgow 6/15, pupilas reactivas',
      fechaHora: new Date('2024-01-16T14:30:00'),
    },
  })

  // Crear medicaciones de ejemplo
  await prisma.medicacion.create({
    data: {
      trasladoId: traslado1.id,
      usuarioId: operario.id,
      medicamento: 'Furosemida',
      dosis: '1 mg/kg',
      via: 'INTRAVENOSA',
      observaciones: 'Para control de edema pulmonar',
      fechaHora: new Date('2024-01-15T11:00:00'),
    },
  })

  await prisma.medicacion.create({
    data: {
      trasladoId: traslado2.id,
      usuarioId: operario.id,
      medicamento: 'Manitol',
      dosis: '0.5 g/kg',
      via: 'INTRAVENOSA',
      observaciones: 'Para reducción de presión intracraneal',
      fechaHora: new Date('2024-01-16T14:45:00'),
    },
  })

  // Crear seguimientos de ejemplo
  await prisma.seguimiento.create({
    data: {
      trasladoId: traslado1.id,
      usuarioId: operario.id,
      tipo: 'ESTADO_PACIENTE',
      descripcion: 'Paciente estable durante el vuelo',
      observaciones: 'Signos vitales dentro de parámetros normales',
      fechaHora: new Date('2024-01-15T11:30:00'),
    },
  })

  await prisma.seguimiento.create({
    data: {
      trasladoId: traslado2.id,
      usuarioId: operario.id,
      tipo: 'CAMBIO_ESTADO',
      descripcion: 'Traslado iniciado',
      observaciones: 'Despegue exitoso, ETA: 16:30',
      fechaHora: new Date('2024-01-16T14:15:00'),
    },
  })

  console.log('✅ Seed completado exitosamente!')
  console.log(`👤 Usuarios creados: ${admin.email}, ${coordinador.email}, ${operario.email}`)
  console.log(`🏥 Hospitales creados: ${hospitalGarrahan.nombre}, ${hospitalItaliano.nombre}, ${hospitalCordoba.nombre}, ${hospitalMendoza.nombre}`)
  console.log(`🚁 Traslados creados: ${traslado1.numeroTraslado}, ${traslado2.numeroTraslado}, ${traslado3.numeroTraslado}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })