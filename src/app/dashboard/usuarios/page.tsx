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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatearFechaLocal } from '@/lib/timezone';

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  rol: string;
  funcion: string;
  activo: boolean;
  emailVerificado: boolean;
  passwordTemporal: boolean;
  ultimoLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export default function GestionUsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  interface EmailInfo {
    verificationUrl: string;
    // Add other properties if needed
  }
  const [emailInfo, setEmailInfo] = useState<EmailInfo | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Form state para crear usuario
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    rol: '',
    funcion: ''
  });

  // Form state para editar usuario
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    rol: '',
    funcion: '',
    activo: true
  });

  // Redirigir si no es admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.rol !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Cargar usuarios
  useEffect(() => {
    if (session?.user?.rol === 'ADMIN') {
      cargarUsuarios();
    }
  }, [session]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usuarios');
      const data = await response.json();

      if (response.ok) {
        setUsuarios(data.usuarios);
      } else {
        setError(data.error || 'Error cargando usuarios');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Usuario creado exitosamente. Contraseña temporal: ${data.passwordTemporal}`);
        setEmailInfo(data.emailInfo);
        setFormData({
          email: '',
          nombre: '',
          apellido: '',
          dni: '',
          telefono: '',
          rol: '',
          funcion: ''
        });
        setShowCreateDialog(false);
        cargarUsuarios();
      } else {
        setError(data.error || 'Error creando usuario');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setCreatingUser(false);
    }
  };

  const toggleUsuarioActivo = async (id: string, activo: boolean) => {
    try {
      const response = await fetch('/api/usuarios/editar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id,
          activo: !activo 
        }),
      });

      if (response.ok) {
        cargarUsuarios();
        setSuccess(`Usuario ${!activo ? 'activado' : 'desactivado'} exitosamente`);
      } else {
        const data = await response.json();
        setError(data.error || 'Error actualizando usuario');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  const abrirEditarUsuario = (usuario: Usuario) => {
    setEditingUser(usuario);
    setEditFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      dni: usuario.dni,
      telefono: usuario.telefono || '',
      rol: usuario.rol,
      funcion: usuario.funcion,
      activo: usuario.activo
    });
    setShowEditDialog(true);
  };

  const editarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdatingUser(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/usuarios/editar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingUser.id,
          ...editFormData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Usuario actualizado exitosamente');
        setShowEditDialog(false);
        setEditingUser(null);
        cargarUsuarios();
      } else {
        setError(data.error || 'Error actualizando usuario');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setUpdatingUser(false);
    }
  };

  const abrirEliminarUsuario = (usuario: Usuario) => {
    setUserToDelete(usuario);
    setShowDeleteDialog(true);
  };

  const eliminarUsuario = async () => {
    if (!userToDelete) return;

    setDeletingUser(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/usuarios/eliminar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userToDelete.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Usuario eliminado exitosamente');
        setShowDeleteDialog(false);
        setUserToDelete(null);
        cargarUsuarios();
      } else {
        setError(data.error || 'Error eliminando usuario');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setDeletingUser(false);
    }
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COORDINADOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OPERARIO':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFuncionBadgeColor = (funcion: string) => {
    switch (funcion) {
      case 'MEDICO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ENFERMERO':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PARAMEDICO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ADMINISTRATIVO':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestión de usuarios...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.rol !== 'ADMIN') {
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
                  Gestión de Usuarios
                </h1>
                <p className="text-sm text-gray-600">Administración del sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-red-100 text-red-800 border-red-200">
                ADMIN
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

        {/* Panel de información del email */}
        {emailInfo && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">📧 Información de Verificación de Email</CardTitle>
              <CardDescription className="text-blue-700">
                Comparte esta información con el nuevo usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border">
                  <Label className="text-sm font-medium text-gray-700">URL de Verificación:</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-mono break-all">
                    {emailInfo.verificationUrl}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      navigator.clipboard.writeText(emailInfo.verificationUrl);
                      setSuccess('URL copiada al portapapeles');
                    }}
                  >
                    Copiar URL
                  </Button>
                </div>
                <div className="text-sm text-blue-700">
                  <strong>Instrucciones para el usuario:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Envía esta URL al nuevo usuario por email o WhatsApp</li>
                    <li>El usuario debe hacer clic en la URL</li>
                    <li>Podrá establecer su contraseña personalizada</li>
                    <li>Después podrá hacer login normalmente</li>
                  </ol>
                </div>
                <Button
                  size="sm"
                  onClick={() => setEmailInfo(null)}
                  variant="outline"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header con botón crear */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h2>
            <p className="text-gray-600">Gestiona los usuarios y sus permisos</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Complete los datos del nuevo usuario. Se enviará un email de verificación.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={crearUsuario} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={formData.dni}
                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rol">Rol</Label>
                    <Select value={formData.rol} onValueChange={(value) => setFormData({...formData, rol: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="COORDINADOR">Coordinador</SelectItem>
                        <SelectItem value="OPERARIO">Operario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="funcion">Función</Label>
                    <Select value={formData.funcion} onValueChange={(value) => setFormData({...formData, funcion: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar función" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                        <SelectItem value="MEDICO">Médico</SelectItem>
                        <SelectItem value="ENFERMERO">Enfermero</SelectItem>
                        <SelectItem value="PARAMEDICO">Paramédico</SelectItem>
                        <SelectItem value="OTROS">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    disabled={creatingUser}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creatingUser}>
                    {creatingUser ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de usuarios responsive */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lista de Usuarios</h3>
              <p className="text-sm text-gray-600">
                {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Vista de escritorio - Tabla compacta */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Rol/Función</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{usuario.nombre} {usuario.apellido}</div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{usuario.dni}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={`text-xs ${getRoleBadgeColor(usuario.rol)}`}>
                              {usuario.rol}
                            </Badge>
                            <Badge className={`text-xs ${getFuncionBadgeColor(usuario.funcion)}`}>
                              {usuario.funcion}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={`text-xs ${usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                            {!usuario.emailVerificado && (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                Email pendiente
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirEditarUsuario(usuario)}
                              className="text-blue-600 hover:text-blue-700 px-2"
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleUsuarioActivo(usuario.id, usuario.activo)}
                              className={`px-2 ${usuario.activo ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                            >
                              {usuario.activo ? 'Desact.' : 'Act.'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirEliminarUsuario(usuario)}
                              className="text-red-600 hover:text-red-700 px-2"
                            >
                              Elim.
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Vista móvil y tablet - Tarjetas */}
          <div className="lg:hidden space-y-4">
            {usuarios.map((usuario) => (
              <Card key={usuario.id} className="p-4">
                <div className="space-y-3">
                  {/* Header de la tarjeta */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {usuario.nombre} {usuario.apellido}
                      </h4>
                      <p className="text-sm text-gray-600">{usuario.email}</p>
                      <p className="text-sm text-gray-500 font-mono">DNI: {usuario.dni}</p>
                    </div>
                    <Badge className={usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  {/* Información del usuario */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Rol:</span>
                      <Badge className={`ml-2 text-xs ${getRoleBadgeColor(usuario.rol)}`}>
                        {usuario.rol}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Función:</span>
                      <Badge className={`ml-2 text-xs ${getFuncionBadgeColor(usuario.funcion)}`}>
                        {usuario.funcion}
                      </Badge>
                    </div>
                    {usuario.telefono && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Teléfono:</span>
                        <span className="ml-2 text-gray-900">{usuario.telefono}</span>
                      </div>
                    )}
                  </div>

                  {/* Estados adicionales */}
                  <div className="flex flex-wrap gap-2">
                    {!usuario.emailVerificado && (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                        Email pendiente
                      </Badge>
                    )}
                    {usuario.passwordTemporal && (
                      <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200">
                        Password temporal
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs text-gray-600">
                      Último login: {usuario.ultimoLogin 
                        ? formatearFechaLocal(usuario.ultimoLogin)
                        : 'Nunca'
                      }
                    </Badge>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirEditarUsuario(usuario)}
                      className="flex-1 text-blue-600 hover:text-blue-700"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleUsuarioActivo(usuario.id, usuario.activo)}
                      className={`flex-1 ${usuario.activo ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                    >
                      {usuario.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirEliminarUsuario(usuario)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Dialog para editar usuario */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Modifica los datos del usuario. El email y contraseña no son editables.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={editarUsuario} className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Email:</strong> {editingUser.email} (no editable)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-nombre">Nombre</Label>
                    <Input
                      id="edit-nombre"
                      value={editFormData.nombre}
                      onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-apellido">Apellido</Label>
                    <Input
                      id="edit-apellido"
                      value={editFormData.apellido}
                      onChange={(e) => setEditFormData({...editFormData, apellido: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-dni">DNI</Label>
                  <Input
                    id="edit-dni"
                    value={editFormData.dni}
                    onChange={(e) => setEditFormData({...editFormData, dni: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-telefono">Teléfono</Label>
                  <Input
                    id="edit-telefono"
                    value={editFormData.telefono}
                    onChange={(e) => setEditFormData({...editFormData, telefono: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-rol">Rol</Label>
                    <Select value={editFormData.rol} onValueChange={(value) => setEditFormData({...editFormData, rol: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="COORDINADOR">Coordinador</SelectItem>
                        <SelectItem value="OPERARIO">Operario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-funcion">Función</Label>
                    <Select value={editFormData.funcion} onValueChange={(value) => setEditFormData({...editFormData, funcion: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar función" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                        <SelectItem value="MEDICO">Médico</SelectItem>
                        <SelectItem value="ENFERMERO">Enfermero</SelectItem>
                        <SelectItem value="PARAMEDICO">Paramédico</SelectItem>
                        <SelectItem value="OTROS">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                    disabled={updatingUser}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updatingUser}>
                    {updatingUser ? 'Actualizando...' : 'Actualizar Usuario'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para confirmar eliminación */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. ¿Está seguro que desea eliminar este usuario?
              </DialogDescription>
            </DialogHeader>
            {userToDelete && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-sm">
                    <div className="font-medium text-red-900">
                      {userToDelete.nombre} {userToDelete.apellido}
                    </div>
                    <div className="text-red-700">{userToDelete.email}</div>
                    <div className="text-red-600">DNI: {userToDelete.dni}</div>
                    <div className="text-red-600">Rol: {userToDelete.rol}</div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={deletingUser}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={eliminarUsuario}
                    disabled={deletingUser}
                  >
                    {deletingUser ? 'Eliminando...' : 'Eliminar Usuario'}
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