"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import LoginForm from '@/components/auth/LoginForm';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirigir si ya está logueado
  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Mostrar loading mientras verifica la sesión
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si ya está logueado, no mostrar la página de login
  if (session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
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
                <p className="text-sm text-gray-600">Provincia - Unidad de Transporte Aéreo</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Sistema Activo
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Gestión Integral de Traslados Médicos
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Sistema provincial para el registro y seguimiento de solicitudes de traslado 
                de pacientes neonatales, pediátricos y adultos de complejidad mediana y alta.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">Seguimiento en Tiempo Real</h3>
                <p className="text-sm text-gray-600">
                  Monitoreo continuo del estado de traslados y procedimientos médicos
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">Gestión de Usuarios</h3>
                <p className="text-sm text-gray-600">
                  Control de acceso con roles diferenciados para coordinadores y operarios
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">Registro Médico</h3>
                <p className="text-sm text-gray-600">
                  Documentación completa de procedimientos y medicación durante traslados
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">Acceso Móvil</h3>
                <p className="text-sm text-gray-600">
                  Interfaz responsive para acceso desde cualquier dispositivo
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Disponibilidad</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-gray-600">Seguridad</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">Real-time</div>
                  <div className="text-sm text-gray-600">Sincronización</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center">
            <LoginForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              © 2024 Sistema Provincial de Salud - Unidad de Transporte Aéreo
            </div>
            <div className="flex space-x-4">
              <span>Versión 1.0.0</span>
              <span>•</span>
              <span>Soporte Técnico</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}