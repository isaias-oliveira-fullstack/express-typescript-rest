import { Router, type Request, type Response } from "express";
import type { Product } from "../models/Product";

const products: Product[] = [
  {
    id: 1,
    name: "Guitarra",
    price: 400,
    category: { id: 1, title: "Instrumentos Musicais" },
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60",
    description: "Guitarra elétrica de 6 cordas com acabamento em maple e som encorpado.",
    brand: "Fender",
    stock: 5,
  },
  {
    id: 2,
    name: "Camiseta",
    price: 100,
    category: { id: 2, title: "Roupas" },
    thumbnail: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60",
    description: "Camiseta 100% algodão, confortável e ideal para o dia a dia.",
    brand: "BasicBrand",
    stock: 24,
  },
  {
    id: 3,
    name: "Livro de TypeScript",
    price: 80,
    category: { id: 3, title: "Livros" },
    thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=60",
    description: "Guia prático de TypeScript para desenvolvedores JavaScript.",
    brand: "TechPress",
    stock: 12,
  },
  {
    id: 4,
    name: "Violão",
    price: 350,
    category: { id: 1, title: "Instrumentos Musicais" },
    thumbnail: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&auto=format&fit=crop&q=60",
    description: "Violão acústico com timbre equilibrado e ação confortável.",
    brand: "Yamaha",
    stock: 8,
  },
];

export const productsRouter = Router();

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\s+/g, "-")
    .replace(/[^-\u007f\w]+/g, "")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

productsRouter.get("/", (req: Request, res: Response) => {
  const rawCategory = String(req.query.category ?? "").trim();
  const category = rawCategory.toLowerCase();
  const skip = Number(req.query.skip ?? 0);
  const limit = Number(req.query.limit ?? products.length);

  const filtered = category
    ? products.filter((prod) => {
        const title = prod.category.title.toLowerCase();
        return title === category || slugify(title) === category;
      })
    : products;

  const paged = filtered.slice(skip, skip + limit);

  return res.json({
    message: category ? `Products filtered by category: ${rawCategory}` : undefined,
    products: paged,
    total: filtered.length,
    skip,
    limit,
  });
});

productsRouter.get("/category/:slug", (req: Request, res: Response) => {
  const rawCategory = String(req.params.slug ?? "").trim();
  const category = rawCategory.toLowerCase();
  const skip = Number(req.query.skip ?? 0);
  const limit = Number(req.query.limit ?? products.length);

  const filtered = products.filter((prod) => {
    const title = prod.category.title.toLowerCase();
    return title === category || slugify(title) === category;
  });

  const paged = filtered.slice(skip, skip + limit);

  return res.json({
    products: paged,
    total: filtered.length,
    skip,
    limit,
  });
});

productsRouter.get("/:id", (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  if (Number.isNaN(productId) || productId < 0) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const product = products.find((item) => item.id === productId);
  return res.json(product ?? null);
});
