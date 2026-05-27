import Constants from 'expo-constants';

const getApiBaseUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const fromExpoExtra =
    (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

  const fallbackForWeb = 'http://localhost:3000';
  const fallbackForNative = 'https://aerosamec.vercel.app';

  return (
    fromEnv ||
    fromExpoExtra ||
    (typeof window !== 'undefined' ? fallbackForWeb : fallbackForNative)
  );
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Cliente HTTP mínimo para centralizar requests.
 * Define `expo.extra.apiBaseUrl` en app.json para evitar IPs hardcodeadas.
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
