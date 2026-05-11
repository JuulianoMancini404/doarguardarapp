import { Camera, CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { lookupProductByBarcode, PantryProduct, saveProduct } from '@/lib/products';

const EMPTY_PRODUCT: PantryProduct = {
  barcode: '',
  name: '',
  brand: '',
  category: '',
  expiryDate: '',
  quantity: '1',
  notes: '',
  imageUri: '',
  createdAt: new Date().toISOString(),
};

export default function NewProductScreen() {
  const router = useRouter();
  const [product, setProduct] = useState<PantryProduct>(EMPTY_PRODUCT);
  const [isFetching, setIsFetching] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanMessage, setScanMessage] = useState('Aguardando leitura do código de barras...');

  useEffect(() => {
    if (!scannerOpen) {
      return;
    }

    if (Platform.OS === 'web') {
      setHasPermission(false);
      return;
    }

    (async () => {
      setHasPermission(null);
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, [scannerOpen]);

  const handleLookupBarcode = async () => {
    if (!product.barcode.trim()) {
      Alert.alert('Digite um código de barras');
      return;
    }

    setIsFetching(true);
    const remoteProduct = await lookupProductByBarcode(product.barcode);
    setIsFetching(false);

    if (remoteProduct) {
      setProduct((current) => ({
        ...current,
        ...remoteProduct,
      }));
      Alert.alert('Sucesso', 'Dados do produto preenchidos automaticamente.');
      return;
    }

    Alert.alert('Não encontrado', 'Produto não encontrado. Complete os dados manualmente.');
  };

  const handleSave = async () => {
    if (!product.name.trim() || !product.expiryDate.trim()) {
      Alert.alert('Preencha ao menos o nome e a data de validade do produto.');
      return;
    }

    await saveProduct(product);
    router.push('/dashboard');
  };

  const handleFieldChange = (field: keyof PantryProduct, value: string) => {
    setProduct((current) => ({ ...current, [field]: value }));
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setProduct((current) => ({ ...current, barcode: data }));
    setScanMessage(`Código lido: ${data}`);

    const remoteProduct = await lookupProductByBarcode(data);
    if (remoteProduct) {
      setProduct((current) => ({ ...current, ...remoteProduct }));
      Alert.alert('Sucesso', 'Produto encontrado e preenchido automaticamente.');
      return;
    }

    Alert.alert(
      'Código lido',
      'Código de barras capturado. Preencha os dados manualmente ou toque em Buscar.',
    );
  };

  const openScanner = () => {
    setScannerOpen(true);
    setScanMessage('Aguardando leitura do código de barras...');
    setScanned(false);
  };

  const closeScanner = () => {
    setScannerOpen(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Novo produto
        </ThemedText>
        <ThemedText style={styles.description}>
          Leia o código de barras ou preencha os dados manualmente.
        </ThemedText>

        <View style={styles.scannerContainer}>
          <View style={styles.scanHeader}>
            <ThemedText style={styles.scanHint}>{scanMessage}</ThemedText>
            <Pressable
              style={styles.scanToggleButton}
              onPress={scannerOpen ? closeScanner : openScanner}
            >
              <ThemedText style={styles.scanToggleText}>
                {scannerOpen ? 'Fechar câmera' : 'Ler código'}
              </ThemedText>
            </Pressable>
          </View>

          {scannerOpen ? (
            hasPermission === null ? (
              <ThemedText>Solicitando permissão de câmera...</ThemedText>
            ) : hasPermission === false ? (
              <ThemedText>Permissão de câmera negada. Use o campo de código manualmente.</ThemedText>
            ) : (
              <Camera
                style={styles.scanner}
                type={CameraType.back}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
            )
          ) : (
            <ThemedText style={styles.scanIdleText}>
              Toque em "Ler código" para abrir a câmera e escanear.
            </ThemedText>
          )}

          {scannerOpen && scanned ? (
            <Pressable style={styles.secondaryButton} onPress={resetScanner}>
              <ThemedText style={styles.secondaryButtonText}>Escanear novamente</ThemedText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.barcodeSection}>
          <TextInput
            style={styles.input}
            placeholder="Código de barras"
            value={product.barcode}
            onChangeText={(value) => handleFieldChange('barcode', value)}
            placeholderTextColor="#888"
            keyboardType="number-pad"
          />
          <Pressable style={styles.lookupButton} onPress={handleLookupBarcode} disabled={isFetching}>
            <ThemedText type="defaultSemiBold" style={styles.lookupButtonText}>
              {isFetching ? 'Buscando...' : 'Buscar'}
            </ThemedText>
          </Pressable>
        </View>

        {product.imageUri ? (
          <Image source={product.imageUri} style={styles.productImage} />
        ) : null}

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
            Salvar produto
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
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  scannerContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  scanner: {
    width: '100%',
    aspectRatio: 1,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#111',
  },
  scanHint: {
    flex: 1,
    color: '#fff',
    marginRight: 12,
  },
  scanIdleText: {
    padding: 16,
    color: '#fff',
    textAlign: 'center',
  },
  scanToggleButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  scanToggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  barcodeSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  lookupButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookupButtonText: {
    color: '#fff',
  },
  productImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});
