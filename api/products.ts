import type { Request, Response } from "express";
import express from "express";
import { productsRouter } from "../src/routes/products";
import { logger } from "../src/middlewares/logger";

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(logger);
app.use(["/api/products", "/api/products.ts"], productsRouter);

export default function handler(req: Request, res: Response) {
  return app(req, res);
}
