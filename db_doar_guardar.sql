CREATE SCHEMA estoque;
SET search_path TO estoque, public;

-- =====================================================================
-- 1. ESTRUTURA: CRIAÇÃO DAS TABELAS
-- =====================================================================

-- Tabela de Produtos (Products)
CREATE TABLE products (
    barcode VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    minimum_stock DECIMAL(10, 2),
    daily_consumption_rate DECIMAL(10, 2),
    notes TEXT,
    image_uri VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);

-- Tabela de Lotes (Batches)
CREATE TABLE batches (
    batch_id VARCHAR(50) PRIMARY KEY,
    barcode VARCHAR(50) REFERENCES products(barcode),
    batch_number VARCHAR(50) NOT NULL,
    batch_quantity INT NOT NULL,
    expiration_date DATE NOT NULL,
    batch_created_at TIMESTAMP NOT NULL
);

-- Tabela de Transações de Estoque (Inventory Transactions)
CREATE TABLE inventory_transactions (
    transaction_id UUID PRIMARY KEY,
    barcode VARCHAR(50) REFERENCES products(barcode),
    batch_id VARCHAR(50) REFERENCES batches(batch_id),
    transaction_type VARCHAR(20) NOT NULL,
    quantity_changed INT NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    reason TEXT
);

-- =====================================================================
-- 2. DADOS: INSERÇÃO DOS REGISTROS (ORDEM POPULACIONAL CRÍTICA)
-- =====================================================================

-- 2.1 POPULANDO A TABELA 'products'
INSERT INTO products (barcode, name, brand, category, minimum_stock, daily_consumption_rate, notes, image_uri, created_at) VALUES
('4332181960013', 'Condicionador 250g', 'Colgate', 'Higiene Pessoal', 430.88, NULL, 'Alias fugiat soluta sapiente deserunt.', 'https://mock-storage/produtos/4332181960013.jpg', '2025-08-20 00:00:00'),
('3503056413953', 'Desinfetante 200ml', 'Ajax', 'Limpeza', 3013.33, NULL, 'Voluptatibus iure debitis quisquam doloremque.', 'https://mock-storage/produtos/3503056413953.jpg', '2024-06-13 00:00:00'),
('3178108013267', 'Café 1kg', 'Pilão', 'Cesta Básica', 3013.59, NULL, 'Fugiat perspiciatis incidunt cumque quae quia harum dignissimos cupiditate corporis praesentium.', 'https://mock-storage/produtos/3178108013267.jpg', '2024-12-09 00:00:00'),
('4874016400524', 'Molho de Tomate Unidade', 'Quero', 'Cesta Básica', 338.50, NULL, 'Culpa aspernatur vitae eligendi molestias reiciendis voluptatum velit deleniti.', 'https://mock-storage/produtos/4874016400524.jpg', '2025-11-01 00:00:00'),
('1632870831727', 'Sal 250g', 'Camil', 'Cesta Básica', 409.13, NULL, 'Illo occaecati vitae quis amet enim aperiam exercitationem est illo.', 'https://mock-storage/produtos/1632870831727.jpg', '2024-06-01 00:00:00'),
('6284987769453', 'Inseticida 500g', 'Veja', 'Limpeza', 2213.28, NULL, 'Eligendi inventore veniam ullam minima delectus.', 'https://mock-storage/produtos/6284987769453.jpg', '2023-12-17 00:00:00'),
('7520471167190', 'Sabão em Barra 1kg', 'Cif', 'Limpeza', 4114.26, NULL, 'Dolorem unde at a officiis beatae alias.', 'https://mock-storage/produtos/7520471167190.jpg', '2025-11-11 00:00:00'),
('1906594013990', 'Absorvente Unidade', 'Johnsons', 'Higiene Pessoal', 228.86, NULL, 'Vitae tenetur deleniti impedit culpa quis explicabo.', 'https://mock-storage/produtos/1906594013990.jpg', '2024-02-22 00:00:00'),
('1465840449972', 'Protetor Solar 250g', 'Nivea', 'Higiene Pessoal', 355.50, NULL, 'Nobis labore saepe culpa quae voluptatum dolorem perspiciatis.', 'https://mock-storage/produtos/1465840449972.jpg', '2025-01-13 00:00:00'),
('5395024026811', 'Sal 200ml', 'Camil', 'Cesta Básica', 287.94, NULL, 'Sit quo in cumque minus possimus aliquid facere dicta alias.', 'https://mock-storage/produtos/5395024026811.jpg', '2024-12-14 00:00:00'),
('1111615280988', 'Protetor Solar Unidade', 'Johnsons', 'Higiene Pessoal', 126.46, NULL, 'Delectus magni qui repudiandae officia animi.', 'https://mock-storage/produtos/1111615280988.jpg', '2025-05-13 00:00:00'),
('9058147700541', 'Escova de Dente Pack 12', 'Rexona', 'Higiene Pessoal', 109.42, NULL, 'Dolores excepturi esse perspiciatis ipsam nostrum labore adipisci.', 'https://mock-storage/produtos/9058147700541.jpg', '2024-06-24 00:00:00');

