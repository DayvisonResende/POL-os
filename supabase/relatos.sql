-- SISP · Relatos de problemas (Cláudio, do TI)
-- Rodar UMA vez no painel do Supabase: SQL Editor › New query › colar tudo › Run.
-- Pode rodar de novo sem problema (não apaga nada).
--
-- Segurança: igual à tabela de eventos. Com a chave pública (anon), o jogo só consegue INSERIR relatos;
-- ler, marcar como resolvido e apagar exigem a chave secreta (service_role), que fica só no .env.
-- Ler os relatos: npm run bugs  (ver docs/telemetria-comandos.md)

create table if not exists public.relatos (
  id          bigint generated always as identity primary key,
  recebido_em timestamptz not null default now(),
  chamado     text not null check (chamado ~ '^[A-Z0-9]{4,8}$'),            -- número que o Cláudio mostra ao jogador
  jogador     text not null check (char_length(jogador) between 8 and 64),  -- código anônimo do navegador
  versao      text not null check (char_length(versao) <= 32),              -- versão do jogo (js/config.js)
  texto       text not null check (char_length(texto) between 10 and 1000), -- o que o jogador escreveu
  contexto    jsonb not null default '{}'::jsonb check (octet_length(contexto::text) <= 8000),
  status      text not null default 'novo' check (status in ('novo', 'visto', 'resolvido', 'descartado')),
  nota        text                                                         -- sua anotação (só pelo npm run bugs)
);
create index if not exists relatos_recebido_idx on public.relatos (recebido_em);
create index if not exists relatos_status_idx on public.relatos (status);

-- Só inserção para quem joga, e sempre como "novo".
alter table public.relatos enable row level security;
drop policy if exists "jogo envia relatos" on public.relatos;
create policy "jogo envia relatos" on public.relatos
  for insert to anon
  with check (status = 'novo' and nota is null);
revoke select, update, delete on public.relatos from anon;
grant insert on public.relatos to anon;

-- Pedido de exclusão (LGPD): pelo código anônimo do jogador ou pelo número do chamado.
--   delete from public.relatos where jogador = 'CODIGO-INFORMADO';
--   delete from public.relatos where chamado = 'A7F3';
