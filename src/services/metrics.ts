import client from "prom-client";

// Essa função do prom-client adiciona métricas padrão úteis do Node.js (opcional)
// client.collectDefaultMetrics();

export const postsTotal = new client.Counter({
  name: "posts_total",
  help: "Total de posts recebidos",
});

export const postsApprovedTotal = new client.Counter({
  name: "posts_approved_total",
  help: "Total de posts aprovados",
});

export const postsBlockedTotal = new client.Counter({
  name: "posts_blocked_total",
  help: "Total de posts bloqueados",
});

export const moderationDurationSeconds = new client.Histogram({
  name: "moderation_duration_seconds",
  help: "Tempo de resposta da moderação",
  buckets: [0.1, 0.5, 1, 2, 5], // Intervalos de tempo em segundos
});

export const postsBlockedByCategory = new client.Counter({
  name: "posts_blocked_by_category",
  help: "Bloqueios por categoria",
  labelNames: ["category"],
});

export const getMetrics = async () => {
  return await client.register.metrics();
};
