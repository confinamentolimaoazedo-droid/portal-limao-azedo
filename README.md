# Portal Limão Azedo — Cloudflare

Portal do Cliente do Limão Azedo Confinamento, hospedado no Cloudflare Workers com arquivos estáticos e uma rota protegida de consulta.

## Estrutura

- `public/`: HTML, CSS, JavaScript e logotipo.
- `src/index.js`: Worker que atende `/api/consultar` e encaminha a consulta ao Google Apps Script.
- `wrangler.jsonc`: configuração da Cloudflare.

## Variáveis obrigatórias na Cloudflare

Cadastre em **Settings → Variables and Secrets**:

### APPS_SCRIPT_URL

Valor:

`https://script.google.com/macros/s/AKfycbzVQtQvXQcNmku5HPLH0N-v2-kHZ7ABwALLIz1G-u4YSzanbzaItVjsLXozezfSJEAzjQ/exec`

Pode ser variável normal.

### API_SECRET

Use exatamente a mesma chave configurada no `SEGREDO_API` do `Código.gs`.

Cadastre como **Secret**. Nunca coloque essa chave no GitHub.

## Implantação pelo GitHub

1. Envie todos os arquivos deste projeto para a raiz do repositório `portal-limao-azedo`.
2. Na Cloudflare, conecte o repositório.
3. O projeto será detectado pelo `wrangler.jsonc`.
4. Configure as duas variáveis.
5. Faça o deploy.
6. Teste `/` e o login por Curral + Carimbo.

## Teste local opcional

Crie um arquivo `.dev.vars`:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_ID/exec
API_SECRET=SUA_CHAVE
```

Depois:

```bash
npm install
npm run dev
```

O `.dev.vars` está ignorado pelo Git.
