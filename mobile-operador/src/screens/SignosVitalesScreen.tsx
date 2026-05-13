import * as React from 'react';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import SelectField, { SelectOption } from '../components/SelectField';
import { addQueueItem } from '../storage/queueStorage';
import { syncPendingItems } from '../services/syncService';

const OPCIONES_GLASGOW: SelectOption[] = [
  { label: '15/15 (Normal)', value: '15' },
  { label: '14/15 (Leve alteración)', value: '14' },
  { label: '13/15 (Leve alteración)', value: '13' },
  { label: '12/15 (Moderada alteración)', value: '12' },
  { label: '11/15 (Moderada alteración)', value: '11' },
  { label: '10/15 (Moderada alteración)', value: '10' },
  { label: '9/15 (Severa alteración)', value: '9' },
  { label: '8/15 (Severa alteración)', value: '8' },
  { label: '7/15 (Severa alteración)', value: '7' },
  { label: '6/15 (Severa alteración)', value: '6' },
  { label: '5/15 (Severa alteración)', value: '5' },
  { label: '4/15 (Severa alteración)', value: '4' },
  { label: '3/15 (Coma)', value: '3' },
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
    tipo: 'signos-vitales',
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

export default function SignosVitalesScreen({
  trasladoId,
  usuarioId,
  online,
  onBack,
}: {
  trasladoId: string;
  usuarioId: string;
  online: boolean;
  onBack: () => void;
}) {
  const [fc, setFc] = useState('');
  const [fr, setFr] = useState('');
  const [taSist, setTaSist] = useState('');
  const [taDiast, setTaDiast] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [saturacionO2, setSaturacionO2] = useState('');
  const [escalaGlasgow, setEscalaGlasgow] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaHora, setFechaHora] = useState(new Date().toISOString().slice(0, 16));

  const submitSignos = async () => {
    if (!trasladoId.trim()) {
      Alert.alert('Validación', 'Selecciona un traslado en Seguimiento');
      return;
    }

    if (!usuarioId.trim()) {
      Alert.alert('Validación', 'Sesión inválida, vuelve a ingresar');
      return;
    }

    await guardarConCola(
      {
        trasladoId,
        usuarioId,
        frecuenciaCardiaca: fc,
        frecuenciaRespiratoria: fr,
        presionArterialSist: taSist,
        presionArterialDiast: taDiast,
        temperatura,
        saturacionO2,
        escalaGlasgow,
        observaciones,
        fechaHora,
      },
      online
    );

    setFc('');
    setFr('');
    setTaSist('');
    setTaDiast('');
    setTemperatura('');
    setSaturacionO2('');
    setEscalaGlasgow('');
    setObservaciones('');
    setFechaHora(new Date().toISOString().slice(0, 16));
    Alert.alert('OK', online ? 'Guardado y sincronizado (o en proceso)' : 'Guardado offline en cola');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Registrar signos vitales</Text>

      <View style={[styles.banner, online ? styles.online : styles.offline]}>
        <Text style={styles.bannerText}>{online ? 'Online' : 'Offline - guardando en cola local'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Traslado seleccionado</Text>
        <Text style={styles.value}>{trasladoId ? trasladoId : 'Ninguno seleccionado'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Fecha y hora (YYYY-MM-DDTHH:mm)"
          value={fechaHora}
          onChangeText={setFechaHora}
        />

        <TextInput style={styles.input} placeholder="Frecuencia cardíaca (lpm)" value={fc} onChangeText={setFc} />
        <TextInput style={styles.input} placeholder="Frecuencia respiratoria (rpm)" value={fr} onChangeText={setFr} />
        <TextInput style={styles.input} placeholder="TA sistólica (mmHg)" value={taSist} onChangeText={setTaSist} />
        <TextInput style={styles.input} placeholder="TA diastólica (mmHg)" value={taDiast} onChangeText={setTaDiast} />
        <TextInput style={styles.input} placeholder="Temperatura (°C)" value={temperatura} onChangeText={setTemperatura} />
        <TextInput style={styles.input} placeholder="Saturación O2 (%)" value={saturacionO2} onChangeText={setSaturacionO2} />
        <SelectField
          label="Escala de Glasgow"
          placeholder="Seleccionar score"
          value={escalaGlasgow}
          options={OPCIONES_GLASGOW}
          onChange={setEscalaGlasgow}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Observaciones"
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
        />

        <Pressable style={styles.button} onPress={submitSignos}>
          <Text style={styles.buttonText}>Guardar Signos</Text>
        </Pressable>
      </View>

      <Pressable style={[styles.button, styles.secondary]} onPress={onBack}>
        <Text style={styles.buttonText}>Volver a Seguimiento</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 40 },
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
