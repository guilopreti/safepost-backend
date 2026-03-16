import { Request, Response } from "express";
import { moderateText } from "../services/textModeration";
import { moderateImage } from "../services/imageModeration";
import * as metrics from "../services/metrics";

export const handlePost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { text } = req.body;
  const image = req.file;

  if (!text && !image) {
    res
      .status(400)
      .json({ error: "Você precisa enviar um texto ou uma imagem." });
    return;
  }

  // Registra +1 no total de posts recebidos
  metrics.postsTotal.inc();

  // Inicia o relógio que vai medir o tempo total que demoramos pra responder no Prometheus
  const endTimer = metrics.moderationDurationSeconds.startTimer();

  try {
    let isApproved = true;

    const responsePayload = {
      approved: false,
      text: {
        analyzed: false,
        categories: { Hate: 0, Violence: 0, Sexual: 0, SelfHarm: 0 } as Record<
          string,
          number
        >,
      },
      image: {
        analyzed: false,
        tags: [] as string[],
        categories: { Hate: 0, Violence: 0, Sexual: 0, SelfHarm: 0 } as Record<
          string,
          number
        >,
      },
    };

    // Moderação de Texto
    if (text) {
      const textResult = await moderateText(text);
      responsePayload.text.analyzed = true;

      if (textResult.success && textResult.scores) {
        responsePayload.text.categories = textResult.scores;

        if (!textResult.approved) {
          isApproved = false;

          Object.entries(textResult.scores).forEach(([category, score]) => {
            if (score > 2) metrics.postsBlockedByCategory.inc({ category });
          });
        }
      }
    }

    // Moderação de Imagem
    if (image) {
      // Como configuramos multer em memória, o arquivo vem via req.file.buffer
      const imageResult = await moderateImage(image.buffer);
      responsePayload.image.analyzed = true;

      if (
        imageResult.success &&
        imageResult.scores &&
        imageResult.detectedTags
      ) {
        responsePayload.image.categories = imageResult.scores;
        responsePayload.image.tags = imageResult.detectedTags;

        if (!imageResult.approved) {
          isApproved = false;

          Object.entries(imageResult.scores).forEach(([category, score]) => {
            if (score > 2) metrics.postsBlockedByCategory.inc({ category });
          });

          imageResult.detectedTags.forEach((tag: string) => {
            metrics.rejectedTopicsTotal.inc({ tag });
          });
        } else {
          imageResult.detectedTags.forEach((tag: string) => {
            metrics.uploadedTopicsTotal.inc({ tag });
          });
        }
      }
    }

    responsePayload.approved = isApproved;

    // Registra métricas de sucesso/bloqueio finais
    if (isApproved) {
      metrics.postsApprovedTotal.inc();
    } else {
      metrics.postsBlockedTotal.inc();
    }

    endTimer();

    res.status(200).json(responsePayload);
  } catch (error) {
    endTimer();
    console.error("[ERRO] Falha ao processar o PostController:", error);
    res
      .status(500)
      .json({ error: "Erro interno durante a análise do conteúdo." });
  }
};
