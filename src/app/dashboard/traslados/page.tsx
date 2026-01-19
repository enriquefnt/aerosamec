"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { formatearFechaHoraLocal } from '@/lib/timezone';

interface Traslado {
  id: string;
  numeroTraslado: string;
  fechaSolicitud: string;
  fechaTraslado?: string;
  fechaFinalizacion?: string;
  
  // Paciente
  pacienteNombre: string;
  pacienteApellido: string;
  pacienteDni: string;
  pacienteFechaNac: string;
  pacienteEdadAnios?: number;
  pacienteEdadMeses?: number;
  pacienteEdadDias?: number;
  pacienteSexo: string;
  pacientePeso?: number;
  pacienteAltura?: number;
  pacienteDomicilio: string;
  pacienteLocalidad: string;
  tieneCobertura: boolean;
  numeroObraSocial?: string;
  
  // Solicitud
  institucionSolicitante: string;
  profesionalNombre: string;
  profesionalCelular: string;
  motivoPedido: string;
  diagnosticos: string;
  codigoTraslado: string;
  
  // Equipo
  horarioSalida?: string;
  medicoNombre?: string;
  enfermeroNombre?: string;
  pilotoNombre?: string;
  matriculaAeronave?: string;
  
  estado: string;
  prioridad: string;
  tipoComplejidad: string;
  categoriaPaciente: string;
  hospitalOrigen: { nombre: string };
  hospitalDestino: { nombre: string };
  usuarioCreador: { nombre: string; apellido: string };
}

