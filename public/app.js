'use strict';

let pesoEntradaNumerico = 0;
let pesoFinalNumerico = 0;

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
      throw new Error('A consulta retornou uma resposta inválida.');
    }

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(
        dados.mensagem || 'Não foi possível consultar o lote.'
      );
    }

    if (!dados.resultado) {
      mostrarMensagem(
        'Lote não encontrado. Confira o curral e o carimbo.'
      );
      return;
    }

    preencherTelaLote(dados.resultado);
    abrirTelaLote();
  } catch (erro) {
    const mensagem =
      erro && erro.message
        ? erro.message
        : 'Não foi possível consultar o lote.';

    mostrarMensagem(mensagem);
    console.error(erro);
  } finally {
    alterarEstadoCarregamento(false);
  }
}

 preencherTelaLote(dados) {
  definirTexto('clienteNome', dados.cliente, 'Cliente não informado');
  definirTexto('loteNome', dados.lote, 'Lote não informado');
  definirTexto('pesoEstimado', dados.pesoEstimado);

  definirTexto('cabecasAtuais', dados.cabecasAtuais);
  definirTexto('diasConfinados', dados.diasConfinados);
  definirTexto('diasRestantes', dados.diasRestantes);

  definirTexto(
    'consumoMS',
    adicionarUnidade(dados.consumoMS, 'kg')
  );

  definirTexto('dietaAtual', dados.dieta);

  definirTexto(
    'gmdProjetado',
    adicionarUnidade(dados.gmdProjetado, 'kg/dia')
  );

  definirTexto('modalidadeLote', dados.modalidade);

  definirTexto(
    'pesoEntrada',
    adicionarUnidade(dados.pesoEntrada, 'kg')
  );

  definirTexto(
    'ganhoTotalKg',
    adicionarUnidade(dados.ganhoTotalKg, 'kg')
  );

  definirTexto('consumoPV', dados.consumoPV);

  definirTexto(
    'pesoFinalProjetado',
    adicionarUnidade(dados.pesoFinalProjetado, 'kg')
  );

  definirTexto(
    'arrobaFinalProjetada',
    adicionarUnidade(dados.arrobaFinalProjetada, '@')
  );

  pesoEntradaNumerico = converterNumero(dados.pesoEntrada);
  pesoFinalNumerico = converterNumero(dados.pesoFinalProjetado);

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
  const seletor = document.getElementById('rendimentoCarcaca');
  const rendimento = seletor ? Number(seletor.value) : 50;

  if (!pesoFinalNumerico || pesoFinalNumerico <= 0) {
    definirTexto('carcacaFinalKg', '—');
    definirTexto('carcacaFinalArrobas', '—');
    return;
  }

  const pesoCarcaca = pesoFinalNumerico * (rendimento / 100);
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

function formatarNumero(valor, casasDecimais) {
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const seletor = document.getElementById('rendimentoCarcaca');

  if (seletor) {
    seletor.addEventListener(
      'change',
      atualizarResultadoCarcacaFinal
    );
  }
});

function preencherSaudeDoLote(dados) {
  const sanidade = dados.sanidade || {};

  definirTexto('animaisDoentes', dados.animaisDoentes || '0');
  definirTexto('animaisEnfermaria', dados.animaisEnfermaria || '0');
  definirTexto('tratamentosRealizados', sanidade.quantidadeRegistros || '0');
  definirTexto('animaisTratados', sanidade.totalAnimaisTratados || '0');
  definirTexto('custoSanitarioTotal', sanidade.custoTotal || 'R$ 0,00');
}

