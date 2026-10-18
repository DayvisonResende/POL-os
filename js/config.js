/* Configuração do jogo. Este arquivo pode ser publicado: a chave do Supabase aqui é a PÚBLICA (anon),
   que só permite inserir eventos de telemetria. A chave secreta (service_role) NUNCA entra aqui:
   fica no arquivo .env do desenvolvedor. Passo a passo: docs/telemetria-supabase.md */
var VERSAO_JOGO='2026-10-17-m4tec';   // atualizar a cada publicação relevante: vai junto com cada evento enviado
var TELEMETRIA_REMOTA=window.SISP_CONFIG_TESTE||{
  url:'https://hkltzqavgnqfnvxdszgi.supabase.co',   // vazio = envio desligado; o jogo funciona igual
  chave:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrbHR6cWF2Z25xZm52eGRzemdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxOTU0MjMsImV4cCI6MjEwNzc3MTQyM30.qorJYgmNwGN887n5jJo8IAt_mA13_JzkgGuYhyEB6BQ',   // anon key (pública: só permite inserir eventos; conferido em 17/10/2026)
  contato:'resende.dayvison@gmail.com'   // pedidos de exclusão de dados (aparece no termo de uso; exigido pela LGPD)
};
