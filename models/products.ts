export interface Product {
  barcode: string; // Chave primária
  name: string; // Não nulo
  brand?: string;
  category?: string;
  minimum_stock?: number;
  daily_consumption_rate?: number;
  notes?: string;
  image_uri?: string;
  created_at: Date; // Não nulo
}