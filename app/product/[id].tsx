import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { deleteProduct, getProductById, PantryProduct, saveProduct } from '@/lib/products';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<PantryProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      const productItem = await getProductById(Number(id));
      setProduct(productItem);
      setLoading(false);
    };

    load();
  }, [id]);

  const handleFieldChange = (field: keyof PantryProduct, value: string) => {
    setProduct((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSave = async () => {
    if (!product) {
      return;
    }

    if (!product.name.trim() || !product.expiryDate.trim()) {
      Alert.alert('Preencha ao menos o nome e a data de validade do produto.');
      return;
    }

    await saveProduct(product);
    router.push('/dashboard');
  };

  const handleDelete = async () => {
    if (!product?.id) {
      return;
    }

    Alert.alert('Excluir produto', 'Deseja remover este produto da despensa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteProduct(product.id!);
          router.push('/dashboard');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Carregando produto...</ThemedText>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Produto não encontrado.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Editar produto
        </ThemedText>

        {product.imageUri ? (
          <Image source={product.imageUri} style={styles.productImage} />
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Código de barras"
          value={product.barcode}
          onChangeText={(value) => handleFieldChange('barcode', value)}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Nome do produto"
          value={product.name}
          onChangeText={(value) => handleFieldChange('name', value)}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Marca"
          value={product.brand}
          onChangeText={(value) => handleFieldChange('brand', value)}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Categoria"
          value={product.category}
          onChangeText={(value) => handleFieldChange('category', value)}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Data de validade (YYYY-MM-DD)"
          value={product.expiryDate}
          onChangeText={(value) => handleFieldChange('expiryDate', value)}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Quantidade"
          value={product.quantity}
          onChangeText={(value) => handleFieldChange('quantity', value)}
          placeholderTextColor="#888"
          keyboardType="number-pad"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Observações"
          value={product.notes}
          onChangeText={(value) => handleFieldChange('notes', value)}
          placeholderTextColor="#888"
          multiline
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Salvar alterações
          </ThemedText>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <ThemedText type="defaultSemiBold" style={styles.deleteButtonText}>
            Excluir produto
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  productImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#c53030',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
  },
});
