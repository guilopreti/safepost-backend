import { Router } from "express";
import { getMetrics, getContentType } from "../services/metrics";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // Usa o content-type dinâmico do próprio registry do prom-client
    res.set("Content-Type", getContentType());

    // Obtém a "fotografia" atual de todos os Contadores e Histogramas
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error) {
    console.error("Erro ao gerar métricas:", error);
    res.status(500).send("Erro interno ao ler as métricas do Prometheus");
  }
});

export default router;
