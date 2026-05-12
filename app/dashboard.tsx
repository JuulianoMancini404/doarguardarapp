import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDate, getAllProducts, isNearExpiry, PantryProduct } from '@/lib/products';

export default function DashboardScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<PantryProduct[]>([]);

  const loadProducts = async () => {
    const items = await getAllProducts();
    setProducts(items);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const soonProducts = products.filter((item) => {
    const daysUntil = new Date(item.expiryDate).getTime() - new Date().getTime();
    return daysUntil <= 1000 * 60 * 60 * 24 * 7;
  });

  const renderCard = (item: PantryProduct) => {
    const expiryDate = item.expiryDate ? formatDate(item.expiryDate) : 'Não informada';
    const days = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const detail = days >= 0 ? `${days} dia(s)` : 'Vencido';

    return (
      <Pressable
        key={item.id}
        style={[styles.card, isNearExpiry(item.expiryDate) ? styles.cardWarning : null]}
        onPress={() => router.push({ pathname: `/product/${item.id}` } as any)}>
        <View style={styles.imageContainer}>
          {item.imageUri ? (
            <Image source={item.imageUri} style={styles.cardImage} />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <ThemedText type="subtitle">Sem imagem</ThemedText>
            </View>
          )}
          <View style={styles.quantityBadge}>
            <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
          </View>
        </View>
        <View style={styles.cardContent}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            {item.name || 'Produto sem nome'}
          </ThemedText>
          <ThemedText style={styles.cardText}>{item.brand || 'Marca não informada'}</ThemedText>
          <ThemedText style={styles.cardText}>Validade: {expiryDate}</ThemedText>
          <ThemedText style={styles.cardText}>Restam {detail}</ThemedText>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Dashboard</ThemedText>
        <Pressable style={styles.addButton} onPress={() => router.push({ pathname: '/product/new' } as any)}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="inventory-2" size={32} color="#0a7ea4" />
            <View style={styles.statContent}>
              <ThemedText style={styles.statLabel}>Produtos no estoque</ThemedText>
              <ThemedText style={styles.statValue}>{products.length}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Vencimento próximo</ThemedText>
        </View>
        {soonProducts.length > 0 ? (
          soonProducts.map((product) => renderCard(product))
        ) : (
          <ThemedText style={styles.emptyText}>Nenhum produto próximo de vencer.</ThemedText>
        )}

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Todos os produtos</ThemedText>
        </View>
        {products.length > 0 ? (
          products.map((product) => renderCard(product))
        ) : (
          <ThemedText style={styles.emptyText}>
            Nenhum produto cadastrado ainda. Toque no + para adicionar.
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  cardWarning: {
    borderColor: '#cc5200',
    backgroundColor: '#fff4e6',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  quantityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0a7ea4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  cardContent: {
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardText: {
    color: '#555',
  },
  emptyText: {
    color: '#555',
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statContent: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0a7ea4',
  },
});
