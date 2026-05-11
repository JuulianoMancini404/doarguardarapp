import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Dashboard
      </ThemedText>
      <ThemedText style={styles.message}>
        Você está autenticado. Esta é a sua tela principal.
      </ThemedText>

      <Pressable style={styles.button} onPress={() => router.push('/')}> 
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Voltar ao login
        </ThemedText>
      </Pressable>
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
  message: {
    textAlign: 'center',
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
});
