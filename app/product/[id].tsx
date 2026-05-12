import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { deleteProduct, formatDate, getProductById, PantryProduct, saveProduct } from '@/lib/products';

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

  const handleExpiryDateChange = (value: string) => {
    // Remove tudo que não é número
    const cleaned = value.replace(/\D/g, '');
    // Limita a 8 dígitos (ddmmyyyy)
    const limited = cleaned.slice(0, 8);
    // Aplica máscara dd/mm/yyyy
    let formatted = limited;
    if (limited.length >= 2) {
      formatted = `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }
    if (limited.length >= 4) {
      formatted = `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    }
    if (limited.length >= 6) {
      formatted = `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4, 8)}`;
    }
    // Atualizar o produto com a data formatada para exibição, mas manter o valor interno como yyyy-mm-dd
    setProduct((current) => (current ? { ...current, expiryDate: formatted } : current));
  };

  const handleSave = async () => {
    if (!product) {
      return;
    }

    if (!product.name.trim() || !product.expiryDate.trim()) {
      Alert.alert('Preencha ao menos o nome e a data de validade do produto.');
      return;
    }

    // Converter data de dd/mm/yyyy para yyyy-mm-dd se necessário
    let expiryDate = product.expiryDate;
    if (expiryDate.includes('/')) {
      const dateParts = expiryDate.split('/');
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        expiryDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    const productToSave = { ...product, expiryDate };

    await saveProduct(productToSave);
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
          placeholder="Número do lote"
          value={product.batchNumber}
          onChangeText={(value) => handleFieldChange('batchNumber', value)}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Data de validade (dd/mm/aaaa)"
          value={product.expiryDate ? formatDate(product.expiryDate) : ''}
          onChangeText={(value) => handleExpiryDateChange(value)}
          placeholderTextColor="#888"
          keyboardType="number-pad"
          maxLength={10}
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
