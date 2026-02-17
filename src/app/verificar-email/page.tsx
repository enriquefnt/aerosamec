"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Usuario = {
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  funcion: string;
};

export default function VerificarEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (!t) {
      setError("Token no encontrado");
      setLoading(false);
      return;
    }

    setToken(t);

    fetch(`/api/verificar-email?token=${t}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setUsuario(data.usuario);
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Activación de cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Validando enlace…</p>}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {usuario && (
            <>
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  Hola <strong>{usuario.nombre}</strong>, para completar la activación
                  debés definir tu contraseña.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full"
                onClick={() =>
                  router.push(`/reset-password?token=${token}`)
                }
              >
                Continuar
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
