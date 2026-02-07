"use client";

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Intentar login (Como Auth::attempt en Laravel)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales incorrectos. Verifique su email y contraseña.');
      } else {
        // Login exitoso - obtener sesión y redirigir
        const session = await getSession();
        if (session?.user) {
          // Redirigir según el rol del usuario
          router.push('/dashboard');
        }
      }
    } catch (error) {
      setError('Error de conexión. Intente nuevamente.');
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: demoEmail,
        password: '123456',
        redirect: false,
      });

      if (result?.error) {
        setError('Error en login de demostración.');
      } else {
        const session = await getSession();
        if (session?.user) {
          router.push('/dashboard');
        }
      }
    } catch {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Acceso al Sistema</CardTitle>
        <CardDescription>
          Ingrese sus credenciales para acceder al panel de control
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="usuario@salud.gob.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        
        {/* Demo Users */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Usuarios de Demostración:</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => handleDemoLogin('admin@salud.gob.ar')}
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="font-medium">Administrador</div>
                <div className="text-xs text-gray-500">admin@aerosamec.gob.ar</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => handleDemoLogin('coord@salud.gob.ar')}
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="font-medium">Coordinador</div>
                <div className="text-xs text-gray-500">coord@salud.gob.ar</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => handleDemoLogin('operario@salud.gob.ar')}
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="font-medium">Operario</div>
                <div className="text-xs text-gray-500">operario@salud.gob.ar</div>
              </div>
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Contraseña para todos: 123456
          </div>
        </div>
      </CardContent>
    </Card>
  );
}