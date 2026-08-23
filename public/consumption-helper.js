'use strict';

/**
 * Portal do Cliente — V6.8.8
 *
 * Atualizações:
 * - Consumo diário com data e horário;
 * - remove "cabeças tratadas" do card;
 * - transforma os indicadores antigos no card 02 "Resumo do lote";
 * - exibe Consumo de MS com 3 casas decimais no resumo;
 * - preserva protocolo sanitário e custos.
 */

const PROTOCOLO_PADRAO_LIMAO_AZEDO_V652 = [
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
  instalarEstilosV652();
  transformarResumoLoteV652();
  instalarCardConsumoV652();
  instalarCardTratosV66();
  instalarProtocoloV652();
  instalarCardsFinanceirosV682();
  envolverPreenchimentoLoteV652();
});

function instalarEstilosV652() {
  if (document.getElementById('estilosV652')) return;

  const style = document.createElement('style');
  style.id = 'estilosV652';
  style.textContent = `
    #consumoAutomacaoCard,
    #resumoLoteCardV652 {
      margin-bottom: 18px;
      padding: 20px;
      border: 1px solid rgba(8,120,62,.10);
      border-radius: 20px;
      background: var(--branco, #fff);
      box-shadow: var(--sombra, 0 14px 38px rgba(13,64,37,.09));
    }

    .cabecalho-card-v652 {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 17px;
    }

    .cabecalho-card-v652 .rotulo-v652 {
      display: block;
      margin-bottom: 4px;
      color: var(--verde, #08783e);
      font-size: 11px;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: .07em;
    }

    .cabecalho-card-v652 h3 {
      margin: 0;
      color: var(--texto, #1f2a24);
      font-size: 24px;
      line-height: 1.12;
    }

    .icone-card-v652 {
      width: 48px;
      min-width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: var(--verde-claro, #edf7f1);
      color: var(--verde-escuro, #075f35);
      font-size: 20px;
      font-weight: 900;
    }

    .consumo-grid-v652 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 12px;
    }

    .consumo-item-v652 {
      min-width: 0;
      padding: 18px;
      border: 1px solid rgba(8,120,62,.13);
      border-radius: 17px;
      background: #f7fbf8;
    }

    .consumo-item-v652 > span {
      display: block;
      margin-bottom: 10px;
      color: var(--muted, #68756d);
      font-size: 13px;
      font-weight: 750;
    }

    .consumo-item-v652 > strong {
      display: block;
      color: var(--verde, #08783e);
      font-size: clamp(26px, 6vw, 38px);
      line-height: 1;
    }

    .consumo-item-v652 > small {
      display: block;
      margin-top: 7px;
      color: var(--muted, #68756d);
      font-size: 12px;
    }

    .consumo-meta-v652 {
      margin-top: 15px;
      padding-top: 14px;
      border-top: 1px solid var(--linha, #dfe9e3);
      color: var(--muted, #68756d);
      font-size: 12px;
    }

    #resumoLoteCardV652 .grade-indicadores {
      display: grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 12px;
    }

    #resumoLoteCardV652 .indicador {
      min-width: 0;
      min-height: 118px;
      margin: 0;
      padding: 16px;
      border: 1px solid rgba(8,120,62,.10);
      border-radius: 16px;
      background: #f7fbf8;
      box-shadow: none;
    }

    #resumoLoteCardV652 .indicador-icone {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      margin-bottom: 10px;
      border-radius: 11px;
      background: var(--verde-claro, #edf7f1);
    }

    #resumoLoteCardV652 .indicador span {
      display: block;
      color: var(--muted, #68756d);
      font-size: 12px;
      font-weight: 700;
    }

    #resumoLoteCardV652 .indicador strong {
      display: block;
      margin-top: 5px;
      overflow-wrap: anywhere;
      color: var(--verde-escuro, #075f35);
      font-size: 18px;
    }

    #listaProtocoloSanitario .item-protocolo {
      display: flex;
      align-items: center;
      gap: 13px;
      margin-bottom: 11px;
      padding: 15px;
      border: 1px solid rgba(8,120,62,.14);
      border-radius: 15px;
      background: #f7fbf8;
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

    #listaProtocoloSanitario .item-protocolo-conteudo strong,
    #listaProtocoloSanitario .item-protocolo-conteudo span {
      display: block;
    }

    #listaProtocoloSanitario .item-protocolo-conteudo span {
      margin-top: 4px;
      color: var(--muted, #68756d);
      font-size: 13px;
    }


    #tratosDoDiaCardV66 {
      margin-bottom: 18px;
      padding: 20px;
      border: 1px solid rgba(8,120,62,.10);
      border-radius: 20px;
      background: var(--branco, #fff);
      box-shadow: var(--sombra, 0 14px 38px rgba(13,64,37,.09));
    }

    .tratos-resumo-v66 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
      padding: 13px 14px;
      border-radius: 14px;
      background: var(--verde-claro, #edf7f1);
      color: var(--verde-escuro, #075f35);
    }

    .tratos-resumo-v66 strong {
      font-size: 16px;
    }

    .tratos-resumo-v66 span {
      color: var(--muted, #68756d);
      font-size: 12px;
      text-align: right;
    }

    .lista-tratos-v66 {
      display: grid;
      gap: 11px;
    }

    .trato-item-v66 {
      display: grid;
      grid-template-columns: 46px minmax(0, 1fr);
      gap: 13px;
      align-items: center;
      padding: 15px;
      border: 1px solid rgba(8,120,62,.13);
      border-radius: 16px;
      background: #f7fbf8;
    }

    .trato-numero-v66 {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: #dff2e7;
      color: var(--verde, #08783e);
      font-size: 18px;
      font-weight: 900;
    }

    .trato-conteudo-v66 {
      min-width: 0;
    }

    .trato-topo-v66 {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: baseline;
    }

    .trato-topo-v66 strong {
      color: var(--texto, #1f2a24);
      font-size: 15px;
    }

    .trato-topo-v66 span {
      color: var(--verde-escuro, #075f35);
      font-size: 12px;
      font-weight: 800;
    }

    .trato-detalhes-v66 {
      display: flex;
      flex-wrap: wrap;
      gap: 7px 12px;
      margin-top: 6px;
      color: var(--muted, #68756d);
      font-size: 12px;
    }

    .tratos-vazio-v66 {
      padding: 18px;
      border: 1px dashed rgba(8,120,62,.25);
      border-radius: 15px;
      color: var(--muted, #68756d);
      text-align: center;
    }

    @media (min-width: 680px) {
      #resumoLoteCardV652 .grade-indicadores {
        grid-template-columns: repeat(4, minmax(0,1fr));
      }
    }

    @media (max-width: 520px) {
      #consumoAutomacaoCard,
      #resumoLoteCardV652,
      #tratosDoDiaCardV66 {
        padding: 18px;
      }

      .consumo-grid-v652 {
        gap: 9px;
      }

      .consumo-item-v652 {
        padding: 14px 12px;
      }

      .consumo-item-v652 > strong {
        font-size: 27px;
      }
    }
  `;
  document.head.appendChild(style);
}

