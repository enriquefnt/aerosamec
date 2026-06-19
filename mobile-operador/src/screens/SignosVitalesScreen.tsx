import * as React from 'react';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimeField, { formatLocalDateTime } from '../components/DateTimeField';
import ScreenContainer from '../components/ScreenContainer';
import { addQueueItem } from '../storage/queueStorage';
import { syncPendingItems } from '../services/syncService';

const GLASGOW_MIN = 3;
const GLASGOW_MAX = 15;

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
  trasladoLabel,
  onBack,
}: {
  trasladoId: string;
  usuarioId: string;
  online: boolean;
  trasladoLabel: string;
  onBack: () => void;
}) {
  const [fc, setFc] = useState('');
  const [fr, setFr] = useState('');
  const [taSist, setTaSist] = useState('');
  const [taDiast, setTaDiast] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [saturacionO2, setSaturacionO2] = useState('');
  const [escalaGlasgow, setEscalaGlasgow] = useState('15');
  const [observaciones, setObservaciones] = useState('');
  const [fechaHora, setFechaHora] = useState(formatLocalDateTime(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitSignos = async () => {
    if (isSubmitting) return;

    if (!trasladoId.trim()) {
      Alert.alert('Validación', 'Selecciona un traslado en Seguimiento');
      return;
    }

    if (!usuarioId.trim()) {
      Alert.alert('Validación', 'Sesión inválida, vuelve a ingresar');
      return;
    }

    setIsSubmitting(true);
    try {
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
      setEscalaGlasgow('15');
      setObservaciones('');
      setFechaHora(formatLocalDateTime(new Date()));
      Alert.alert('OK', online ? 'Guardado y sincronizado (o en proceso)' : 'Guardado offline en cola');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los signos vitales. Inténtalo de nuevo.');
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
      <Text style={styles.title}>Registrar signos vitales</Text>

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

        <TextInput style={styles.input} placeholder="Frecuencia cardíaca (lpm)" value={fc} onChangeText={setFc} />
        <TextInput style={styles.input} placeholder="Frecuencia respiratoria (rpm)" value={fr} onChangeText={setFr} />
        <TextInput style={styles.input} placeholder="TA sistólica (mmHg)" value={taSist} onChangeText={setTaSist} />
        <TextInput style={styles.input} placeholder="TA diastólica (mmHg)" value={taDiast} onChangeText={setTaDiast} />
        <TextInput style={styles.input} placeholder="Temperatura (°C)" value={temperatura} onChangeText={setTemperatura} />
        <TextInput style={styles.input} placeholder="Saturación O2 (%)" value={saturacionO2} onChangeText={setSaturacionO2} />
        <View style={styles.glasgowContainer}>
          <Text style={styles.label}>Escala de Glasgow</Text>
          <View style={styles.glasgowStepper}>
            <Pressable
              style={[styles.stepperButton, Number(escalaGlasgow) <= GLASGOW_MIN && styles.stepperButtonDisabled]}
              disabled={Number(escalaGlasgow) <= GLASGOW_MIN}
              onPress={() => setEscalaGlasgow(String(Math.max(GLASGOW_MIN, Number(escalaGlasgow) - 1)))}
            >
              <Text style={styles.stepperButtonText}>-</Text>
            </Pressable>

            <View style={styles.stepperValueBox}>
              <Text style={styles.stepperValueText}>{escalaGlasgow}/15</Text>
            </View>

            <Pressable
              style={[styles.stepperButton, Number(escalaGlasgow) >= GLASGOW_MAX && styles.stepperButtonDisabled]}
              disabled={Number(escalaGlasgow) >= GLASGOW_MAX}
              onPress={() => setEscalaGlasgow(String(Math.min(GLASGOW_MAX, Number(escalaGlasgow) + 1)))}
            >
              <Text style={styles.stepperButtonText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.glasgowHelp}>
            15 = Normal, 13-14 = Leve, 9-12 = Moderado, 3-8 = Severo
          </Text>
        </View>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Observaciones"
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
        />

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={submitSignos}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Guardando...' : 'Guardar Signos'}</Text>
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
  glasgowContainer: { marginBottom: 8 },
  glasgowStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  stepperButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  stepperValueBox: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  glasgowHelp: { marginTop: 6, color: '#4b5563', fontSize: 12 },
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
