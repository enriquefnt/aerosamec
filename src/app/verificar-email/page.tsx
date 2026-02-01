"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerificarEmailPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  type UserInfo = {
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    funcion: string;
  };
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Obtener token de la URL usando window.location
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verificarToken(tokenFromUrl);
    }
  }, []);

  const verificarToken = async (tokenToVerify: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/verificar-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await response.json();

      if (response.ok) {
        setTokenValid(true);
        setUserInfo(data.usuario);
      } else {
        setError(data.error || 'Token inválido o expirado');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/cambiar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contraseña cambiada exitosamente. Redirigiendo al login...');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setError(data.error || 'Error cambiando contraseña');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verificar Email y Cambiar Contraseña</CardTitle>
          <CardDescription>
            {tokenValid 
              ? `Bienvenido, ${userInfo?.nombre}. Establezca su nueva contraseña.`
              : 'Verificando su token de acceso...'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {tokenValid && userInfo ? (
            <form onSubmit={cambiarPassword} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Información de la cuenta:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Nombre:</strong> {userInfo.nombre} {userInfo.apellido}</div>
                  <div><strong>Email:</strong> {userInfo.email}</div>
                  <div><strong>Rol:</strong> {userInfo.rol}</div>
                  <div><strong>Función:</strong> {userInfo.funcion}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña"
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Cambiando contraseña...' : 'Establecer Contraseña'}
              </Button>
            </form>
          ) : !loading && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                El token de verificación es inválido o ha expirado.
              </p>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
              >
                Volver al Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}