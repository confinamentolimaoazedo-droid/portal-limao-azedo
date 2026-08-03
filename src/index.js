import { buildPushPayload } from '@block65/webcrypto-web-push';

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

function limparTexto(value, max = 200) {
  return String(value ?? '').trim().slice(0, max);
}

async function consultarAppsScript(curral, carimbo, env) {
  const response = await fetch(env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow',
    body: JSON.stringify({
      curral,
      carimbo,
      segredo: env.API_SECRET
    })
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Apps Script respondeu ${response.status}: ${text}`);
  }

  const data = JSON.parse(text);

  if (!data.sucesso || !data.resultado) {
    throw new Error(data.mensagem || 'Lote não encontrado.');
  }

  return data.resultado;
}

async function consultarLote(request, env) {
  if (!env.APPS_SCRIPT_URL || !env.API_SECRET) {
    return json({
      sucesso: false,
      mensagem: 'O portal está temporariamente indisponível.'
    }, 503);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ sucesso: false, mensagem: 'Requisição inválida.' }, 400);
  }

  const curral = limparTexto(body.curral, 50);
  const carimbo = limparTexto(body.carimbo, 100);

  if (!curral || !carimbo) {
    return json({
      sucesso: false,
      mensagem: 'Informe o curral e o carimbo.'
    }, 400);
  }

  try {
    const resultado = await consultarAppsScript(curral, carimbo, env);
    return json({ sucesso: true, resultado });
  } catch (error) {
    console.error('Falha ao consultar lote:', error);
    return json({
      sucesso: false,
      mensagem: 'Não foi possível consultar o lote.'
    }, 502);
  }
}

async function salvarInscricao(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ sucesso: false, mensagem: 'Requisição inválida.' }, 400);
  }

  const curral = limparTexto(body.curral, 50);
  const carimbo = limparTexto(body.carimbo, 100);
  const subscription = body.subscription;

  if (
    !curral ||
    !carimbo ||
    !subscription?.endpoint ||
    !subscription?.keys?.p256dh ||
    !subscription?.keys?.auth
  ) {
    return json({
      sucesso: false,
      mensagem: 'Dados da inscrição incompletos.'
    }, 400);
  }

  // Valida o acesso antes de gravar a inscrição.
  let lote;

  try {
    lote = await consultarAppsScript(curral, carimbo, env);
  } catch {
    return json({
      sucesso: false,
      mensagem: 'Curral ou carimbo inválidos.'
    }, 403);
  }

  const idLote = limparTexto(lote.id || lote.ID || lote.lote, 80);
  const endpoint = limparTexto(subscription.endpoint, 2048);

  await env.DB.prepare(`
    INSERT INTO push_subscriptions (
      endpoint,
      p256dh,
      auth,
      curral,
      carimbo,
      lote_id,
      cliente,
      lote_nome,
      ativo,
      criado_em,
      atualizado_em
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    ON CONFLICT(endpoint) DO UPDATE SET
      p256dh = excluded.p256dh,
      auth = excluded.auth,
      curral = excluded.curral,
      carimbo = excluded.carimbo,
      lote_id = excluded.lote_id,
      cliente = excluded.cliente,
      lote_nome = excluded.lote_nome,
      ativo = 1,
      atualizado_em = datetime('now')
  `).bind(
    endpoint,
    limparTexto(subscription.keys.p256dh, 512),
    limparTexto(subscription.keys.auth, 512),
    curral,
    carimbo,
    idLote,
    limparTexto(lote.cliente, 200),
    limparTexto(lote.lote, 200)
  ).run();

  // Cria a referência inicial para não notificar eventos antigos.
  const eventos = extrairEventos(lote);

  for (const evento of eventos) {
    await registrarEventoSemNotificar(env, idLote, evento);
  }

  return json({
    sucesso: true,
    mensagem: 'Notificações em segundo plano ativadas.'
  });
}

async function removerInscricao(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ sucesso: false, mensagem: 'Requisição inválida.' }, 400);
  }

  const endpoint = limparTexto(body.endpoint, 2048);

  if (!endpoint) {
    return json({ sucesso: false, mensagem: 'Endpoint não informado.' }, 400);
  }

  await env.DB.prepare(`
    UPDATE push_subscriptions
    SET ativo = 0, atualizado_em = datetime('now')
    WHERE endpoint = ?
  `).bind(endpoint).run();

  return json({ sucesso: true });
}

function extrairEventos(lote) {
  const eventos = [];

  const tratamentos = Array.isArray(lote?.sanidade?.tratamentos)
    ? lote.sanidade.tratamentos
    : [];

  for (const item of tratamentos) {
    const id = limparTexto(
      item.idTratamento ||
      item.IDTratamento ||
      [
        item.data || item.Data || '',
        item.produto || item.Produto || '',
        item.quantidadeAnimais || item.QuantidadeAnimais || '',
        item.custoTotal || item.CustoTotal || ''
      ].join('|'),
      500
    );

    eventos.push({
      chave: `TRATAMENTO:${id}`,
      tipo: 'TRATAMENTO',
      titulo: 'Tratamento realizado',
      corpo: montarCorpoTratamento(item),
      data: limparTexto(item.data || item.Data, 50)
    });
  }

  const movimentacoes = Array.isArray(lote?.movimentacoes)
    ? lote.movimentacoes
    : [];

  for (const item of movimentacoes) {
    const tipo = limparTexto(item.tipo || item.Tipo, 50).toUpperCase();

    if (tipo !== 'MORTE') continue;

    const id = limparTexto(
      item.idMovimentacao ||
      item.IDMovimentacao ||
      [
        item.data || item.Data || '',
        item.quantidade || item.Quantidade || '',
        item.motivo || item.Motivo || ''
      ].join('|'),
      500
    );

    eventos.push({
      chave: `MORTE:${id}`,
      tipo: 'MORTE',
      titulo: 'Morte registrada no lote',
      corpo: montarCorpoMorte(item),
      data: limparTexto(item.data || item.Data, 50)
    });
  }

  return eventos;
}

function montarCorpoTratamento(item) {
  const produto = limparTexto(item.produto || item.Produto || 'Produto');
  const quantidade = limparTexto(
    item.quantidadeAnimais ||
    item.QuantidadeAnimais ||
    item.quantidade ||
    '0'
  );

  return `${quantidade} animal(is) tratado(s) com ${produto}.`;
}

function montarCorpoMorte(item) {
  const quantidade = limparTexto(
    item.quantidade ||
    item.Quantidade ||
    '1'
  );

  const motivo = limparTexto(item.motivo || item.Motivo || '');

  return motivo
    ? `${quantidade} morte(s) registrada(s). Motivo: ${motivo}.`
    : `${quantidade} morte(s) registrada(s) no lote.`;
}

async function registrarEventoSemNotificar(env, loteId, evento) {
  await env.DB.prepare(`
    INSERT OR IGNORE INTO push_events (
      lote_id,
      evento_chave,
      tipo,
      titulo,
      corpo,
      data_evento,
      criado_em
    )
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    loteId,
    evento.chave,
    evento.tipo,
    evento.titulo,
    evento.corpo,
    evento.data
  ).run();
}

async function eventoJaExiste(env, loteId, eventoChave) {
  const row = await env.DB.prepare(`
    SELECT 1 AS existe
    FROM push_events
    WHERE lote_id = ? AND evento_chave = ?
    LIMIT 1
  `).bind(loteId, eventoChave).first();

  return Boolean(row);
}

async function registrarNovoEvento(env, loteId, evento) {
  await env.DB.prepare(`
    INSERT OR IGNORE INTO push_events (
      lote_id,
      evento_chave,
      tipo,
      titulo,
      corpo,
      data_evento,
      criado_em
    )
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    loteId,
    evento.chave,
    evento.tipo,
    evento.titulo,
    evento.corpo,
    evento.data
  ).run();
}

async function enviarPush(subscription, notification, env) {
  const vapid = {
    subject: env.VAPID_SUBJECT,
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY
  };

  const message = {
    data: JSON.stringify(notification),
    options: {
      ttl: 60 * 60,
      urgency: 'high'
    }
  };

  const payload = await buildPushPayload(
    message,
    {
      endpoint: subscription.endpoint,
      expirationTime: null,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    },
    vapid
  );

  return fetch(subscription.endpoint, payload);
}

async function verificarLotesEEnviar(env) {
  const { results: lotes } = await env.DB.prepare(`
    SELECT
      lote_id,
      curral,
      carimbo,
      cliente,
      lote_nome
    FROM push_subscriptions
    WHERE ativo = 1
    GROUP BY lote_id, curral, carimbo, cliente, lote_nome
  `).all();

  let notificacoesEnviadas = 0;

  for (const cadastro of lotes || []) {
    let lote;

    try {
      lote = await consultarAppsScript(
        cadastro.curral,
        cadastro.carimbo,
        env
      );
    } catch (error) {
      console.error(
        `Falha ao consultar ${cadastro.lote_id}:`,
        error
      );
      continue;
    }

    const eventos = extrairEventos(lote);

    for (const evento of eventos) {
      if (
        await eventoJaExiste(
          env,
          cadastro.lote_id,
          evento.chave
        )
      ) {
        continue;
      }

      await registrarNovoEvento(
        env,
        cadastro.lote_id,
        evento
      );

      const { results: subscriptions } =
        await env.DB.prepare(`
          SELECT endpoint, p256dh, auth
          FROM push_subscriptions
          WHERE lote_id = ? AND ativo = 1
        `).bind(cadastro.lote_id).all();

      const notification = {
        title: evento.titulo,
        body: `${cadastro.lote_nome || cadastro.lote_id}: ${evento.corpo}`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: evento.chave,
        url: `/?curral=${encodeURIComponent(
          cadastro.curral
        )}&carimbo=${encodeURIComponent(
          cadastro.carimbo
        )}`
      };

      for (const subscription of subscriptions || []) {
        try {
          const response = await enviarPush(
            subscription,
            notification,
            env
          );

          if (response.status === 404 || response.status === 410) {
            await env.DB.prepare(`
              UPDATE push_subscriptions
              SET ativo = 0, atualizado_em = datetime('now')
              WHERE endpoint = ?
            `).bind(subscription.endpoint).run();
          } else if (!response.ok) {
            console.error(
              'Push recusado:',
              response.status,
              await response.text()
            );
          } else {
            notificacoesEnviadas += 1;
          }
        } catch (error) {
          console.error('Falha ao enviar push:', error);
        }
      }
    }
  }

  await env.DB.prepare(`
    DELETE FROM push_events
    WHERE criado_em < datetime('now', '-180 days')
  `).run();

  return notificacoesEnviadas;
}

async function testePush(request, env) {
  const token = request.headers.get('X-Push-Admin');

  if (!env.PUSH_ADMIN_TOKEN || token !== env.PUSH_ADMIN_TOKEN) {
    return json({ sucesso: false, mensagem: 'Não autorizado.' }, 401);
  }

  const total = await verificarLotesEEnviar(env);

  return json({
    sucesso: true,
    notificacoesEnviadas: total
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/consultar') {
      if (request.method !== 'POST') {
        return json({ sucesso: false, mensagem: 'Método não permitido.' }, 405);
      }

      return consultarLote(request, env);
    }

    if (url.pathname === '/api/push/public-key') {
      return json({
        sucesso: true,
        publicKey: env.VAPID_PUBLIC_KEY || ''
      });
    }

    if (url.pathname === '/api/push/subscribe') {
      if (request.method !== 'POST') {
        return json({ sucesso: false, mensagem: 'Método não permitido.' }, 405);
      }

      return salvarInscricao(request, env);
    }

    if (url.pathname === '/api/push/unsubscribe') {
      if (request.method !== 'POST') {
        return json({ sucesso: false, mensagem: 'Método não permitido.' }, 405);
      }

      return removerInscricao(request, env);
    }

    if (url.pathname === '/api/push/test') {
      if (request.method !== 'POST') {
        return json({ sucesso: false, mensagem: 'Método não permitido.' }, 405);
      }

      return testePush(request, env);
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);

    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    if (
      url.pathname === '/' ||
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css')
    ) {
      headers.set('Cache-Control', 'no-cache');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      verificarLotesEEnviar(env)
        .then(function(total) {
          console.log(
            `Push V6.4 concluído: ${total} notificação(ões).`
          );
        })
        .catch(function(error) {
          console.error('Erro no cron de push:', error);
        })
    );
  }
};
