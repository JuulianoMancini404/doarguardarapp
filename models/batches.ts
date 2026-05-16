export interface Batch {
  batch_id: string; // Chave primária
  barcode: string; // Chave estrangeira para products.barcode
  batch_number: string; // Não nulo
  batch_quantity: number; // Não nulo
  expiration_date: string; // Não nulo (DATE)
  batch_created_at: Date; // Não nulo (TIMESTAMP)
}