import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import HistorialSyncScreen from './src/screens/HistorialSyncScreen';
import LoginScreen from './src/screens/LoginScreen';
import SeguimientoScreen from './src/screens/SeguimientoScreen';

function Root() {
  const { usuario, loading } = useAuth();
  const [screen, setScreen] = useState<'seguimiento' | 'historial'>('seguimiento');

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

  return (
    <>
      {screen === 'seguimiento' ? (
        <SeguimientoScreen onOpenHistorial={() => setScreen('historial')} />
      ) : (
        <HistorialSyncScreen onBack={() => setScreen('seguimiento')} />
      )}
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
