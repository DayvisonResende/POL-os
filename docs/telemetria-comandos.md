# Telemetria — comandos do dia a dia

Cola rápida. Instalação e configuração (feitas uma vez): [telemetria-supabase.md](telemetria-supabase.md).

---

## Baixar os dados e gerar o relatório

```bash
npm run telemetria
```

Baixa só o que é novo e gera tudo na pasta **`telemetria/`** (fora do git, porque são dados de jogadores):

| Arquivo | O que é |
|---|---|
| `telemetria/relatorio.md` | **Comece por aqui.** Funil, onde travam, onde demoram, onde pararam, erros de SQL, erros do jogo, aparelhos |
| `telemetria/sessoes/AAAA-MM-DD-xxxxxxxx.json` | Uma sessão por arquivo, no mesmo formato do "Baixar JSON" do painel de diagnóstico |
| `telemetria/eventos.jsonl` | Todos os eventos, brutos |

Precisa do arquivo `.env` na raiz com `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` (a chave secreta). **Nunca** commitar o `.env`.

### Tirar os seus próprios testes do relatório

Seus testes misturados com os dos jogadores distorcem tudo. Em cada navegador onde você joga, abra **SISP › Configurações › Privacidade › Dados de uso** e copie o **código anônimo**. Depois, no `.env`:
```
TELEMETRIA_IGNORAR=3d343ac5,1c03dde7
```
Separe os códigos por vírgula; basta o começo de cada um (os 8 primeiros caracteres). Os dados continuam baixados em `eventos.jsonl`, só não entram no relatório. O relatório também deixa de fora as aberturas que não passaram da tela de login.

Para baixar tudo de novo do zero:
```bash
rm -rf telemetria && npm run telemetria
```

---

## Consultas no Supabase (SQL Editor)

Painel do Supabase › **SQL Editor** › New query. Lá você usa a chave secreta automaticamente: lê tudo.

**Sessões mais recentes, resumidas**
```sql
select * from sessoes_resumo order by inicio desc limit 20;
```

**Quantos jogadores e sessões por dia**
```sql
select date(to_timestamp(t / 1000.0)) as dia,
       count(distinct jogador) as jogadores,
       count(distinct sessao)  as sessoes
from eventos
group by dia
order by dia desc;
```

**Funil: quantos jogadores chegaram a cada marco**
```sql
select
  count(distinct jogador) filter (where tipo = 'sessao')                                          as abriram,
  count(distinct jogador) filter (where tipo = 'treino_fim' and dados->>'treino' = 'm1')          as treino_m1,
  count(distinct jogador) filter (where tipo = 'desfecho' and dados->>'caso' = '1001' and (dados->>'ok')::bool) as bo_1001,
  count(distinct jogador) filter (where tipo = 'desfecho' and dados->>'caso' = '1002' and (dados->>'ok')::bool) as bo_1002,
  count(distinct jogador) filter (where tipo = 'desfecho' and dados->>'caso' = '1003' and (dados->>'ok')::bool) as bo_1003,
  count(distinct jogador) filter (where tipo = 'promocao' and dados->>'patente' = '2')            as investigador_junior
from eventos;
```

**Erros de SQL mais comuns**
```sql
select dados->>'erro' as erro, count(*)
from eventos
where tipo = 'consulta' and dados->>'res' = 'erro'
group by erro
order by count(*) desc
limit 15;
```

**Onde as pessoas mais pedem dica**
```sql
select onde, count(*) as dicas
from eventos
where tipo = 'dica'
group by onde
order by dicas desc;
```

**Erros técnicos do jogo (corrigir!)**
```sql
select dados->>'msg' as erro, dados->>'arquivo' as arquivo, dados->>'linha' as linha, count(*)
from eventos
where tipo = 'erro_js'
group by 1, 2, 3
order by count(*) desc;
```

**Aparelhos e navegadores**
```sql
select dados->>'faixa' as tela, dados->>'navegador' as navegador, dados->>'sistema' as sistema, count(*)
from eventos
where tipo = 'sessao'
group by 1, 2, 3
order by count(*) desc;
```

**Todos os eventos de uma sessão, em ordem**
```sql
select to_timestamp(t / 1000.0) as quando, tipo, onde, dados
from eventos
where sessao = 'COLE-O-CODIGO-DA-SESSAO'
order by t;
```

---

## Apagar dados

**Pedido de exclusão (LGPD):** o jogador manda o código anônimo dele (aparece em *SISP › Configurações › Privacidade*) para o e-mail de contato.
```sql
delete from eventos where jogador = 'CODIGO-INFORMADO';
```

**O evento de teste da configuração:**
```sql
delete from eventos where jogador = 'teste-configuracao';
```

**Suas próprias sessões de teste:** abra o jogo, copie o seu código em *SISP › Configurações › Privacidade* e use o mesmo `delete`.

Depois de apagar no Supabase, rode `rm -rf telemetria && npm run telemetria` para a cópia local também ficar sem esses dados.

---

## Ao publicar uma versão nova

Mude `VERSAO_JOGO` em `js/config.js` (ex.: `'2026-10-24'`). Cada evento leva a versão, e o relatório separa por ela. É assim que se compara o antes e o depois de uma mudança.

Mudou **o que é coletado**? Atualize o termo em `js/conteudo/termo.js` e aumente `TERMO_VERSAO`: todos os jogadores são perguntados de novo.

---

## Desligar a telemetria

Esvazie `url` em `js/config.js` (`url:''`) e publique. O termo some e nada mais é enviado; o jogo funciona igual.

---

## Problemas comuns

| Mensagem | O que fazer |
|---|---|
| *Faltam SUPABASE_URL e SUPABASE_SERVICE_KEY* | Falta o `.env` ou a chave secreta nele |
| *O Supabase respondeu 401* | A chave no `.env` não é a `service_role` (é a anon?) ou foi trocada no painel |
| *0 evento(s) novo(s)* | Ninguém jogou desde o último download, ou ninguém aceitou o termo |
| Projeto pausado no painel | Projetos grátis sem uso por 1 semana são pausados: clique em **Restore** no painel |
