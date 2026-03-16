import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 3333,
  AZURE_CONTENT_SAFETY_ENDPOINT: process.env
    .AZURE_CONTENT_SAFETY_ENDPOINT as string,
  AZURE_CONTENT_SAFETY_KEY: process.env.AZURE_CONTENT_SAFETY_KEY as string,
  AZURE_VISION_ENDPOINT: process.env.AZURE_VISION_ENDPOINT as string,
  AZURE_VISION_KEY: process.env.AZURE_VISION_KEY as string,
};

const requiredKeys = [
  "AZURE_CONTENT_SAFETY_ENDPOINT",
  "AZURE_CONTENT_SAFETY_KEY",
  "AZURE_VISION_ENDPOINT",
  "AZURE_VISION_KEY",
];

// Validação: se faltar alguma variável crucial, o aplicativo morre aqui mesmo (Fail Fast)
for (const key of requiredKeys) {
  if (!process.env[key]) {
    console.error(
      `[ERRO FATAL] Variável de ambiente ausente: ${key}. Verifique seu arquivo .env`,
    );
    process.exit(1); // O código 1 força a parada imediata do Node.js
  }
}
