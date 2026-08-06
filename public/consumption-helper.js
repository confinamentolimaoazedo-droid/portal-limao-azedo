'use strict';

/**
 * Portal do Cliente — V6.7.3
 *
 * Atualizações:
 * - Consumo diário com data e horário;
 * - remove "cabeças tratadas" do card;
 * - transforma os indicadores antigos no card 02 "Resumo do lote";
 * - exibe Consumo de MS com 3 casas decimais no resumo;
 * - preserva protocolo sanitário e custos;
 * - adiciona Histórico de Tratos agrupado por data;
 * - adiciona painel leve de cotações do Boi Gordo B3 via widget oficial do TradingView.
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
  instalarHistoricoTratosV662();
  instalarMercadoBoiGordoV67();
  instalarProtocoloV652();
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


    #historicoTratosCardV662 {
      margin-bottom: 18px;
      padding: 20px;
      border: 1px solid rgba(8,120,62,.10);
      border-radius: 20px;
      background: var(--branco, #fff);
      box-shadow: var(--sombra, 0 14px 38px rgba(13,64,37,.09));
    }

    .historico-tratos-v662 {
      display: grid;
      gap: 13px;
    }

    .historico-dia-v662 {
      overflow: hidden;
      border: 1px solid rgba(8,120,62,.13);
      border-radius: 16px;
      background: #f7fbf8;
    }

    .historico-dia-cabecalho-v662 {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 15px;
      background: var(--verde-claro, #edf7f1);
    }

    .historico-dia-cabecalho-v662 strong {
      color: var(--verde-escuro, #075f35);
      font-size: 15px;
    }

    .historico-dia-cabecalho-v662 span {
      color: var(--muted, #68756d);
      font-size: 12px;
      text-align: right;
    }

    .historico-dia-lista-v662 {
      display: grid;
    }

    .historico-trato-item-v662 {
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 13px 15px;
      border-top: 1px solid rgba(8,120,62,.08);
    }

    .historico-trato-numero-v662 {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: #dff2e7;
      color: var(--verde, #08783e);
      font-weight: 900;
    }

    .historico-trato-conteudo-v662 {
      min-width: 0;
    }

    .historico-trato-topo-v662 {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      color: var(--texto, #1f2a24);
      font-size: 13px;
      font-weight: 800;
    }

    .historico-trato-detalhes-v662 {
      display: flex;
      flex-wrap: wrap;
      gap: 5px 12px;
      margin-top: 5px;
      color: var(--muted, #68756d);
      font-size: 12px;
    }

    .historico-vazio-v662 {
      padding: 18px;
      border: 1px dashed rgba(8,120,62,.25);
      border-radius: 15px;
      color: var(--muted, #68756d);
      text-align: center;
    }





    #mercadoBoiGordoCardV67 {
      margin-bottom: 18px;
      padding: 20px;
      border: 1px solid rgba(8,120,62,.10);
      border-radius: 20px;
      background: var(--branco, #fff);
      box-shadow: var(--sombra, 0 14px 38px rgba(13,64,37,.09));
    }

    .mercado-descricao-v67 {
      margin: -4px 0 15px;
      color: var(--muted, #68756d);
      font-size: 13px;
      line-height: 1.5;
    }

    .mercado-widget-v67 {
      min-height: 420px;
      overflow: hidden;
      border: 1px solid rgba(8,120,62,.13);
      border-radius: 17px;
      background: #fff;
    }

    .mercado-widget-v67 tv-tickers {
      display: block;
      width: 100%;
      min-height: 420px;
    }

    .mercado-aviso-v67 {
      margin: 12px 2px 0;
      color: var(--muted, #68756d);
      font-size: 11px;
      line-height: 1.45;
      text-align: center;
    }

    .mercado-carregando-v673,
    .mercado-erro-v673 {
      min-height: 420px;
      display: grid;
      place-items: center;
      padding: 24px;
      color: var(--muted, #68756d);
      font-size: 13px;
      line-height: 1.5;
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
      #tratosDoDiaCardV66,
      #historicoTratosCardV662,
      #mercadoBoiGordoCardV67 {
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
        <span class="rotulo-v652">03. Automação do trato</span>
        <h3>Consumo diário</h3>
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
        <span class="rotulo-v652">04. Tratos do dia</span>
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


function instalarHistoricoTratosV662() {
  if (
    document.getElementById(
      'historicoTratosCardV662'
    )
  ) {
    return;
  }

  const tratosHoje = document.getElementById(
    'tratosDoDiaCardV66'
  );

  if (!tratosHoje) {
    return;
  }

  const card = document.createElement('section');
  card.id = 'historicoTratosCardV662';
  card.className = 'cartao historico-tratos-v662-card';

  card.innerHTML = `
    <div class="cabecalho-card-v652">
      <div>
        <span class="rotulo-v652">
          05. Histórico de tratos
        </span>
        <h3>Fornecimentos anteriores</h3>
      </div>

      <div
        class="icone-card-v652"
        aria-hidden="true"
      >
        🕒
      </div>
    </div>

    <div
      id="historicoTratosListaV662"
      class="historico-tratos-v662"
    >
      <div class="historico-vazio-v662">
        Nenhum histórico de trato disponível.
      </div>
    </div>
  `;

  tratosHoje.insertAdjacentElement(
    'afterend',
    card
  );
}

function preencherHistoricoTratosV662(dados) {
  const container = document.getElementById(
    'historicoTratosListaV662'
  );

  if (!container) {
    return;
  }

  const historico =
    dados && dados.historicoTratos
      ? dados.historicoTratos
      : null;

  const dias =
    historico && Array.isArray(historico.dias)
      ? historico.dias
      : [];

  if (!dias.length) {
    container.innerHTML = `
      <div class="historico-vazio-v662">
        Nenhum histórico de trato disponível.
      </div>
    `;
    return;
  }

  container.innerHTML = dias
    .map(function(dia) {
      const tratos = Array.isArray(dia.tratos)
        ? dia.tratos
        : [];

      const realizados = Number(
        dia.quantidadeRealizada || tratos.length
      );

      const previstos = Number(
        dia.totalPrevisto || 0
      );

      return `
        <section class="historico-dia-v662">
          <div class="historico-dia-cabecalho-v662">
            <strong>
              ${escaparHtmlV652(dia.data || '—')}
            </strong>

            <span>
              ${escaparHtmlV652(realizados)}
              ${previstos
                ? ` de ${escaparHtmlV652(previstos)}`
                : ''}
              trato(s)
            </span>
          </div>

          <div class="historico-dia-lista-v662">
            ${tratos.map(function(trato) {
              const inicio =
                formatarHoraCurtaV66(
                  trato.horaInicio
                );

              const fim =
                formatarHoraCurtaV66(
                  trato.horaFim
                );

              const horario = [
                inicio,
                fim ? `às ${fim}` : ''
              ].filter(Boolean).join(' ');

              const peso = Number(
                trato.pesoDescarregadoKg || 0
              ).toLocaleString('pt-BR', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
              });

              return `
                <article class="historico-trato-item-v662">
                  <div class="historico-trato-numero-v662">
                    ${escaparHtmlV652(
                      trato.numeroTrato || '—'
                    )}
                  </div>

                  <div class="historico-trato-conteudo-v662">
                    <div class="historico-trato-topo-v662">
                      <span>
                        Trato
                        ${escaparHtmlV652(
                          trato.numeroTrato || '—'
                        )}
                      </span>

                      <span>
                        ${escaparHtmlV652(
                          horario || '—'
                        )}
                      </span>
                    </div>

                    <div class="historico-trato-detalhes-v662">
                      <span>
                        Dieta:
                        <b>
                          ${escaparHtmlV652(
                            trato.dieta || '—'
                          )}
                        </b>
                      </span>

                      <span>
                        Fornecido:
                        <b>
                          ${escaparHtmlV652(peso)} kg
                        </b>
                      </span>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </section>
      `;
    })
    .join('');
}


function instalarMercadoBoiGordoV67() {
  if (
    document.getElementById(
      'mercadoBoiGordoCardV67'
    )
  ) {
    return;
  }

  const card = document.createElement('section');
  card.id = 'mercadoBoiGordoCardV67';
  card.className = 'cartao mercado-boi-gordo-v67';

  card.innerHTML = `
    <div class="cabecalho-card-v652">
      <div>
        <span class="rotulo-v652">
          Mercado
        </span>
        <h3>Cotação do Boi Gordo — B3</h3>
      </div>

      <div
        class="icone-card-v652"
        aria-hidden="true"
      >
        📊
      </div>
    </div>

    <p class="mercado-descricao-v67">
      Preço e variação diária do contrato contínuo
      e dos principais vencimentos do boi gordo na B3.
    </p>

    <div
      id="mercadoWidgetV67"
      class="mercado-widget-v67"
    >
      <div class="mercado-carregando-v673">
        Carregando cotações...
      </div>
    </div>

    <p class="mercado-aviso-v67">
      Dados fornecidos pelo TradingView.
      As cotações podem apresentar atraso.
      Conteúdo exclusivamente informativo.
    </p>
  `;

  const contato = localizarCardContatoV672();

  if (contato && contato.parentNode) {
    contato.parentNode.insertBefore(card, contato);
  } else {
    const telaLote = document.getElementById('telaLote');

    if (telaLote) {
      telaLote.appendChild(card);
    }
  }

  carregarWidgetMercadoV673();
}

function localizarCardContatoV672() {
  const botaoContato = document.querySelector(
    '.botao-contato'
  );

  if (botaoContato) {
    return botaoContato.closest('section');
  }

  const secoes = Array.from(
    document.querySelectorAll('#telaLote section')
  );

  return secoes.find(function(secao) {
    return /fale conosco|contato/i.test(
      secao.textContent || ''
    );
  }) || null;
}

function carregarWidgetMercadoV673() {
  const destino = document.getElementById(
    'mercadoWidgetV67'
  );

  if (!destino || destino.dataset.carregado === 'sim') {
    return;
  }

  destino.dataset.carregado = 'sim';

  carregarScriptTradingViewV673()
    .then(function() {
      destino.innerHTML = '';

      const tickers = document.createElement(
        'tv-tickers'
      );

      tickers.setAttribute(
        'symbols',
        [
          'BMFBOVESPA:BGI1!',
          'BMFBOVESPA:BGIN2026',
          'BMFBOVESPA:BGIQ2026',
          'BMFBOVESPA:BGIU2026',
          'BMFBOVESPA:BGIV2026',
          'BMFBOVESPA:BGIX2026',
          'BMFBOVESPA:BGIZ2026'
        ].join(',')
      );

      tickers.setAttribute(
        'direction',
        'vertical'
      );

      tickers.setAttribute(
        'item-size',
        'compact'
      );

      tickers.setAttribute('hide-chart', '');
      tickers.setAttribute('color-theme', 'light');
      tickers.setAttribute('locale', 'br');

      destino.appendChild(tickers);
    })
    .catch(function() {
      destino.innerHTML = `
        <div class="mercado-erro-v673">
          Não foi possível carregar as cotações neste momento.
          Verifique a conexão e atualize a página.
        </div>
      `;
    });
}

function carregarScriptTradingViewV673() {
  if (
    window.customElements &&
    customElements.get('tv-tickers')
  ) {
    return Promise.resolve();
  }

  const existente = document.querySelector(
    'script[data-tradingview-tickers-v673]'
  );

  if (existente) {
    return new Promise(function(resolve, reject) {
      const limite = Date.now() + 12000;

      function verificar() {
        if (
          window.customElements &&
          customElements.get('tv-tickers')
        ) {
          resolve();
          return;
        }

        if (Date.now() >= limite) {
          reject(
            new Error('Tempo limite do TradingView.')
          );
          return;
        }

        window.setTimeout(verificar, 250);
      }

      verificar();
    });
  }

  return new Promise(function(resolve, reject) {
    const script = document.createElement('script');

    script.type = 'module';
    script.src =
      'https://widgets.tradingview-widget.com/' +
      'w/en/tv-tickers.js';

    script.dataset.tradingviewTickersV673 = 'sim';

    script.onload = function() {
      if (
        window.customElements &&
        customElements.get('tv-tickers')
      ) {
        resolve();
        return;
      }

      customElements
        .whenDefined('tv-tickers')
        .then(resolve)
        .catch(reject);
    };

    script.onerror = reject;

    document.head.appendChild(script);
  });
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
    preencherHistoricoTratosV662(dados);
    preencherProtocoloSanitarioV652(dados);
  };

  envolvida.__v652 = true;
  window.preencherTelaLote = envolvida;
}

function preencherConsumoV652(dados) {
  const consumo = dados?.consumoAutomacao || null;

  if (!consumo) {
    definirTextoV652('consumoNaturalAutomacao', '—');
    definirTextoV652('consumoMSAutomacao', '—');
    definirTextoV652(
      'consumoAutomacaoData',
      'Sem importação disponível'
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

  const data = consumo.data || '—';
  const atualizado = String(consumo.atualizadoEm || '').trim();
  const horarioMatch = atualizado.match(/(\d{2}:\d{2})$/);
  const horario = horarioMatch ? horarioMatch[1] : '';

  definirTextoV652(
    'consumoAutomacaoData',
    horario
      ? `Dados de ${data} às ${horario}`
      : `Dados de ${data}`
  );

  // O card de resumo usa exatamente o mesmo valor, com 3 casas.
  definirTextoV652(
    'consumoMS',
    `${ms} kg`
  );
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