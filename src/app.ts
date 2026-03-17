import express from "express";
import postRoutes from "./routes/postRoutes";
import metricsRoutes from "./routes/metricsRoutes";
import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "https://safepost-frontend.vercel.app",
];

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  }),
);

// Middlewares padrão em JSON e suporte a formulários URL-enconded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/posts", postRoutes);
app.use("/metrics", metricsRoutes);

export default app;
