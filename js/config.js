/* Configuração do jogo. Este arquivo pode ser publicado: a chave do Supabase aqui é a PÚBLICA (anon),
   que só permite inserir eventos de telemetria. A chave secreta (service_role) NUNCA entra aqui:
   fica no arquivo .env do desenvolvedor. Passo a passo: docs/telemetria-supabase.md */
var VERSAO_JOGO='2026-10-17';   // atualizar a cada publicação relevante: vai junto com cada evento enviado
var TELEMETRIA_REMOTA=window.SISP_CONFIG_TESTE||{
  url:'',       // ex.: 'https://abcdefghijkl.supabase.co'   (vazio = envio desligado; o jogo funciona igual)
  chave:'',     // anon key do projeto (pública)
  contato:''    // e-mail para pedidos de exclusão de dados (aparece no termo de uso)
};
