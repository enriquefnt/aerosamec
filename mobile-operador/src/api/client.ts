//const API_BASE_URL = 'http://192.168.1.100:3000';
//const API_BASE_URL = 'http://192.168.100.196:3000';
//const API_BASE_URL = 'http://192.168.0.130:3000';
const API_BASE_URL = 'http://192.168.0.104:3000';
/**
 * Cliente HTTP mínimo para centralizar requests.
 * Cambiar API_BASE_URL por la IP local del servidor.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Error de servidor');
  }

  return data as T;
}
