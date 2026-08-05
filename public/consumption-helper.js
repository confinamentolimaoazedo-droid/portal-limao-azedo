'use strict';

/**
 * Portal do Cliente — V6.5.1
 *
 * Correções:
 * 1. Card de consumo diário no mesmo padrão visual do portal.
 * 2. Protocolo sanitário padrão quando a lista recebida estiver vazia.
 * 3. Custos do protocolo e dos tratamentos permanecem visíveis.
 */

const PROTOCOLO_PADRAO_LIMAO_AZEDO_V651 = [
  {
    procedimento: 'Vacina Respiratória',
    produto: 'BOVILIS VISTA ONCE SQ',
    dose: '2',
    unidade: 'mL'
  },
  {
    procedimento: 'Vacina Polivalente',
    produto: 'STARVAC',
    dose: '5',
    unidade: 'mL'
  },
  {
    procedimento: 'Vacina Antirrábica',
    produto: 'Raiva',
    dose: '2',
    unidade: 'mL'
  },
  {
    procedimento: 'Endectocida',
    produto: 'Moxisolv 1%',
    dose: '10',
    unidade: 'mL'
  }
];

document.addEventListener('DOMContentLoaded', function() {
  instalarEstilosV651();
  instalarCardConsumoAutomacaoV651();
  instalarCorrecaoProtocoloV651();
  envolverPreenchimentoLoteV651();
});

function instalarEstilosV651() {
  if (document.getElementById('estilosConsumoV651')) {
    return;
  }

  const estilos = document.createElement('style');
  estilos.id = 'estilosConsumoV651';

  estilos.textContent = `
    #consumoAutomacaoCard {
      margin-bottom: 18px;
      padding: 20px;
      border: 1px solid rgba(8, 120, 62, 0.10);
      border-radius: 20px;
      background: var(--branco, #ffffff);
      box-shadow: var(
        --sombra,
        0 14px 38px rgba(13, 64, 37, 0.09)
      );
    }

    #consumoAutomacaoCard .consumo-v651-topo {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 17px;
    }

    #consumoAutomacaoCard .consumo-v651-subtitulo {
      display: block;
      margin-bottom: 4px;
      color: var(--verde, #08783e);
      font-size: 11px;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    #consumoAutomacaoCard h3 {
      margin: 0;
      color: var(--texto, #1f2a24);
      font-size: 24px;
      line-height: 1.12;
    }

    #consumoAutomacaoCard .consumo-v651-icone {
      width: 48px;
      min-width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: var(--verde-claro, #edf7f1);
      font-size: 23px;
    }

    #consumoAutomacaoCard .consumo-v651-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    #consumoAutomacaoCard .consumo-v651-item {
      min-width: 0;
      padding: 18px;
      border: 1px solid rgba(8, 120, 62, 0.13);
      border-radius: 17px;
      background: #f7fbf8;
    }

    #consumoAutomacaoCard .consumo-v651-item span {
      display: block;
      margin-bottom: 10px;
      color: var(--muted, #68756d);
      font-size: 13px;
      font-weight: 750;
    }

    #consumoAutomacaoCard .consumo-v651-item strong {
      display: block;
      overflow-wrap: anywhere;
      color: var(--verde, #08783e);
      font-size: clamp(26px, 6vw, 38px);
      line-height: 1;
    }

    #consumoAutomacaoCard .consumo-v651-item small {
      display: block;
      margin-top: 7px;
      color: var(--muted, #68756d);
      font-size: 12px;
      line-height: 1.35;
    }

    #consumoAutomacaoCard .consumo-v651-meta {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      margin-top: 15px;
      padding-top: 14px;
      border-top: 1px solid var(--linha, #dfe9e3);
      color: var(--muted, #68756d);
      font-size: 12px;
      line-height: 1.4;
    }

    #listaProtocoloSanitario .item-protocolo {
      display: flex;
      align-items: center;
      gap: 13px;
      margin-bottom: 11px;
      padding: 15px;
      border: 1px solid rgba(8, 120, 62, 0.14);
      border-radius: 15px;
      background: #f7fbf8;
    }

    #listaProtocoloSanitario .item-protocolo:last-child {
      margin-bottom: 0;
    }

    #listaProtocoloSanitario .item-protocolo-check {
      width: 42px;
      min-width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #dff2e7;
      color: var(--verde, #08783e);
      font-size: 23px;
      font-weight: 900;
    }

    #listaProtocoloSanitario .item-protocolo-conteudo {
      min-width: 0;
    }

    #listaProtocoloSanitario .item-protocolo-conteudo strong {
      display: block;
      color: var(--texto, #1f2a24);
      font-size: 15px;
      line-height: 1.3;
    }

    #listaProtocoloSanitario .item-protocolo-conteudo span {
      display: block;
      margin-top: 4px;
      color: var(--muted, #68756d);
      font-size: 13px;
      line-height: 1.35;
    }

    @media (max-width: 520px) {
      #consumoAutomacaoCard .consumo-v651-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
      }

      #consumoAutomacaoCard .consumo-v651-item {
        padding: 14px 12px;
      }

      #consumoAutomacaoCard .consumo-v651-item strong {
        font-size: 27px;
      }

      #consumoAutomacaoCard .consumo-v651-meta {
        flex-direction: column;
        gap: 5px;
      }
    }
  `;

  document.head.appendChild(estilos);
}

