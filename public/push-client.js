'use strict';

/**
 * Portal Limão Azedo V6.4
 * Inscrição Web Push em segundo plano.
 */

async function ativarPushSegundoPlano() {
  if (!('serviceWorker' in navigator)) {
    alert('Este navegador não suporta notificações em segundo plano.');
    return;
  }

  if (!('PushManager' in window)) {
    alert('Este aparelho não suporta Web Push.');
    return;
  }

  if (!dadosLoteAtual) {
    alert('Consulte o lote antes de ativar as notificações.');
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    alert('A permissão de notificações não foi concedida.');
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const keyResponse = await fetch('/api/push/public-key', {
    cache: 'no-store'
  });

  const keyData = await keyResponse.json();

  if (!keyResponse.ok || !keyData.publicKey) {
    throw new Error('Chave de notificações não configurada.');
  }

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlParaUint8Array(
        keyData.publicKey
      )
    });
  }

  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      curral: dadosLoteAtual.curral,
      carimbo: dadosLoteAtual.carimbo,
      subscription: subscription.toJSON()
    })
  });

  const data = await response.json();

  if (!response.ok || !data.sucesso) {
    throw new Error(
      data.mensagem ||
      'Não foi possível ativar as notificações.'
    );
  }

  localStorage.setItem(
    'push_limao_azedo_ativo',
    'sim'
  );

  alert(
    'Notificações em segundo plano ativadas. ' +
    'Os avisos poderão chegar mesmo com o portal fechado.'
  );
}

async function desativarPushSegundoPlano() {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    localStorage.removeItem('push_limao_azedo_ativo');
    return;
  }

  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subscription.endpoint
    })
  });

  await subscription.unsubscribe();
  localStorage.removeItem('push_limao_azedo_ativo');

  alert('Notificações em segundo plano desativadas.');
}

function base64UrlParaUint8Array(base64String) {
  const padding = '='.repeat(
    (4 - base64String.length % 4) % 4
  );

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const raw = atob(base64);

  return Uint8Array.from(
    [...raw].map(function(char) {
      return char.charCodeAt(0);
    })
  );
}

/**
 * Substitui o comportamento do botão já existente na V6.3.
 */
document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById(
    'ativarNotificacoesNavegador'
  );

  if (!button) return;

  button.removeAttribute('onclick');

  button.addEventListener('click', async function(event) {
    event.preventDefault();

    button.disabled = true;

    try {
      await ativarPushSegundoPlano();
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
        'Não foi possível ativar as notificações.'
      );
    } finally {
      button.disabled = false;
    }
  });
});
