import type { Product } from "./Product";

export interface CartItem {
  product: Product;
  quantity: number;
  /** Observação de variante (cor/tamanho) quando aplicável */
  variantNote?: string;
}

