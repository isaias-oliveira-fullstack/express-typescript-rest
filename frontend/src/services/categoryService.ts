import type { LocalCategory } from "@shared/models/LocalCategory";
import { STORAGE } from "./storageKeys";

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `cat-${Date.now()}`;
}

function read(): LocalCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE.CATEGORIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalCategory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: LocalCategory[]): void {
  localStorage.setItem(STORAGE.CATEGORIES, JSON.stringify(list));
}

function nextId(): number {
  const raw = localStorage.getItem(STORAGE.CATEGORY_SEQ);
  const cur = raw ? Number(raw) : 0;
  const next = cur + 1;
  localStorage.setItem(STORAGE.CATEGORY_SEQ, String(next));
  return next;
}

export const categoryService = {
  list(): LocalCategory[] {
    return read().sort((a, b) => a.name.localeCompare(b.name));
  },

  getById(id: number): LocalCategory | undefined {
    return read().find((c) => c.id === id);
  },

  async seedFromApiIfEmpty(): Promise<void> {
    if (read().length > 0) return;

    const defaultCategories: Array<{ slug: string; name: string }> = [
      { slug: "instrumentos-musicais", name: "Instrumentos Musicais" },
      { slug: "roupas", name: "Roupas" },
      { slug: "livros", name: "Livros" },
      { slug: "acessorios", name: "Acessórios" },
    ];

    const list: LocalCategory[] = defaultCategories.map((category) => ({
      id: nextId(),
      name: category.name,
      slug: category.slug,
    }));

    write(list);
  },

  create(name: string): { ok: true; category: LocalCategory } | { ok: false; error: string } {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "Nome obrigatório." };
    const slug = slugify(trimmed);
    const exists = read().some((c) => c.slug === slug);
    if (exists) return { ok: false, error: "Já existe uma categoria com nome similar." };
    const category: LocalCategory = {
      id: nextId(),
      name: trimmed,
      slug: `${slug}-${Date.now().toString(36)}`,
    };
    const all = read();
    all.push(category);
    write(all);
    return { ok: true, category };
  },

  update(
    id: number,
    patch: Partial<Pick<LocalCategory, "name" | "slug">>
  ): { ok: true } | { ok: false; error: string } {
    const all = read();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return { ok: false, error: "Categoria não encontrada." };
    const nextName = patch.name?.trim() ?? all[idx].name;
    const nextSlug = patch.slug?.trim() ?? all[idx].slug;
    all[idx] = { ...all[idx], name: nextName, slug: nextSlug };
    write(all);
    return { ok: true };
  },

  remove(id: number): { ok: true } | { ok: false; error: string } {
    const all = read();
    const next = all.filter((c) => c.id !== id);
    if (next.length === all.length) return { ok: false, error: "Categoria não encontrada." };
    write(next);
    return { ok: true };
  },
};
