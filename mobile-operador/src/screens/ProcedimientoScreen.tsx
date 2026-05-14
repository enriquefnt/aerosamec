import * as React from 'react';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimeField, { formatLocalDateTime } from '../components/DateTimeField';
import ScreenContainer from '../components/ScreenContainer';
import SelectField, { SelectOption } from '../components/SelectField';
import { addQueueItem } from '../storage/queueStorage';
import { syncPendingItems } from '../services/syncService';

const OPCIONES_TIPO_PROCEDIMIENTO: SelectOption[] = [
  { label: 'Monitoreo Cardíaco', value: 'Monitoreo Cardíaco' },
  { label: 'Control Neurológico', value: 'Control Neurológico' },
  { label: 'Aspiración de Secreciones', value: 'Aspiración de Secreciones' },
  { label: 'Ventilación Asistida', value: 'Ventilación Asistida' },
  { label: 'Acceso Vascular', value: 'Acceso Vascular' },
  { label: 'Inmovilización', value: 'Inmovilización' },
  { label: 'Oxigenoterapia', value: 'Oxigenoterapia' },
  { label: 'Otro', value: 'Otro' },
];

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function guardarConCola(
  payload: Record<string, unknown>,
  intentarSyncOnline: boolean
) {
  const now = new Date().toISOString();

  await addQueueItem({
    idLocal: createLocalId(),
    tipo: 'procedimiento',
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

export default function ProcedimientoScreen({
  trasladoId,
  usuarioId,
  online,
  trasladoLabel,
  onBack,
}: {
  trasladoId: string;
  usuarioId: string;
  online: boolean;
  trasladoLabel: string;
  onBack: () => void;
}) {
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaHora, setFechaHora] = useState(formatLocalDateTime(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitProcedimiento = async () => {
    if (isSubmitting) return;
    if (!trasladoId.trim()) {
      Alert.alert('Validación', 'Selecciona un traslado en Seguimiento');
      return;
    }

    if (!usuarioId.trim() || !tipo.trim() || !descripcion.trim()) {
      Alert.alert('Validación', 'Completa tipo y descripción');
      return;
    }

    try {
      setIsSubmitting(true);

      await guardarConCola(
        {
          trasladoId,
          usuarioId,
          tipoRaw: tipo,
          descripcionRaw: descripcion,
          observacionesRaw: observaciones,
          fechaHora,
        },
        online
      );

      setTipo('');
      setDescripcion('');
      setObservaciones('');
      setFechaHora(formatLocalDateTime(new Date()));
      Alert.alert('OK', online ? 'Guardado y sincronizado (o en proceso)' : 'Guardado offline en cola');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      footer={
        <Pressable style={[styles.button, styles.secondary]} onPress={onBack}>
          <Text style={styles.buttonText}>Volver a Seguimiento</Text>
        </Pressable>
      }
    >
      <Text style={styles.title}>Registrar procedimiento</Text>

      <View style={[styles.banner, online ? styles.online : styles.offline]}>
        <Text style={styles.bannerText}>{online ? 'Online' : 'Offline - guardando en cola local'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Traslado seleccionado</Text>
        <Text style={styles.value}>{trasladoLabel ? trasladoLabel : 'Ninguno seleccionado'}</Text>

        <DateTimeField
          label="Fecha y hora"
          value={fechaHora}
          onChangeValue={setFechaHora}
        />

        <SelectField
          label="Tipo de procedimiento"
          placeholder="Seleccionar tipo"
          value={tipo}
          options={OPCIONES_TIPO_PROCEDIMIENTO}
          onChange={setTipo}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Observaciones"
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
        />

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={submitProcedimiento}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Guardando...' : 'Guardar Procedimiento'}
          </Text>
        </Pressable>
      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 12 },
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
  label: { color: '#374151', marginBottom: 4, fontWeight: '600' },
  value: { color: '#111827', marginBottom: 10 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 4,
  },
  secondary: { backgroundColor: '#1d4ed8' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
