import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDate, getAllProducts, getBrazilNow, getDaysUntilExpiry, isExpired, isNearExpiry, PantryProduct } from '@/lib/products';

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

  const soonProducts = products.filter((item) => isNearExpiry(item.expiryDate));

  const renderCard = (item: PantryProduct) => {
    const expiryDate = item.expiryDate ? formatDate(item.expiryDate) : 'Não informada';
    const days = getDaysUntilExpiry(item.expiryDate);
    const detail = days >= 0 ? `${days} dia(s)` : 'Vencido';
    const expired = isExpired(item.expiryDate);

    return (
      <Pressable
        key={item.id}
        style={[
          styles.gridCard,
          expired ? styles.expiredCard : isNearExpiry(item.expiryDate) ? styles.cardWarning : null,
        ]}
        onPress={() => {
          if (expired) {
            Alert.alert(
              'Produto vencido',
              `O produto "${item.name}" expirou em ${expiryDate}. Este item é impróprio para consumo e deve ser descartado e removido do sistema.`,
              [
                {
                  text: 'Ok',
                  onPress: () => {},
                  style: 'cancel',
                },
                {
                  text: 'Editar',
                  onPress: () => {
                    router.push({ pathname: `/product/${item.id}` } as any);
                  },
                  style: 'default',
                },
              ]
            );
            return;
          }

          router.push({ pathname: `/product/${item.id}` } as any);
        }}>
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
          <ThemedText style={styles.cardText}>Validade: {expiryDate}</ThemedText>
          <ThemedText style={styles.cardText}>{detail}</ThemedText>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.pageTitle}>Dashboard</ThemedText>
          <ThemedText style={styles.pageSubtitle}>Resumo rápido dos itens e validade.</ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="inventory-2" size={32} color="#1f6f5a" />
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
          soonProducts.map((product) => {
            const expiryDate = product.expiryDate ? formatDate(product.expiryDate) : 'Não informada';
            const days = Math.ceil((new Date(product.expiryDate).getTime() - getBrazilNow().getTime()) / (1000 * 60 * 60 * 24));
            const detail = days >= 0 ? `${days} dia(s) até o vencimento` : 'Vencido';
            return (
              <View key={product.id} style={styles.soonItem}>
                <ThemedText type="defaultSemiBold" style={styles.soonName}>
                  {product.name || 'Produto sem nome'}
                </ThemedText>
                <ThemedText style={styles.soonInfo}>Validade: {expiryDate}</ThemedText>
                <ThemedText style={styles.soonInfo}>{detail}</ThemedText>
              </View>
            );
          })
        ) : (
          <ThemedText style={styles.emptyText}>Nenhum produto próximo de vencer.</ThemedText>
        )}

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Todos os produtos</ThemedText>
        </View>
        {products.length > 0 ? (
          <View style={styles.gridContainer}>
            {products.map((product) => renderCard(product))}
          </View>
        ) : (
          <ThemedText style={styles.emptyText}>
            Nenhum produto cadastrado ainda. Toque no botão para adicionar.
          </ThemedText>
        )}
      </ScrollView>

      <Pressable style={styles.floatingButton} onPress={() => router.push({ pathname: '/product/new' } as any)}>
        <MaterialIcons name="add" size={20} color="#fff" />
        <ThemedText type="defaultSemiBold" style={{ color: '#fff', fontSize: 14 }}>
          Adicionar novos produtos
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#eef8f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageTitle: {
    color: '#0f5478',
  },
  pageSubtitle: {
    color: '#4f7f84',
    marginTop: 6,
  },
  content: {
    gap: 18,
    paddingBottom: 140,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#195f45',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gridCard: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d4e6e5',
    backgroundColor: '#ffffff',
    shadowColor: '#0f5478',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardWarning: {
    borderColor: '#f1b259',
    backgroundColor: '#fff7ef',
  },
  cardImage: {
    width: '100%',
    height: 100,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 100,
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
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    marginBottom: 4,
    fontSize: 14,
  },
  cardText: {
    color: '#555',
    fontSize: 12,
  },
  soonItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d0dccf',
    backgroundColor: '#f6f8f5',
    padding: 14,
    marginBottom: 10,
  },
  soonName: {
    color: '#0f5478',
    marginBottom: 4,
  },
  soonInfo: {
    color: '#55615f',
    fontSize: 13,
  },
  expiredCard: {
    borderColor: '#d1413c',
    backgroundColor: '#fff1f0',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: '#0a7ea4',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
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
    borderColor: '#c9e7ee',
    backgroundColor: '#ecf7f4',
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
    color: '#2d8571',
  },
});
