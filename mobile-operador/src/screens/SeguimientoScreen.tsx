import NetInfo from '@react-native-community/netinfo';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { syncPendingItems } from '../services/syncService';
import { obtenerTrasladosOperario, TrasladoOperario } from '../api/seguimiento';

export default function SeguimientoScreen({
  onOpenHistorial,
  onOpenEvaluacion,
  onOpenProcedimiento,
  onOpenMedicacion,
  onOpenSignos,
  onTrasladoChange,
  onOnlineChange,
}: {
  onOpenHistorial: () => void;
  onOpenEvaluacion: () => void;
  onOpenProcedimiento: () => void;
  onOpenMedicacion: () => void;
  onOpenSignos: () => void;
  onTrasladoChange: (trasladoId: string) => void;
  onOnlineChange: (online: boolean) => void;
}) {
  const { usuario, logout } = useAuth();
  const [online, setOnline] = useState<boolean>(true);
  const [trasladoId, setTrasladoId] = useState('');
  const [traslados, setTraslados] = useState<TrasladoOperario[]>([]);
  const [loadingTraslados, setLoadingTraslados] = useState(false);

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(isOnline);
      onOnlineChange(isOnline);
    });
    return () => sub();
  }, [onOnlineChange]);

  const usuarioId = usuario?.id || '';

  const formatearFechaHora = (fecha?: string | null) => {
    if (!fecha) return 'sin horario';
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return 'sin horario';
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const nombrePaciente = (t: TrasladoOperario) =>
    `${(t.pacienteApellido || '').trim()} ${(t.pacienteNombre || '').trim()}`.trim() || 'Paciente sin nombre';

  const etiquetaTraslado = (t: TrasladoOperario) => {
    const nro = t.numeroTraslado != null ? `Traslado #${t.numeroTraslado}` : `ID ${t.id.slice(0, 8)}`;
    return `${nombrePaciente(t)} — ${nro} — ${formatearFechaHora(t.fechaSolicitud)}`;
  };

  useEffect(() => {
    let mounted = true;

    const cargar = async () => {
      if (!usuarioId) return;
      setLoadingTraslados(true);
      try {
        const data = await obtenerTrasladosOperario(usuarioId);
        if (!mounted) return;
        const items = Array.isArray(data?.traslados) ? data.traslados : [];
        const activos = items.filter((t) => {
          const estado = String((t as unknown as { estado?: string | null }).estado ?? '')
            .trim()
            .toLowerCase();
          return estado !== 'completado' && estado !== 'cancelado';
        });

        setTraslados(activos);
        setTrasladoId((prev) => (activos.some((t) => t.id === prev) ? prev : ''));

        if (activos.length === 1) {
          const unico = activos[0];
          setTrasladoId(unico.id);
          onTrasladoChange(unico.id);
          Alert.alert('Traslado seleccionado', etiquetaTraslado(unico));
        }
      } catch (_e) {
        if (!mounted) return;
        Alert.alert('Error', 'No se pudieron cargar los traslados asignados');
      } finally {
        if (mounted) setLoadingTraslados(false);
      }
    };

    cargar();

    return () => {
      mounted = false;
    };
  }, [usuarioId, onTrasladoChange]);

  const runSync = async () => {
    const result = await syncPendingItems();
    if (result.skipped) {
      Alert.alert('Sin conexión', 'No hay internet para sincronizar');
      return;
    }
    Alert.alert('Sincronización', `Enviados: ${result.synced} | Fallidos: ${result.failed}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Seguimiento Operador</Text>
      <Text style={styles.subtitle}>
        Usuario: {usuario?.nombre} ({usuario?.email})
      </Text>

      <View style={[styles.banner, online ? styles.online : styles.offline]}>
        <Text style={styles.bannerText}>{online ? 'Online' : 'Offline - guardando en cola local'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Seleccionar traslado</Text>
        {loadingTraslados ? <Text style={styles.subtitle}>Cargando traslados...</Text> : null}
        {!loadingTraslados && traslados.length === 0 ? (
          <Text style={styles.subtitle}>No tienes traslados asignados por el momento.</Text>
        ) : null}

        <View style={styles.trasladosList}>
          {traslados.map((t) => {
            const selected = trasladoId === t.id;
            return (
              <Pressable
                key={t.id}
                style={[styles.trasladoItem, selected && styles.trasladoItemSelected]}
                onPress={() => {
                  setTrasladoId(t.id);
                  onTrasladoChange(t.id);
                  Alert.alert('Traslado seleccionado', etiquetaTraslado(t));
                }}
              >
                <Text style={[styles.trasladoText, selected && styles.trasladoTextSelected]}>
                  {etiquetaTraslado(t)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Carga de seguimiento</Text>

        <Pressable style={styles.button} onPress={onOpenEvaluacion}>
          <Text style={styles.buttonText}>Valoración inicial</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onOpenProcedimiento}>
          <Text style={styles.buttonText}>Registrar procedimientos</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onOpenMedicacion}>
          <Text style={styles.buttonText}>Registrar medicamentos</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onOpenSignos}>
          <Text style={styles.buttonText}>Signos vitales</Text>
        </Pressable>
      </View>

      <Pressable style={[styles.button, styles.secondary]} onPress={runSync}>
        <Text style={styles.buttonText}>Sincronizar ahora</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.secondary]} onPress={onOpenHistorial}>
        <Text style={styles.buttonText}>Ver historial de sync</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.logout]} onPress={logout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 4, marginBottom: 12, color: '#4b5563' },
  banner: { padding: 10, borderRadius: 10, marginBottom: 12 },
  online: { backgroundColor: '#dcfce7' },
  offline: { backgroundColor: '#fee2e2' },
  bannerText: { color: '#111827', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#111827' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 6,
  },
  secondary: { backgroundColor: '#1d4ed8', marginBottom: 10 },
  logout: { backgroundColor: '#b91c1c' },
  buttonText: { color: '#fff', fontWeight: '600' },
  trasladosList: {
    marginBottom: 4,
  },
  trasladoItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  trasladoItemSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  trasladoText: {
    color: '#111827',
    fontWeight: '500',
  },
  trasladoTextSelected: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
});
