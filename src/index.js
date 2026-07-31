const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=UTF-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

async function consultarLote(request, env) {
  if (!env.APPS_SCRIPT_URL || !env.API_SECRET) {
    console.error('APPS_SCRIPT_URL ou API_SECRET não configurados.');
    return json({
      sucesso: false,
      mensagem: 'O portal está temporariamente indisponível.'
    }, 503);
  }

  let corpo;

  try {
    corpo = await request.json();
  } catch {
    return json({
      sucesso: false,
      mensagem: 'Requisição inválida.'
    }, 400);
  }

  const curral = String(corpo.curral || '').trim();
  const carimbo = String(corpo.carimbo || '').trim();

  if (!curral || !carimbo) {
    return json({
      sucesso: false,
      mensagem: 'Informe o curral e o carimbo.'
    }, 400);
  }

  if (curral.length > 50 || carimbo.length > 100) {
    return json({
      sucesso: false,
      mensagem: 'Dados de consulta inválidos.'
    }, 400);
  }

  try {
    const resposta = await fetch(env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify({
        curral,
        carimbo,
        segredo: env.API_SECRET
      })
    });

    const texto = await resposta.text();

    if (!resposta.ok) {
      console.error('Apps Script respondeu:', resposta.status, texto);
      return json({
        sucesso: false,
        mensagem: 'Não foi possível consultar o lote.'
      }, 502);
    }

    let dados;

    try {
      dados = JSON.parse(texto);
    } catch {
      console.error('Resposta não JSON do Apps Script:', texto);
      return json({
        sucesso: false,
        mensagem: 'A consulta retornou uma resposta inválida.'
      }, 502);
    }

    return json(dados, dados.sucesso === false ? 400 : 200);
  } catch (erro) {
    console.error('Falha ao consultar Apps Script:', erro);

    return json({
      sucesso: false,
      mensagem: 'Não foi possível consultar o lote.'
    }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/consultar') {
      if (request.method !== 'POST') {
        return json({
          sucesso: false,
          mensagem: 'Método não permitido.'
        }, 405);
      }

      return consultarLote(request, env);
    }

    const resposta = await env.ASSETS.fetch(request);

    const headers = new Headers(resposta.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
      headers.set('Cache-Control', 'no-cache');
    }

    return new Response(resposta.body, {
      status: resposta.status,
      statusText: resposta.statusText,
      headers
    });
  }
};
