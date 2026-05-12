import {
  enviarEvaluacionInicial,
  enviarMedicacion,
  enviarProcedimiento,
  enviarSignos,
} from '../api/seguimiento';
import { getQueue, updateQueueItemStatus } from '../storage/queueStorage';
import { QueueItem } from '../types/sync';
import { isOnline } from './networkService';

async function enviarItem(item: QueueItem) {
  switch (item.tipo) {
    case 'procedimiento':
      await enviarProcedimiento(item.payload as never);
      return;
    case 'medicacion':
      await enviarMedicacion(item.payload as never);
      return;
    case 'signos-vitales':
      await enviarSignos(item.payload as never);
      return;
    case 'evaluacion-inicial':
      await enviarEvaluacionInicial(item.payload as never);
      return;
    default:
      throw new Error('Tipo de item no soportado');
  }
}

/**
 * Procesa pendientes locales en orden de creación.
 * Si falla uno, continúa con los demás y deja trazado en estado/error.
 */
export async function syncPendingItems() {
  const online = await isOnline();
  if (!online) {
    return { synced: 0, failed: 0, skipped: true };
  }

  const queue = await getQueue();
  const pending = queue
    .filter((q) => q.estado === 'pending' || q.estado === 'error')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await enviarItem(item);
      await updateQueueItemStatus(item.idLocal, 'synced');
      synced += 1;
    } catch (error) {
      await updateQueueItemStatus(
        item.idLocal,
        'error',
        error instanceof Error ? error.message : 'Error desconocido'
      );
      failed += 1;
    }
  }

  return { synced, failed, skipped: false };
}
