import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

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

  const incrementQuantity = () => {
    setProduct((current) => {
      if (!current) return current;
      const next = Number(current.quantity) + 1;
      return { ...current, quantity: String(isNaN(next) ? 1 : next) };
    });
  };

  const decrementQuantity = () => {
    setProduct((current) => {
      if (!current) return current;
      const next = Number(current.quantity) - 1;
      return { ...current, quantity: String(isNaN(next) || next < 1 ? 1 : next) };
    });
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

    let expiryDate = product.expiryDate;
    if (expiryDate.includes('/')) {
      const expiryRegex = /^([0-3]\d)\/([0-1]\d)\/(\d{4})$/;
      const match = expiryDate.trim().match(expiryRegex);
      if (!match) {
        Alert.alert('Data de validade inválida. Use o formato dd/mm/aaaa.');
        return;
      }

      const [, day, month, year] = match;
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (
        parsedDate.getFullYear() !== Number(year) ||
        parsedDate.getMonth() + 1 !== Number(month) ||
        parsedDate.getDate() !== Number(day)
      ) {
        Alert.alert('Data de validade inválida. Use o formato dd/mm/aaaa.');
        return;
      }

      expiryDate = `${year}-${month}-${day}`;
    }

    const quantityNumber = Math.max(1, Number(product.quantity) || 1);
    const productToSave = { ...product, expiryDate, quantity: String(quantityNumber) };

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

        <View style={styles.formContainer}>
          {product.imageUri ? (
            <Image source={product.imageUri} style={styles.productImage} />
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Código de barras"
            value={product.barcode}
            onChangeText={(value) => handleFieldChange('barcode', value)}
            placeholderTextColor="#5a7a7f"
          />
          <TextInput
            style={styles.input}
            placeholder="Nome do produto"
            value={product.name}
            onChangeText={(value) => handleFieldChange('name', value)}
            placeholderTextColor="#5a7a7f"
          />
          <TextInput
            style={styles.input}
            placeholder="Marca"
            value={product.brand}
            onChangeText={(value) => handleFieldChange('brand', value)}
            placeholderTextColor="#5a7a7f"
          />
          <TextInput
            style={styles.input}
            placeholder="Categoria"
            value={product.category}
            onChangeText={(value) => handleFieldChange('category', value)}
            placeholderTextColor="#5a7a7f"
          />
          <TextInput
            style={styles.input}
            placeholder="Número do lote"
            value={product.batchNumber}
            onChangeText={(value) => handleFieldChange('batchNumber', value)}
            placeholderTextColor="#5a7a7f"
          />
          <TextInput
            style={styles.input}
            placeholder="Data de validade (dd/mm/aaaa)"
            value={product.expiryDate ? (product.expiryDate.includes('/') ? product.expiryDate : formatDate(product.expiryDate)) : ''}
            onChangeText={(value) => handleExpiryDateChange(value)}
            placeholderTextColor="#5a7a7f"
            keyboardType="number-pad"
            maxLength={10}
          />
          <View style={styles.quantityRow}>
            <Pressable style={styles.quantityButton} onPress={decrementQuantity}>
              <ThemedText style={styles.quantityButtonText}>-</ThemedText>
            </Pressable>
            <TextInput
              style={[styles.quantityDisplay, styles.quantityInput]}
              value={product.quantity}
              onChangeText={(value) => {
                const numeric = value.replace(/\D/g, '');
                setProduct((current) => (current ? { ...current, quantity: numeric || '0' } : current));
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#5a7a7f"
            />
            <Pressable style={styles.quantityButton} onPress={incrementQuantity}>
              <ThemedText style={styles.quantityButtonText}>+</ThemedText>
            </Pressable>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Observações"
            value={product.notes}
            onChangeText={(value) => handleFieldChange('notes', value)}
            placeholderTextColor="#5a7a7f"
            multiline
          />
        </View>

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
    backgroundColor: '#f3fbfc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    gap: 14,
  },
  title: {
    textAlign: 'center',
    color: '#0d3a4e',
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 14,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2d8571',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  quantityDisplay: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#edf7f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c9e7ee',
  },
  quantityInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#0f5478',
    padding: 0,
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f5478',
  },
  description: {
    color: '#3f7d83',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbf0f0',
    shadowColor: '#0f5478',
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
    marginTop: 16,
  },
  sectionHeading: {
    color: '#0f5478',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#b1d5c4',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f8fffe',
    color: '#1a3a3d',
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
