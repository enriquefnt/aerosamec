export type QueueItemType =
  | 'procedimiento'
  | 'medicacion'
  | 'signos-vitales'
  | 'evaluacion-inicial';

export type QueueItemStatus = 'pending' | 'synced' | 'error';

export interface QueueItem {
  idLocal: string;
  tipo: QueueItemType;
  payload: Record<string, unknown>;
  estado: QueueItemStatus;
  intentos: number;
  ultimoError?: string;
  createdAt: string;
  updatedAt: string;
}
