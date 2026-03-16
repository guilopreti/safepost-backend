import { Router } from "express";
import { getMetrics } from "../services/metrics";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // O Prometheus espera que os dados venham num formato textual bem específico
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");

    // Obtém a "fotografia" atual de todos os Contadores e Histogramas
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error) {
    console.error("Erro ao gerar métricas:", error);
    res.status(500).send("Erro interno ao ler as métricas do Prometheus");
  }
});

export default router;