function instalarCardConsumoAutomacaoV651() {
  const antigo = document.getElementById(
    'consumoAutomacaoCard'
  );

  if (antigo) {
    antigo.remove();
  }

  const referencia =
    document.querySelector('.secao-desempenho') ||
    document.querySelector('.secao-dados') ||
    document.querySelector('.secao-projecao') ||
    localizarCardPorTextoV651('Evolução do lote');

  if (!referencia) {
    return;
  }

  const card = document.createElement('section');
  card.id = 'consumoAutomacaoCard';
  card.className = 'cartao consumo-automacao-card';

  card.innerHTML = `
    <div class="consumo-v651-topo">
      <div>
        <span class="consumo-v651-subtitulo">
          Automação do trato
        </span>
        <h3>Consumo diário</h3>
      </div>

      <div
        class="consumo-v651-icone"
        aria-hidden="true"
      >
        🌽
      </div>
    </div>

    <div class="consumo-v651-grid">
      <article class="consumo-v651-item">
        <span>Consumo natural</span>

        <strong id="consumoNaturalAutomacao">
          —
        </strong>

        <small>kg por cabeça/dia</small>
      </article>

      <article class="consumo-v651-item">
        <span>Matéria seca</span>

        <strong id="consumoMSAutomacao">
          —
        </strong>

        <small>kg por cabeça/dia</small>
      </article>
    </div>

    <div class="consumo-v651-meta">
      <span id="consumoAutomacaoData">
        Sem importação disponível
      </span>

      <span id="consumoAutomacaoCabecas"></span>
    </div>
  `;

  referencia.insertAdjacentElement('afterend', card);
}

function localizarCardPorTextoV651(texto) {
  const cards = document.querySelectorAll(
    'section.cartao'
  );

  return [...cards].find(function(card) {
    return card.textContent.includes(texto);
  }) || null;
}

function instalarCorrecaoProtocoloV651() {
  window.preencherProtocoloSanitario =
    preencherProtocoloSanitarioV651;
}

