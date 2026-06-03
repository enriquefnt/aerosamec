import NetInfo from '@react-native-community/netinfo';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { obtenerTrasladosOperario, TrasladoOperario } from '../api/seguimiento';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { syncPendingItems } from '../services/syncService';

export default function SeguimientoScreen({
  onOpenHistorial,
  onOpenEvaluacion,
  onOpenProcedimiento,
  onOpenMedicacion,
  onOpenSignos,
  selectedTrasladoId,
  selectedTrasladoLabel,
  onTrasladoChange,
  onOnlineChange,
}: {
  onOpenHistorial: () => void;
  onOpenEvaluacion: () => void;
  onOpenProcedimiento: () => void;
  onOpenMedicacion: () => void;
  onOpenSignos: () => void;
  selectedTrasladoId: string;
  selectedTrasladoLabel: string;
  onTrasladoChange: (trasladoId: string, trasladoLabel: string) => void;
  onOnlineChange: (online: boolean) => void;
}) {
  const { usuario, logout } = useAuth();
  const [online, setOnline] = useState<boolean>(true);
  const [trasladoId, setTrasladoId] = useState(selectedTrasladoId || '');
  const [traslados, setTraslados] = useState<TrasladoOperario[]>([]);
  const [loadingTraslados, setLoadingTraslados] = useState(false);
  const [lastSelectedFallbackLabel, setLastSelectedFallbackLabel] = useState(selectedTrasladoLabel || '');

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(isOnline);
      onOnlineChange(isOnline);
    });
    return () => sub();
  }, [onOnlineChange]);

  useEffect(() => {
    setTrasladoId(selectedTrasladoId || '');
  }, [selectedTrasladoId]);

  useEffect(() => {
    if (selectedTrasladoLabel?.trim()) {
      setLastSelectedFallbackLabel(selectedTrasladoLabel);
    }
  }, [selectedTrasladoLabel]);

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
    const hospitalOrigen = t.hospitalOrigen?.nombre?.trim() || 'Hospital origen sin definir';
    const nro = t.numeroTraslado != null ? `Traslado #${t.numeroTraslado}` : `ID ${t.id.slice(0, 8)}`;
    return `${nombrePaciente(t)} — ${hospitalOrigen} — ${nro} — Salida: ${formatearFechaHora(t.fechaSolicitud)}`;
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

        console.log('[mobile] traslados raw', {
          usuarioId,
          total: items.length,
          ids: items.map((t) => t.id),
          estados: items.map((t) => (t as unknown as { estado?: string | null }).estado ?? null),
        });

        const activos = items.filter((t) => {
          const estado = String((t as unknown as { estado?: string | null }).estado ?? '')
            .trim()
            .toLowerCase();
          return !(
            estado === 'completado' ||
            estado === 'completada' ||
            estado === 'cancelado' ||
            estado === 'cancelada'
          );
        });

        console.log('[mobile] traslados activos', {
          usuarioId,
          total: activos.length,
          ids: activos.map((t) => t.id),
        });

        setTraslados(activos);
        setTrasladoId((prev) => {
          const stillExists = activos.some((t) => t.id === prev);
          if (stillExists) return prev;
          if (activos.length === 1) return activos[0].id;
          return '';
        });

        if (activos.length === 1) {
          const unico = activos[0];
          Alert.alert('Traslado seleccionado', etiquetaTraslado(unico));
        }
      } catch (_e) {
        if (!mounted) return;
        const netState = await NetInfo.fetch();
        const isOnlineNow = Boolean(netState.isConnected && netState.isInternetReachable !== false);
        if (isOnlineNow) {
          Alert.alert('Error', 'No se pudieron cargar los traslados asignados');
        }
      } finally {
        if (mounted) setLoadingTraslados(false);
      }
    };

    cargar();

    return () => {
      mounted = false;
    };
  }, [usuarioId]);

  useEffect(() => {
    if (!trasladoId) {
      onTrasladoChange('', '');
      setLastSelectedFallbackLabel('');
      return;
    }
    const selected = traslados.find((t) => t.id === trasladoId);
    if (selected) {
      const label = etiquetaTraslado(selected);
      onTrasladoChange(selected.id, label);
      setLastSelectedFallbackLabel(label);
      return;
    }
    if (lastSelectedFallbackLabel) {
      onTrasladoChange(trasladoId, lastSelectedFallbackLabel);
    }
  }, [trasladoId, traslados, onTrasladoChange, lastSelectedFallbackLabel]);

  const hasSelectedTraslado = Boolean(trasladoId);

  const runSync = async () => {
    const result = await syncPendingItems();
    if (result.skipped) {
      Alert.alert('Sin conexión', 'No hay internet para sincronizar');
      return;
    }
    Alert.alert('Sincronización', `Enviados: ${result.synced} | Fallidos: ${result.failed}`);
  };

  return (
    <ScreenContainer
      footer={
        <>
          <Pressable style={[styles.button, styles.secondary]} onPress={runSync}>
            <Text style={styles.buttonText}>Sincronizar ahora</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.secondary]} onPress={onOpenHistorial}>
            <Text style={styles.buttonText}>Ver historial de sync</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.logout]} onPress={logout}>
            <Text style={styles.buttonText}>Cerrar sesión</Text>
          </Pressable>
        </>
      }
    >
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
        {!loadingTraslados && traslados.length === 0 && !trasladoId ? (
          <Text style={styles.subtitle}>No tienes traslados asignados por el momento.</Text>
        ) : null}

        {!loadingTraslados && traslados.length === 0 && trasladoId ? (
          <View style={styles.trasladoItemSelected}>
            <Text style={styles.trasladoTextSelected}>
              Último traslado seleccionado (offline):{' '}
              {lastSelectedFallbackLabel || selectedTrasladoLabel || 'Traslado seleccionado sin detalle disponible'}
            </Text>
          </View>
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

        <Pressable
          style={[styles.button, !hasSelectedTraslado && styles.buttonDisabled]}
          disabled={!hasSelectedTraslado}
          onPress={() => {
            if (!hasSelectedTraslado) return;
            onOpenEvaluacion();
          }}
        >
          <Text style={styles.buttonText}>Valoración inicial</Text>
        </Pressable>

        <Pressable
          style={[styles.button, !hasSelectedTraslado && styles.buttonDisabled]}
          disabled={!hasSelectedTraslado}
          onPress={() => {
            if (!hasSelectedTraslado) return;
            onOpenProcedimiento();
          }}
        >
          <Text style={styles.buttonText}>Registrar procedimientos</Text>
        </Pressable>

        <Pressable
          style={[styles.button, !hasSelectedTraslado && styles.buttonDisabled]}
          disabled={!hasSelectedTraslado}
          onPress={() => {
            if (!hasSelectedTraslado) return;
            onOpenMedicacion();
          }}
        >
          <Text style={styles.buttonText}>Registrar medicamentos</Text>
        </Pressable>

        <Pressable
          style={[styles.button, !hasSelectedTraslado && styles.buttonDisabled]}
          disabled={!hasSelectedTraslado}
          onPress={() => {
            if (!hasSelectedTraslado) return;
            onOpenSignos();
          }}
        >
          <Text style={styles.buttonText}>Signos vitales</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  buttonDisabled: { backgroundColor: '#93c5fd' },
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