function transformarResumoLoteV652() {
  const grade = document.querySelector('.grade-indicadores');
  if (!grade || document.getElementById('resumoLoteCardV652')) return;

  const card = document.createElement('section');
  card.id = 'resumoLoteCardV652';
  card.className = 'cartao resumo-lote-v652';

  card.innerHTML = `
    <div class="cabecalho-card-v652">
      <div>
        <span class="rotulo-v652">01. Resumo do lote</span>
        <h3>Resumo geral do lote</h3>
      </div>
      <div class="icone-card-v652" aria-hidden="true">01</div>
    </div>
  `;

  grade.parentNode.insertBefore(card, grade);
  card.appendChild(grade);
}

function instalarCardConsumoV652() {
  const antigo = document.getElementById('consumoAutomacaoCard');
  if (antigo) antigo.remove();

  const resumo = document.getElementById('resumoLoteCardV652');
  if (!resumo) return;

  const card = document.createElement('section');
  card.id = 'consumoAutomacaoCard';
  card.className = 'cartao consumo-automacao-card';

  card.innerHTML = `
    <div class="cabecalho-card-v652">
      <div>
        <span class="rotulo-v652">02. Automação do trato</span>
        <h3>Consumo diário médio</h3>
      </div>
      <div class="icone-card-v652" aria-hidden="true">🌽</div>
    </div>

    <div class="consumo-grid-v652">
      <article class="consumo-item-v652">
        <span>Consumo natural</span>
        <strong id="consumoNaturalAutomacao">—</strong>
        <small>kg por cabeça/dia</small>
      </article>

      <article class="consumo-item-v652">
        <span>Matéria seca</span>
        <strong id="consumoMSAutomacao">—</strong>
        <small>kg por cabeça/dia</small>
      </article>
    </div>

    <div class="consumo-meta-v652">
      <span id="consumoAutomacaoData">
        Sem importação disponível
      </span>
    </div>
  `;

  resumo.insertAdjacentElement('afterend', card);
}



