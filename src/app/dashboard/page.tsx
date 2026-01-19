"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (status === 'loading') return; // Esperar a que cargue
    if (!session?.user) {
      router.push('/');
    }
  }, [session, status, router]);

  // Mostrar loading mientras verifica la sesión
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión, no mostrar nada (se redirigirá)
  if (!session?.user) {
    return null;
  }

  const handleLogout = async () => {
    // Usar window.location.origin para obtener la URL base actual
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    await signOut({ 
      callbackUrl: `${baseUrl}/`,
      redirect: true 
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/93bc40ea-c225-45d3-b910-974774eb57d3.png" 
                alt="Logo Sistema de Traslados Médicos" 
                className="h-10 w-10 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema de Traslados Médicos Aéreos
                </h1>
                <p className="text-sm text-gray-600">Dashboard - {session.user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getRoleBadgeColor(session.user.rol)}>
                {session.user.rol}
              </Badge>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {session.user.name}!
          </h2>
          <p className="text-gray-600">
            Has iniciado sesión exitosamente en el sistema de traslados médicos aéreos.
          </p>
        </div>

        {/* User Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Nombre:</span>
                <p className="text-gray-900">{session.user.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{session.user.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Rol:</span>
                <Badge className={`ml-2 ${getRoleBadgeColor(session.user.rol)}`}>
                  {session.user.rol}
                </Badge>
              </div>
              {session.user.telefono && (
                <div>
                  <span className="font-medium text-gray-700">Teléfono:</span>
                  <p className="text-gray-900">{session.user.telefono}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Activo
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conexión BD:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Conectado
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última actualización:</span>
                  <span className="text-sm text-gray-900">Ahora</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions / Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {session.user.rol === 'ADMIN' ? 'Acciones de Administrador' : 'Próximos Pasos'}
              </CardTitle>
              <CardDescription>
                {session.user.rol === 'ADMIN' 
                  ? 'Herramientas de administración del sistema'
                  : 'Funcionalidades que se implementarán'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.user.rol === 'ADMIN' ? (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard/usuarios')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Gestión de Usuarios</div>
                        <div className="text-sm text-gray-500">Crear, editar y administrar usuarios</div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard/traslados')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Gestión de Traslados</div>
                        <div className="text-sm text-gray-500">Administrar traslados médicos</div>
                      </div>
                    </div>
                  </Button>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Gestión de usuarios ✓</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Gestión de traslados ✓</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Reportes y estadísticas (próximamente)</span>
                    </div>
                  </div>
                </div>
              ) : session.user.rol === 'COORDINADOR' ? (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard/traslados')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Gestión de Traslados</div>
                        <div className="text-sm text-gray-500">Coordinar traslados médicos aéreos</div>
                      </div>
                    </div>
                  </Button>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Gestión de traslados ✓</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Seguimiento médico (próximamente)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Reportes operacionales (próximamente)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard/seguimiento')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Seguimiento Médico</div>
                        <div className="text-sm text-gray-500">Control durante traslados</div>
                      </div>
                    </div>
                  </Button>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Seguimiento médico ✓</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Procedimientos y medicación</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Control de signos vitales</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-900">
                  ¡Autenticación Exitosa!
                </h3>
                <p className="text-green-700">
                  El sistema de login está funcionando correctamente. La base de datos está conectada 
                  y los usuarios pueden autenticarse según sus roles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}