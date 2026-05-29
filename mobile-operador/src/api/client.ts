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

console.log('[mobile] API base URL resolved', {
  fromEnv: process.env.EXPO_PUBLIC_API_URL || null,
  fromExpoExtra:
    (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl || null,
  final: API_BASE_URL,
});

/**
 * Cliente HTTP mínimo para centralizar requests.
 * Define `expo.extra.apiBaseUrl` en app.json para evitar IPs hardcodeadas.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log('[mobile] apiRequest start', {
    method: options.method || 'GET',
    url,
  });

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const rawText = await response.text();
  let data: unknown = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = rawText;
  }

  console.log('[mobile] apiRequest response', {
    method: options.method || 'GET',
    url,
    status: response.status,
    ok: response.ok,
    payloadType: typeof data,
    payloadSize: rawText?.length || 0,
  });

  if (!response.ok) {
    const errorMessage =
      (typeof data === 'object' && data !== null && 'error' in data
        ? (data as { error?: string }).error
        : undefined) || 'Error de servidor';
    throw new Error(errorMessage);
  }

  return data as T;
}