function instalarCardTratosV66() {
  if (document.getElementById('tratosDoDiaCardV66')) {
    return;
  }

  const resumo = document.getElementById('resumoLoteCardV652');

  if (!resumo) {
    return;
  }

  const card = document.createElement('section');
  card.id = 'tratosDoDiaCardV66';
  card.className = 'cartao tratos-do-dia-v66';

  card.innerHTML = `
    <div class="cabecalho-card-v652">
      <div>
        <span class="rotulo-v652">03. Tratos do dia</span>
        <h3>Fornecimento realizado</h3>
      </div>

      <div class="icone-card-v652" aria-hidden="true">
        🥣
      </div>
    </div>

    <div class="tratos-resumo-v66">
      <strong id="tratosResumoTituloV66">
        Nenhum trato registrado
      </strong>

      <span id="tratosResumoDataV66"></span>
    </div>

    <div
      id="listaTratosV66"
      class="lista-tratos-v66"
    >
      <div class="tratos-vazio-v66">
        Aguardando importação do relatório de descarga.
      </div>
    </div>
  `;

  const consumo = document.getElementById(
    'consumoAutomacaoCard'
  );

  if (consumo) {
    consumo.insertAdjacentElement('afterend', card);
  } else {
    resumo.insertAdjacentElement('afterend', card);
  }
}

