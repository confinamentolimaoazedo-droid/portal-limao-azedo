'use strict';

let pesoEntradaNumerico = 0;
let pesoFinalNumerico = 0;
let dadosLoteAtual = null;

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('formLogin');
  const voltar = document.getElementById('botaoVoltar');
  const rendimento = document.getElementById('rendimentoCarcaca');
  const exportarPdf = document.getElementById('botaoExportarPdf');
  const exportarExcel = document.getElementById('botaoExportarExcel');

  form.addEventListener('submit', consultarLote);
  voltar.addEventListener('click', voltarParaLogin);
  rendimento.addEventListener('change', atualizarResultadoCarcacaFinal);
  exportarPdf.addEventListener('click', exportarLotePDF);
  exportarExcel.addEventListener('click', exportarLoteExcel);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(function(erro) {
        console.error('Falha ao registrar PWA:', erro);
      });
  }
});

async function consultarLote(evento) {
  evento.preventDefault();
  limparMensagem();

  const curral = document.getElementById('curral').value.trim();
  const carimbo = document.getElementById('carimbo').value.trim();

  if (!curral || !carimbo) {
    mostrarMensagem('Informe o curral e o carimbo.');
    return;
  }

  alterarEstadoCarregamento(true);

  try {
    const resposta = await fetch('/api/consultar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store',
      body: JSON.stringify({ curral, carimbo })
    });

    let dados;

    try {
      dados = await resposta.json();
    } catch {
      throw new Error(
        'A consulta retornou uma resposta inválida.'
      );
    }

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(
        dados.mensagem ||
        'Não foi possível consultar o lote.'
      );
    }

    if (!dados.resultado) {
      throw new Error(
        'Lote não encontrado. Confira o curral e o carimbo.'
      );
    }

    preencherTelaLote(dados.resultado);
    abrirTelaLote();
  } catch (erro) {
    mostrarMensagem(
      erro && erro.message
        ? erro.message
        : 'Não foi possível consultar o lote.'
    );

    console.error(erro);
  } finally {
    alterarEstadoCarregamento(false);
  }
}

function preencherTelaLote(dados) {
  dadosLoteAtual = dados;

  definirTexto(
    'clienteNome',
    dados.cliente,
    'Cliente não informado'
  );

  definirTexto(
    'loteNome',
    dados.lote,
    'Lote não informado'
  );

  definirTexto(
    'pesoEstimado',
    formatarNumeroExibicao(dados.pesoEstimado)
  );

  definirTexto('cabecasAtuais', dados.cabecasAtuais);
  definirTexto('diasConfinados', dados.diasConfinados);
  definirTexto('diasRestantes', dados.diasRestantes);

  definirTexto(
    'consumoMS',
    adicionarUnidade(
      formatarNumeroExibicao(dados.consumoMS),
      'kg'
    )
  );

  definirTexto('dietaAtual', dados.dieta);

  definirTexto(
    'gmdProjetado',
    adicionarUnidade(
      formatarNumeroExibicao(dados.gmdProjetado),
      'kg/dia'
    )
  );

  definirTexto('modalidadeLote', dados.modalidade);

  definirTexto(
    'pesoEntrada',
    adicionarUnidade(
      formatarNumeroExibicao(dados.pesoEntrada),
      'kg'
    )
  );

  definirTexto(
    'ganhoTotalKg',
    adicionarUnidade(
      formatarNumeroExibicao(dados.ganhoTotalKg),
      'kg'
    )
  );

  definirTexto('consumoPV', dados.consumoPV);

  definirTexto(
    'pesoFinalProjetado',
    adicionarUnidade(
      formatarNumeroExibicao(dados.pesoFinalProjetado),
      'kg'
    )
  );

  definirTexto(
    'arrobaFinalProjetada',
    adicionarUnidade(
      formatarNumeroExibicao(dados.arrobaFinalProjetada),
      '@'
    )
  );

  pesoEntradaNumerico = converterNumero(dados.pesoEntrada);
  pesoFinalNumerico = converterNumero(
    dados.pesoFinalProjetado
  );

  atualizarResultadoCarcacaFinal();

  definirTexto('curralResultado', dados.curral);
  definirTexto('carimboResultado', dados.carimbo);
  definirTexto('cabecasIniciais', dados.cabecasIniciais);
  definirTexto('mortes', dados.mortes);
  definirTexto('mortalidade', dados.mortalidade);
  definirTexto('dataEntrada', dados.dataEntrada);
  definirTexto('dataAbate', dados.dataAbate);

  preencherSaudeDoLote(dados);
  preencherProtocoloSanitario(dados);
  preencherHistoricoTratamentos(dados);
  preencherGraficos(dados);

  atualizarStatus(dados.status);
  atualizarProgresso(dados);
}

