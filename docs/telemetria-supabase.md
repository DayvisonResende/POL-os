# Telemetria remota com Supabase — passo a passo

O jogo pode enviar a telemetria (anônima, só com o consentimento do jogador) para um banco PostgreSQL no Supabase. Você baixa tudo para a pasta do projeto com um comando e recebe um relatório pronto.

Enquanto `js/config.js` estiver com `url` e `chave` vazios, **nada é enviado e o termo de uso nem aparece**. O jogo funciona igual.

---

## 1. Criar o projeto (uma vez, ~5 min)

1. Entre em **https://supabase.com** e faça login (dá para usar a conta do GitHub). O plano **Free** basta.
2. **New project** → nome `sisp-telemetria` → crie uma senha de banco (guarde num gerenciador de senhas) → região **South America (São Paulo)**.
3. Espere o projeto ficar pronto (1–2 min).

## 2. Criar a tabela (uma vez)

1. No menu da esquerda: **SQL Editor** → **New query**.
2. Copie todo o conteúdo de [`supabase/setup.sql`](../supabase/setup.sql), cole e clique em **Run**.
3. Deve aparecer *"Success. No rows returned"*.

O script cria a tabela `eventos` com a regra de que **quem joga só consegue inserir**: ler, alterar e apagar exige a chave secreta.

## 3. Ligar o envio no jogo

1. No Supabase: **Project Settings** (engrenagem) → **API**.
2. Copie a **Project URL** e a chave **anon / public**.
3. Abra [`js/config.js`](../js/config.js) e preencha:
   ```js
   var TELEMETRIA_REMOTA=window.SISP_CONFIG_TESTE||{
     url:'https://SEU-PROJETO.supabase.co',
     chave:'eyJhbGciOi...a chave anon...',
     contato:'seu-email-para-pedidos-de-exclusao@exemplo.com'
   };
   ```
4. Commit + push. No próximo acesso, cada jogador vê o **Termo de uso** e decide.

> **A chave anon pode ser publicada**: é feita para ficar no navegador e, com a regra do passo 2, só permite inserir eventos.
> **A chave `service_role` NUNCA vai para `js/config.js` nem para o git.**

## 4. Baixar a telemetria e gerar o relatório

1. Na raiz do projeto, crie um arquivo **`.env`** (já está no `.gitignore`):
   ```
   SUPABASE_URL=https://SEU-PROJETO.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOi...a chave service_role (secreta)...
   ```
   A chave `service_role` fica em **Project Settings → API**, embaixo da anon.
2. Rode:
   ```bash
   npm run telemetria
   ```
3. Resultado, na pasta `telemetria/` (fora do git, porque são dados de jogadores):
   - `relatorio.md`: funil (quantos chegam a cada etapa), onde mais travam, onde mais demoram, onde pararam, erros de SQL, broncas da Célia, dicas automáticas, escolhas erradas, **erros técnicos do jogo**, dilema do Beto e aparelhos;
   - `sessoes/AAAA-MM-DD-xxxxxxxx.json`: uma sessão por arquivo, no mesmo formato do "Baixar JSON" do painel de diagnóstico;
   - `eventos.jsonl`: tudo, bruto. Rodar de novo baixa **só o que é novo**.

Para analisar direto em SQL, no SQL Editor do Supabase:
```sql
select * from sessoes_resumo order by inicio desc;
```

## 5. Atualizar a versão

A cada publicação relevante, mude `VERSAO_JOGO` em `js/config.js` (ex.: `'2026-10-24'`). Cada evento leva a versão, e o relatório separa por versão. É assim que se compara o antes e o depois de uma mudança.

## 6. Privacidade (LGPD)

- **Consentimento:** pedido no primeiro login, pelo termo em `js/conteudo/termo.js`. O padrão é não enviar. O jogador muda quando quiser em **SISP › Configurações › Privacidade**.
- **Mudou o que é coletado?** Atualize o texto do termo e aumente `TERMO_VERSAO`: todos são perguntados de novo.
- **Pedido de exclusão:** o jogador envia o código anônimo dele (aparece em Privacidade) para o e-mail de `contato`. No SQL Editor:
  ```sql
  delete from public.eventos where jogador = 'CODIGO-INFORMADO';
  ```
- **Nunca coletar:** nome, e-mail, login, senha, localização, nem o nome que vai no certificado. Os testes automáticos conferem que login, senha e contato não aparecem nos eventos.

## Limites do plano grátis

500 MB de banco. Uma sessão completa gera ~150 eventos (~30 KB): cabem dezenas de milhares de sessões. Projetos grátis sem uso por 1 semana são pausados; é só reativar no painel.
