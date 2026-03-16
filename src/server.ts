import app from "./app";
import { env } from "./config/env";

const PORT = env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`[SafePost API] Servidor rodando na porta ${PORT}`);
});
