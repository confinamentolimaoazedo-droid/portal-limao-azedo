# Portal Limão Azedo — Versão 2.1

## Alteração principal

O cálculo de rendimento de carcaça ficou somente no peso vivo final projetado.

Na entrada do lote permanece apenas o peso vivo de entrada informado na planilha.

Na seção Resultado previsto, o cliente escolhe entre 50% e 55% e o portal calcula:

- Peso de carcaça em kg;
- Arrobas de carcaça;
- Uma arroba equivalente a 15 kg de carcaça.

## Atualização dos dados

Os dados continuam sendo consultados em tempo real na planilha Google Sheets.

## Variáveis na Cloudflare

- `APPS_SCRIPT_URL` como Text;
- `API_SECRET` como Secret.

O `wrangler.jsonc` mantém `keep_vars: true`.
