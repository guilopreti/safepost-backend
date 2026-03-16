import { Router } from "express";
import multer from "multer";
import { handlePost } from "../controllers/postController";

const router = Router();

// Configuramos o multer para manter o arquivo na memória RAM (memoryStorage)
// invés de salvar no HD, já que só precisamos repassar os bytes do Buffer para a API da Azure.
const upload = multer({ storage: multer.memoryStorage() });

// Registra que a rota POST espera um MultipartFormData com um campo arquivo chamado "image"
router.post("/", upload.single("image"), handlePost);

export default router;