function atualizarResultadoCarcacaFinal() {
  const seletor = document.getElementById(
    'rendimentoCarcaca'
  );

  const rendimento = seletor
    ? Number(seletor.value)
    : 50;

  if (!pesoFinalNumerico || pesoFinalNumerico <= 0) {
    definirTexto('carcacaFinalKg', '—');
    definirTexto('carcacaFinalArrobas', '—');
    return;
  }

  const pesoCarcaca =
    pesoFinalNumerico * (rendimento / 100);

  const arrobasCarcaca = pesoCarcaca / 15;

  definirTexto(
    'carcacaFinalKg',
    `${formatarNumero(pesoCarcaca, 2)} kg`
  );

  definirTexto(
    'carcacaFinalArrobas',
    `${formatarNumero(arrobasCarcaca, 2)} @`
  );
}

function preencherSaudeDoLote(dados) {
  const sanidade = dados.sanidade || {};

  definirTexto(
    'animaisDoentes',
    dados.animaisDoentes || '0'
  );

  definirTexto(
    'animaisEnfermaria',
    dados.animaisEnfermaria || '0'
  );

  definirTexto(
    'tratamentosRealizados',
    sanidade.quantidadeRegistros || '0'
  );

  definirTexto(
    'animaisTratados',
    sanidade.totalAnimaisTratados || '0'
  );

  definirTexto(
    'custoSanitarioTotal',
    sanidade.custoTotal || 'R$ 0,00'
  );
}

function preencherProtocoloSanitario(dados) {
  const lista = document.getElementById(
    'listaProtocoloSanitario'
  );

  const protocolo = Array.isArray(
    dados.protocoloSanitario
  )
    ? dados.protocoloSanitario
    : [];

  lista.innerHTML = '';

  if (!protocolo.length) {
    lista.innerHTML = `
      <p class="estado-vazio">
        Nenhum protocolo sanitário cadastrado.
      </p>
    `;
  } else {
    protocolo.forEach(function(item) {
      const procedimento =
        item.procedimento || 'Procedimento';

      const produto =
        item.produto || 'Produto não informado';

      const dose = String(item.dose || '').trim();
      const unidade = String(item.unidade || '').trim();

      const detalhes = [
        produto,
        dose && unidade
          ? `${dose} ${unidade}`
          : dose || unidade
      ].filter(Boolean).join(' • ');

      const elemento = document.createElement('article');
      elemento.className = 'item-protocolo';

      elemento.innerHTML = `
        <div class="item-protocolo-check">✓</div>
        <div class="item-protocolo-conteudo">
          <strong>${escaparHtml(procedimento)}</strong>
          <span>${escaparHtml(detalhes)}</span>
        </div>
      `;

      lista.appendChild(elemento);
    });
  }

  definirTexto(
    'custoProtocoloPorAnimal',
    dados.custoProtocoloPorAnimal || 'R$ 22,00'
  );

  definirTexto(
    'custoProtocoloTotal',
    dados.custoProtocoloTotal || '—'
  );
}