export default function GestionTrasladosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [traslados, setTraslados] = useState<Traslado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingTraslado, setCreatingTraslado] = useState(false);
  const [hospitales, setHospitales] = useState<any[]>([]);
  
  // Estados para edición
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTraslado, setEditingTraslado] = useState<Traslado | null>(null);
  const [updatingTraslado, setUpdatingTraslado] = useState(false);
  const [editFormData, setEditFormData] = useState({
    // Datos del paciente
    pacienteNombre: '',
    pacienteApellido: '',
    pacienteDni: '',
    pacienteFechaNac: '',
    pacienteSexo: '',
    pacientePeso: '',
    pacienteAltura: '',
    pacienteDomicilio: '',
    pacienteLocalidad: '',
    tieneCobertura: false,
    numeroObraSocial: '',
    
    // Datos de la solicitud
    institucionSolicitante: '',
    profesionalNombre: '',
    profesionalCelular: '',
    motivoPedido: '',
    diagnosticos: '',
    codigoTraslado: '',
    
    // Datos del traslado
    hospitalOrigenId: '',
    hospitalDestinoId: '',
    tipoComplejidad: '',
    categoriaPaciente: '',
    prioridad: 'NORMAL'
  });
  // Estados para cambio de estado
  const [showEstadoDialog, setShowEstadoDialog] = useState(false);
  const [trasladoEstado, setTrasladoEstado] = useState<Traslado | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [updatingEstado, setUpdatingEstado] = useState(false);
  
  // Estados para asignar equipo
  const [showEquipoDialog, setShowEquipoDialog] = useState(false);
  const [trasladoEquipo, setTrasladoEquipo] = useState<Traslado | null>(null);
  const [updatingEquipo, setUpdatingEquipo] = useState(false);
  const [equipoData, setEquipoData] = useState({
    horarioSalida: '',
    medicoNombre: '',
    enfermeroNombre: '',
    pilotoNombre: '',
    matriculaAeronave: ''
  });
  
  // Estados para eliminación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [trasladoToDelete, setTrasladoToDelete] = useState<Traslado | null>(null);
  const [deletingTraslado, setDeletingTraslado] = useState(false);

  // Form state para crear traslado
  const [formData, setFormData] = useState({
    // Datos del paciente
    pacienteNombre: '',
    pacienteApellido: '',
    pacienteDni: '',
    pacienteFechaNac: '',
    pacienteSexo: '',
    pacientePeso: '',
    pacienteAltura: '',
    pacienteDomicilio: '',
    pacienteLocalidad: '',
    tieneCobertura: false,
    numeroObraSocial: '',
    
    // Datos de la solicitud
    institucionSolicitante: '',
    profesionalNombre: '',
    profesionalCelular: '',
    motivoPedido: '',
    diagnosticos: '',
    codigoTraslado: '',
    
    // Datos del traslado
    hospitalOrigenId: '',
    hospitalDestinoId: '',
    tipoComplejidad: '',
    categoriaPaciente: '',
    prioridad: 'NORMAL'
  });

  // Redirigir si no es coordinador o admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || (session.user.rol !== 'COORDINADOR' && session.user.rol !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Cargar traslados y hospitales
  useEffect(() => {
    if (session?.user && (session.user.rol === 'COORDINADOR' || session.user.rol === 'ADMIN')) {
      cargarTraslados();
      cargarHospitales();
    }
  }, [session]);

  const cargarTraslados = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/traslados');
      const data = await response.json();

      if (response.ok) {
        setTraslados(data.traslados);
      } else {
        setError(data.error || 'Error cargando traslados');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cargarHospitales = async () => {
    try {
      const response = await fetch('/api/hospitales');
      const data = await response.json();

      if (response.ok) {
        setHospitales(data.hospitales || []);
      }
    } catch (error) {
      console.error('Error cargando hospitales:', error);
    }
  };

  const crearTraslado = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTraslado(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/traslados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          usuarioCreadorId: session?.user?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Traslado ${data.traslado.numeroTraslado} creado exitosamente`);
        setFormData({
          pacienteNombre: '',
          pacienteApellido: '',
          pacienteDni: '',
          pacienteFechaNac: '',
          pacienteSexo: '',
          pacientePeso: '',
          pacienteAltura: '',
          pacienteDomicilio: '',
          pacienteLocalidad: '',
          tieneCobertura: false,
          numeroObraSocial: '',
          institucionSolicitante: '',
          profesionalNombre: '',
          profesionalCelular: '',
          motivoPedido: '',
          diagnosticos: '',
          codigoTraslado: '',
          hospitalOrigenId: '',
          hospitalDestinoId: '',
          tipoComplejidad: '',
          categoriaPaciente: '',
          prioridad: 'NORMAL'
        });
        setShowCreateDialog(false);
        cargarTraslados();
      } else {
        setError(data.error || 'Error creando traslado');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setCreatingTraslado(false);
    }
  };

  // Función para abrir edición de traslado
  const abrirEditarTraslado = (traslado: Traslado) => {
    setEditingTraslado(traslado);
    setEditFormData({
      // Datos del paciente
      pacienteNombre: traslado.pacienteNombre,
      pacienteApellido: traslado.pacienteApellido,
      pacienteDni: traslado.pacienteDni,
      pacienteFechaNac: traslado.pacienteFechaNac.split('T')[0], // Solo la fecha
      pacienteSexo: traslado.pacienteSexo,
      pacientePeso: traslado.pacientePeso?.toString() || '',
      pacienteAltura: traslado.pacienteAltura?.toString() || '',
      pacienteDomicilio: traslado.pacienteDomicilio,
      pacienteLocalidad: traslado.pacienteLocalidad,
      tieneCobertura: traslado.tieneCobertura,
      numeroObraSocial: traslado.numeroObraSocial || '',
      
      // Datos de la solicitud
      institucionSolicitante: traslado.institucionSolicitante,
      profesionalNombre: traslado.profesionalNombre,
      profesionalCelular: traslado.profesionalCelular,
      motivoPedido: traslado.motivoPedido,
      diagnosticos: traslado.diagnosticos,
      codigoTraslado: traslado.codigoTraslado,
      
      // Datos del traslado
      hospitalOrigenId: '', // Se cargará cuando se abra el diálogo
      hospitalDestinoId: '', // Se cargará cuando se abra el diálogo
      tipoComplejidad: traslado.tipoComplejidad || '',
      categoriaPaciente: traslado.categoriaPaciente || '',
      prioridad: traslado.prioridad
    });
    setShowEditDialog(true);
  };

  // Función para editar traslado
  const editarTraslado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraslado) return;

    setUpdatingTraslado(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/traslados/editar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTraslado.id,
          ...editFormData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Traslado actualizado exitosamente');
        setShowEditDialog(false);
        setEditingTraslado(null);
        cargarTraslados();
      } else {
        setError(data.error || 'Error actualizando traslado');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setUpdatingTraslado(false);
    }
  };

  // Función para cambiar estado
  const abrirCambiarEstado = (traslado: Traslado) => {
    setTrasladoEstado(traslado);
    setNuevoEstado(traslado.estado);
    setShowEstadoDialog(true);
  };

  const cambiarEstado = async () => {
    if (!trasladoEstado) return;

    setUpdatingEstado(true);
    setError('');

    try {
      const response = await fetch('/api/traslados/estado', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: trasladoEstado.id,
          estado: nuevoEstado
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Estado del traslado actualizado exitosamente');
        setShowEstadoDialog(false);
        cargarTraslados();
      } else {
        setError(data.error || 'Error actualizando estado');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setUpdatingEstado(false);
    }
  };

  // Función para asignar equipo
  const abrirAsignarEquipo = (traslado: Traslado) => {
    setTrasladoEquipo(traslado);
    setEquipoData({
      horarioSalida: traslado.horarioSalida ? traslado.horarioSalida.slice(0, 16) : '',
      medicoNombre: traslado.medicoNombre || '',
      enfermeroNombre: traslado.enfermeroNombre || '',
      pilotoNombre: traslado.pilotoNombre || '',
      matriculaAeronave: traslado.matriculaAeronave || ''
    });
    setShowEquipoDialog(true);
  };

  const asignarEquipo = async () => {
    if (!trasladoEquipo) return;

    setUpdatingEquipo(true);
    setError('');

    try {
      const response = await fetch('/api/traslados/equipo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: trasladoEquipo.id,
          ...equipoData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Equipo asignado exitosamente');
        setShowEquipoDialog(false);
        cargarTraslados();
      } else {
        setError(data.error || 'Error asignando equipo');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setUpdatingEquipo(false);
    }
  };

  // Función para eliminar traslado
  const abrirEliminarTraslado = (traslado: Traslado) => {
    setTrasladoToDelete(traslado);
    setShowDeleteDialog(true);
  };

  const eliminarTraslado = async () => {
    if (!trasladoToDelete) return;

    setDeletingTraslado(true);
    setError('');

    try {
      const response = await fetch('/api/traslados/eliminar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: trasladoToDelete.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Traslado eliminado exitosamente');
        setShowDeleteDialog(false);
        cargarTraslados();
      } else {
        setError(data.error || 'Error eliminando traslado');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setDeletingTraslado(false);
    }
  };

  const calcularEdadTexto = (anios?: number, meses?: number, dias?: number) => {
    if (anios === 0) {
      return `${meses || 0} meses, ${dias || 0} días`;
    } else {
      return `${anios || 0} años, ${meses || 0} meses`;
    }
  };

  const getCodigoColor = (codigo: string) => {
    switch (codigo) {
      case 'ROJO':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'AMARILLO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'VERDE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'SOLICITADO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ASIGNADO':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EN_PREPARACION':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EN_CURSO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestión de traslados...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || (session.user.rol !== 'COORDINADOR' && session.user.rol !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Volver al Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de Traslados
                </h1>
                <p className="text-sm text-gray-600">Coordinación de traslados médicos aéreos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={session.user.rol === 'ADMIN' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'}>
                {session.user.rol}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Header con botón crear */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Traslados Médicos</h2>
            <p className="text-gray-600">Gestiona las solicitudes de traslado de pacientes</p>
          </div>
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            Nuevo Traslado
          </Button>
        </div>

        {/* Lista de traslados responsive */}
        <div className="space-y-4">
          {traslados.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No hay traslados registrados</p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4"
                >
                  Crear Primer Traslado
                </Button>
              </CardContent>
            </Card>
          ) : (
            traslados.map((traslado) => (
              <Card key={traslado.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-lg">{traslado.numeroTraslado}</CardTitle>
                      <CardDescription>
                        {traslado.pacienteNombre} {traslado.pacienteApellido} - 
                        {calcularEdadTexto(traslado.pacienteEdadAnios, traslado.pacienteEdadMeses, traslado.pacienteEdadDias)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCodigoColor(traslado.codigoTraslado)}>
                        {traslado.codigoTraslado}
                      </Badge>
                      <Badge className={getEstadoColor(traslado.estado)}>
                        {traslado.estado.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Información del paciente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Paciente:</span>
                      <p className="text-gray-900">{traslado.pacienteNombre} {traslado.pacienteApellido}</p>
                      <p className="text-gray-600">DNI: {traslado.pacienteDni}</p>
                      <p className="text-gray-600">Sexo: {traslado.pacienteSexo}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Domicilio:</span>
                      <p className="text-gray-900">{traslado.pacienteDomicilio}</p>
                      <p className="text-gray-600">{traslado.pacienteLocalidad}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Cobertura:</span>
                      <p className="text-gray-900">
                        {traslado.tieneCobertura ? 'Sí' : 'No'}
                        {traslado.numeroObraSocial && (
                          <span className="block text-gray-600">{traslado.numeroObraSocial}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Información de la solicitud */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Institución Solicitante:</span>
                        <p className="text-gray-900">{traslado.institucionSolicitante}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Profesional:</span>
                        <p className="text-gray-900">{traslado.profesionalNombre}</p>
                        <p className="text-gray-600">{traslado.profesionalCelular}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium text-gray-700">Motivo:</span>
                      <p className="text-gray-900 mt-1">{traslado.motivoPedido}</p>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium text-gray-700">Diagnósticos:</span>
                      <p className="text-gray-900 mt-1">{traslado.diagnosticos}</p>
                    </div>
                  </div>

                  {/* Información del equipo (si está asignado) */}
                  {traslado.horarioSalida && (
                    <div className="border-t pt-4 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Equipo Asignado</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-blue-700">Horario de Salida:</span>
                          <p className="text-blue-900">
                            {formatearFechaHoraLocal(traslado.horarioSalida)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Aeronave:</span>
                          <p className="text-blue-900">{traslado.matriculaAeronave}</p>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Médico:</span>
                          <p className="text-blue-900">{traslado.medicoNombre}</p>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Enfermero:</span>
                          <p className="text-blue-900">{traslado.enfermeroNombre}</p>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Piloto:</span>
                          <p className="text-blue-900">{traslado.pilotoNombre}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirEditarTraslado(traslado)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirCambiarEstado(traslado)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Cambiar Estado
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirAsignarEquipo(traslado)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Asignar Equipo
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirEliminarTraslado(traslado)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog para crear nuevo traslado */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Traslado Médico</DialogTitle>
              <DialogDescription>
                Complete toda la información del paciente y la solicitud de traslado
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={crearTraslado} className="space-y-6">
              {/* Sección 1: Datos del Paciente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  📋 Información del Paciente
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pacienteNombre">Nombre *</Label>
                    <Input
                      id="pacienteNombre"
                      value={formData.pacienteNombre}
                      onChange={(e) => setFormData({...formData, pacienteNombre: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pacienteApellido">Apellido *</Label>
                    <Input
                      id="pacienteApellido"
                      value={formData.pacienteApellido}
                      onChange={(e) => setFormData({...formData, pacienteApellido: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pacienteDni">DNI *</Label>
                    <Input
                      id="pacienteDni"
                      value={formData.pacienteDni}
                      onChange={(e) => setFormData({...formData, pacienteDni: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pacienteFechaNac">Fecha de Nacimiento *</Label>
                    <Input
                      id="pacienteFechaNac"
                      type="date"
                      value={formData.pacienteFechaNac}
                      onChange={(e) => setFormData({...formData, pacienteFechaNac: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pacienteSexo">Sexo *</Label>
                    <Select value={formData.pacienteSexo} onValueChange={(value) => setFormData({...formData, pacienteSexo: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                        <SelectItem value="FEMENINO">Femenino</SelectItem>
                        <SelectItem value="OTRO">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pacienteDomicilio">Domicilio *</Label>
                    <Input
                      id="pacienteDomicilio"
                      value={formData.pacienteDomicilio}
                      onChange={(e) => setFormData({...formData, pacienteDomicilio: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pacienteLocalidad">Localidad *</Label>
                    <Input
                      id="pacienteLocalidad"
                      value={formData.pacienteLocalidad}
                      onChange={(e) => setFormData({...formData, pacienteLocalidad: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pacientePeso">Peso (kg)</Label>
                    <Input
                      id="pacientePeso"
                      type="number"
                      step="0.1"
                      value={formData.pacientePeso}
                      onChange={(e) => setFormData({...formData, pacientePeso: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pacienteAltura">Altura (cm)</Label>
                    <Input
                      id="pacienteAltura"
                      type="number"
                      step="0.1"
                      value={formData.pacienteAltura}
                      onChange={(e) => setFormData({...formData, pacienteAltura: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="tieneCobertura"
                      checked={formData.tieneCobertura}
                      onCheckedChange={(checked) => setFormData({...formData, tieneCobertura: !!checked})}
                    />
                    <Label htmlFor="tieneCobertura">Tiene cobertura social</Label>
                  </div>
                </div>

                {formData.tieneCobertura && (
                  <div>
                    <Label htmlFor="numeroObraSocial">Número de Obra Social</Label>
                    <Input
                      id="numeroObraSocial"
                      value={formData.numeroObraSocial}
                      onChange={(e) => setFormData({...formData, numeroObraSocial: e.target.value})}
                      placeholder="Ej: OSDE 123456789"
                    />
                  </div>
                )}
              </div>

              {/* Sección 2: Datos de la Solicitud */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  🏥 Información de la Solicitud
                </h3>

                <div>
                  <Label htmlFor="institucionSolicitante">Institución Solicitante *</Label>
                  <Input
                    id="institucionSolicitante"
                    value={formData.institucionSolicitante}
                    onChange={(e) => setFormData({...formData, institucionSolicitante: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profesionalNombre">Profesional Solicitante *</Label>
                    <Input
                      id="profesionalNombre"
                      value={formData.profesionalNombre}
                      onChange={(e) => setFormData({...formData, profesionalNombre: e.target.value})}
                      placeholder="Dr. Juan Pérez"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="profesionalCelular">Celular de Contacto *</Label>
                    <Input
                      id="profesionalCelular"
                      value={formData.profesionalCelular}
                      onChange={(e) => setFormData({...formData, profesionalCelular: e.target.value})}
                      placeholder="+54 11 1234-5678"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="motivoPedido">Motivo del Pedido *</Label>
                  <Textarea
                    id="motivoPedido"
                    value={formData.motivoPedido}
                    onChange={(e) => setFormData({...formData, motivoPedido: e.target.value})}
                    placeholder="Describa detalladamente el motivo del traslado..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="diagnosticos">Diagnósticos *</Label>
                  <Textarea
                    id="diagnosticos"
                    value={formData.diagnosticos}
                    onChange={(e) => setFormData({...formData, diagnosticos: e.target.value})}
                    placeholder="Liste todos los diagnósticos relevantes..."
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hospitalOrigenId">Hospital de Origen *</Label>
                    <Select value={formData.hospitalOrigenId} onValueChange={(value) => setFormData({...formData, hospitalOrigenId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitales.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.nombre} - {hospital.ciudad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hospitalDestinoId">Hospital de Destino *</Label>
                    <Select value={formData.hospitalDestinoId} onValueChange={(value) => setFormData({...formData, hospitalDestinoId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitales.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.nombre} - {hospital.ciudad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="codigoTraslado">Código de Traslado *</Label>
                    <Select value={formData.codigoTraslado} onValueChange={(value) => setFormData({...formData, codigoTraslado: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar código" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROJO">🔴 ROJO (Urgente)</SelectItem>
                        <SelectItem value="AMARILLO">🟡 AMARILLO (Programado)</SelectItem>
                        <SelectItem value="VERDE">🟢 VERDE (No urgente)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoriaPaciente">Categoría *</Label>
                    <Select value={formData.categoriaPaciente} onValueChange={(value) => setFormData({...formData, categoriaPaciente: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEONATAL">Neonatal</SelectItem>
                        <SelectItem value="PEDIATRICO">Pediátrico</SelectItem>
                        <SelectItem value="ADULTO">Adulto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tipoComplejidad">Complejidad *</Label>
                    <Select value={formData.tipoComplejidad} onValueChange={(value) => setFormData({...formData, tipoComplejidad: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BAJA">Baja</SelectItem>
                        <SelectItem value="MEDIANA">Mediana</SelectItem>
                        <SelectItem value="ALTA">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  disabled={creatingTraslado}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creatingTraslado}>
                  {creatingTraslado ? 'Creando traslado...' : 'Crear Traslado'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para editar traslado */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Traslado</DialogTitle>
              <DialogDescription>
                Modifique los datos del traslado. El número de traslado no es editable.
              </DialogDescription>
            </DialogHeader>
            
            {editingTraslado && (
              <form onSubmit={editarTraslado} className="space-y-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Número de Traslado:</strong> {editingTraslado.numeroTraslado} (no editable)
                  </div>
                </div>

                {/* Sección 1: Datos del Paciente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    📋 Información del Paciente
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-pacienteNombre">Nombre *</Label>
                      <Input
                        id="edit-pacienteNombre"
                        value={editFormData.pacienteNombre}
                        onChange={(e) => setEditFormData({...editFormData, pacienteNombre: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-pacienteApellido">Apellido *</Label>
                      <Input
                        id="edit-pacienteApellido"
                        value={editFormData.pacienteApellido}
                        onChange={(e) => setEditFormData({...editFormData, pacienteApellido: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-pacienteDni">DNI *</Label>
                      <Input
                        id="edit-pacienteDni"
                        value={editFormData.pacienteDni}
                        onChange={(e) => setEditFormData({...editFormData, pacienteDni: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-pacienteFechaNac">Fecha de Nacimiento *</Label>
                      <Input
                        id="edit-pacienteFechaNac"
                        type="date"
                        value={editFormData.pacienteFechaNac}
                        onChange={(e) => setEditFormData({...editFormData, pacienteFechaNac: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-pacienteSexo">Sexo *</Label>
                      <Select value={editFormData.pacienteSexo} onValueChange={(value) => setEditFormData({...editFormData, pacienteSexo: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MASCULINO">Masculino</SelectItem>
                          <SelectItem value="FEMENINO">Femenino</SelectItem>
                          <SelectItem value="OTRO">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-pacienteDomicilio">Domicilio *</Label>
                      <Input
                        id="edit-pacienteDomicilio"
                        value={editFormData.pacienteDomicilio}
                        onChange={(e) => setEditFormData({...editFormData, pacienteDomicilio: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-pacienteLocalidad">Localidad *</Label>
                      <Input
                        id="edit-pacienteLocalidad"
                        value={editFormData.pacienteLocalidad}
                        onChange={(e) => setEditFormData({...editFormData, pacienteLocalidad: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-pacientePeso">Peso (kg)</Label>
                      <Input
                        id="edit-pacientePeso"
                        type="number"
                        step="0.1"
                        value={editFormData.pacientePeso}
                        onChange={(e) => setEditFormData({...editFormData, pacientePeso: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-pacienteAltura">Altura (cm)</Label>
                      <Input
                        id="edit-pacienteAltura"
                        type="number"
                        step="0.1"
                        value={editFormData.pacienteAltura}
                        onChange={(e) => setEditFormData({...editFormData, pacienteAltura: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="edit-tieneCobertura"
                        checked={editFormData.tieneCobertura}
                        onCheckedChange={(checked) => setEditFormData({...editFormData, tieneCobertura: !!checked})}
                      />
                      <Label htmlFor="edit-tieneCobertura">Tiene cobertura social</Label>
                    </div>
                  </div>

                  {editFormData.tieneCobertura && (
                    <div>
                      <Label htmlFor="edit-numeroObraSocial">Número de Obra Social</Label>
                      <Input
                        id="edit-numeroObraSocial"
                        value={editFormData.numeroObraSocial}
                        onChange={(e) => setEditFormData({...editFormData, numeroObraSocial: e.target.value})}
                        placeholder="Ej: OSDE 123456789"
                      />
                    </div>
                  )}
                </div>

                {/* Sección 2: Datos de la Solicitud */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    🏥 Información de la Solicitud
                  </h3>

                  <div>
                    <Label htmlFor="edit-institucionSolicitante">Institución Solicitante *</Label>
                    <Input
                      id="edit-institucionSolicitante"
                      value={editFormData.institucionSolicitante}
                      onChange={(e) => setEditFormData({...editFormData, institucionSolicitante: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-profesionalNombre">Profesional Solicitante *</Label>
                      <Input
                        id="edit-profesionalNombre"
                        value={editFormData.profesionalNombre}
                        onChange={(e) => setEditFormData({...editFormData, profesionalNombre: e.target.value})}
                        placeholder="Dr. Juan Pérez"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-profesionalCelular">Celular de Contacto *</Label>
                      <Input
                        id="edit-profesionalCelular"
                        value={editFormData.profesionalCelular}
                        onChange={(e) => setEditFormData({...editFormData, profesionalCelular: e.target.value})}
                        placeholder="+54 11 1234-5678"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-motivoPedido">Motivo del Pedido *</Label>
                    <Textarea
                      id="edit-motivoPedido"
                      value={editFormData.motivoPedido}
                      onChange={(e) => setEditFormData({...editFormData, motivoPedido: e.target.value})}
                      placeholder="Describa detalladamente el motivo del traslado..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-diagnosticos">Diagnósticos *</Label>
                    <Textarea
                      id="edit-diagnosticos"
                      value={editFormData.diagnosticos}
                      onChange={(e) => setEditFormData({...editFormData, diagnosticos: e.target.value})}
                      placeholder="Liste todos los diagnósticos relevantes..."
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-codigoTraslado">Código de Traslado *</Label>
                      <Select value={editFormData.codigoTraslado} onValueChange={(value) => setEditFormData({...editFormData, codigoTraslado: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar código" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ROJO">🔴 ROJO (Urgente)</SelectItem>
                          <SelectItem value="AMARILLO">🟡 AMARILLO (Programado)</SelectItem>
                          <SelectItem value="VERDE">🟢 VERDE (No urgente)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-categoriaPaciente">Categoría *</Label>
                      <Select value={editFormData.categoriaPaciente} onValueChange={(value) => setEditFormData({...editFormData, categoriaPaciente: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEONATAL">Neonatal</SelectItem>
                          <SelectItem value="PEDIATRICO">Pediátrico</SelectItem>
                          <SelectItem value="ADULTO">Adulto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-tipoComplejidad">Complejidad *</Label>
                      <Select value={editFormData.tipoComplejidad} onValueChange={(value) => setEditFormData({...editFormData, tipoComplejidad: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BAJA">Baja</SelectItem>
                          <SelectItem value="MEDIANA">Mediana</SelectItem>
                          <SelectItem value="ALTA">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                    disabled={updatingTraslado}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updatingTraslado}>
                    {updatingTraslado ? 'Actualizando...' : 'Actualizar Traslado'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para cambiar estado */}
        <Dialog open={showEstadoDialog} onOpenChange={setShowEstadoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar Estado del Traslado</DialogTitle>
              <DialogDescription>
                Actualice el estado del traslado según el progreso actual
              </DialogDescription>
            </DialogHeader>
            {trasladoEstado && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {trasladoEstado.numeroTraslado}
                    </div>
                    <div className="text-gray-600">
                      {trasladoEstado.pacienteNombre} {trasladoEstado.pacienteApellido}
                    </div>
                    <div className="text-gray-500">
                      Estado actual: <Badge className={getEstadoColor(trasladoEstado.estado)}>
                        {trasladoEstado.estado.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="nuevoEstado">Nuevo Estado</Label>
                  <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOLICITADO">Solicitado</SelectItem>
                      <SelectItem value="ASIGNADO">Asignado</SelectItem>
                      <SelectItem value="EN_PREPARACION">En Preparación</SelectItem>
                      <SelectItem value="EN_CURSO">En Curso</SelectItem>
                      <SelectItem value="COMPLETADO">Completado</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEstadoDialog(false)}
                    disabled={updatingEstado}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={cambiarEstado}
                    disabled={updatingEstado}
                  >
                    {updatingEstado ? 'Actualizando...' : 'Actualizar Estado'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para asignar equipo */}
        <Dialog open={showEquipoDialog} onOpenChange={setShowEquipoDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Asignar Equipo Médico</DialogTitle>
              <DialogDescription>
                Configure el equipo médico y la aeronave para el traslado
              </DialogDescription>
            </DialogHeader>
            {trasladoEquipo && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {trasladoEquipo.numeroTraslado}
                    </div>
                    <div className="text-gray-600">
                      {trasladoEquipo.pacienteNombre} {trasladoEquipo.pacienteApellido}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="horarioSalida">Horario de Salida</Label>
                  <Input
                    id="horarioSalida"
                    type="datetime-local"
                    value={equipoData.horarioSalida}
                    onChange={(e) => setEquipoData({...equipoData, horarioSalida: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medicoNombre">Médico a Cargo</Label>
                    <Input
                      id="medicoNombre"
                      value={equipoData.medicoNombre}
                      onChange={(e) => setEquipoData({...equipoData, medicoNombre: e.target.value})}
                      placeholder="Dr. Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="enfermeroNombre">Enfermero</Label>
                    <Input
                      id="enfermeroNombre"
                      value={equipoData.enfermeroNombre}
                      onChange={(e) => setEquipoData({...equipoData, enfermeroNombre: e.target.value})}
                      placeholder="Enf. María García"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pilotoNombre">Piloto</Label>
                    <Input
                      id="pilotoNombre"
                      value={equipoData.pilotoNombre}
                      onChange={(e) => setEquipoData({...equipoData, pilotoNombre: e.target.value})}
                      placeholder="Piloto Carlos López"
                    />
                  </div>
                  <div>
                    <Label htmlFor="matriculaAeronave">Matrícula de Aeronave</Label>
                    <Input
                      id="matriculaAeronave"
                      value={equipoData.matriculaAeronave}
                      onChange={(e) => setEquipoData({...equipoData, matriculaAeronave: e.target.value})}
                      placeholder="LV-ABC123"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEquipoDialog(false)}
                    disabled={updatingEquipo}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={asignarEquipo}
                    disabled={updatingEquipo}
                  >
                    {updatingEquipo ? 'Asignando...' : 'Asignar Equipo'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para confirmar eliminación */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. ¿Está seguro que desea eliminar este traslado?
              </DialogDescription>
            </DialogHeader>
            {trasladoToDelete && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-sm">
                    <div className="font-medium text-red-900">
                      {trasladoToDelete.numeroTraslado}
                    </div>
                    <div className="text-red-700">
                      {trasladoToDelete.pacienteNombre} {trasladoToDelete.pacienteApellido}
                    </div>
                    <div className="text-red-600">
                      DNI: {trasladoToDelete.pacienteDni}
                    </div>
                    <div className="text-red-600">
                      Estado: {trasladoToDelete.estado}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={deletingTraslado}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={eliminarTraslado}
                    disabled={deletingTraslado}
                  >
                    {deletingTraslado ? 'Eliminando...' : 'Eliminar Traslado'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}