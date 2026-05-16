export interface InventoryTransaction {
  transaction_id: string; // UUID, Chave primária
  barcode: string; // Chave estrangeira para products.barcode
  batch_id: string; // Chave estrangeira para batches.batch_id
  transaction_type: 'entrada' | 'saida'; // Não nulo
  quantity_changed: number; // Não nulo
  transaction_date: Date; // Não nulo (TIMESTAMP)
  reason?: string;
}