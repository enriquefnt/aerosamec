import { apiRequest } from './client';
import {
  EvaluacionInicialPayload,
  MedicacionPayload,
  ProcedimientoPayload,
  SignosPayload,
} from '../types/seguimiento';

export type TrasladoOperario = {
  id: string;
  numeroTraslado?: number | null;
  pacienteNombre?: string | null;
  pacienteApellido?: string | null;
  fechaSolicitud?: string | null;
};

export async function obtenerTrasladosOperario(operarioId: string) {
  const query = encodeURIComponent(operarioId);
  return apiRequest<{ traslados: TrasladoOperario[] }>(`/api/traslados/operario?operarioId=${query}`);
}

export async function enviarProcedimiento(payload: ProcedimientoPayload) {
  return apiRequest('/api/procedimientos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function enviarMedicacion(payload: MedicacionPayload) {
  return apiRequest('/api/medicaciones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function enviarSignos(payload: SignosPayload) {
  return apiRequest('/api/signos-vitales', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function enviarEvaluacionInicial(payload: EvaluacionInicialPayload) {
  return apiRequest('/api/evaluaciones-iniciales', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
