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

function preencherTelaLote(dados) {
  definirTexto('clienteNome', dados.cliente, 'Cliente não informado');
  definirTexto('loteNome', dados.lote, 'Lote não informado');
  definirTexto('pesoEstimado', dados.pesoEstimado);

  definirTexto(
    'arrobasEstimadas',
    adicionarUnidade(dados.arrobasEstimadas, '@')
  );

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

  definirTexto(
    'ganhoTotalArroba',
    adicionarUnidade(dados.ganhoTotalArroba, '@')
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

function converterNumero(valor) {
  const texto = String(valor || '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');

  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : 0;
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