-- 2.2 POPULANDO A TABELA 'batches'
INSERT INTO batches (batch_id, barcode, batch_number, batch_quantity, expiration_date, batch_created_at) VALUES
('BATCH_1_1', '4332181960013', 'LOT-29192', 289, '2027-10-16', '2025-11-20 00:00:00'),
('BATCH_1_2', '4332181960013', 'LOT-35319', 129, '2026-01-16', '2025-09-27 00:00:00'),
('BATCH_2_1', '3503056413953', 'LOT-38714', 81, '2025-04-29', '2024-07-02 00:00:00'),
('BATCH_2_2', '3503056413953', 'LOT-92169', 284, '2025-02-03', '2024-09-09 00:00:00'),
('BATCH_2_3', '3503056413953', 'LOT-41522', 122, '2026-04-06', '2024-07-13 00:00:00'),
('BATCH_2_4', '3503056413953', 'LOT-67247', 252, '2025-02-03', '2024-08-22 00:00:00'),
('BATCH_3_1', '3178108013267', 'LOT-40668', 209, '2025-02-28', '2025-01-27 00:00:00'),
('BATCH_3_2', '3178108013267', 'LOT-20123', 136, '2026-12-06', '2025-04-02 00:00:00'),
('BATCH_4_1', '4874016400524', 'LOT-86245', 67, '2026-02-20', '2026-01-12 00:00:00'),
('BATCH_4_2', '4874016400524', 'LOT-54015', 218, '2027-10-05', '2026-02-09 00:00:00'),
('BATCH_4_3', '4874016400524', 'LOT-51892', 207, '2026-06-03', '2026-01-06 00:00:00'),
('BATCH_4_4', '4874016400524', 'LOT-62692', 181, '2027-12-04', '2026-01-25 00:00:00');

-- 2.3 POPULANDO A TABELA 'inventory_transactions'
INSERT INTO inventory_transactions (transaction_id, barcode, batch_id, transaction_type, quantity_changed, transaction_date, reason) VALUES
('7922489b-23fd-4834-bc9b-330e50bbaace', '4332181960013', 'BATCH_1_1', 'entrada', 18, '2025-12-09 03:56:00', 'inventário inicial'),
('039dd82f-67e8-4d17-9687-c528fb65e24a', '4332181960013', 'BATCH_1_1', 'entrada', 22, '2025-12-23 03:56:00', 'doação recebida'),
('df19f591-3cf1-4683-9703-86d2a2aa9340', '4332181960013', 'BATCH_1_1', 'saida', 49, '2025-12-30 03:56:00', 'descarte'),
('985e6162-7ba9-4250-ae55-e92f44fd683d', '4332181960013', 'BATCH_1_1', 'saida', 25, '2026-01-02 03:56:00', 'consumo diário'),
('50d652d1-936c-4967-abd5-b8ba28429834', '4332181960013', 'BATCH_1_1', 'entrada', 39, '2026-01-14 03:56:00', 'reposição de estoque'),
('87ad9a1b-88ef-4df2-bef1-c63d8cb9e50f', '4332181960013', 'BATCH_1_1', 'saida', 35, '2026-01-29 03:56:00', 'consumo diário'),
('d388ce88-3aa5-46c8-9acd-ca149acea613', '4332181960013', 'BATCH_1_1', 'entrada', 36, '2026-02-01 03:56:00', 'inventário inicial'),
('306f026f-5605-4258-91cc-6f3b49d70f1a', '4332181960013', 'BATCH_1_1', 'saida', 13, '2026-02-20 03:56:00', 'produto vencido'),
('d0585ebb-8132-4ab0-866e-7f4a853dc49f', '4332181960013', 'BATCH_1_1', 'entrada', 50, '2026-02-28 03:56:00', 'compra fornecedor'),
('08e7b374-1820-4fe5-89e7-c182bd2d969d', '4332181960013', 'BATCH_1_2', 'saida', 41, '2025-10-12 03:56:00', 'produto vencido'),
('0d76deff-fdcc-4f40-83f3-f76cf6d276d1', '4332181960013', 'BATCH_1_2', 'saida', 23, '2025-10-24 03:56:00', 'descarte'),
('af42281c-a266-4d9b-b17f-543523b50947', '4332181960013', 'BATCH_1_2', 'entrada', 39, '2025-10-27 03:56:00', 'reposição de estoque');


SELECT * FROM estoque.batches;
SELECT * FROM estoque.products;
SELECT * FROM inventory_transactions;