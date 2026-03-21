import ContentSafetyClient from "@azure-rest/ai-content-safety";
import createVisionClient from "@azure-rest/ai-vision-image-analysis";
import { AzureKeyCredential } from "@azure/core-auth";
import { env } from "../config/env";

const safetyClient = ContentSafetyClient(
  env.AZURE_CONTENT_SAFETY_ENDPOINT,
  new AzureKeyCredential(env.AZURE_CONTENT_SAFETY_KEY),
);

const visionClient = createVisionClient(
  env.AZURE_VISION_ENDPOINT,
  new AzureKeyCredential(env.AZURE_VISION_KEY),
);

export const moderateImage = async (imageBuffer: Buffer) => {
  try {
    const base64Image = imageBuffer.toString("base64");

    // Dispara as duas chamadas em paralelo para não somar os tempos de espera
    const [safetyResponse, visionResponse] = await Promise.all([
      safetyClient.path("/image:analyze").post({
        body: {
          image: { content: base64Image },
          categories: ["Hate", "Sexual", "SelfHarm", "Violence"],
        },
      }),
      visionClient.path("/imageanalysis:analyze").post({
        body: imageBuffer,
        queryParameters: { features: ["Tags"] },
        contentType: "application/octet-stream",
      }),
    ]);

    if (safetyResponse.status !== "200") {
      throw new Error(
        `Falha na API Content Safety: HTTP ${safetyResponse.status}`,
      );
    }

    if (visionResponse.status !== "200") {
      throw new Error(`Falha na API Vision: HTTP ${visionResponse.status}`);
    }

    // Processa os scores de segurança (decisão de aprovação)
    const safetyBody = safetyResponse.body as any;
    const scores: Record<string, number> = {
      Hate: 0,
      Violence: 0,
      Sexual: 0,
      SelfHarm: 0,
    };

    safetyBody.categoriesAnalysis?.forEach((analysis: any) => {
      scores[analysis.category] = analysis.severity || 0;
    });

    const isApproved = !Object.values(scores).some((score) => score > 0);

    // Processa as tags visuais detectadas pelo Azure AI Vision
    const visionBody = visionResponse.body as any;
    const detectedTags = (visionBody.tagsResult?.values || []).map(
      (t: any) => t.name,
    );

    return {
      success: true,
      approved: isApproved,
      scores,
      detectedTags,
    };
  } catch (error) {
    console.error("[ERRO] Falha ao moderar imagem:", error);
    return { success: false, error: "Erro de comunicação ao analisar imagem" };
  }
};
