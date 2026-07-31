# Portal Limão Azedo — Versão 3.1 Completa

## Conteúdo da versão

### Dashboard e desempenho
- Peso estimado atual;
- Peso de entrada;
- Ganho total em kg;
- Consumo de matéria seca;
- Consumo sobre peso vivo;
- GMD projetado;
- Dieta e modalidade;
- Progresso do confinamento.

### Arrobas
Foram removidos:
- Arrobas estimadas do peso atual;
- Ganho em arrobas.

Foi mantido:
- Arrobas vivas equivalentes no resultado previsto;
- Arrobas de carcaça dentro do simulador de rendimento.

### Resultado previsto
- Peso vivo final;
- Arrobas vivas equivalentes;
- Rendimento de carcaça selecionável entre 50% e 55%;
- Peso de carcaça;
- Arrobas de carcaça.

### Saúde e sanidade
- Animais doentes;
- Animais na enfermaria;
- Tratamentos realizados;
- Animais tratados;
- Custo total de tratamentos;
- Protocolo sanitário de entrada;
- Custo fixo do protocolo por animal;
- Custo total do protocolo;
- Histórico sanitário por lote.

### Gráficos
- Evolução de peso: entrada, atual e projetado;
- Custos sanitários: protocolo, tratamentos e total;
- Situação sanitária: saudáveis, doentes e enfermaria.

### PWA
A versão inclui:
- `manifest.webmanifest`;
- `service-worker.js`;
- ícones de 192 e 512 pixels;
- instalação na tela inicial;
- abertura em modo aplicativo;
- estratégia de atualização que prioriza arquivos novos.

## Atualização no GitHub

Envie todo o conteúdo extraído para a raiz do repositório:

- `public/`;
- `src/`;
- `.gitignore`;
- `README.md`;
- `package.json`;
- `wrangler.jsonc`.

Mensagem recomendada:

`Publicar Portal Limão Azedo V3.1 completa`

## Variáveis da Cloudflare

Devem permanecer configuradas:

- `APPS_SCRIPT_URL` como Text;
- `API_SECRET` como Secret.

O `keep_vars` está ativado no `wrangler.jsonc`.
