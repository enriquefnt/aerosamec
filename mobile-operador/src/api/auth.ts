import { apiRequest } from './client';
import { LoginResponse } from '../types/auth';

export async function login(email: string, password: string) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
