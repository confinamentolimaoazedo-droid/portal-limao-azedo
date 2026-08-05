'use strict';

/**
 * Portal do Cliente — V6.5
 * Exibe somente consumo natural e consumo de matéria seca.
 */

document.addEventListener('DOMContentLoaded', function() {
  instalarCardConsumoAutomacaoV65();
  envolverPreenchimentoLoteV65();
});

function instalarCardConsumoAutomacaoV65() {
  if (document.getElementById('consumoAutomacaoCard')) {
    return;
  }

  const referencia =
    document.querySelector('.secao-dados') ||
    document.querySelector('.secao-projecao');

  if (!referencia) return;

  const card = document.createElement('section');
  card.id = 'consumoAutomacaoCard';
  card.className = 'cartao consumo-automacao-card';

  card.innerHTML = `
    <div class="secao-titulo">
      <div>
        <span>Automação do trato</span>
        <h3>Consumo diário</h3>
      </div>
      <div class="secao-icone">🌽</div>
    </div>

    <div class="consumo-automacao-grid">
      <article>
        <span>Consumo natural</span>
        <strong id="consumoNaturalAutomacao">—</strong>
        <small>kg/cabeça/dia</small>
      </article>

      <article>
        <span>Matéria seca</span>
        <strong id="consumoMSAutomacao">—</strong>
        <small>kg/cabeça/dia</small>
      </article>
    </div>

    <div class="consumo-automacao-meta">
      <span id="consumoAutomacaoData">
        Sem importação disponível
      </span>

      <span id="consumoAutomacaoCabecas"></span>
    </div>
  `;

  referencia.insertAdjacentElement(
    'afterend',
    card
  );
}

function envolverPreenchimentoLoteV65() {
  if (
    typeof window.preencherTelaLote !== 'function' ||
    window.preencherTelaLote.__consumoV65
  ) {
    return;
  }

  const original = window.preencherTelaLote;

  const envolvida = function(dados) {
    original(dados);
    preencherConsumoAutomacaoV65(dados);
  };

  envolvida.__consumoV65 = true;
  window.preencherTelaLote = envolvida;
}

function preencherConsumoAutomacaoV65(dados) {
  const consumo = dados && dados.consumoAutomacao
    ? dados.consumoAutomacao
    : null;

  if (!consumo) {
    definirTexto(
      'consumoNaturalAutomacao',
      '—'
    );

    definirTexto(
      'consumoMSAutomacao',
      '—'
    );

    definirTexto(
      'consumoAutomacaoData',
      'Sem importação disponível'
    );

    definirTexto(
      'consumoAutomacaoCabecas',
      ''
    );

    return;
  }

  definirTexto(
    'consumoNaturalAutomacao',
    formatarConsumoV65(
      consumo.consumoNaturalPorCabecaKg
    )
  );

  definirTexto(
    'consumoMSAutomacao',
    formatarConsumoV65(
      consumo.consumoMSPorCabecaKg
    )
  );

  definirTexto(
    'consumoAutomacaoData',
    `Dados de ${consumo.data || '—'}`
  );

  definirTexto(
    'consumoAutomacaoCabecas',
    `${consumo.cabecasTratadas || 0} cabeça(s) tratada(s)`
  );
}

function formatarConsumoV65(valor) {
  const numero = converterNumero(valor);

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
}
