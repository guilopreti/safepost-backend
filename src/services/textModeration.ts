import ContentSafetyClient from "@azure-rest/ai-content-safety";
import { AzureKeyCredential } from "@azure/core-auth";
import { env } from "../config/env";

const client = ContentSafetyClient(
  env.AZURE_CONTENT_SAFETY_ENDPOINT,
  new AzureKeyCredential(env.AZURE_CONTENT_SAFETY_KEY),
);

export const moderateText = async (text: string) => {
  try {
    const response = await client.path("/text:analyze").post({
      body: {
        text,
        categories: ["Hate", "Sexual", "SelfHarm", "Violence"],
        // false garante que a API continue analisando as outras categorias mesmo se encontrar um score alto na primeira
        haltOnBlocklistHit: false,
      },
    });

    if (response.status !== "200") {
      throw new Error(`Falha na API Content Safety: HTTP ${response.status}`);
    }

    const body = response.body as any;
    const { categoriesAnalysis } = body;

    // Inicializa o objeto de pontuações zerado
    const scores: Record<string, number> = {
      Hate: 0,
      Violence: 0,
      Sexual: 0,
      SelfHarm: 0,
    };

    // Preenche com os resultados recebidos
    categoriesAnalysis?.forEach((analysis: any) => {
      scores[analysis.category] = analysis.severity || 0;
    });

    // Regra do projeto: aprovado se TODOS os scores forem <= 2
    const isApproved = !Object.values(scores).some((score) => score > 2);

    return {
      success: true,
      approved: isApproved,
      scores,
    };
  } catch (error) {
    console.error("[ERRO] Falha ao moderar texto:", error);
    return { success: false, error: "Erro de comunicação ao analisar texto" };
  }
};
