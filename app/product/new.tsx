import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
import { getBrazilNow, lookupProductByBarcode, PantryProduct, saveProduct } from '@/lib/products';

const CATEGORY_OPTIONS = [
  'Alimentícios',
  'Alimentos Geladeira',
  'Higiene Pessoal',
  'Limpeza',
  'Outros',
];

const EMPTY_PRODUCT: PantryProduct = {
  barcode: '',
  name: '',
  brand: '',
  category: '',
  expiryDate: '',
  quantity: '1',
  notes: '',
  imageUri: '',
  createdAt: '',
  batchNumber: '',
};

export default function NewProductScreen() {
  const router = useRouter();
  const [product, setProduct] = useState<PantryProduct>(EMPTY_PRODUCT);
  const [isFetching, setIsFetching] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanMessage, setScanMessage] = useState('Aguardando leitura do código de barras...');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [, requestPermission] = useCameraPermissions();

  useEffect(() => {
    // Efeito vazio - permissões são solicitadas no openScanner
  }, []);

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

    const expiryRegex = /^([0-3]\d)\/([0-1]\d)\/(\d{4})$/;
    const match = product.expiryDate.trim().match(expiryRegex);
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

    const isoDate = `${year}-${month}-${day}`;
    const quantityNumber = Math.max(1, Number(product.quantity) || 1);
    const productToSave = {
      ...product,
      expiryDate: isoDate,
      quantity: String(quantityNumber),
      createdAt: product.createdAt || getBrazilNow().toISOString(),
    };

    await saveProduct(productToSave);
    router.push('/dashboard');
  };

  const handleFieldChange = (field: keyof PantryProduct, value: string) => {
    setProduct((current) => ({ ...current, [field]: value }));
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
    setProduct((current) => ({ ...current, expiryDate: formatted }));
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

    Alert.alert('Código lido', 'Código de barras capturado. Preencha os dados manualmente ou toque em Buscar.');
  };

  const openScanner = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Não suportado', 'O scanner de código de barras não está disponível na web.');
      return;
    }

    const permissionResponse = await requestPermission();
    const granted = permissionResponse?.granted === true;
    setHasPermission(granted);

    if (granted) {
      setScannerOpen(true);
      setScanMessage('Aguardando leitura do código de barras...');
      setScanned(false);
    } else {
      Alert.alert('Permissão negada', 'Permissão de câmera necessária para escanear códigos de barras.');
    }
  };

  const closeScanner = () => {
    setScannerOpen(false);
  };

  const resetScanner = () => {
    setScanned(false);
    setScanMessage('Aguardando leitura do código de barras...');
  };

  const incrementQuantity = () => {
    setProduct((current) => {
      const next = Number(current.quantity) + 1;
      return { ...current, quantity: String(isNaN(next) ? 1 : next) };
    });
  };

  const decrementQuantity = () => {
    setProduct((current) => {
      const next = Number(current.quantity) - 1;
      return { ...current, quantity: String(isNaN(next) || next < 1 ? 1 : next) };
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Novos produtos
        </ThemedText>

        <View style={styles.formContainer}>
          <View style={styles.scannerContainer}>
            <View style={styles.scanHeader}>
              <ThemedText style={styles.scanHint}>{scanMessage}</ThemedText>
              <Pressable
                style={styles.cameraButton}
                onPress={scannerOpen ? closeScanner : openScanner}
              >
                <MaterialIcons name={scannerOpen ? 'close' : 'camera-alt'} size={20} color="#fff" />
              </Pressable>
            </View>

            {scannerOpen ? (
              hasPermission === null ? (
                <ThemedText>Solicitando permissão de câmera...</ThemedText>
              ) : hasPermission === false ? (
                <ThemedText>Permissão de câmera negada. Use o campo de código manualmente.</ThemedText>
              ) : (
                <CameraView
                  style={styles.scanner}
                  facing="back"
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
              )
            ) : (
              <ThemedText style={styles.scanIdleText}>
                Toque em &quot;Ler código&quot; para abrir a câmera e escanear.
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
              placeholderTextColor="#5a7a7f"
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
            placeholderTextColor="#5a7a7f"
          />
          <TextInput
            style={styles.input}
            placeholder="Marca"
            value={product.brand}
            onChangeText={(value) => handleFieldChange('brand', value)}
            placeholderTextColor="#5a7a7f"
          />
          <Pressable
            style={[styles.input, styles.dropdownInput]}
            onPress={() => setCategoryOpen((current) => !current)}
          >
            <ThemedText style={product.category ? styles.categoryText : styles.placeholderText}>
              {product.category || 'Selecione categoria'}
            </ThemedText>
          </Pressable>
          {categoryOpen ? (
            <View style={styles.dropdown}>
              {CATEGORY_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={styles.dropdownItem}
                  onPress={() => {
                    handleFieldChange('category', option);
                    setCategoryOpen(false);
                  }}
                >
                  <ThemedText style={styles.dropdownItemText}>{option}</ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}
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
            value={product.expiryDate}
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
                setProduct((current) => ({ ...current, quantity: numeric || '0' }));
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
    backgroundColor: '#f3fbfc',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  title: {
    textAlign: 'center',
    color: '#0d3a4e',
    marginBottom: 8,
  },
  formContainer: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbf0f0',
    shadowColor: '#0f5478',
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
    gap: 12,
  },
  scannerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c9e7ee',
    overflow: 'hidden',
    backgroundColor: '#e8f7fb',
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
    backgroundColor: '#2d8571',
  },
  scanHint: {
    flex: 1,
    color: '#fff',
    marginRight: 12,
  },
  scanIdleText: {
    padding: 16,
    color: '#0f5478',
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
  cameraButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0a7ea4',
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
    backgroundColor: '#f0fbfd',
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
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b1d5c4',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f8fffe',
    color: '#1a3a3d',
  },
  dropdownInput: {
    justifyContent: 'center',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  placeholderText: {
    color: '#5a7a7f',
  },
  categoryText: {
    color: '#1a3a3d',
  },
  lookupButton: {
    backgroundColor: '#2d8571',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookupButtonText: {
    color: '#fff',
  },
  heroCard: {
    backgroundColor: '#daf4f1',
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    display: 'none',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f5478',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#3f7d83',
    lineHeight: 22,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 14,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
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
