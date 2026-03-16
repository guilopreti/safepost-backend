# SafePost — Backend

Uma API REST desenvolvida em Node.js com TypeScript que serve como backend para uma plataforma social simulada. O foco principal deste serviço é a **moderação automática de conteúdo** (texto e imagens) utilizando os serviços de Inteligência Artificial da Azure, além de exportar métricas de uso no formato Prometheus.

Projeto acadêmico desenvolvido para a disciplina de Computação em Nuvem II.

---

## 🛠 Tecnologias e Stack

- **Runtime:** Node.js
- **Linguagem:** TypeScript
- **Framework Web:** Express
- **Upload de Arquivos:** Multer (Memory Storage)
- **Integração IA de Texto:** `@azure-rest/ai-content-safety` (Azure AI Content Safety)
- **Integração IA de Imagem:** `@azure-rest/ai-vision-image-analysis` (Azure AI Vision)
- **Observabilidade:** `prom-client` (Métricas compatíveis com Prometheus / Azure Monitor)

---

## ⚙️ Regras de Negócio e Moderação

A API intercepta os posts recebidos (podem conter texto, imagem ou ambos). As requisições são analisadas pelos recursos da Azure através de categorias de segurança:

- Hate (Ódio)
- Violence (Violência)
- Sexual (Conteúdo Sexual)
- SelfHarm (Automutilação)

A severidade de cada categoria varia num score de **0 a 6**.

> **Regra de Aprovação:** Para um post ser liberado (`approved: true`), **todos** os scores avaliados no texto e na imagem devem ser **≤ 2**. Caso qualquer categoria exceda esse valor em qualquer uma das mídias, o post inteiro é bloqueado.

\* _Para as imagens, além do score de segurança, a API tenta extrair **tags semânticas** (ex: "dog", "car", "beach") para dados analíticos de consumo._

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Pré-requisitos

Certifique-se de ter instalado em sua máquina o **Node.js** (v18+) e o **Yarn** (ou npm).
Você também precisará ter instâncias ativas do **Azure AI Vision** e do **Azure AI Content Safety** no portal da Azure para obter as chaves de integração.

### 2. Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/safepost-backend.git
cd safepost-backend
yarn install
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Preencha o `.env` com suas credenciais da Azure. O sistema possui _Fail-Fast_, portanto a API **não iniciará** se houver chaves faltantes.

### 4. Executando o Servidor

Inicie a aplicação em modo de desenvolvimento (as atualizações no código refletem em tempo real):

```bash
yarn dev
```

Por padrão, a API estará escutando as requisições em `http://localhost:3333`.

---

## 📡 Endpoints Mapeados

### `POST /posts`

Endpoint responsável por receber o conteúdo do post e devolvê-lo classificado.

- **Content-Type esperada:** `multipart/form-data`
- **Body:**
  - `text` (String - opcional)
  - `image` (File - opcional)
    _(Ao menos um dos campos deve ser enviado)_

**Exemplo de Resposta (Post Aprovado):**

```json
{
  "approved": true,
  "text": {
    "analyzed": true,
    "categories": {
      "Hate": 0,
      "Violence": 0,
      "Sexual": 0,
      "SelfHarm": 0
    }
  },
  "image": {
    "analyzed": true,
    "tags": ["dog", "park", "sunny"],
    "categories": {
      "Hate": 0,
      "Violence": 0,
      "Sexual": 0,
      "SelfHarm": 0
    }
  }
}
```

### `GET /metrics`

Endpoint que expõe as métricas da aplicação para serem coletadas automaticamente por ferramentas de monitoramento, como o Azure Monitor ou o próprio Prometheus. O retorno do sistema é gerado em texto puro no formato padrão do _Prometheus_.

**Métricas extraídas:**

- `posts_total` (Counter): Total de tentativas de registros
- `posts_approved_total` (Counter): Quantidade de aprovações com sucesso
- `posts_blocked_total` (Counter): Quantidade de reprovações de segurança
- `moderation_duration_seconds` (Histogram): Latência do processamento em paralelo nas APIs da Microsoft
- `posts_blocked_by_category` (Counter): Conta individual de quebras isoladas por motivo bloqueante (ódio, violência, etc)
- `uploaded_topics_total` (Counter): Total de tags extraídas das **imagens** que foram aprovadas (a moderação de texto não alimenta essa métrica)
- `rejected_topics_total` (Counter): Total de tags extraídas das **imagens** que resultaram em bloqueio do post (a moderação de texto não alimenta essa métrica)