function preencherHistoricoTratamentos(dados) {
  const historico = document.getElementById(
    'historicoTratamentos'
  );

  const sanidade = dados.sanidade || {};

  const tratamentos = Array.isArray(
    sanidade.tratamentos
  )
    ? sanidade.tratamentos
    : [];

  historico.innerHTML = '';

  if (!tratamentos.length) {
    historico.innerHTML = `
      <p class="estado-vazio">
        Nenhum tratamento registrado para este lote.
      </p>
    `;
    return;
  }

  tratamentos.forEach(function(item) {
    const elemento = document.createElement('article');
    elemento.className = 'tratamento-item';

    const observacoes = String(
      item.observacoes || ''
    ).trim();

    elemento.innerHTML = `
      <div class="tratamento-topo">
        <div>
          <strong>
            ${escaparHtml(
              item.produto || 'Produto não informado'
            )}
          </strong>

          <span>
            ${escaparHtml(
              item.data || 'Data não informada'
            )}
          </span>
        </div>

        <strong class="tratamento-custo">
          ${escaparHtml(
            item.custoTotal || 'R$ 0,00'
          )}
        </strong>
      </div>

      <div class="tratamento-dados">
        <div class="tratamento-dado">
          <span>Animais tratados</span>
          <strong>
            ${escaparHtml(item.quantidadeAnimais || '0')}
          </strong>
        </div>

        <div class="tratamento-dado">
          <span>Dose por animal</span>
          <strong>
            ${escaparHtml(
              adicionarUnidade(item.dosePorAnimal, 'ml')
            )}
          </strong>
        </div>

        <div class="tratamento-dado">
          <span>Volume total</span>
          <strong>
            ${escaparHtml(
              adicionarUnidade(item.volumeTotal, 'ml')
            )}
          </strong>
        </div>

        <div class="tratamento-dado">
          <span>Motivo</span>
          <strong>
            ${escaparHtml(item.motivo || 'Não informado')}
          </strong>
        </div>
      </div>

      ${
        observacoes
          ? `<p class="tratamento-observacao">
               ${escaparHtml(observacoes)}
             </p>`
          : ''
      }
    `;

    historico.appendChild(elemento);
  });
}

function preencherGraficos(dados) {
  const sanidade = dados.sanidade || {};

  criarGraficoBarras('graficoPeso', [
    {
      rotulo: 'Entrada',
      valor: converterNumero(dados.pesoEntrada),
      exibicao: adicionarUnidade(
        formatarNumeroExibicao(dados.pesoEntrada),
        'kg'
      )
    },
    {
      rotulo: 'Atual',
      valor: converterNumero(dados.pesoEstimado),
      exibicao: adicionarUnidade(
        formatarNumeroExibicao(dados.pesoEstimado),
        'kg'
      )
    },
    {
      rotulo: 'Projetado',
      valor: converterNumero(dados.pesoFinalProjetado),
      exibicao: adicionarUnidade(
        formatarNumeroExibicao(
          dados.pesoFinalProjetado
        ),
        'kg'
      )
    }
  ]);

  const custoProtocolo = converterNumero(
    dados.custoProtocoloTotal
  );

  const custoTratamentos = converterNumero(
    sanidade.custoTotalNumerico ||
    sanidade.custoTotal
  );

  criarGraficoBarras('graficoCustos', [
    {
      rotulo: 'Protocolo',
      valor: custoProtocolo,
      exibicao: formatarMoeda(custoProtocolo)
    },
    {
      rotulo: 'Tratamentos',
      valor: custoTratamentos,
      exibicao: formatarMoeda(custoTratamentos)
    },
    {
      rotulo: 'Total',
      valor: custoProtocolo + custoTratamentos,
      exibicao: formatarMoeda(
        custoProtocolo + custoTratamentos
      )
    }
  ]);

  const cabecasAtuais = converterNumero(
    dados.cabecasAtuais
  );

  const animaisDoentes = converterNumero(
    dados.animaisDoentes
  );

  const animaisEnfermaria = converterNumero(
    dados.animaisEnfermaria
  );

  const animaisSaudaveis = Math.max(
    0,
    cabecasAtuais - animaisDoentes
  );

  criarGraficoBarras('graficoSaude', [
    {
      rotulo: 'Saudáveis',
      valor: animaisSaudaveis,
      exibicao: String(animaisSaudaveis)
    },
    {
      rotulo: 'Doentes',
      valor: animaisDoentes,
      exibicao: String(animaisDoentes)
    },
    {
      rotulo: 'Enfermaria',
      valor: animaisEnfermaria,
      exibicao: String(animaisEnfermaria)
    }
  ]);
}

function criarGraficoBarras(id, itens) {
  const container = document.getElementById(id);

  const maiorValor = Math.max(
    1,
    ...itens.map(function(item) {
      return Number(item.valor) || 0;
    })
  );

  container.innerHTML = '';

  itens.forEach(function(item) {
    const valor = Number(item.valor) || 0;

    const percentual = Math.max(
      valor > 0 ? 5 : 0,
      Math.min(100, (valor / maiorValor) * 100)
    );

    const linha = document.createElement('div');
    linha.className = 'grafico-linha';

    linha.innerHTML = `
      <div class="grafico-linha-topo">
        <span>${escaparHtml(item.rotulo)}</span>
        <strong>${escaparHtml(item.exibicao)}</strong>
      </div>

      <div class="grafico-trilho">
        <div
          class="grafico-preenchimento"
          style="width: ${percentual}%"
        ></div>
      </div>
    `;

    container.appendChild(linha);
  });
}

