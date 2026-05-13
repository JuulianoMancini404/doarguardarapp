import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const DEFAULT_PIN = '1234';

export default function LoginScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
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
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          Bem Vindo ao Doar & Guardar
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.pinLabel}>
          PIN secreto
        </ThemedText>

        <View style={styles.inputWrapper}>
          <TextInput
            value={pin}
            onChangeText={setPin}
            placeholder="Digite seu PIN"
            placeholderTextColor="#7a9a88"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
            secureTextEntry={!showPin}
            maxLength={4}
            style={styles.input}
          />
          <Pressable style={styles.toggleButton} onPress={() => setShowPin(prev => !prev)}>
            <ThemedText type="defaultSemiBold" style={styles.toggleText}>
              {showPin ? '🙈' : '👁️'}
            </ThemedText>
          </Pressable>
        </View>

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <Pressable style={styles.button} onPress={handleSubmit}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Entrar
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#eef8f7',
  },
  title: {
    textAlign: 'center',
    color: '#0f422f',
    marginBottom: 22,
  },
  card: {
    padding: 32,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bfd8cc',
    shadowColor: '#0d3f30',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  pinLabel: {
    fontSize: 16,
    color: '#1f5e45',
    marginBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#b1d5c4',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    paddingRight: 58,
    fontSize: 18,
    color: '#111',
    backgroundColor: '#edf7f2',
  },
  toggleButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  toggleText: {
    fontSize: 18,
    color: '#1f5e45',
  },
  button: {
    borderRadius: 18,
    backgroundColor: '#1f6f5a',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
  },
  error: {
    color: '#c53030',
    textAlign: 'center',
    marginBottom: 8,
  },
});
