CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  curral TEXT NOT NULL,
  carimbo TEXT NOT NULL,
  lote_id TEXT NOT NULL,
  cliente TEXT,
  lote_nome TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_lote
ON push_subscriptions (lote_id, ativo);

CREATE TABLE IF NOT EXISTS push_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lote_id TEXT NOT NULL,
  evento_chave TEXT NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  data_evento TEXT,
  criado_em TEXT NOT NULL,
  UNIQUE (lote_id, evento_chave)
);

CREATE INDEX IF NOT EXISTS idx_push_events_lote
ON push_events (lote_id, evento_chave);