function preencherProtocoloSanitario(dados) {
  const lista = document.getElementById('listaProtocoloSanitario');

  if (!lista) {
    return;
  }

  const protocolo = Array.isArray(dados.protocoloSanitario)
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
      const procedimento = item.procedimento || 'Procedimento';
      const produto = item.produto || 'Produto não informado';
      const dose = String(item.dose || '').trim();
      const unidade = String(item.unidade || '').trim();

      const detalhes = [
        produto,
        dose && unidade ? `${dose} ${unidade}` : dose || unidade
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
  const historico = document.getElementById('historicoTratamentos');

  if (!historico) {
    return;
  }

  const sanidade = dados.sanidade || {};
  const tratamentos = Array.isArray(sanidade.tratamentos)
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

    const observacoes = String(item.observacoes || '').trim();

    elemento.innerHTML = `
      <div class="tratamento-topo">
        <div>
          <strong>${escaparHtml(item.produto || 'Produto não informado')}</strong>
          <span>${escaparHtml(item.data || 'Data não informada')}</span>
        </div>

        <strong class="tratamento-custo">
          ${escaparHtml(item.custoTotal || 'R$ 0,00')}
        </strong>
      </div>

      <div class="tratamento-dados">
        <div class="tratamento-dado">
          <span>Animais tratados</span>
          <strong>${escaparHtml(item.quantidadeAnimais || '0')}</strong>
        </div>

        <div class="tratamento-dado">
          <span>Dose por animal</span>
          <strong>${escaparHtml(adicionarUnidade(item.dosePorAnimal, 'ml'))}</strong>
        </div>

        <div class="tratamento-dado">
          <span>Volume total</span>
          <strong>${escaparHtml(adicionarUnidade(item.volumeTotal, 'ml'))}</strong>
        </div>

        <div class="tratamento-dado">
          <span>Motivo</span>
          <strong>${escaparHtml(item.motivo || 'Não informado')}</strong>
        </div>
      </div>

      ${
        observacoes
          ? `<p class="tratamento-observacao">${escaparHtml(observacoes)}</p>`
          : ''
      }
    `;

    historico.appendChild(elemento);
  });
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function preencherGraficos(dados) {
  const sanidade = dados.sanidade || {};

  criarGraficoBarras('graficoPeso', [
    {
      rotulo: 'Entrada',
      valor: converterNumero(dados.pesoEntrada),
      exibicao: adicionarUnidade(dados.pesoEntrada, 'kg')
    },
    {
      rotulo: 'Atual',
      valor: converterNumero(dados.pesoEstimado),
      exibicao: adicionarUnidade(dados.pesoEstimado, 'kg')
    },
    {
      rotulo: 'Projetado',
      valor: converterNumero(dados.pesoFinalProjetado),
      exibicao: adicionarUnidade(dados.pesoFinalProjetado, 'kg')
    }
  ]);

  const custoProtocolo = converterNumero(
    dados.custoProtocoloTotal
  );

  const custoTratamentos = converterNumero(
    sanidade.custoTotalNumerico || sanidade.custoTotal
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
      exibicao: formatarMoeda(custoProtocolo + custoTratamentos)
    }
  ]);

  const cabecasAtuais = converterNumero(dados.cabecasAtuais);
  const animaisDoentes = converterNumero(dados.animaisDoentes);
  const animaisEnfermaria = converterNumero(dados.animaisEnfermaria);
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

  if (!container) {
    return;
  }

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

      <div class="grafico-trilho" aria-hidden="true">
        <div
          class="grafico-preenchimento"
          style="width: ${percentual}%"
        ></div>
      </div>
    `;

    container.appendChild(linha);
  });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

let eventoInstalacaoPwa = null;

window.addEventListener('beforeinstallprompt', function(evento) {
  evento.preventDefault();
  eventoInstalacaoPwa = evento;

  const botao = document.getElementById('botaoInstalarApp');

  if (botao) {
    botao.classList.remove('oculto');
  }
});

window.addEventListener('appinstalled', function() {
  eventoInstalacaoPwa = null;

  const botao = document.getElementById('botaoInstalarApp');

  if (botao) {
    botao.classList.add('oculto');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const botao = document.getElementById('botaoInstalarApp');

  if (botao) {
    botao.addEventListener('click', async function() {
      if (!eventoInstalacaoPwa) {
        return;
      }

      eventoInstalacaoPwa.prompt();
      await eventoInstalacaoPwa.userChoice;
      eventoInstalacaoPwa = null;
      botao.classList.add('oculto');
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(function(erro) {
        console.error('Falha ao registrar PWA:', erro);
      });
  }
});

function atualizarProgresso(dados) {
  const diasConfinados = converterNumero(dados.diasConfinados);
  const diasRestantes = converterNumero(dados.diasRestantes);
  const total = Math.max(0, diasConfinados + diasRestantes);

  let percentual = 0;

  if (total > 0) {
    percentual = Math.round((diasConfinados / total) * 100);
  } else if (
    String(dados.status || '').toLowerCase().includes('encerr')
  ) {
    percentual = 100;
  }

  percentual = Math.min(100, Math.max(0, percentual));

  definirTexto(
    'progressoTexto',
    `${diasConfinados || 0} de ${total || 0} dias`
  );

  definirTexto('progressoPercentual', `${percentual}%`);

  definirTexto(
    'dataEntradaResumo',
    `Entrada: ${dados.dataEntrada || '—'}`
  );

  definirTexto(
    'dataAbateResumo',
    `Abate: ${dados.dataAbate || '—'}`
  );

  const barra = document.getElementById(
    'barraProgressoPreenchimento'
  );

  if (barra) {
    barra.style.width = `${percentual}%`;
  }
}

/**
 * Converte números recebidos do backend ou textos formatados.
 *
 * Aceita:
 * 541.5
 * "541.5"
 * "541,5"
 * "2.200,00"
 * "R$ 2.200,00"
 * "19 kg"
 */
function converterNumero(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return 0;
  }

  /*
   * Quando o Apps Script envia um número verdadeiro,
   * não devemos remover o ponto decimal.
   */
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

  /*
   * Formato brasileiro:
   * 2.200,00 → 2200.00
   */
  if (possuiVirgula && possuiPonto) {
    const ultimaVirgula = texto.lastIndexOf(',');
    const ultimoPonto = texto.lastIndexOf('.');

    if (ultimaVirgula > ultimoPonto) {
      texto = texto
        .replace(/\./g, '')
        .replace(',', '.');
    } else {
      /*
       * Formato internacional:
       * 2,200.00 → 2200.00
       */
      texto = texto.replace(/,/g, '');
    }
  } else if (possuiVirgula) {
    /*
     * 541,5 → 541.5
     */
    texto = texto.replace(',', '.');
  }

  /*
   * Quando existe somente ponto:
   * 541.5 permanece 541.5.
   */
  const resultado = Number(texto);

  return Number.isFinite(resultado)
    ? resultado
    : 0;
}

function definirTexto(id, valor, valorPadrao = '—') {
  const elemento = document.getElementById(id);

  if (!elemento) {
    return;
  }

  const valorTratado = String(valor ?? '').trim();
  elemento.textContent = valorTratado || valorPadrao;
}

function adicionarUnidade(valor, unidade) {
  const texto = String(valor ?? '').trim();

  if (!texto) {
    return '—';
  }

  if (texto.toLowerCase().includes(unidade.toLowerCase())) {
    return texto;
  }

  return `${texto} ${unidade}`;
}

function atualizarStatus(status) {
  const elemento = document.getElementById('statusLote');

  if (!elemento) {
    return;
  }

  const texto = String(status || 'Ativo').trim();
  elemento.textContent = texto;

  if (texto.toLowerCase().includes('encerr')) {
    elemento.className = 'status encerrado';
  } else {
    elemento.className = 'status ativo';
  }
}

function abrirTelaLote() {
  document.getElementById('telaLogin').classList.remove('ativa');
  document.getElementById('telaLote').classList.add('ativa');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function voltarParaLogin() {
  document.getElementById('telaLote').classList.remove('ativa');
  document.getElementById('telaLogin').classList.add('ativa');

  limparMensagem();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function mostrarMensagem(texto) {
  const mensagem = document.getElementById('mensagemLogin');
  mensagem.textContent = texto;
  mensagem.className = 'mensagem erro';
}

function limparMensagem() {
  const mensagem = document.getElementById('mensagemLogin');
  mensagem.textContent = '';
  mensagem.className = 'mensagem';
}

function alterarEstadoCarregamento(estaCarregando) {
  const botao = document.getElementById('botaoEntrar');
  const texto = document.getElementById('textoBotao');
  const spinnerBotao = document.getElementById('carregandoBotao');
  const carregamentoTela = document.getElementById('carregamentoTela');

  botao.disabled = estaCarregando;

  texto.textContent = estaCarregando
    ? 'Consultando...'
    : 'Acessar meu lote';

  spinnerBotao.classList.toggle('oculto', !estaCarregando);
  carregamentoTela.classList.toggle('oculto', !estaCarregando);
}
