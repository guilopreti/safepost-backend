import express from "express";
import metricsRoutes from "./routes/metricsRoutes";

const app = express();

// Middlewares padrão em JSON e suporte a formulários URL-enconded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectando os roteadores
app.use("/metrics", metricsRoutes);

export default app;
