import type { Category } from "@shared/models/Category";
import type { Product } from "@shared/models/Product";
import { idFromString } from "@shared/utils/hashId";
import { categoryService } from "./categoryService";
import { STORAGE } from "./storageKeys";

const API = "/api/products";

interface DummyProduct {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  price: number;
  thumbnail?: string;
  brand?: string;
  stock?: number;
  category: string | { id: number; title: string };
}

interface DummyListResponse {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}

function mapDummy(p: DummyProduct): Product {
  const category: Category =
    typeof p.category === "string"
      ? { id: idFromString(p.category), title: p.category }
      : p.category;

  const name = (p.title ?? p.name ?? "").toString();

  return {
    id: p.id,
    name,
    price: p.price,
    category,
    thumbnail: p.thumbnail,
    description: p.description,
    brand: p.brand,
    stock: p.stock,
  };
}

function readLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE.LOCAL_PRODUCTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalProducts(products: Product[]): void {
  localStorage.setItem(STORAGE.LOCAL_PRODUCTS, JSON.stringify(products));
}

function nextLocalId(): number {
  const raw = localStorage.getItem(STORAGE.LOCAL_PRODUCT_SEQ);
  const current = raw ? Number(raw) : 1_000_000;
  const next = current + 1;
  localStorage.setItem(STORAGE.LOCAL_PRODUCT_SEQ, String(next));
  return next;
}

function matchesCategoryFilter(
  product: Product,
  categorySlug: string,
): boolean {
  const slug = categorySlug.toLowerCase();
  const localCat = categoryService.list().find((c) => c.slug === categorySlug);
  if (localCat && product.categoryId) {
    return product.categoryId === localCat.id;
  }
  return product.category.title.toLowerCase() === slug;
}

export const productService = {
  async fetchPage(params?: {
    limit?: number;
    skip?: number;
    categorySlug?: string;
  }): Promise<{
    products: Product[];
    total: number;
  }> {
    const limit = params?.limit ?? 30;
    const skip = params?.skip ?? 0;

    let url = "";

    if (params?.categorySlug) {
      url = `${API}/category/${encodeURIComponent(params.categorySlug)}?limit=${limit}&skip=${skip}`;
    } else {
      url = `${API}?limit=${limit}&skip=${skip}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha ao carregar produtos.");
    const data = (await res.json()) as DummyListResponse;
    return {
      products: data.products.map(mapDummy),
      total: data.total,
    };
  },

  async fetchByCategory(category: string): Promise<Product[]> {
    const slug = encodeURIComponent(category);
    const res = await fetch(`${API}?category=${slug}`);
    if (!res.ok) throw new Error("Categoria não encontrada.");
    const data = (await res.json()) as DummyListResponse;
    return data.products.map(mapDummy);
  },

  async fetchCategories(): Promise<{ slug: string; name: string }[]> {
    // Always use local categories stored via `categoryService`.
    return categoryService.list().map((category) => ({
      slug: category.slug,
      name: category.name,
    }));
  },

  async getById(id: number): Promise<Product | null> {
    const local = readLocalProducts().find((p) => p.id === id);
    if (local) return local;
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) return null;
    const p = (await res.json()) as DummyProduct;
    return mapDummy(p);
  },

  getMergedCatalog(apiProducts: Product[]): Product[] {
    const local = readLocalProducts();
    const map = new Map<number, Product>();
    apiProducts.forEach((p) => map.set(p.id, p));
    local.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  },

  mergePage(
    apiProducts: Product[],
    categorySlug: string | "",
    includeLocalExtras: boolean,
  ): Product[] {
    const map = new Map<number, Product>();
    apiProducts.forEach((p) => map.set(p.id, p));
    if (includeLocalExtras) {
      readLocalProducts().forEach((p) => {
        if (categorySlug && !matchesCategoryFilter(p, categorySlug)) return;
        if (!map.has(p.id)) map.set(p.id, p);
      });
    }
    return Array.from(map.values());
  },

  listLocal(): Product[] {
    return readLocalProducts();
  },

  createLocal(payload: {
    name: string;
    price: number;
    categoryId: number;
    description?: string;
    stock?: number;
    colors?: string[];
    sizes?: string[];
    extraAttributes?: string[];
    mainImage?: string;
    galleryImages?: string[];
  }): Product {
    const cat = categoryService.getById(payload.categoryId);
    if (!cat) {
      throw new Error("Categoria inválida.");
    }
    const category: Category = {
      id: cat.id,
      title: cat.name,
    };
    const thumb =
      payload.mainImage || (payload.galleryImages && payload.galleryImages[0]);
    const product: Product = {
      id: nextLocalId(),
      name: payload.name.trim(),
      price: payload.price,
      category,
      categoryId: cat.id,
      description: payload.description?.trim(),
      stock: payload.stock ?? 0,
      localOnly: true,
      colors: payload.colors,
      sizes: payload.sizes,
      extraAttributes: payload.extraAttributes,
      mainImage: payload.mainImage,
      galleryImages: payload.galleryImages,
      thumbnail: thumb,
    };
    const all = readLocalProducts();
    all.push(product);
    writeLocalProducts(all);
    return product;
  },

  updateLocal(product: Product): void {
    const all = readLocalProducts();
    const idx = all.findIndex((p) => p.id === product.id);
    if (idx === -1) return;
    all[idx] = { ...product, localOnly: true };
    writeLocalProducts(all);
  },

  deleteLocal(id: number): void {
    const all = readLocalProducts().filter((p) => p.id !== id);
    writeLocalProducts(all);
  },
  

  async fetchEntireCatalog(opts?: { categorySlug?: string }): Promise<Product[]> {
    if (opts?.categorySlug) {
      try {
        const api = await this.fetchByCategory(opts.categorySlug);
        const merged = this.getMergedCatalog(api);
        return merged.filter((p) => matchesCategoryFilter(p, opts.categorySlug!));
      } catch {
        const all = await this.fetchEntireCatalog();
        return all.filter((p) => matchesCategoryFilter(p, opts.categorySlug!));
      }
    }
    const allApi: Product[] = [];
    let skip = 0;
    let total = Infinity;
    while (skip < total) {
      const res = await this.fetchPage({ limit: 100, skip });
      total = res.total;
      allApi.push(...res.products);
      if (res.products.length === 0) break;
      skip += res.products.length;
    }
    return this.getMergedCatalog(allApi);
  },
 async listAll() {
    try {
      const apiProducts = await productService.fetchEntireCatalog();
      const localProducts = productService.listLocal();

      return [...apiProducts, ...localProducts];
    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
      return productService.listLocal();
    }
  },
};
