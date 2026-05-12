export interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

export interface LoginResponse {
  ok: boolean;
  usuario?: Usuario;
  error?: string;
}

export interface SessionData {
  usuario: Usuario;
  loginAt: string;
}
