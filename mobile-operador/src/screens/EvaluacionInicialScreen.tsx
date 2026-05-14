import * as React from 'react';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SelectField, { SelectOption } from '../components/SelectField';
import { addQueueItem } from '../storage/queueStorage';
import { syncPendingItems } from '../services/syncService';

const OPCIONES_VIA_AEREA: SelectOption[] = [
  { label: 'Permeable', value: 'Permeable' },
  { label: 'Obstruida', value: 'Obstruida' },
  { label: 'Asegurada (TET)', value: 'Asegurada (TET)' },
];

const OPCIONES_RESPIRACION: SelectOption[] = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Dificultad', value: 'Dificultad' },
  { label: 'Asistida', value: 'Asistida' },
  { label: 'Apnea', value: 'Apnea' },
];

const OPCIONES_HEMODINAMIA: SelectOption[] = [
  { label: 'Estable', value: 'Estable' },
  { label: 'Inestable', value: 'Inestable' },
  { label: 'Shock', value: 'Shock' },
  { label: 'PCR', value: 'PCR' },
];

const OPCIONES_NEUROLOGICO: SelectOption[] = [
  { label: 'Alerta', value: 'Alerta' },
  { label: 'Verbal', value: 'Verbal' },
  { label: 'Dolor', value: 'Dolor' },
  { label: 'No responde', value: 'No responde' },
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
    tipo: 'evaluacion-inicial',
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

export default function EvaluacionInicialScreen({
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
  const [diagnostico, setDiagnostico] = useState('');
  const [viaAerea, setViaAerea] = useState('');
  const [respiracion, setRespiracion] = useState('');
  const [hemodinamia, setHemodinamia] = useState('');
  const [neurologico, setNeurologico] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEvaluacion = async () => {
    if (isSubmitting) return;
    if (!trasladoId.trim()) {
      Alert.alert('Validación', 'Selecciona un traslado en Seguimiento');
      return;
    }

    if (!usuarioId.trim()) {
      Alert.alert('Validación', 'Sesión inválida, vuelve a ingresar');
      return;
    }

    if (!diagnostico.trim() || !viaAerea.trim() || !respiracion.trim() || !hemodinamia.trim() || !neurologico.trim()) {
      Alert.alert('Validación', 'Completa diagnóstico, vía aérea, respiración, hemodinamia y neurológico');
      return;
    }

    try {
      setIsSubmitting(true);

      await guardarConCola(
        {
          trasladoId,
          usuarioId,
          diagnostico,
          viaAerea,
          respiracion,
          hemodinamia,
          neurologico,
        },
        online
      );

      setDiagnostico('');
      setViaAerea('');
      setRespiracion('');
      setHemodinamia('');
      setNeurologico('');
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
      <Text style={styles.title}>Valoración inicial</Text>

      <View style={[styles.banner, online ? styles.online : styles.offline]}>
        <Text style={styles.bannerText}>{online ? 'Online' : 'Offline - guardando en cola local'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Traslado seleccionado</Text>
        <Text style={styles.value}>{trasladoLabel ? trasladoLabel : 'Ninguno seleccionado'}</Text>

        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Diagnóstico"
          value={diagnostico}
          onChangeText={setDiagnostico}
          multiline
        />

        <SelectField
          label="Vía aérea"
          placeholder="Seleccionar estado de vía aérea"
          value={viaAerea}
          options={OPCIONES_VIA_AEREA}
          onChange={setViaAerea}
        />

        <SelectField
          label="Respiración"
          placeholder="Seleccionar estado respiratorio"
          value={respiracion}
          options={OPCIONES_RESPIRACION}
          onChange={setRespiracion}
        />

        <SelectField
          label="Hemodinamia"
          placeholder="Seleccionar estado hemodinámico"
          value={hemodinamia}
          options={OPCIONES_HEMODINAMIA}
          onChange={setHemodinamia}
        />

        <SelectField
          label="Neurológico"
          placeholder="Seleccionar estado neurológico"
          value={neurologico}
          options={OPCIONES_NEUROLOGICO}
          onChange={setNeurologico}
        />

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={submitEvaluacion}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Guardando...' : 'Guardar Valoración inicial'}
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
