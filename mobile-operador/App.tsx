import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import EvaluacionInicialScreen from './src/screens/EvaluacionInicialScreen';
import HistorialSyncScreen from './src/screens/HistorialSyncScreen';
import LoginScreen from './src/screens/LoginScreen';
import MedicacionScreen from './src/screens/MedicacionScreen';
import ProcedimientoScreen from './src/screens/ProcedimientoScreen';
import SeguimientoScreen from './src/screens/SeguimientoScreen';
import SignosVitalesScreen from './src/screens/SignosVitalesScreen';

type ScreenName =
  | 'seguimiento'
  | 'evaluacion'
  | 'procedimiento'
  | 'medicacion'
  | 'signos'
  | 'historial';

function Root() {
  const { usuario, loading } = useAuth();
  const [screen, setScreen] = useState<ScreenName>('seguimiento');
  const [trasladoId, setTrasladoId] = useState('');
  const [online, setOnline] = useState(true);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!usuario) {
    return <LoginScreen />;
  }

  const usuarioId = usuario?.id || '';

  return (
    <>
      {screen === 'seguimiento' ? (
        <SeguimientoScreen
          onOpenHistorial={() => setScreen('historial')}
          onOpenEvaluacion={() => setScreen('evaluacion')}
          onOpenProcedimiento={() => setScreen('procedimiento')}
          onOpenMedicacion={() => setScreen('medicacion')}
          onOpenSignos={() => setScreen('signos')}
          onTrasladoChange={setTrasladoId}
          onOnlineChange={setOnline}
        />
      ) : null}

      {screen === 'evaluacion' ? (
        <EvaluacionInicialScreen
          trasladoId={trasladoId}
          usuarioId={usuarioId}
          online={online}
          onBack={() => setScreen('seguimiento')}
        />
      ) : null}

      {screen === 'procedimiento' ? (
        <ProcedimientoScreen
          trasladoId={trasladoId}
          usuarioId={usuarioId}
          online={online}
          onBack={() => setScreen('seguimiento')}
        />
      ) : null}

      {screen === 'medicacion' ? (
        <MedicacionScreen
          trasladoId={trasladoId}
          usuarioId={usuarioId}
          online={online}
          onBack={() => setScreen('seguimiento')}
        />
      ) : null}

      {screen === 'signos' ? (
        <SignosVitalesScreen
          trasladoId={trasladoId}
          usuarioId={usuarioId}
          online={online}
          onBack={() => setScreen('seguimiento')}
        />
      ) : null}

      {screen === 'historial' ? <HistorialSyncScreen onBack={() => setScreen('seguimiento')} /> : null}

      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
