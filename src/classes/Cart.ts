import type { Product } from "../models/Product";
import type { CartItem } from "../models/CartItem";

export class Cart {
  private items: CartItem[] = [];

  addItem(product: Product, quantity: number): void {
    const existingItem: boolean = this.items.some(
      (item: CartItem) => item.product.id === product.id
    );

    if (existingItem) {
      this.items = this.items.map(
        (item: CartItem): CartItem =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
      );
    } else {
      this.items.push({ product, quantity });
    }
  }

  setQuantity(productId: number, quantity: number): void {
  const exists: boolean = this.items.some(
    (item: CartItem) => item.product.id === productId
  );

  if (!exists) return;

  if (quantity <= 0) {
    this.removeItem(productId);
  } else {
    this.items = this.items.map((item: CartItem): CartItem =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    );
  }
}

  getTotalItems(): number {
    return this.items.reduce(
      (total: number, item: CartItem) => total + item.quantity,
      0
    );
  }

  getFinalPrice(): number {
    return this.items.reduce(
      (total: number, item: CartItem) =>
        total + item.product.price * item.quantity,
      0
    );
  }

  getItems(): CartItem[] {
    return this.items;
  }

  loadItems(items: CartItem[]): void {
    this.items = items.map((row: CartItem) => ({
      quantity: row.quantity,
      variantNote: row.variantNote,
      product: {
        ...row.product,
        category: { ...row.product.category },
      },
    }));
  }

  clear(): void {
    this.items = [];
  }

  decreaseQuantity(productId: number): void {
    const index: number = this.items.findIndex(
      (item: CartItem) => item.product.id === productId
    );
    if (index === -1) return;
    const item: CartItem = this.items[index];
    if (item.quantity <= 1) {
      this.items = this.items.filter(
        (i: CartItem) => i.product.id !== productId
      );
    } else {
      this.items = this.items.map((i: CartItem): CartItem =>
        i.product.id === productId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    }
  }

  increaseQuantity(productId: number): void {
    const index: number = this.items.findIndex(
      (item: CartItem) => item.product.id === productId
    );
    if (index === -1) return;

    const item: CartItem = this.items[index];

    this.items = this.items.map((i: CartItem): CartItem =>
      i.product.id === productId
        ? { ...i, quantity: item.quantity + 1 }
        : i
    );
  }

  removeItem(productId: number): void {
    this.items = this.items.filter(
      (item: CartItem) => item.product.id !== productId
    );
  }
}

