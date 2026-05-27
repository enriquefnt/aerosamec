export interface Usuario {
  id: string;
  nombre: string;
  apellido?: string | null;
  email: string;
  funcion?: string | null;
  rol?: string | null;
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
