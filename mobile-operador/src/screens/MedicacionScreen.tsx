import * as React from 'react';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimeField, { formatLocalDateTime } from '../components/DateTimeField';
import ScreenContainer from '../components/ScreenContainer';
import SelectField, { SelectOption } from '../components/SelectField';
import { addQueueItem } from '../storage/queueStorage';
import { syncPendingItems } from '../services/syncService';

const OPCIONES_VIA_MEDICACION: SelectOption[] = [
  { label: 'Oral', value: 'ORAL' },
  { label: 'Intravenosa', value: 'INTRAVENOSA' },
  { label: 'Intramuscular', value: 'INTRAMUSCULAR' },
  { label: 'Subcutánea', value: 'SUBCUTANEA' },
  { label: 'Inhalatoria', value: 'INHALATORIA' },
  { label: 'Tópica', value: 'TOPICA' },
  { label: 'Otra', value: 'OTRA' },
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
    tipo: 'medicacion',
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

export default function MedicacionScreen({
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
  const [medicamento, setMedicamento] = useState('');
  const [dosis, setDosis] = useState('');
  const [via, setVia] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaHora, setFechaHora] = useState(formatLocalDateTime(new Date()));

  const submitMedicacion = async () => {
    if (!trasladoId.trim()) {
      Alert.alert('Validación', 'Selecciona un traslado en Seguimiento');
      return;
    }

    if (!usuarioId.trim() || !medicamento.trim() || !dosis.trim() || !via.trim()) {
      Alert.alert('Validación', 'Completa medicamento, dosis y vía');
      return;
    }

    await guardarConCola(
      {
        trasladoId,
        usuarioId,
        medicamento,
        dosis,
        via,
        observaciones,
        fechaHora,
      },
      online
    );

    setMedicamento('');
    setDosis('');
    setVia('');
    setObservaciones('');
    setFechaHora(formatLocalDateTime(new Date()));
    Alert.alert('OK', online ? 'Guardado y sincronizado (o en proceso)' : 'Guardado offline en cola');
  };

  return (
    <ScreenContainer
      footer={
        <Pressable style={[styles.button, styles.secondary]} onPress={onBack}>
          <Text style={styles.buttonText}>Volver a Seguimiento</Text>
        </Pressable>
      }
    >
      <Text style={styles.title}>Registrar medicación</Text>

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

        <TextInput style={styles.input} placeholder="Medicamento" value={medicamento} onChangeText={setMedicamento} />
        <TextInput style={styles.input} placeholder="Dosis" value={dosis} onChangeText={setDosis} />
        <SelectField
          label="Vía de administración"
          placeholder="Seleccionar vía"
          value={via}
          options={OPCIONES_VIA_MEDICACION}
          onChange={setVia}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Observaciones"
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
        />

        <Pressable style={styles.button} onPress={submitMedicacion}>
          <Text style={styles.buttonText}>Guardar Medicación</Text>
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
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 4,
  },
  secondary: { backgroundColor: '#1d4ed8' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
