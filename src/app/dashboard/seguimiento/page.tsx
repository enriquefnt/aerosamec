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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { obtenerHoraActualDispositivo, formatearFechaHoraLocal } from '@/lib/timezone';

export default function SeguimientoMedicoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [traslados, setTraslados] = useState<any[]>([]);
  const [trasladoSeleccionado, setTrasladoSeleccionado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para formularios
  const [showProcedimientoDialog, setShowProcedimientoDialog] = useState(false);
  const [showMedicacionDialog, setShowMedicacionDialog] = useState(false);
  const [showSignosDialog, setShowSignosDialog] = useState(false);
  const [showEstadoDialog, setShowEstadoDialog] = useState(false);

  // Estados de carga
  const [savingProcedimiento, setSavingProcedimiento] = useState(false);
  const [savingMedicacion, setSavingMedicacion] = useState(false);
  const [savingSignos, setSavingSignos] = useState(false);
  const [updatingEstado, setUpdatingEstado] = useState(false);
  const [savingEpicrisis, setSavingEpicrisis] = useState(false);

  // Form states
  const [procedimientoForm, setProcedimientoForm] = useState({
    tipo: '',
    descripcion: '',
    observaciones: '',
    fechaHora: ''
  });

  const [medicacionForm, setMedicacionForm] = useState({
    medicamento: '',
    dosis: '',
    via: '',
    observaciones: '',
    fechaHora: ''
  });

  const [signosForm, setSignosForm] = useState({
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    presionArterialSist: '',
    presionArterialDiast: '',
    temperatura: '',
    saturacionO2: '',
    escalaGlasgow: '',
    observaciones: '',
    fechaHora: ''
  });

  const [nuevoEstado, setNuevoEstado] = useState('');
  const [epicrisis, setEpicrisis] = useState('');

  // Función para obtener fecha/hora actual del dispositivo
  const obtenerFechaHoraActual = () => {
    return obtenerHoraActualDispositivo();
  };

  // Inicializar formularios con hora actual
  const inicializarFormularios = () => {
    const horaActual = obtenerFechaHoraActual();
    setProcedimientoForm({
      tipo: '',
      descripcion: '',
      observaciones: '',
      fechaHora: horaActual
    });
    setMedicacionForm({
      medicamento: '',
      dosis: '',
      via: '',
      observaciones: '',
      fechaHora: horaActual
    });
    setSignosForm({
      frecuenciaCardiaca: '',
      frecuenciaRespiratoria: '',
      presionArterialSist: '',
      presionArterialDiast: '',
      temperatura: '',
      saturacionO2: '',
      escalaGlasgow: '',
      observaciones: '',
      fechaHora: horaActual
    });
  };

  // Cargar traslados
  useEffect(() => {
    if (session?.user) {
      cargarTraslados();
    }
  }, [session]);

  const cargarTraslados = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/traslados/operario');
      const data = await response.json();

      if (response.ok) {
        setTraslados(data.traslados);
        
        // Si hay un traslado seleccionado, actualizarlo con los nuevos datos
        if (trasladoSeleccionado) {
          const trasladoActualizado = data.traslados.find((t: any) => t.id === trasladoSeleccionado.id);
          if (trasladoActualizado) {
            setTrasladoSeleccionado(trasladoActualizado);
            setEpicrisis(trasladoActualizado.epicrisis || '');
          }
        } else if (data.traslados.length > 0) {
          // Si no hay traslado seleccionado, seleccionar el primero
          seleccionarTraslado(data.traslados[0]);
        }
      } else {
        setError(data.error || 'Error cargando traslados');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarTraslado = (traslado: any) => {
    setTrasladoSeleccionado(traslado);
    setNuevoEstado(traslado.estado);
    setEpicrisis(traslado.epicrisis || '');
    inicializarFormularios();
  };

  // Función para guardar epicrisis
  const guardarEpicrisis = async () => {
    if (!trasladoSeleccionado) return;

    setSavingEpicrisis(true);
    setError('');

    try {
      const response = await fetch('/api/traslados/epicrisis', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: trasladoSeleccionado.id,
          epicrisis
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Epicrisis guardada exitosamente');
        cargarTraslados();
      } else {
        setError(data.error || 'Error guardando epicrisis');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setSavingEpicrisis(false);
    }
  };

  // Función para registrar procedimiento
  const registrarProcedimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trasladoSeleccionado) return;

    setSavingProcedimiento(true);
    setError('');

    try {
      const response = await fetch('/api/procedimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trasladoId: trasladoSeleccionado.id,
          usuarioId: session?.user?.id,
          ...procedimientoForm
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Procedimiento registrado exitosamente');
        setShowProcedimientoDialog(false);
        inicializarFormularios();
        console.log('✅ Procedimiento registrado, recargando traslados...');
        // Forzar actualización inmediata
        setTimeout(async () => {
          await cargarTraslados();
        }, 500);
      } else {
        setError(data.error || 'Error registrando procedimiento');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setSavingProcedimiento(false);
    }
  };

  // Función para registrar medicación
  const registrarMedicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trasladoSeleccionado) return;

    setSavingMedicacion(true);
    setError('');

    try {
      const response = await fetch('/api/medicaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trasladoId: trasladoSeleccionado.id,
          usuarioId: session?.user?.id,
          ...medicacionForm
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Medicación registrada exitosamente');
        setShowMedicacionDialog(false);
        inicializarFormularios();
        console.log('✅ Medicación registrada, recargando traslados...');
        // Forzar actualización inmediata
        setTimeout(async () => {
          await cargarTraslados();
        }, 500);
      } else {
        setError(data.error || 'Error registrando medicación');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setSavingMedicacion(false);
    }
  };

  // Función para registrar signos vitales
  const registrarSignos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trasladoSeleccionado) return;

    setSavingSignos(true);
    setError('');

    try {
      const response = await fetch('/api/signos-vitales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trasladoId: trasladoSeleccionado.id,
          usuarioId: session?.user?.id,
          ...signosForm
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Signos vitales registrados exitosamente');
        setShowSignosDialog(false);
        inicializarFormularios();
        console.log('✅ Signos vitales registrados, recargando traslados...');
        // Forzar actualización inmediata
        setTimeout(async () => {
          await cargarTraslados();
        }, 500);
      } else {
        setError(data.error || 'Error registrando signos vitales');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setSavingSignos(false);
    }
  };

  // Función para cambiar estado
  const cambiarEstado = async () => {
    if (!trasladoSeleccionado) return;

    setUpdatingEstado(true);
    setError('');

    try {
      const response = await fetch('/api/traslados/estado', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: trasladoSeleccionado.id,
          estado: nuevoEstado
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Estado actualizado exitosamente');
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

  const calcularEdadTexto = (anios?: number, meses?: number, dias?: number) => {
    if (anios === 0) {
      return `${meses || 0} meses, ${dias || 0} días`;
    } else {
      return `${anios || 0} años, ${meses || 0} meses`;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'SOLICITADO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ASIGNADO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EN_PREPARACION': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EN_CURSO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETADO': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELADO': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCodigoColor = (codigo: string) => {
    switch (codigo) {
      case 'ROJO': return 'bg-red-100 text-red-800 border-red-200';
      case 'AMARILLO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'VERDE': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando seguimiento médico...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
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
                  Seguimiento Médico
                </h1>
                <p className="text-sm text-gray-600">Control durante el traslado</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800 border-green-200">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Lista de traslados */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Traslados Asignados</CardTitle>
                <CardDescription>
                  {traslados.length} traslado{traslados.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {traslados.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay traslados asignados</p>
                ) : (
                  traslados.map((traslado) => (
                    <div
                      key={traslado.id}
                      onClick={() => seleccionarTraslado(traslado)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        trasladoSeleccionado?.id === traslado.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">{traslado.numeroTraslado}</div>
                      <div className="text-xs text-gray-600">
                        {traslado.pacienteNombre} {traslado.pacienteApellido}
                      </div>
                      <Badge className={`mt-1 text-xs ${getEstadoColor(traslado.estado)}`}>
                        {traslado.estado.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {trasladoSeleccionado ? (
              <div className="space-y-6">
                {/* Información del paciente (solo lectura) */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {trasladoSeleccionado.numeroTraslado}
                        </CardTitle>
                        <CardDescription>
                          {trasladoSeleccionado.pacienteNombre} {trasladoSeleccionado.pacienteApellido} - 
                          {calcularEdadTexto(
                            trasladoSeleccionado.pacienteEdadAnios, 
                            trasladoSeleccionado.pacienteEdadMeses, 
                            trasladoSeleccionado.pacienteEdadDias
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getCodigoColor(trasladoSeleccionado.codigoTraslado)}>
                          {trasladoSeleccionado.codigoTraslado}
                        </Badge>
                        <Badge className={getEstadoColor(trasladoSeleccionado.estado)}>
                          {trasladoSeleccionado.estado.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Paciente:</span>
                        <p className="text-gray-900">{trasladoSeleccionado.pacienteNombre} {trasladoSeleccionado.pacienteApellido}</p>
                        <p className="text-gray-600">DNI: {trasladoSeleccionado.pacienteDni}</p>
                        <p className="text-gray-600">Sexo: {trasladoSeleccionado.pacienteSexo}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Domicilio:</span>
                        <p className="text-gray-900">{trasladoSeleccionado.pacienteDomicilio}</p>
                        <p className="text-gray-600">{trasladoSeleccionado.pacienteLocalidad}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Diagnósticos:</span>
                        <p className="text-gray-900">{trasladoSeleccionado.diagnosticos}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botones de acción */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => {
                      inicializarFormularios();
                      setShowProcedimientoDialog(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Registrar Procedimiento
                  </Button>
                  <Button
                    onClick={() => {
                      inicializarFormularios();
                      setShowMedicacionDialog(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Registrar Medicación
                  </Button>
                  <Button
                    onClick={() => {
                      inicializarFormularios();
                      setShowSignosDialog(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Control Signos Vitales
                  </Button>
                  <Button
                    onClick={() => setShowEstadoDialog(true)}
                    variant="outline"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    Cambiar Estado
                  </Button>
                </div>

                {/* Grilla de seguimiento */}
                <Card>
                  <CardHeader>
                    <CardTitle>Registro de Seguimiento</CardTitle>
                    <CardDescription>
                      Historial cronológico de procedimientos, medicación y controles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Horario</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>FC</TableHead>
                            <TableHead>FR</TableHead>
                            <TableHead>TA</TableHead>
                            <TableHead>Temp</TableHead>
                            <TableHead>SatO2</TableHead>
                            <TableHead>Glasgow</TableHead>
                            <TableHead>Observaciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            // Combinar todos los registros
                            const registros = [
                              ...trasladoSeleccionado.procedimientos.map((p: any) => ({
                                ...p,
                                tipoRegistro: 'procedimiento',
                                timestamp: new Date(p.fechaHora).getTime()
                              })),
                              ...trasladoSeleccionado.medicaciones.map((m: any) => ({
                                ...m,
                                tipoRegistro: 'medicacion',
                                timestamp: new Date(m.fechaHora).getTime()
                              })),
                              ...trasladoSeleccionado.controlesSignos.map((c: any) => ({
                                ...c,
                                tipoRegistro: 'signos',
                                timestamp: new Date(c.fechaHora).getTime()
                              }))
                            ].sort((a, b) => b.timestamp - a.timestamp);

                            if (registros.length === 0) {
                              return (
                                <TableRow>
                                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                                    No hay registros de seguimiento aún
                                  </TableCell>
                                </TableRow>
                              );
                            }

                            return registros.map((registro) => (
                              <TableRow key={`${registro.tipoRegistro}-${registro.id}`}>
                                <TableCell className="font-mono text-sm">
                                  {formatearFechaHoraLocal(registro.fechaHora)}
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    registro.tipoRegistro === 'procedimiento' ? 'bg-blue-100 text-blue-800' :
                                    registro.tipoRegistro === 'medicacion' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                  }>
                                    {registro.tipoRegistro === 'procedimiento' ? 'Procedimiento' :
                                     registro.tipoRegistro === 'medicacion' ? 'Medicación' : 'Signos Vitales'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {registro.tipoRegistro === 'procedimiento' && (
                                    <div>
                                      <div className="font-medium">{registro.tipo}</div>
                                      <div className="text-sm text-gray-600">{registro.descripcion}</div>
                                    </div>
                                  )}
                                  {registro.tipoRegistro === 'medicacion' && (
                                    <div>
                                      <div className="font-medium">{registro.medicamento}</div>
                                      <div className="text-sm text-gray-600">{registro.dosis} - {registro.via}</div>
                                    </div>
                                  )}
                                  {registro.tipoRegistro === 'signos' && (
                                    <div className="text-sm text-gray-600">Control de signos vitales</div>
                                  )}
                                </TableCell>
                                <TableCell>{registro.frecuenciaCardiaca || '-'}</TableCell>
                                <TableCell>{registro.frecuenciaRespiratoria || '-'}</TableCell>
                                <TableCell>
                                  {registro.presionArterialSist && registro.presionArterialDiast 
                                    ? `${registro.presionArterialSist}/${registro.presionArterialDiast}`
                                    : '-'
                                  }
                                </TableCell>
                                <TableCell>{registro.temperatura || '-'}</TableCell>
                                <TableCell>{registro.saturacionO2 ? `${registro.saturacionO2}%` : '-'}</TableCell>
                                <TableCell>{registro.escalaGlasgow ? `${registro.escalaGlasgow}/15` : '-'}</TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  {registro.observaciones || '-'}
                                </TableCell>
                              </TableRow>
                            ));
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Epicrisis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Epicrisis / Debriefing</CardTitle>
                    <CardDescription>
                      Resumen final del traslado y observaciones generales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={epicrisis}
                      onChange={(e) => setEpicrisis(e.target.value)}
                      placeholder="Escriba aquí el resumen del traslado, observaciones generales, complicaciones, evolución del paciente, etc..."
                      rows={6}
                      className="w-full"
                    />
                    <Button
                      onClick={guardarEpicrisis}
                      disabled={savingEpicrisis}
                      className="mt-4"
                    >
                      {savingEpicrisis ? 'Guardando...' : 'Guardar Epicrisis'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Seleccione un traslado para ver los detalles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialog para registrar procedimiento */}
        <Dialog open={showProcedimientoDialog} onOpenChange={setShowProcedimientoDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Procedimiento</DialogTitle>
              <DialogDescription>
                Registre el procedimiento realizado durante el traslado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={registrarProcedimiento} className="space-y-4">
              <div>
                <Label htmlFor="proc-fechaHora">Fecha y Hora</Label>
                <Input
                  id="proc-fechaHora"
                  type="datetime-local"
                  value={procedimientoForm.fechaHora}
                  onChange={(e) => setProcedimientoForm({...procedimientoForm, fechaHora: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se pre-carga la hora actual, pero puede modificarla si es necesario
                </p>
              </div>

              <div>
                <Label htmlFor="proc-tipo">Tipo de Procedimiento *</Label>
                <Select value={procedimientoForm.tipo} onValueChange={(value) => setProcedimientoForm({...procedimientoForm, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monitoreo Cardíaco">Monitoreo Cardíaco</SelectItem>
                    <SelectItem value="Control Neurológico">Control Neurológico</SelectItem>
                    <SelectItem value="Aspiración de Secreciones">Aspiración de Secreciones</SelectItem>
                    <SelectItem value="Ventilación Asistida">Ventilación Asistida</SelectItem>
                    <SelectItem value="Acceso Vascular">Acceso Vascular</SelectItem>
                    <SelectItem value="Inmovilización">Inmovilización</SelectItem>
                    <SelectItem value="Oxigenoterapia">Oxigenoterapia</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="proc-descripcion">Descripción *</Label>
                <Textarea
                  id="proc-descripcion"
                  value={procedimientoForm.descripcion}
                  onChange={(e) => setProcedimientoForm({...procedimientoForm, descripcion: e.target.value})}
                  placeholder="Describa detalladamente el procedimiento realizado..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="proc-observaciones">Observaciones</Label>
                <Textarea
                  id="proc-observaciones"
                  value={procedimientoForm.observaciones}
                  onChange={(e) => setProcedimientoForm({...procedimientoForm, observaciones: e.target.value})}
                  placeholder="Observaciones adicionales, complicaciones, resultados..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowProcedimientoDialog(false)}
                  disabled={savingProcedimiento}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingProcedimiento}>
                  {savingProcedimiento ? 'Registrando...' : 'Registrar Procedimiento'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para registrar medicación */}
        <Dialog open={showMedicacionDialog} onOpenChange={setShowMedicacionDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Medicación</DialogTitle>
              <DialogDescription>
                Registre la medicación administrada durante el traslado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={registrarMedicacion} className="space-y-4">
              <div>
                <Label htmlFor="med-fechaHora">Fecha y Hora</Label>
                <Input
                  id="med-fechaHora"
                  type="datetime-local"
                  value={medicacionForm.fechaHora}
                  onChange={(e) => setMedicacionForm({...medicacionForm, fechaHora: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se pre-carga la hora actual, pero puede modificarla si es necesario
                </p>
              </div>

              <div>
                <Label htmlFor="med-medicamento">Medicamento *</Label>
                <Input
                  id="med-medicamento"
                  value={medicacionForm.medicamento}
                  onChange={(e) => setMedicacionForm({...medicacionForm, medicamento: e.target.value})}
                  placeholder="Ej: Furosemida, Morfina, Adrenalina..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="med-dosis">Dosis *</Label>
                  <Input
                    id="med-dosis"
                    value={medicacionForm.dosis}
                    onChange={(e) => setMedicacionForm({...medicacionForm, dosis: e.target.value})}
                    placeholder="Ej: 1 mg/kg, 5 ml, 0.5 mg..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="med-via">Vía de Administración *</Label>
                  <Select value={medicacionForm.via} onValueChange={(value) => setMedicacionForm({...medicacionForm, via: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar vía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORAL">Oral</SelectItem>
                      <SelectItem value="INTRAVENOSA">Intravenosa</SelectItem>
                      <SelectItem value="INTRAMUSCULAR">Intramuscular</SelectItem>
                      <SelectItem value="SUBCUTANEA">Subcutánea</SelectItem>
                      <SelectItem value="INHALATORIA">Inhalatoria</SelectItem>
                      <SelectItem value="TOPICA">Tópica</SelectItem>
                      <SelectItem value="OTRA">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="med-observaciones">Observaciones</Label>
                <Textarea
                  id="med-observaciones"
                  value={medicacionForm.observaciones}
                  onChange={(e) => setMedicacionForm({...medicacionForm, observaciones: e.target.value})}
                  placeholder="Indicación, efectos observados, reacciones..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowMedicacionDialog(false)}
                  disabled={savingMedicacion}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingMedicacion}>
                  {savingMedicacion ? 'Registrando...' : 'Registrar Medicación'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para control de signos vitales */}
        <Dialog open={showSignosDialog} onOpenChange={setShowSignosDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Control de Signos Vitales</DialogTitle>
              <DialogDescription>
                Registre los signos vitales del paciente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={registrarSignos} className="space-y-4">
              <div>
                <Label htmlFor="signos-fechaHora">Fecha y Hora</Label>
                <Input
                  id="signos-fechaHora"
                  type="datetime-local"
                  value={signosForm.fechaHora}
                  onChange={(e) => setSignosForm({...signosForm, fechaHora: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se pre-carga la hora actual, pero puede modificarla si es necesario
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="signos-fc">Frecuencia Cardíaca (FC)</Label>
                  <Input
                    id="signos-fc"
                    type="number"
                    min="30"
                    max="200"
                    value={signosForm.frecuenciaCardiaca}
                    onChange={(e) => setSignosForm({...signosForm, frecuenciaCardiaca: e.target.value})}
                    placeholder="lpm"
                  />
                </div>
                <div>
                  <Label htmlFor="signos-fr">Frecuencia Respiratoria (FR)</Label>
                  <Input
                    id="signos-fr"
                    type="number"
                    min="5"
                    max="60"
                    value={signosForm.frecuenciaRespiratoria}
                    onChange={(e) => setSignosForm({...signosForm, frecuenciaRespiratoria: e.target.value})}
                    placeholder="rpm"
                  />
                </div>
                <div>
                  <Label htmlFor="signos-temp">Temperatura (°C)</Label>
                  <Input
                    id="signos-temp"
                    type="number"
                    step="0.1"
                    min="30"
                    max="45"
                    value={signosForm.temperatura}
                    onChange={(e) => setSignosForm({...signosForm, temperatura: e.target.value})}
                    placeholder="°C"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="signos-ta-sist">Presión Arterial Sistólica</Label>
                  <Input
                    id="signos-ta-sist"
                    type="number"
                    min="50"
                    max="250"
                    value={signosForm.presionArterialSist}
                    onChange={(e) => setSignosForm({...signosForm, presionArterialSist: e.target.value})}
                    placeholder="mmHg"
                  />
                </div>
                <div>
                  <Label htmlFor="signos-ta-diast">Presión Arterial Diastólica</Label>
                  <Input
                    id="signos-ta-diast"
                    type="number"
                    min="30"
                    max="150"
                    value={signosForm.presionArterialDiast}
                    onChange={(e) => setSignosForm({...signosForm, presionArterialDiast: e.target.value})}
                    placeholder="mmHg"
                  />
                </div>
                <div>
                  <Label htmlFor="signos-sat">Saturación O2 (%)</Label>
                  <Input
                    id="signos-sat"
                    type="number"
                    min="70"
                    max="100"
                    value={signosForm.saturacionO2}
                    onChange={(e) => setSignosForm({...signosForm, saturacionO2: e.target.value})}
                    placeholder="%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signos-glasgow">Escala de Glasgow</Label>
                  <Select value={signosForm.escalaGlasgow} onValueChange={(value) => setSignosForm({...signosForm, escalaGlasgow: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15/15 (Normal)</SelectItem>
                      <SelectItem value="14">14/15 (Leve alteración)</SelectItem>
                      <SelectItem value="13">13/15 (Leve alteración)</SelectItem>
                      <SelectItem value="12">12/15 (Moderada alteración)</SelectItem>
                      <SelectItem value="11">11/15 (Moderada alteración)</SelectItem>
                      <SelectItem value="10">10/15 (Moderada alteración)</SelectItem>
                      <SelectItem value="9">9/15 (Severa alteración)</SelectItem>
                      <SelectItem value="8">8/15 (Severa alteración)</SelectItem>
                      <SelectItem value="7">7/15 (Severa alteración)</SelectItem>
                      <SelectItem value="6">6/15 (Severa alteración)</SelectItem>
                      <SelectItem value="5">5/15 (Severa alteración)</SelectItem>
                      <SelectItem value="4">4/15 (Severa alteración)</SelectItem>
                      <SelectItem value="3">3/15 (Coma)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-6">
                  <p className="text-sm text-gray-600">
                    <strong>Glasgow:</strong> 15 = Normal, 13-14 = Leve, 9-12 = Moderado, 3-8 = Severo
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="signos-observaciones">Observaciones</Label>
                <Textarea
                  id="signos-observaciones"
                  value={signosForm.observaciones}
                  onChange={(e) => setSignosForm({...signosForm, observaciones: e.target.value})}
                  placeholder="Estado general, respuesta a tratamiento, cambios observados..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowSignosDialog(false)}
                  disabled={savingSignos}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingSignos}>
                  {savingSignos ? 'Registrando...' : 'Registrar Signos Vitales'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para cambiar estado */}
        <Dialog open={showEstadoDialog} onOpenChange={setShowEstadoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar Estado del Traslado</DialogTitle>
              <DialogDescription>
                Actualice el estado según el progreso del traslado
              </DialogDescription>
            </DialogHeader>
            {trasladoSeleccionado && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {trasladoSeleccionado.numeroTraslado}
                    </div>
                    <div className="text-gray-600">
                      {trasladoSeleccionado.pacienteNombre} {trasladoSeleccionado.pacienteApellido}
                    </div>
                    <div className="text-gray-500">
                      Estado actual: <Badge className={getEstadoColor(trasladoSeleccionado.estado)}>
                        {trasladoSeleccionado.estado.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="nuevo-estado">Nuevo Estado</Label>
                  <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
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
      </main>
    </div>
  );
}