function preencherProtocoloSanitarioV651(dados) {
  const lista = document.getElementById(
    'listaProtocoloSanitario'
  );

  if (!lista) {
    return;
  }

  const recebido = Array.isArray(
    dados && dados.protocoloSanitario
  )
    ? dados.protocoloSanitario
    : [];

  const protocolo = recebido.length
    ? recebido
    : PROTOCOLO_PADRAO_LIMAO_AZEDO_V651;

  lista.innerHTML = '';

  protocolo.forEach(function(item) {
    const procedimento =
      item.procedimento ||
      item.Procedimento ||
      item.tipo ||
      item.Tipo ||
      'Procedimento';

    const produto =
      item.produto ||
      item.Produto ||
      item.nome ||
      item.Nome ||
      'Produto não informado';

    const dose = String(
      item.dose ??
      item.Dose ??
      item.doseML ??
      ''
    ).trim();

    const unidade = String(
      item.unidade ??
      item.Unidade ??
      (dose ? 'mL' : '')
    ).trim();

    const detalhes = [
      produto,
      dose
        ? `${dose} ${unidade || 'mL'}`
        : unidade
    ]
      .filter(Boolean)
      .join(' • ');

    const elemento = document.createElement('article');
    elemento.className = 'item-protocolo';

    elemento.innerHTML = `
      <div
        class="item-protocolo-check"
        aria-hidden="true"
      >
        ✓
      </div>

      <div class="item-protocolo-conteudo">
        <strong>
          ${escaparHtmlV651(procedimento)}
        </strong>

        <span>
          ${escaparHtmlV651(detalhes)}
        </span>
      </div>
    `;

    lista.appendChild(elemento);
  });

  definirTextoV651(
    'custoProtocoloPorAnimal',
    dados && dados.custoProtocoloPorAnimal
      ? dados.custoProtocoloPorAnimal
      : 'R$ 22,00'
  );

  definirTextoV651(
    'custoProtocoloTotal',
    dados && dados.custoProtocoloTotal
      ? dados.custoProtocoloTotal
      : '—'
  );
}

function envolverPreenchimentoLoteV651() {
  if (
    typeof window.preencherTelaLote !== 'function' ||
    window.preencherTelaLote.__v651
  ) {
    return;
  }

  const original = window.preencherTelaLote;

  const envolvida = function(dados) {
    original(dados);

    preencherConsumoAutomacaoV651(dados);

    // Reaplica depois da função original, garantindo
    // o protocolo padrão quando o backend enviar [].
    preencherProtocoloSanitarioV651(dados);
  };

  envolvida.__v651 = true;
  window.preencherTelaLote = envolvida;
}

function preencherConsumoAutomacaoV651(dados) {
  const consumo =
    dados && dados.consumoAutomacao
      ? dados.consumoAutomacao
      : null;

  if (!consumo) {
    definirTextoV651(
      'consumoNaturalAutomacao',
      '—'
    );

    definirTextoV651(
      'consumoMSAutomacao',
      '—'
    );

    definirTextoV651(
      'consumoAutomacaoData',
      'Sem importação disponível'
    );

    definirTextoV651(
      'consumoAutomacaoCabecas',
      ''
    );

    return;
  }

  definirTextoV651(
    'consumoNaturalAutomacao',
    formatarConsumoV651(
      consumo.consumoNaturalPorCabecaKg
    )
  );

  definirTextoV651(
    'consumoMSAutomacao',
    formatarConsumoV651(
      consumo.consumoMSPorCabecaKg
    )
  );

  definirTextoV651(
    'consumoAutomacaoData',
    `Dados de ${consumo.data || '—'}`
  );

  definirTextoV651(
    'consumoAutomacaoCabecas',
    `${consumo.cabecasTratadas || 0} cabeça(s) tratada(s)`
  );
}

function formatarConsumoV651(valor) {
  const numero = converterNumeroV651(valor);

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
}

function converterNumeroV651(valor) {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0;
  }

  const texto = String(valor ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');

  const numero = Number(texto);

  return Number.isFinite(numero) ? numero : 0;
}

function definirTextoV651(id, valor) {
  const elemento = document.getElementById(id);

  if (elemento) {
    elemento.textContent =
      valor === undefined ||
      valor === null ||
      valor === ''
        ? '—'
        : String(valor);
  }
}

function escaparHtmlV651(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