function atualizarProgresso(dados) {
  const diasConfinados = converterNumero(
    dados.diasConfinados
  );

  const diasRestantes = converterNumero(
    dados.diasRestantes
  );

  const total = Math.max(
    0,
    diasConfinados + diasRestantes
  );

  let percentual = 0;

  if (total > 0) {
    percentual = Math.round(
      (diasConfinados / total) * 100
    );
  } else if (
    String(dados.status || '')
      .toLowerCase()
      .includes('encerr')
  ) {
    percentual = 100;
  }

  percentual = Math.min(
    100,
    Math.max(0, percentual)
  );

  definirTexto(
    'progressoTexto',
    `${diasConfinados || 0} de ${total || 0} dias`
  );

  definirTexto(
    'progressoPercentual',
    `${percentual}%`
  );

  definirTexto(
    'dataEntradaResumo',
    `Entrada: ${dados.dataEntrada || '—'}`
  );

  definirTexto(
    'dataAbateResumo',
    `Abate: ${dados.dataAbate || '—'}`
  );

  document.getElementById(
    'barraProgressoPreenchimento'
  ).style.width = `${percentual}%`;
}

function atualizarStatus(status) {
  const elemento = document.getElementById(
    'statusLote'
  );

  const texto = String(
    status || 'Ativo'
  ).trim();

  elemento.textContent = texto;

  elemento.className = texto
    .toLowerCase()
    .includes('encerr')
      ? 'status encerrado'
      : 'status ativo';
}

function abrirTelaLote() {
  document.getElementById(
    'telaLogin'
  ).classList.remove('ativa');

  document.getElementById(
    'telaLote'
  ).classList.add('ativa');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function voltarParaLogin() {
  document.getElementById(
    'telaLote'
  ).classList.remove('ativa');

  document.getElementById(
    'telaLogin'
  ).classList.add('ativa');

  limparMensagem();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function mostrarMensagem(texto) {
  const mensagem = document.getElementById(
    'mensagemLogin'
  );

  mensagem.textContent = texto;
  mensagem.className = 'mensagem erro';
}

function limparMensagem() {
  const mensagem = document.getElementById(
    'mensagemLogin'
  );

  mensagem.textContent = '';
  mensagem.className = 'mensagem';
}

function alterarEstadoCarregamento(estaCarregando) {
  const botao = document.getElementById(
    'botaoEntrar'
  );

  const texto = document.getElementById(
    'textoBotao'
  );

  const spinnerBotao = document.getElementById(
    'carregandoBotao'
  );

  const carregamentoTela = document.getElementById(
    'carregamentoTela'
  );

  botao.disabled = estaCarregando;

  texto.textContent = estaCarregando
    ? 'Consultando...'
    : 'Acessar meu lote';

  spinnerBotao.classList.toggle(
    'oculto',
    !estaCarregando
  );

  carregamentoTela.classList.toggle(
    'oculto',
    !estaCarregando
  );
}

function converterNumero(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return 0;
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0;
  }

  let texto = String(valor)
    .trim()
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')
    .replace(/[^0-9,.-]/g, '');

  if (!texto) {
    return 0;
  }

  const possuiVirgula = texto.includes(',');
  const possuiPonto = texto.includes('.');

  if (possuiVirgula && possuiPonto) {
    if (
      texto.lastIndexOf(',') >
      texto.lastIndexOf('.')
    ) {
      texto = texto
        .replace(/\./g, '')
        .replace(',', '.');
    } else {
      texto = texto.replace(/,/g, '');
    }
  } else if (possuiVirgula) {
    texto = texto.replace(',', '.');
  }

  const resultado = Number(texto);

  return Number.isFinite(resultado)
    ? resultado
    : 0;
}

function formatarNumero(valor, casasDecimais) {
  return Number(valor || 0).toLocaleString(
    'pt-BR',
    {
      minimumFractionDigits: casasDecimais,
      maximumFractionDigits: casasDecimais
    }
  );
}

function formatarNumeroExibicao(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return '';
  }

  const numero = converterNumero(valor);

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  );
}

