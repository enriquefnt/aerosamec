import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { SessionData } from '../types/auth';

const SESSION_KEY = 'mobile_operador_session';

export async function saveSession(session: SessionData) {
  const value = JSON.stringify(session);
  try {
    await SecureStore.setItemAsync(SESSION_KEY, value);
  } catch {
    await AsyncStorage.setItem(SESSION_KEY, value);
  }
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const secureValue = await SecureStore.getItemAsync(SESSION_KEY);
    if (secureValue) return JSON.parse(secureValue) as SessionData;
  } catch {
    // fallback
  }

  const value = await AsyncStorage.getItem(SESSION_KEY);
  return value ? (JSON.parse(value) as SessionData) : null;
}

export async function clearSession() {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    // fallback
  }
  await AsyncStorage.removeItem(SESSION_KEY);
}
