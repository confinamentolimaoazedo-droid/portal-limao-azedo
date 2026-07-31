# Portal Limão Azedo — Versão 3.1.1 Corrigida

## Correções

- Barras dos gráficos agora são preenchidas corretamente.
- Incluída a variável de cor que faltava no CSS.
- Cards de saúde, protocolo, custos e histórico foram alinhados.
- Alturas internas foram padronizadas.
- Ícone de saúde que aparecia como quadrado foi substituído.
- Cache da PWA atualizado para `v3-1-1`.

## Atenção aos campos de sanidade

Se `Animais tratados` aparecer como zero ou a dose aparecer como traço,
aplique o ajuste descrito em:

`AJUSTE_APPS_SCRIPT_SANIDADE.txt`

Ou mantenha os cabeçalhos da aba Sanidade exatamente como:

- `QuantidadeAnimais`
- `DosePorAnimalML`
- `VolumeTotalML`

## Publicação

Envie todo o conteúdo para a raiz do repositório e use o commit:

`Corrigir alinhamento e gráficos da V3.1`
