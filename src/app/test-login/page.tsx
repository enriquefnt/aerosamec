"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@salud.gob.ar');
  const [password, setPassword] = useState('123456');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Probando login...');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test de Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Email:</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password:</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button 
            onClick={testLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Probando...' : 'Test Login'}
          </Button>
          
          {result && (
            <div className="bg-gray-50 p-4 rounded text-sm">
              <pre>{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}