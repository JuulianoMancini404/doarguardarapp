import AsyncStorage from '@react-native-async-storage/async-storage';

export type PantryProduct = {
  id?: number;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  expiryDate: string;
  quantity: string;
  notes: string;
  imageUri: string;
  createdAt: string;
  batchNumber: string;
};

const STORAGE_KEY = '@doarguardar_products';

async function readStorage(): Promise<PantryProduct[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const items = JSON.parse(stored) as PantryProduct[];
    // Garantir que batchNumber exista para produtos antigos
    return items.map(item => ({
      ...item,
      batchNumber: item.batchNumber || '',
    }));
  } catch {
    return [];
  }
}

async function writeStorage(items: PantryProduct[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getAllProducts(): Promise<PantryProduct[]> {
  const items = await readStorage();
  return items.sort((a, b) => {
    // Primeiro, ordenar por lote (alfabeticamente)
    if (a.batchNumber !== b.batchNumber) {
      return a.batchNumber.localeCompare(b.batchNumber);
    }
    // Dentro do mesmo lote, ordenar por data de validade
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });
}

export async function getProductById(id: number): Promise<PantryProduct | null> {
  const items = await readStorage();
  return items.find((item) => item.id === id) ?? null;
}

export async function saveProduct(product: PantryProduct): Promise<number> {
  const items = await readStorage();

  if (product.id) {
    const updated = items.map((item) => (item.id === product.id ? product : item));
    await writeStorage(updated);
    return product.id;
  }

  const nextId = items.length > 0 ? Math.max(...items.map((item) => item.id ?? 0)) + 1 : 1;
  const newProduct = { ...product, id: nextId };

  await writeStorage([...items, newProduct]);
  return nextId;
}

export async function deleteProduct(id: number): Promise<void> {
  const items = await readStorage();
  await writeStorage(items.filter((item) => item.id !== id));
}

export async function lookupProductByBarcode(barcode: string) {
  if (!barcode) {
    return null;
  }

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const product = data.product;
    const category = Array.isArray(product.categories_tags) ? product.categories_tags[0]?.replace('en:', '') : '';

    return {
      barcode,
      name: product.product_name || product.generic_name || '',
      brand: Array.isArray(product.brands_tags) ? product.brands_tags[0] || '' : product.brands || '',
      category,
      imageUri: product.image_front_small_url || product.image_url || '',
    };
  } catch {
    return null;
  }
}

export function getDaysUntilExpiry(expiryDate: string) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function isNearExpiry(expiryDate: string, thresholdDays = 7) {
  const daysLeft = getDaysUntilExpiry(expiryDate);
  return daysLeft <= thresholdDays;
}
