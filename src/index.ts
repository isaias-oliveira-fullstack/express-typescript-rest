import express from "express";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/orders";
import { logger } from "./middlewares/logger";

const app = express();
const port = process.env.PORT ?? 3000;

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

app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

