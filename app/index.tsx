import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const DEFAULT_PIN = '1234';

export default function LoginScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (pin === DEFAULT_PIN) {
      setError('');
      router.push('/dashboard');
      return;
    }

    setError('PIN inválido. Tente novamente.');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Bem-vindo ao DoarGuardar
      </ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.subtitle}>
        Insira seu PIN para continuar
      </ThemedText>

      <TextInput
        value={pin}
        onChangeText={setPin}
        placeholder="Digite 1234"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        style={styles.input}
      />

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

      <Pressable style={styles.button} onPress={handleSubmit}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Entrar
        </ThemedText>
      </Pressable>

      <ThemedText type="subtitle" style={styles.hint}>
        PIN padrão: 1234
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#111',
    backgroundColor: '#f4f4f4',
  },
  button: {
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  error: {
    color: '#c53030',
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
  },
});
