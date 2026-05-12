import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueItem, QueueItemStatus } from '../types/sync';

const QUEUE_KEY = 'mobile_operador_sync_queue';

export async function getQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as QueueItem[];
}

export async function saveQueue(items: QueueItem[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function addQueueItem(item: QueueItem) {
  const queue = await getQueue();
  queue.push(item);
  await saveQueue(queue);
}

export async function updateQueueItemStatus(
  idLocal: string,
  estado: QueueItemStatus,
  ultimoError?: string
) {
  const queue = await getQueue();
  const updated = queue.map((item) => {
    if (item.idLocal !== idLocal) return item;
    return {
      ...item,
      estado,
      intentos: item.intentos + 1,
      ultimoError,
      updatedAt: new Date().toISOString(),
    };
  });
  await saveQueue(updated);
}