function definirTexto(
  id,
  valor,
  valorPadrao = '—'
) {
  const elemento = document.getElementById(id);

  const valorTratado = String(
    valor ?? ''
  ).trim();

  elemento.textContent =
    valorTratado || valorPadrao;
}

function adicionarUnidade(valor, unidade) {
  const texto = String(valor ?? '').trim();

  if (!texto) {
    return '—';
  }

  if (
    texto
      .toLowerCase()
      .includes(unidade.toLowerCase())
  ) {
    return texto;
  }

  return `${texto} ${unidade}`;
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =========================================================
 * EXPORTAÇÃO
 * ======================================================= */

function obterRelatorioAtual() {
  if (!dadosLoteAtual) {
    alert('Consulte um lote antes de exportar.');
    return null;
  }

  const dados = dadosLoteAtual;
  const sanidade = dados.sanidade || {};

  const protocolo = Array.isArray(
    dados.protocoloSanitario
  )
    ? dados.protocoloSanitario
    : [];

  const tratamentos = Array.isArray(
    sanidade.tratamentos
  )
    ? sanidade.tratamentos
    : [];

  const rendimento = Number(
    document.getElementById(
      'rendimentoCarcaca'
    ).value
  ) || 50;

  const pesoFinal = converterNumero(
    dados.pesoFinalProjetado
  );

  const pesoCarcaca =
    pesoFinal * (rendimento / 100);

  return {
    dados,
    sanidade,
    protocolo,
    tratamentos,
    rendimento,
    pesoFinal,
    pesoCarcaca,
    arrobasCarcaca: pesoCarcaca / 15,
    geradoEm: new Date().toLocaleString('pt-BR')
  };
}

function exportarLotePDF() {
  const relatorio = obterRelatorioAtual();

  if (!relatorio) {
    return;
  }

  const janela = window.open('', '_blank');

  if (!janela) {
    alert(
      'Permita pop-ups para gerar o relatório em PDF.'
    );
    return;
  }

  janela.document.open();
  janela.document.write(
    montarHtmlPDF(relatorio)
  );
  janela.document.close();
}

function montarHtmlPDF(relatorio) {
  const { dados, sanidade } = relatorio;

  const protocoloHtml = relatorio.protocolo.length
    ? relatorio.protocolo.map(function(item) {
        return `
          <tr>
            <td>${escaparHtml(
              item.procedimento || 'Procedimento'
            )}</td>
            <td>${escaparHtml(
              item.produto || '—'
            )}</td>
            <td>${escaparHtml(
              [
                item.dose || '',
                item.unidade || ''
              ].filter(Boolean).join(' ')
            )}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="3">Nenhum protocolo cadastrado.</td></tr>';

  const tratamentosHtml = relatorio.tratamentos.length
    ? relatorio.tratamentos.map(function(item) {
        return `
          <tr>
            <td>${escaparHtml(item.data || '—')}</td>
            <td>${escaparHtml(item.produto || '—')}</td>
            <td>${escaparHtml(
              item.quantidadeAnimais || '0'
            )}</td>
            <td>${escaparHtml(
              adicionarUnidade(
                item.dosePorAnimal,
                'ml'
              )
            )}</td>
            <td>${escaparHtml(
              item.custoTotal || 'R$ 0,00'
            )}</td>
            <td>${escaparHtml(
              item.motivo || '—'
            )}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="6">Nenhum tratamento registrado.</td></tr>';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório ${escaparHtml(dados.lote || '')}</title>

  <style>
    @page {
      size: A4;
      margin: 13mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #1f2a24;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
      line-height: 1.4;
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      padding-bottom: 11px;
      margin-bottom: 14px;
      border-bottom: 3px solid #08783e;
    }

    h1 {
      margin: 0;
      color: #075f35;
      font-size: 21px;
    }

    header p {
      margin: 4px 0 0;
      color: #68756d;
    }

    .status {
      height: max-content;
      padding: 7px 10px;
      border-radius: 8px;
      background: #edf7f1;
      color: #075f35;
      font-weight: 700;
    }

    .resumo {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 7px;
      margin-bottom: 14px;
    }

    .resumo div {
      padding: 8px;
      border: 1px solid #dfe9e3;
      border-radius: 7px;
      background: #f7faf8;
    }

    .resumo span {
      display: block;
      color: #68756d;
      font-size: 8px;
      text-transform: uppercase;
    }

    .resumo strong {
      display: block;
      margin-top: 3px;
      color: #075f35;
      font-size: 11px;
    }

    section {
      margin-bottom: 13px;
      break-inside: avoid;
    }

    h2 {
      margin: 0 0 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #dfe9e3;
      color: #075f35;
      font-size: 13px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    td,
    th {
      padding: 5px 6px;
      border: 1px solid #dfe9e3;
      vertical-align: top;
      text-align: left;
    }

    th {
      background: #075f35;
      color: #ffffff;
      font-size: 8px;
    }

    .dados td:first-child {
      width: 47%;
      background: #f7faf8;
      color: #5d6961;
      font-weight: 700;
    }

    footer {
      margin-top: 15px;
      padding-top: 8px;
      border-top: 1px solid #dfe9e3;
      color: #68756d;
      font-size: 8px;
      text-align: center;
    }
  </style>
</head>

<body>
  <header>
    <div>
      <h1>Limão Azedo Confinamento</h1>
      <p>Relatório de acompanhamento do lote</p>
    </div>

    <div class="status">
      ${escaparHtml(dados.status || 'Ativo')}
    </div>
  </header>

  <div class="resumo">
    <div>
      <span>Cliente</span>
      <strong>${escaparHtml(dados.cliente || '—')}</strong>
    </div>

    <div>
      <span>Lote</span>
      <strong>${escaparHtml(dados.lote || '—')}</strong>
    </div>

    <div>
      <span>Curral</span>
      <strong>${escaparHtml(dados.curral || '—')}</strong>
    </div>

    <div>
      <span>Carimbo</span>
      <strong>${escaparHtml(dados.carimbo || '—')}</strong>
    </div>
  </div>

  ${tabelaPdf('Dados do confinamento', [
    ['Data de entrada', dados.dataEntrada],
    ['Previsão de abate', dados.dataAbate],
    ['Dias confinados', dados.diasConfinados],
    ['Dias restantes', dados.diasRestantes],
    ['Cabeças iniciais', dados.cabecasIniciais],
    ['Cabeças atuais', dados.cabecasAtuais],
    ['Mortes', dados.mortes],
    ['Mortalidade', dados.mortalidade],
    ['Dieta', dados.dieta],
    ['Modalidade', dados.modalidade]
  ])}

  ${tabelaPdf('Desempenho e projeção', [
    [
      'Peso médio de entrada',
      `${formatarNumero(
        converterNumero(dados.pesoEntrada),
        2
      )} kg`
    ],
    [
      'Peso estimado atual',
      `${formatarNumero(
        converterNumero(dados.pesoEstimado),
        2
      )} kg`
    ],
    [
      'GMD projetado',
      `${formatarNumero(
        converterNumero(dados.gmdProjetado),
        2
      )} kg/dia`
    ],
    [
      'Ganho total estimado',
      `${formatarNumero(
        converterNumero(dados.ganhoTotalKg),
        2
      )} kg`
    ],
    [
      'Consumo de MS',
      `${formatarNumero(
        converterNumero(dados.consumoMS),
        2
      )} kg`
    ],
    ['Consumo sobre peso vivo', dados.consumoPV],
    [
      'Peso vivo final projetado',
      `${formatarNumero(relatorio.pesoFinal, 2)} kg`
    ],
    [
      'Arrobas vivas equivalentes',
      `${formatarNumero(
        converterNumero(dados.arrobaFinalProjetada),
        2
      )} @`
    ],
    [
      'Rendimento de carcaça',
      `${relatorio.rendimento}%`
    ],
    [
      'Peso de carcaça projetado',
      `${formatarNumero(
        relatorio.pesoCarcaca,
        2
      )} kg`
    ],
    [
      'Arrobas de carcaça projetadas',
      `${formatarNumero(
        relatorio.arrobasCarcaca,
        2
      )} @`
    ]
  ])}

  ${tabelaPdf('Resumo sanitário', [
    ['Animais doentes', dados.animaisDoentes],
    ['Animais na enfermaria', dados.animaisEnfermaria],
    [
      'Tratamentos realizados',
      sanidade.quantidadeRegistros || 0
    ],
    [
      'Animais tratados',
      sanidade.totalAnimaisTratados || 0
    ],
    [
      'Custo dos tratamentos',
      sanidade.custoTotal || 'R$ 0,00'
    ],
    [
      'Protocolo por animal',
      dados.custoProtocoloPorAnimal
    ],
    [
      'Protocolo total',
      dados.custoProtocoloTotal
    ]
  ])}

  <section>
    <h2>Protocolo sanitário</h2>
    <table>
      <thead>
        <tr>
          <th>Procedimento</th>
          <th>Produto</th>
          <th>Dose</th>
        </tr>
      </thead>
      <tbody>
        ${protocoloHtml}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Histórico de tratamentos</h2>
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Produto</th>
          <th>Animais</th>
          <th>Dose</th>
          <th>Custo</th>
          <th>Motivo</th>
        </tr>
      </thead>
      <tbody>
        ${tratamentosHtml}
      </tbody>
    </table>
  </section>

  <footer>
    Relatório gerado em ${escaparHtml(relatorio.geradoEm)}.
    Pesos e resultados são estimativas.
  </footer>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 300);
    });
  </script>
</body>
</html>`;
}

function tabelaPdf(titulo, linhas) {
  return `
    <section>
      <h2>${escaparHtml(titulo)}</h2>
      <table class="dados">
        <tbody>
          ${linhas.map(function(linha) {
            return `
              <tr>
                <td>${escaparHtml(linha[0])}</td>
                <td>${escaparHtml(
                  linha[1] === undefined ||
                  linha[1] === null ||
                  linha[1] === ''
                    ? '—'
                    : linha[1]
                )}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function exportarLoteExcel() {
  const relatorio = obterRelatorioAtual();

  if (!relatorio) {
    return;
  }

  const xml = montarExcelXml(relatorio);

  const nome = [
    'relatorio',
    nomeSeguro(relatorio.dados.cliente),
    nomeSeguro(relatorio.dados.lote)
  ].filter(Boolean).join('_');

  baixarArquivo(
    xml,
    'application/vnd.ms-excel;charset=utf-8',
    `${nome}.xls`
  );
}

function montarExcelXml(relatorio) {
  const dados = relatorio.dados;
  const sanidade = relatorio.sanidade;

  const identificacao = [
    linhaExcel('Cliente', dados.cliente),
    linhaExcel('Lote', dados.lote),
    linhaExcel('Curral', dados.curral),
    linhaExcel('Carimbo', dados.carimbo),
    linhaExcel('Status', dados.status),
    linhaExcel('Relatório gerado em', relatorio.geradoEm)
  ];

  const confinamento = [
    linhaExcel('Data de entrada', dados.dataEntrada),
    linhaExcel('Previsão de abate', dados.dataAbate),
    linhaExcelNumero('Dias confinados', dados.diasConfinados),
    linhaExcelNumero('Dias restantes', dados.diasRestantes),
    linhaExcelNumero('Cabeças iniciais', dados.cabecasIniciais),
    linhaExcelNumero('Cabeças atuais', dados.cabecasAtuais),
    linhaExcelNumero('Mortes', dados.mortes),
    linhaExcel('Mortalidade', dados.mortalidade),
    linhaExcel('Dieta', dados.dieta),
    linhaExcel('Modalidade', dados.modalidade)
  ];

  const desempenho = [
    linhaExcelNumero('Peso de entrada (kg)', dados.pesoEntrada),
    linhaExcelNumero('Peso estimado atual (kg)', dados.pesoEstimado),
    linhaExcelNumero('GMD projetado (kg/dia)', dados.gmdProjetado),
    linhaExcelNumero('Ganho total (kg)', dados.ganhoTotalKg),
    linhaExcelNumero('Consumo MS (kg)', dados.consumoMS),
    linhaExcel('Consumo sobre peso vivo', dados.consumoPV),
    linhaExcelNumero(
      'Peso final projetado (kg)',
      relatorio.pesoFinal
    ),
    linhaExcelNumero(
      'Arrobas vivas equivalentes',
      dados.arrobaFinalProjetada
    ),
    linhaExcelNumero(
      'Rendimento de carcaça (%)',
      relatorio.rendimento
    ),
    linhaExcelNumero(
      'Peso de carcaça projetado (kg)',
      relatorio.pesoCarcaca
    ),
    linhaExcelNumero(
      'Arrobas de carcaça projetadas',
      relatorio.arrobasCarcaca
    )
  ];

  const sanitario = [
    linhaExcelNumero('Animais doentes', dados.animaisDoentes),
    linhaExcelNumero(
      'Animais na enfermaria',
      dados.animaisEnfermaria
    ),
    linhaExcelNumero(
      'Tratamentos realizados',
      sanidade.quantidadeRegistros
    ),
    linhaExcelNumero(
      'Animais tratados',
      sanidade.totalAnimaisTratados
    ),
    linhaExcel(
      'Custo dos tratamentos',
      sanidade.custoTotal
    ),
    linhaExcel(
      'Protocolo por animal',
      dados.custoProtocoloPorAnimal
    ),
    linhaExcel(
      'Protocolo total',
      dados.custoProtocoloTotal
    )
  ];

  const protocolo = [
    linhaCabecalhoExcel([
      'Procedimento',
      'Produto',
      'Dose',
      'Unidade'
    ])
  ];

  relatorio.protocolo.forEach(function(item) {
    protocolo.push(
      linhaValoresExcel([
        item.procedimento,
        item.produto,
        item.dose,
        item.unidade
      ])
    );
  });

  const tratamentos = [
    linhaCabecalhoExcel([
      'Data',
      'Produto',
      'Animais',
      'Dose por animal (ml)',
      'Volume total (ml)',
      'Custo total',
      'Motivo',
      'Observações'
    ])
  ];

  relatorio.tratamentos.forEach(function(item) {
    tratamentos.push(`
      <Row>
        ${celulaExcel(item.data)}
        ${celulaExcel(item.produto)}
        ${celulaExcelNumero(item.quantidadeAnimais)}
        ${celulaExcelNumero(item.dosePorAnimal)}
        ${celulaExcelNumero(item.volumeTotal)}
        ${celulaExcel(item.custoTotal)}
        ${celulaExcel(item.motivo)}
        ${celulaExcel(item.observacoes)}
      </Row>
    `);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Font ss:FontName="Arial" ss:Size="10"/>
    </Style>
  </Styles>

  ${abaExcel('Identificacao', identificacao, 2)}
  ${abaExcel('Confinamento', confinamento, 2)}
  ${abaExcel('Desempenho', desempenho, 2)}
  ${abaExcel('Sanidade', sanitario, 2)}
  ${abaExcel('Protocolo', protocolo, 4)}
  ${abaExcel('Tratamentos', tratamentos, 8)}
</Workbook>`;
}

function abaExcel(nome, linhas, colunas) {
  return `
    <Worksheet ss:Name="${xmlSeguro(nome)}">
      <Table ss:ExpandedColumnCount="${colunas}">
        ${linhas.join('')}
      </Table>
    </Worksheet>
  `;
}

function linhaExcel(rotulo, valor) {
  return `
    <Row>
      ${celulaExcel(rotulo)}
      ${celulaExcel(valor)}
    </Row>
  `;
}

function linhaExcelNumero(rotulo, valor) {
  return `
    <Row>
      ${celulaExcel(rotulo)}
      ${celulaExcelNumero(valor)}
    </Row>
  `;
}

function linhaCabecalhoExcel(valores) {
  return linhaValoresExcel(valores);
}

function linhaValoresExcel(valores) {
  return `
    <Row>
      ${valores.map(celulaExcel).join('')}
    </Row>
  `;
}

function celulaExcel(valor) {
  return `
    <Cell>
      <Data ss:Type="String">
        ${xmlSeguro(valor)}
      </Data>
    </Cell>
  `;
}

function celulaExcelNumero(valor) {
  return `
    <Cell>
      <Data ss:Type="Number">
        ${converterNumero(valor)}
      </Data>
    </Cell>
  `;
}

function xmlSeguro(valor) {
  return escaparHtml(
    valor === undefined ||
    valor === null
      ? ''
      : valor
  );
}

function nomeSeguro(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function baixarArquivo(
  conteudo,
  tipo,
  nomeArquivo
) {
  const blob = new Blob(
    ['\ufeff', conteudo],
    { type: tipo }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = nomeArquivo;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(function() {
    URL.revokeObjectURL(url);
  }, 1500);
}
