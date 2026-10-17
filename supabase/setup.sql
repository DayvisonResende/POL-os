-- SISP · Telemetria remota (Supabase / PostgreSQL)
-- Rodar UMA vez no painel do Supabase: SQL Editor › New query › colar tudo › Run.
-- Guia passo a passo: docs/telemetria-supabase.md
--
-- Segurança: o jogo usa a chave pública (anon). Com ela só é possível INSERIR eventos;
-- ler, alterar e apagar exigem a chave secreta (service_role), que fica só no computador do desenvolvedor.
-- Nenhum dado pessoal é coletado: o jogador é um código aleatório gerado no navegador (ver js/conteudo/termo.js).

create table if not exists public.eventos (
  id           bigint generated always as identity primary key,
  recebido_em  timestamptz not null default now(),
  jogador      text not null check (char_length(jogador) between 8 and 64),   -- código anônimo do navegador
  sessao       text not null check (char_length(sessao) between 8 and 64),    -- uma por abertura do jogo
  versao       text not null check (char_length(versao) <= 32),               -- versão do jogo (js/config.js)
  t            bigint not null,                                               -- horário do evento no navegador (ms)
  tipo         text not null check (char_length(tipo) <= 40),
  onde         text check (char_length(onde) <= 80),
  dados        jsonb not null default '{}'::jsonb check (octet_length(dados::text) <= 4000)
);

create index if not exists eventos_jogador_idx on public.eventos (jogador);
create index if not exists eventos_sessao_idx  on public.eventos (sessao, t);
create index if not exists eventos_recebido_idx on public.eventos (recebido_em);

-- Só inserção para quem joga.
alter table public.eventos enable row level security;
drop policy if exists "jogo insere eventos" on public.eventos;
create policy "jogo insere eventos" on public.eventos
  for insert to anon
  with check (t between 1767225600000 and 4102444800000);   -- entre 2026 e 2100: descarta lixo óbvio
revoke select, update, delete on public.eventos from anon;

-- Resumo por sessão, para análise rápida no próprio SQL Editor (só com a chave secreta).
create or replace view public.sessoes_resumo
  with (security_invoker = true) as
select sessao,
       min(jogador)                                             as jogador,
       min(versao)                                              as versao,
       to_timestamp(min(t) / 1000.0)                            as inicio,
       round((max(t) - min(t)) / 60000.0, 1)                    as minutos,
       count(*)                                                 as eventos,
       count(*) filter (where tipo = 'consulta')                as consultas,
       count(*) filter (where tipo = 'consulta' and dados->>'res' = 'erro') as consultas_com_erro,
       count(*) filter (where tipo = 'dica')                    as dicas,
       count(*) filter (where tipo = 'erro_js')                 as erros_do_jogo,
       max(onde) filter (where tipo = 'saida')                  as onde_parou
from public.eventos
group by sessao;
revoke all on public.sessoes_resumo from anon;

-- Pedido de exclusão (LGPD): o jogador informa o código anônimo que aparece em
-- SISP › Configurações › Privacidade. Para apagar tudo dele:
--   delete from public.eventos where jogador = 'CODIGO-INFORMADO';
