# Portal Limão Azedo — Versão 2.0

Portal do Cliente do Limão Azedo Confinamento hospedado na Cloudflare.

## Novidades da versão 2.0

- Simulação completa de rendimento de carcaça de 50% a 55%.
- Tabela de carcaça para o peso vivo de entrada.
- Tabela de carcaça para o peso vivo final projetado.
- Peso de carcaça em kg.
- Arrobas de carcaça considerando 15 kg por arroba.
- Imagem de prévia para compartilhamento no WhatsApp.
- `keep_vars: true` para preservar variáveis cadastradas no painel da Cloudflare.

## Estrutura

- `public/index.html`: interface.
- `public/style.css`: visual.
- `public/app.js`: consulta e cálculos.
- `public/logo.webp`: logotipo.
- `public/preview-whatsapp.jpg`: imagem de compartilhamento.
- `src/index.js`: Worker e rota `/api/consultar`.
- `wrangler.jsonc`: configuração da Cloudflare.

## Variáveis na Cloudflare

Cadastre em **Settings → Variables and Secrets**:

### APPS_SCRIPT_URL

Tipo: Text

Valor: URL oficial `/exec` do Apps Script.

### API_SECRET

Tipo: Secret

Valor: exatamente a mesma chave definida no `SEGREDO_API` do Apps Script.

Nunca coloque a chave secreta no GitHub.

## Atualização dos dados

Alterações na planilha são consultadas em tempo real. Não é necessário novo deploy
para atualizar peso, dieta, GMD, datas ou demais informações do lote.