function preencherTratosV66(dados) {
  const resumo =
    dados && dados.tratosDoDia
      ? dados.tratosDoDia
      : null;

  const lista = document.getElementById('listaTratosV66');

  if (!lista) {
    return;
  }

  const tratos =
    resumo && Array.isArray(resumo.tratos)
      ? resumo.tratos
      : [];

  const realizados = Number(
    resumo && resumo.quantidadeRealizada
      ? resumo.quantidadeRealizada
      : tratos.length
  );

  const previstos = Number(
    resumo && resumo.totalPrevisto
      ? resumo.totalPrevisto
      : 0
  );

  if (!tratos.length) {
    definirTextoV652(
      'tratosResumoTituloV66',
      'Nenhum trato registrado'
    );

    definirTextoV652(
      'tratosResumoDataV66',
      ''
    );

    lista.innerHTML = `
      <div class="tratos-vazio-v66">
        Nenhum trato foi importado para hoje.
      </div>
    `;

    return;
  }

  definirTextoV652(
    'tratosResumoTituloV66',
    previstos > 0
      ? `${realizados} de ${previstos} trato(s) realizado(s)`
      : `${realizados} trato(s) realizado(s)`
  );

  definirTextoV652(
    'tratosResumoDataV66',
    tratos[0].data || ''
  );

  lista.innerHTML = tratos
    .map(function(trato) {
      const numeroTrato = Number(trato.numeroTrato || 0);
      const totalPrevisto = Number(
        trato.totalTratosPrevistos || previstos || 0
      );

      const horarioInicio = formatarHoraCurtaV66(
        trato.horaInicio
      );

      const horarioFim = formatarHoraCurtaV66(
        trato.horaFim
      );

      const horario = [
        horarioInicio,
        horarioFim
          ? `às ${horarioFim}`
          : ''
      ].filter(Boolean).join(' ');

      const peso = Number(
        trato.pesoDescarregadoKg || 0
      ).toLocaleString('pt-BR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      });

      return `
        <article class="trato-item-v66">
          <div class="trato-numero-v66">
            ${escaparHtmlV652(numeroTrato || '—')}
          </div>

          <div class="trato-conteudo-v66">
            <div class="trato-topo-v66">
              <strong>
                Trato ${escaparHtmlV652(numeroTrato || '—')}
                ${totalPrevisto
                  ? ` de ${escaparHtmlV652(totalPrevisto)}`
                  : ''}
              </strong>

              <span>
                ${escaparHtmlV652(horario || 'Horário não informado')}
              </span>
            </div>

            <div class="trato-detalhes-v66">
              <span>
                Dieta:
                <b>${escaparHtmlV652(trato.dieta || '—')}</b>
              </span>

              <span>
                Fornecido:
                <b>${escaparHtmlV652(peso)} kg</b>
              </span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function formatarHoraCurtaV66(valor) {
  const texto = String(valor || '').trim();

  const encontrado = texto.match(
    /(\d{2}):(\d{2})(?::\d{2})?/
  );

  if (!encontrado) {
    return texto;
  }

  return `${encontrado[1]}:${encontrado[2]}`;
}

function instalarProtocoloV652() {
  window.preencherProtocoloSanitario =
    preencherProtocoloSanitarioV652;
}

function envolverPreenchimentoLoteV652() {
  if (
    typeof window.preencherTelaLote !== 'function' ||
    window.preencherTelaLote.__v652
  ) return;

  const original = window.preencherTelaLote;

  const envolvida = function(dados) {
    original(dados);
    preencherConsumoV652(dados);
    preencherTratosV66(dados);
    preencherProtocoloSanitarioV652(dados);
    preencherFreteV682(dados);
    preencherCobrancasV682(dados);
  };

  envolvida.__v652 = true;
  window.preencherTelaLote = envolvida;
}

function preencherConsumoV652(dados) {
  const consumo = dados?.consumoAutomacao || null;

  if (!consumo) {
    definirTextoV652(
      'consumoNaturalAutomacao',
      '—'
    );

    definirTextoV652(
      'consumoMSAutomacao',
      formatarConsumoV652(
        dados?.consumoMS || 0
      )
    );

    definirTextoV652(
      'consumoAutomacaoData',
      'Média ainda não disponível'
    );

    return;
  }

  const natural = formatarConsumoV652(
    consumo.consumoNaturalPorCabecaKg
  );
  const ms = formatarConsumoV652(
    consumo.consumoMSPorCabecaKg
  );

  definirTextoV652('consumoNaturalAutomacao', natural);
  definirTextoV652('consumoMSAutomacao', ms);

  const dataInicio =
    consumo.dataInicio ||
    consumo.data ||
    '—';

  const dataFim =
    consumo.dataFim ||
    consumo.data ||
    '—';

  const dias =
    Number(
      consumo.diasConsiderados || 0
    );

  definirTextoV652(
    'consumoAutomacaoData',
    consumo.mediaPeriodo
      ? (
          dataInicio === dataFim
            ? `Média acumulada do lote • ${dataFim}`
            : `Média do período: ${dataInicio} a ${dataFim}` +
              (dias > 0 ? ` • ${dias} dia(s)` : '')
        )
      : `Dados de ${consumo.data || '—'}`
  );

  /**
   * O card principal de consumo é a fonte oficial.
   * Não atualizamos novamente o card "Consumo de MS"
   * do resumo para evitar informação duplicada.
   */
  const resumoConsumo =
    document.getElementById(
      'consumoMS'
    );

  if (resumoConsumo) {
    const card =
      resumoConsumo.closest(
        '.metrica, .item-resumo, article, .resumo-item'
      );

    if (card) {
      card.style.display = 'none';
    }
  }
}

function preencherProtocoloSanitarioV652(dados) {
  const lista = document.getElementById('listaProtocoloSanitario');
  if (!lista) return;

  const recebidos = Array.isArray(dados?.protocoloSanitario)
    ? dados.protocoloSanitario
    : [];

  const protocolo = recebidos.length
    ? recebidos
    : PROTOCOLO_PADRAO_LIMAO_AZEDO_V652;

  lista.innerHTML = '';

  protocolo.forEach(function(item) {
    const procedimento =
      item.procedimento || item.Procedimento ||
      item.tipo || item.Tipo || 'Procedimento';

    const produto =
      item.produto || item.Produto ||
      item.nome || item.Nome || 'Produto não informado';

    const dose = String(
      item.dose ?? item.Dose ?? item.doseML ?? ''
    ).trim();

    const unidade = String(
      item.unidade ?? item.Unidade ?? (dose ? 'mL' : '')
    ).trim();

    const detalhes = [
      produto,
      dose ? `${dose} ${unidade || 'mL'}` : unidade
    ].filter(Boolean).join(' • ');

    const elemento = document.createElement('article');
    elemento.className = 'item-protocolo';
    elemento.innerHTML = `
      <div class="item-protocolo-check">✓</div>
      <div class="item-protocolo-conteudo">
        <strong>${escaparHtmlV652(procedimento)}</strong>
        <span>${escaparHtmlV652(detalhes)}</span>
      </div>
    `;
    lista.appendChild(elemento);
  });

  definirTextoV652(
    'custoProtocoloPorAnimal',
    dados?.custoProtocoloPorAnimal || 'R$ 22,00'
  );

  definirTextoV652(
    'custoProtocoloTotal',
    dados?.custoProtocoloTotal || '—'
  );
}

function formatarConsumoV652(valor) {
  const numero = converterNumeroV652(valor);
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
}

function converterNumeroV652(valor) {
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

function definirTextoV652(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent =
      valor === undefined || valor === null || valor === ''
        ? '—'
        : String(valor);
  }
}

function escaparHtmlV652(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ==========================================================
 * V6.8.4 — FRETE + RESUMO DE COBRANÇAS
 * ==========================================================
 */

function instalarCardsFinanceirosV682() {
  const protocolo =
    document.querySelector(
      '.secao-protocolo'
    );

  if (!protocolo) {
    return;
  }

  if (
    !document.getElementById(
      'freteClienteCardV682'
    )
  ) {
    const frete =
      document.createElement(
        'section'
      );

    frete.id =
      'freteClienteCardV682';

    frete.className =
      'cartao frete-cliente-v682';

    frete.hidden = true;

    frete.innerHTML = `
      <div class="secao-titulo">
        <div>
          <span>Transporte</span>
          <h3>Frete do lote</h3>
        </div>
        <div class="secao-icone">🚛</div>
      </div>

      <div class="linha-dado">
        <span>Data do frete</span>
        <strong id="freteDataV682">—</strong>
      </div>

      <div class="linha-dado">
        <span>Distância percorrida</span>
        <strong id="freteDistanciaV682">—</strong>
      </div>

      <div class="linha-dado">
        <span>Valor por km</span>
        <strong id="freteValorKmV682">—</strong>
      </div>

      <div class="linha-dado">
        <span>Total do frete</span>
        <strong id="freteTotalV682">—</strong>
      </div>

      <div class="linha-dado">
        <span>Status</span>
        <strong id="freteStatusV682">—</strong>
      </div>
    `;

    protocolo.insertAdjacentElement(
      'afterend',
      frete
    );
  }

  if (
    !document.getElementById(
      'cobrancasClienteCardV682'
    )
  ) {
    const cobrancas =
      document.createElement(
        'section'
      );

    cobrancas.id =
      'cobrancasClienteCardV682';

    cobrancas.className =
      'cartao cobrancas-cliente-v682';

    cobrancas.innerHTML = `
      <div class="secao-titulo">
        <div>
          <span>Financeiro</span>
          <h3>Resumo das cobranças</h3>
        </div>
        <div class="secao-icone">R$</div>
      </div>

      <div
        id="cobrancasItensV682"
        class="cobrancas-lista-v682"
      ></div>

      <div class="cobrancas-total-v682">
        <span>Total</span>
        <strong id="cobrancasTotalV682">
          R$ 0,00
        </strong>
      </div>

      <div class="cobrancas-resumo-v682">
        <div>
          <span>Total pago</span>
          <strong id="cobrancasPagoV682">
            R$ 0,00
          </strong>
        </div>

        <div>
          <span>Saldo pendente</span>
          <strong id="cobrancasSaldoV682">
            R$ 0,00
          </strong>
        </div>
      </div>
    `;

    const frete =
      document.getElementById(
        'freteClienteCardV682'
      );

    if (frete) {
      frete.insertAdjacentElement(
        'afterend',
        cobrancas
      );
    } else {
      protocolo.insertAdjacentElement(
        'afterend',
        cobrancas
      );
    }
  }

  if (
    !document.getElementById(
      'estilosFinanceiroV682'
    )
  ) {
    const style =
      document.createElement('style');

    style.id =
      'estilosFinanceiroV682';

    style.textContent = `
      .cobrancas-lista-v682 {
        display: grid;
        gap: 10px;
        margin-top: 12px;
      }

      .cobranca-item-v682 {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 10px;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0,0,0,.07);
      }

      .cobranca-item-v682 strong {
        color: var(--texto, #1f2a24);
      }

      .status-cobranca-v682 {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 76px;
        padding: 6px 9px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .04em;
      }

      .status-cobranca-v682.pago {
        color: #08783e;
        background: #edf7f1;
      }

      .status-cobranca-v682.pendente {
        color: #8a5a00;
        background: #fff6df;
      }

      .cobrancas-total-v682 {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        margin-top: 18px;
        padding: 16px;
        border-radius: 14px;
        background: var(--verde-claro, #edf7f1);
      }

      .cobrancas-total-v682 strong {
        font-size: 22px;
        color: var(--verde-escuro, #075f35);
      }

      .cobrancas-resumo-v682 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 12px;
      }

      .cobrancas-resumo-v682 > div {
        padding: 14px;
        border: 1px solid rgba(8,120,62,.10);
        border-radius: 14px;
      }

      .cobrancas-resumo-v682 span {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        color: var(--texto-suave, #657169);
      }

      @media (max-width: 620px) {
        .cobranca-item-v682 {
          grid-template-columns: 1fr auto;
        }

        .cobranca-item-v682 .status-cobranca-v682 {
          grid-column: 1 / -1;
          justify-self: start;
        }

        .cobrancas-resumo-v682 {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }
}


function preencherFreteV682(dados) {
  const card =
    document.getElementById(
      'freteClienteCardV682'
    );

  if (!card) {
    return;
  }

  const frete =
    dados &&
    dados.frete &&
    dados.frete.ativo
      ? dados.frete
      : null;

  if (!frete) {
    card.hidden = true;
    return;
  }

  card.hidden = false;

  definirTextoV652(
    'freteDataV682',
    frete.data || '—'
  );

  definirTextoV652(
    'freteDistanciaV682',
    `${formatarNumeroV682(
      frete.distanciaKm
    )} km`
  );

  definirTextoV652(
    'freteValorKmV682',
    `${frete.valorKm || 'R$ 0,00'}/km`
  );

  definirTextoV652(
    'freteTotalV682',
    frete.total || 'R$ 0,00'
  );

  definirTextoV652(
    'freteStatusV682',
    frete.status || (
      frete.pago
        ? 'Pago'
        : 'Pendente'
    )
  );
}


function preencherCobrancasV682(dados) {
  const container =
    document.getElementById(
      'cobrancasItensV682'
    );

  if (!container) {
    return;
  }

  const cobrancas =
    dados &&
    dados.cobrancas
      ? dados.cobrancas
      : null;

  if (!cobrancas) {
    container.innerHTML =
      '<p class="estado-vazio">Nenhuma cobrança disponível.</p>';

    definirTextoV652(
      'cobrancasTotalV682',
      'R$ 0,00'
    );

    definirTextoV652(
      'cobrancasPagoV682',
      'R$ 0,00'
    );

    definirTextoV652(
      'cobrancasSaldoV682',
      'R$ 0,00'
    );

    return;
  }

  const itens = [
    {
      nome:
        'Protocolo sanitário',
      dados:
        cobrancas.protocolo
    },
    {
      nome:
        'Sanidade',
      dados:
        cobrancas.sanidade
    }
  ];

  if (cobrancas.frete) {
    itens.push({
      nome:
        'Frete',
      dados:
        cobrancas.frete
    });
  }

  container.innerHTML =
    itens.map(
      function(item) {
        const registro =
          item.dados || {};

        const pago =
          Boolean(
            registro.pago
          );

        const status =
          registro.status ||
          (
            pago
              ? 'Pago'
              : 'Pendente'
          );

        return `
          <div class="cobranca-item-v682">
            <span>${escaparHtmlV652(item.nome)}</span>
            <strong>${escaparHtmlV652(
              registro.valor ||
              registro.total ||
              'R$ 0,00'
            )}</strong>
            <span
              class="status-cobranca-v682 ${
                pago
                  ? 'pago'
                  : 'pendente'
              }"
            >
              ${escaparHtmlV652(status)}
            </span>
          </div>
        `;
      }
    ).join('');

  definirTextoV652(
    'cobrancasTotalV682',
    cobrancas.total ||
    'R$ 0,00'
  );

  definirTextoV652(
    'cobrancasPagoV682',
    cobrancas.totalPago ||
    'R$ 0,00'
  );

  definirTextoV652(
    'cobrancasSaldoV682',
    cobrancas.saldo ||
    'R$ 0,00'
  );
}


function formatarNumeroV682(valor) {
  const numero =
    converterNumeroV652(
      valor
    );

  return numero.toLocaleString(
    'pt-BR',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  );
}


/* =========================================================
 * V6.8.6 — PDF / EXCEL
 * Inclui frete, situação dos pagamentos e resumo das
 * cobranças visíveis ao cliente.
 * ======================================================= */

(function instalarExportacoesFinanceirasV686() {
  const htmlPdfOriginal =
    typeof window.montarHtmlPDF === 'function'
      ? window.montarHtmlPDF
      : null;

  const excelOriginal =
    typeof window.montarExcelXml === 'function'
      ? window.montarExcelXml
      : null;

  if (htmlPdfOriginal) {
    window.montarHtmlPDF = function(relatorio) {
      let html =
        htmlPdfOriginal(relatorio);

      const dados =
        relatorio && relatorio.dados
          ? relatorio.dados
          : {};

      const cobrancas =
        dados.cobrancas || {};

      const frete =
        dados.frete ||
        cobrancas.frete ||
        null;

      const protocolo =
        cobrancas.protocolo || {};

      const sanidade =
        cobrancas.sanidade || {};

      const linhasCobrancas = [
        [
          'Protocolo sanitário',
          `${protocolo.valor || dados.custoProtocoloTotal || 'R$ 0,00'} • ${protocolo.status || (protocolo.pago ? 'Pago' : 'Pendente')}`
        ],
        [
          'Sanidade',
          `${sanidade.valor || dados.sanidade?.custoTotal || 'R$ 0,00'} • ${sanidade.status || (sanidade.pago ? 'Pago' : 'Pendente')}`
        ]
      ];

      if (frete && frete.ativo !== false) {
        linhasCobrancas.push([
          'Frete',
          `${frete.total || 'R$ 0,00'} • ${frete.status || (frete.pago ? 'Pago' : 'Pendente')}`
        ]);
      }

      linhasCobrancas.push(
        [
          'Total das cobranças',
          cobrancas.total || 'R$ 0,00'
        ],
        [
          'Total pago',
          cobrancas.totalPago || 'R$ 0,00'
        ],
        [
          'Saldo pendente',
          cobrancas.saldo || 'R$ 0,00'
        ]
      );

      const blocoCobrancas =
        typeof window.tabelaPdf === 'function'
          ? window.tabelaPdf(
              'Resumo das cobranças',
              linhasCobrancas
            )
          : '';

      let blocoFrete = '';

      if (frete && frete.ativo !== false) {
        const distancia =
          converterNumeroV652(
            frete.distanciaKm
          );

        blocoFrete =
          typeof window.tabelaPdf === 'function'
            ? window.tabelaPdf(
                'Frete do lote',
                [
                  [
                    'Data do frete',
                    frete.data || '—'
                  ],
                  [
                    'Distância percorrida',
                    `${distancia.toLocaleString('pt-BR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    })} km`
                  ],
                  [
                    'Valor por km',
                    frete.valorKm
                      ? `${frete.valorKm}/km`
                      : 'R$ 0,00/km'
                  ],
                  [
                    'Total do frete',
                    frete.total || 'R$ 0,00'
                  ],
                  [
                    'Situação',
                    frete.status ||
                    (
                      frete.pago
                        ? 'Pago'
                        : 'Pendente'
                    )
                  ]
                ]
              )
            : '';
      }

      const marcador =
        '<section>\n    <h2>Histórico de tratamentos</h2>';

      if (html.includes(marcador)) {
        html = html.replace(
          marcador,
          `${blocoFrete}${blocoCobrancas}${marcador}`
        );
      } else {
        html = html.replace(
          '<footer>',
          `${blocoFrete}${blocoCobrancas}<footer>`
        );
      }

      return html;
    };
  }

  if (excelOriginal) {
    window.montarExcelXml = function(relatorio) {
      let xml =
        excelOriginal(relatorio);

      const dados =
        relatorio && relatorio.dados
          ? relatorio.dados
          : {};

      const cobrancas =
        dados.cobrancas || {};

      const frete =
        dados.frete ||
        cobrancas.frete ||
        null;

      const protocolo =
        cobrancas.protocolo || {};

      const sanidade =
        cobrancas.sanidade || {};

      const linhas = [];

      if (
        typeof window.linhaExcel === 'function'
      ) {
        linhas.push(
          window.linhaExcel(
            'Protocolo sanitário',
            protocolo.valor ||
            dados.custoProtocoloTotal ||
            'R$ 0,00'
          ),
          window.linhaExcel(
            'Protocolo sanitário - situação',
            protocolo.status ||
            (
              protocolo.pago
                ? 'Pago'
                : 'Pendente'
            )
          ),
          window.linhaExcel(
            'Sanidade',
            sanidade.valor ||
            dados.sanidade?.custoTotal ||
            'R$ 0,00'
          ),
          window.linhaExcel(
            'Sanidade - situação',
            sanidade.status ||
            (
              sanidade.pago
                ? 'Pago'
                : 'Pendente'
            )
          )
        );

        if (
          frete &&
          frete.ativo !== false
        ) {
          linhas.push(
            window.linhaExcel(
              'Frete - data',
              frete.data || ''
            ),
            window.linhaExcelNumero(
              'Frete - distância (km)',
              frete.distanciaKm
            ),
            window.linhaExcelNumero(
              'Frete - valor por km (R$)',
              frete.valorKmNumerico ||
              converterNumeroV652(
                frete.valorKm
              )
            ),
            window.linhaExcelNumero(
              'Frete - total (R$)',
              frete.totalNumerico ||
              converterNumeroV652(
                frete.total
              )
            ),
            window.linhaExcel(
              'Frete - situação',
              frete.status ||
              (
                frete.pago
                  ? 'Pago'
                  : 'Pendente'
              )
            )
          );
        }

        linhas.push(
          window.linhaExcelNumero(
            'Total das cobranças (R$)',
            cobrancas.totalNumerico ||
            converterNumeroV652(
              cobrancas.total
            )
          ),
          window.linhaExcelNumero(
            'Total pago (R$)',
            cobrancas.totalPagoNumerico ||
            converterNumeroV652(
              cobrancas.totalPago
            )
          ),
          window.linhaExcelNumero(
            'Saldo pendente (R$)',
            cobrancas.saldoNumerico ||
            converterNumeroV652(
              cobrancas.saldo
            )
          )
        );
      }

      if (
        linhas.length &&
        typeof window.abaExcel === 'function'
      ) {
        const aba =
          window.abaExcel(
            'Cobrancas',
            linhas,
            2
          );

        xml = xml.replace(
          '</Workbook>',
          `${aba}\n</Workbook>`
        );
      }

      return xml;
    };
  }
})();


/* V6.8.7 — deixa explícito que o %PV é médio do período. */
document.addEventListener('DOMContentLoaded', function() {
  const consumoPv =
    document.getElementById(
      'consumoPV'
    );

  if (!consumoPv) {
    return;
  }

  const linha =
    consumoPv.closest(
      '.linha-dado, .desempenho-linha, .item-dado, div'
    );

  if (!linha) {
    return;
  }

  const rotulos =
    linha.querySelectorAll(
      'span, p, small'
    );

  rotulos.forEach(
    function(elemento) {
      const texto =
        String(
          elemento.textContent || ''
        ).trim();

      if (
        texto.toLowerCase() ===
        'consumo sobre peso vivo'
      ) {
        elemento.textContent =
          'Consumo médio sobre peso vivo';
      }
    }
  );
});
