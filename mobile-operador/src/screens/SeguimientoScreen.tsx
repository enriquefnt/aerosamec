import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { addQueueItem } from '../storage/queueStorage';
import { syncPendingItems } from '../services/syncService';
import { QueueItemType } from '../types/sync';
import { obtenerTrasladosOperario, TrasladoOperario } from '../api/seguimiento';

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Encola un item para sincronizar luego.
 * Si hay internet, también intenta sincronizar en el momento.
 */
async function guardarConCola(
  tipo: QueueItemType,
  payload: Record<string, unknown>,
  intentarSyncOnline: boolean
) {
  const now = new Date().toISOString();

  await addQueueItem({
    idLocal: createLocalId(),
    tipo,
    payload,
    estado: 'pending',
    intentos: 0,
    createdAt: now,
    updatedAt: now,
  });

  if (intentarSyncOnline) {
    await syncPendingItems();
  }
}

export default function SeguimientoScreen({
  onOpenHistorial,
}: {
  onOpenHistorial: () => void;
}) {
  const { usuario, logout } = useAuth();
  const [online, setOnline] = useState<boolean>(true);

  const [trasladoId, setTrasladoId] = useState('');
  const [traslados, setTraslados] = useState<TrasladoOperario[]>([]);
  const [loadingTraslados, setLoadingTraslados] = useState(false);
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [medicamento, setMedicamento] = useState('');
  const [dosis, setDosis] = useState('');
  const [via, setVia] = useState('');
  const [fc, setFc] = useState('');
  const [diagnostico, setDiagnostico] = useState('');

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => sub();
  }, []);

  const usuarioId = usuario?.id || '';

  const trasladoSeleccionado = useMemo(
    () => traslados.find((t) => t.id === trasladoId) || null,
    [traslados, trasladoId]
  );

  const canSubmit = useMemo(() => Boolean(trasladoId.trim() && usuarioId), [trasladoId, usuarioId]);

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
        setTraslados(items);

        if (items.length === 1) {
          const unico = items[0];
          setTrasladoId(unico.id);
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
  }, [usuarioId]);

  const submitProcedimiento = async () => {
    if (!canSubmit || !tipo.trim() || !descripcion.trim()) {
      Alert.alert('Validación', 'Completa traslado, tipo y descripción');
      return;
    }

    await guardarConCola(
      'procedimiento',
      {
        trasladoId,
        usuarioId,
        tipoRaw: tipo,
        descripcionRaw: descripcion,
        observacionesRaw: '',
        fechaHora: new Date().toISOString().slice(0, 16),
      },
      online
    );

    setTipo('');
    setDescripcion('');
    Alert.alert('OK', online ? 'Guardado y sincronizado (o en proceso)' : 'Guardado offline en cola');
  };

  const submitMedicacion = async () => {
    if (!canSubmit || !medicamento.trim() || !dosis.trim() || !via.trim()) {
      Alert.alert('Validación', 'Completa traslado, medicamento, dosis y vía');
      return;
    }

    await guardarConCola(
      'medicacion',
      {
        trasladoId,
        usuarioId,
        medicamento,
        dosis,
        via,
        observaciones: '',
        fechaHora: new Date().toISOString().slice(0, 16),
      },
      online
    );

    setMedicamento('');
    setDosis('');
    setVia('');
    Alert.alert('OK', online ? 'Guardado y sincronizado (o en proceso)' : 'Guardado offline en cola');
  };

  const submitSignos = async () => {
    if (!canSubmit) {
      Alert.alert('Validación', 'Completa traslado');
      return;
    }

    await guardarConCola(
      'signos-vitales',
      {
        trasladoId,
        usuarioId,
        frecuenciaCardiaca: fc,
        fechaHora: new Date().toISOString().slice(0, 16),
      },
      online
    );

    setFc('');
    Alert.alert('OK', online ? 'Guardado y sincronizado (o en proceso)' : 'Guardado offline en cola');
  };

  const submitEvaluacion = async () => {
    if (!canSubmit || !diagnostico.trim()) {
      Alert.alert('Validación', 'Completa traslado y diagnóstico');
      return;
    }

    await guardarConCola(
      'evaluacion-inicial',
      {
        trasladoId,
        usuarioId,
        diagnostico,
        viaAerea: 'Permeable',
        respiracion: 'Normal',
        hemodinamia: 'Estable',
        neurologico: 'Alerta',
      },
      online
    );

    setDiagnostico('');
    Alert.alert('OK', online ? 'Guardado y sincronizado (o en proceso)' : 'Guardado offline en cola');
  };

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

      <Section title="Procedimiento">
        <TextInput style={styles.input} placeholder="Tipo" value={tipo} onChangeText={setTipo} />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />
        <Pressable style={styles.button} onPress={submitProcedimiento}>
          <Text style={styles.buttonText}>Guardar Procedimiento</Text>
        </Pressable>
      </Section>

      <Section title="Medicación">
        <TextInput style={styles.input} placeholder="Medicamento" value={medicamento} onChangeText={setMedicamento} />
        <TextInput style={styles.input} placeholder="Dosis" value={dosis} onChangeText={setDosis} />
        <TextInput style={styles.input} placeholder="Vía" value={via} onChangeText={setVia} />
        <Pressable style={styles.button} onPress={submitMedicacion}>
          <Text style={styles.buttonText}>Guardar Medicación</Text>
        </Pressable>
      </Section>

      <Section title="Signos Vitales (mínimo)">
        <TextInput style={styles.input} placeholder="Frecuencia cardíaca" value={fc} onChangeText={setFc} />
        <Pressable style={styles.button} onPress={submitSignos}>
          <Text style={styles.buttonText}>Guardar Signos</Text>
        </Pressable>
      </Section>

      <Section title="Evaluación Inicial (mínimo)">
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Diagnóstico"
          value={diagnostico}
          onChangeText={setDiagnostico}
          multiline
        />
        <Pressable style={styles.button} onPress={submitEvaluacion}>
          <Text style={styles.buttonText}>Guardar Evaluación</Text>
        </Pressable>
      </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
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
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 4,
  },
  secondary: { backgroundColor: '#1d4ed8', marginBottom: 10 },
  logout: { backgroundColor: '#b91c1c' },
  buttonText: { color: '#fff', fontWeight: '600' },
  trasladosList: {
    marginBottom: 12,
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
