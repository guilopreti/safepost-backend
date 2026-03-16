import express from "express";
import postRoutes from "./routes/postRoutes";
import metricsRoutes from "./routes/metricsRoutes";

const app = express();

// Middlewares padrão em JSON e suporte a formulários URL-enconded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/posts", postRoutes);
app.use("/metrics", metricsRoutes);

export default app;
