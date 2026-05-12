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
import { lookupProductByBarcode, PantryProduct, saveProduct } from '@/lib/products';

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
  createdAt: new Date().toISOString(),
  batchNumber: '',
};

export default function NewProductScreen() {
  const router = useRouter();
  const [product, setProduct] = useState<PantryProduct>(EMPTY_PRODUCT);
  const [isFetching, setIsFetching] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState<'barcode' | 'batch'>('barcode');
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

    // Converter data de dd/mm/yyyy para yyyy-mm-dd
    const dateParts = product.expiryDate.split('/');
    if (dateParts.length !== 3) {
      Alert.alert('Data de validade inválida. Use o formato dd/mm/aaaa.');
      return;
    }
    const [day, month, year] = dateParts;
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    const productToSave = { ...product, expiryDate: isoDate };

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
    const fieldName = scanMode === 'barcode' ? 'barcode' : 'batchNumber';
    setProduct((current) => ({ ...current, [fieldName]: data }));
    setScanMessage(`${scanMode === 'barcode' ? 'Código lido' : 'Lote lido'}: ${data}`);

    if (scanMode === 'barcode') {
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
      return;
    }

    Alert.alert('Lote lido', 'Número do lote capturado. Continue o cadastro manualmente.');
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
      setScanMessage(
        scanMode === 'barcode'
          ? 'Aguardando leitura do código de barras...'
          : 'Aguardando leitura do número do lote...',
      );
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
    setScanMessage(
      scanMode === 'barcode'
        ? 'Aguardando leitura do código de barras...'
        : 'Aguardando leitura do número do lote...',
    );
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

          <View style={styles.scanModeRow}>
            <Pressable
              style={[
                styles.scanModeButton,
                scanMode === 'barcode' ? styles.scanModeButtonActive : null,
              ]}
              onPress={() => setScanMode('barcode')}
            >
              <ThemedText
                style={scanMode === 'barcode' ? styles.scanModeTextActive : styles.scanModeText}
              >
                Código de barras
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.scanModeButton,
                scanMode === 'batch' ? styles.scanModeButtonActive : null,
              ]}
              onPress={() => setScanMode('batch')}
            >
              <ThemedText
                style={scanMode === 'batch' ? styles.scanModeTextActive : styles.scanModeText}
              >
                Número do lote
              </ThemedText>
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
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Data de validade (dd/mm/aaaa)"
          value={product.expiryDate}
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
  scanModeRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#111',
  },
  scanModeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  scanModeButtonActive: {
    borderColor: '#0a7ea4',
    backgroundColor: '#0a7ea4',
  },
  scanModeText: {
    color: '#fff',
  },
  scanModeTextActive: {
    color: '#fff',
    fontWeight: '700',
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
    color: '#888',
  },
  categoryText: {
    color: '#000',
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
