import client from "prom-client";

export const register = new client.Registry();

// Essa função do prom-client adiciona métricas padrão úteis do Node.js (opcional)
client.collectDefaultMetrics({ register });

export const postsTotal = new client.Counter({
  name: "posts_total",
  help: "Total de posts recebidos",
  registers: [register],
});

export const postsApprovedTotal = new client.Counter({
  name: "posts_approved_total",
  help: "Total de posts aprovados",
  registers: [register],
});

export const postsBlockedTotal = new client.Counter({
  name: "posts_blocked_total",
  help: "Total de posts bloqueados",
  registers: [register],
});

export const moderationDurationSeconds = new client.Histogram({
  name: "moderation_duration_seconds",
  help: "Tempo de resposta da moderação",
  buckets: [0.1, 0.5, 1, 2, 5], // Intervalos de tempo em segundos
  registers: [register],
});

export const postsBlockedByCategory = new client.Counter({
  name: "posts_blocked_by_category",
  help: "Bloqueios por categoria",
  labelNames: ["category"],
  registers: [register],
});

export const uploadedTopicsTotal = new client.Counter({
  name: "uploaded_topics_total",
  help: "Tópicos das imagens detectadas em posts aprovados",
  labelNames: ["tag"],
  registers: [register],
});

export const rejectedTopicsTotal = new client.Counter({
  name: "rejected_topics_total",
  help: "Tópicos das imagens detectadas em posts bloqueados",
  labelNames: ["tag"],
  registers: [register],
});

export const getMetrics = async () => {
  return await register.metrics();
};

export const getContentType = () => register.contentType;
