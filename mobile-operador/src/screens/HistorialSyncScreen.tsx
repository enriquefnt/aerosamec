import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { getQueue } from '../storage/queueStorage';
import { QueueItem } from '../types/sync';

export default function HistorialSyncScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [items, setItems] = useState<QueueItem[]>([]);

  const load = useCallback(async () => {
    const queue = await getQueue();
    setItems(queue.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Volver</Text>
      </Pressable>
      <Text style={styles.title}>Historial de sincronización</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.idLocal}
        ListEmptyComponent={<Text style={styles.empty}>No hay registros en cola</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.tipo}>{item.tipo}</Text>
            <Text style={styles.meta}>Estado: {item.estado}</Text>
            <Text style={styles.meta}>Intentos: {item.intentos}</Text>
            {item.ultimoError ? <Text style={styles.error}>Error: {item.ultimoError}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  backBtnText: { color: '#fff', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#111827' },
  empty: { color: '#6b7280' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 10,
  },
  tipo: { fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  meta: { color: '#374151', fontSize: 13 },
  error: { color: '#b91c1c', marginTop: 4, fontSize: 13 },
});
