import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllMovements, PantryMovement } from '@/lib/products';

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MovementsScreen() {
  const router = useRouter();
  const [movements, setMovements] = useState<PantryMovement[]>([]);

  const loadMovements = async () => {
    const items = await getAllMovements();
    setMovements(items);
  };

  useFocusEffect(
    useCallback(() => {
      loadMovements();
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Histórico de movimentações
        </ThemedText>
        <Pressable style={styles.backButton} onPress={() => router.push('/dashboard')}>
          <MaterialIcons name="arrow-back" size={20} color="#fff" />
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {movements.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            Nenhuma movimentação registrada ainda.
          </ThemedText>
        ) : (
          movements.map((movement) => (
            <View key={movement.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText type="defaultSemiBold" style={styles.productName}>
                  {movement.productName}
                </ThemedText>
                <View style={[styles.typeBadge, movement.type === 'entrada' ? styles.entryBadge : styles.exitBadge]}>
                  <ThemedText style={styles.typeBadgeText}>
                    {movement.type === 'entrada' ? 'Entrada' : 'Retirada'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.movementInfo}>Quantidade: {movement.quantity}</ThemedText>
              <ThemedText style={styles.movementInfo}>
                {movement.previousQuantity} → {movement.newQuantity}
              </ThemedText>
              <ThemedText style={styles.timestamp}>{formatTimestamp(movement.timestamp)}</ThemedText>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef8f7',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#0f5478',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#0a7ea4',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  content: {
    gap: 14,
    paddingBottom: 140,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d4e6e5',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  entryBadge: {
    backgroundColor: '#daf4f1',
  },
  exitBadge: {
    backgroundColor: '#ffe7e4',
  },
  typeBadgeText: {
    color: '#0f5478',
    fontSize: 12,
    fontWeight: '700',
  },
  movementInfo: {
    color: '#4f7f84',
    marginBottom: 2,
  },
  timestamp: {
    marginTop: 8,
    color: '#8c9a98',
    fontSize: 12,
  },
  emptyText: {
    color: '#55615f',
  },
});
