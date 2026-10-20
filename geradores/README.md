# Geradores (ferramentas de produção)

Pasta **temporária** de ferramentas para produzir o conteúdo do Pol-OS: pessoas, empresas, contas, nomes, fichas de caso, facções, prompts de imagem e o controle das imagens. **Não faz parte do jogo**: o jogo não carrega nada daqui, e a pasta pode ser apagada sem quebrar nada (apague junto `tests/geradores.test.js` e `tests/carregar-geradores.js`).

> **Atenção:** o GitHub Pages publica o repositório inteiro, então esta pasta também fica acessível pela internet (a página pede para não ser indexada). Se não quiser isso, mova-a para fora do repositório ou acrescente-a ao `.gitignore`.

## Como usar

1. Abra `geradores/index.html` no navegador (dois cliques; não precisa instalar nada nem ter internet).
2. Escolha o gerador na lista da esquerda, ajuste as opções e clique em **Gerar**.
3. O resultado aparece em três abas: **Cartões** (para ler), **Tabelas** (os dados) e **Texto** (para copiar ou colar num documento).
4. Botões: **Salvar tudo no projeto**, **Copiar texto**, **Baixar .md / SQL / CSV / JSON**. Em cada cartão: **Salvar**, **Copiar prompt** e **+ produção**.

**Semente.** O campo "Semente" decide o sorteio: a mesma semente com as mesmas opções gera sempre o mesmo resultado. Anote a semente de algo que você gostou para poder refazer igual. O 🎲 sorteia outra semente e já gera.

**Projeto.** O que você salva fica guardado neste navegador e os geradores usam uns dos outros:
- as empresas pegam sócios entre as pessoas salvas;
- veículos e contas usam as pessoas e as empresas como donos;
- pessoas e empresas moram nos bairros salvos;
- as fichas usam os chefões e tenentes das facções salvas.

Uma ordem que funciona bem: **bairros → pessoas → empresas → veículos → contas**, salvando cada etapa.

Na aba **Projeto** (canto superior direito) dá para ver e limpar cada coleção, mudar o nome da cidade e o DDD, **exportar o projeto em JSON** (faça isso de vez em quando: limpar os dados do navegador apaga o projeto), importar de volta e exportar tudo em SQL. Ali fica também a **lista de produção de imagens**, com o status de cada uma.

## Os 14 geradores

| # | Gerador | O que faz |
|---|---|---|
| 1 | Pessoas completas | Nome da geração certa, idade, CPF, endereço, profissão, renda, aparência, personalidade e o prompt do retrato. O papel no caso é sorteado **sem olhar a aparência**. |
| 2 | Rotina de uma pessoa | Dias de vida em dados (antenas, radares, ponto, compras, PIX). Pode plantar uma anomalia (placa clonada, madrugada, saque, encontro), com gabarito. |
| 3 | Bairros e endereços | Bairros por perfil (porto, periferia, centro financeiro…), ruas, CEP, pontos de referência, crimes típicos e o prompt do lugar. Sugere nomes para a cidade. |
| 4 | Empresas | Razão social, CNPJ, abertura, capital, sócios. "De fachada" gera os sinais de alerta (e algumas honestas têm um sinal inocente, para não virar regra óbvia). |
| 5 | Veículos e placas | Modelo, cor, ano e valor coerentes com a renda do dono; opção de carro caro no nome de quem não tem renda. |
| 6 | Contas e transações | Movimentação normal (salário, aluguel, mercado, PIX) e um padrão criminoso plantado, com gabarito: fracionamento, carrossel, laranjas, golpe em série, saque atípico. |
| 7 | Nomes de casos | Dezenas de títulos (manchete, operação, apelido, capítulo), já verificados, com links de busca. |
| 8 | Fichas de caso | Sorteia a fórmula (Crime + Rastro + Técnica + Armadilha + Escala + Desfecho) só com peças que combinam, monta a hierarquia e os finais, no formato de `docs/casos-da-cidade.md`. Tipo arco: 5 a 8 casos subindo até o chefão. |
| 9 | Facções e chefões | Chefão com apelido e fraqueza, 2 tenentes, operadores, laranjas, reações, o arco e os prompts do chefão, dos tenentes e do emblema. Parte das cinco aprovadas ou cria uma nova. |
| 10 | Finais | Completo, parcial e fracasso (o moral só nos arcos de chefão), no tom da Célia, de jornal ou de relatório, com a cena de cada um. |
| 11 | Verificador | Nomes: avisa se lembram polícia, facção, operação ou empresa real, siglas, profissões ou origens usadas como nome de grupo, ou nomes que o jogo já usa. Documentos: avisa se um CPF/CNPJ tem dígito válido. |
| 12 | Sujador de dados | Suja uma tabela como a vida real (espaços, caixa, acentos, abreviações, CPF sem ponto, erros de digitação, datas, vazios, duplicados) e devolve o gabarito. |
| 13 | Prompts de imagem | Retrato, lote de rostos equilibrado, lugar, emblema e cena, sempre na fórmula do prompt do Beto. Mostra a lista de verificação da imagem pronta. |
| 14 | Lista de produção | Andamento por categoria (metas da seção 6 de `casos-da-cidade.md`) e nome de arquivo padrão: `rosto-001.webp`, `lugar-porto.webp`, `chefao-livro-caixa.webp`, `tenente-mare-1.webp`, `emblema-balcao.webp`, `final-fantasmas-parcial.webp`, `final-completo.webp`. |

## Regras que valem para todos

1. **Nada pode coincidir com gente ou empresa real.**
   - CPF e CNPJ saem com o **dígito verificador errado de propósito**: parecem reais, mas não podem pertencer a ninguém.
   - Telefones na faixa (DDD) 90xxx-xxxx.
   - E-mails no domínio reservado `.example`.
   - Bancos e marcas inventados.
2. **Nomes passam pelo verificador**, mas a lista só pega o que já conhecemos: antes de fixar um nome, clique nos links de busca.
3. **Mesmo estilo de imagem em tudo:** a fórmula do prompt do Beto, retrato do peito para cima, sem texto na imagem.
4. **Tudo é rascunho.** Os geradores dão o ponto de partida; a história, os valores e o texto final passam pelo seu olho antes de entrar no jogo.

## Para quem mexe no código

- Sem build e sem biblioteca: `index.html` carrega os scripts em ordem.
  - `js/nucleo.js`: sorteio com semente, documentos, exportação e projeto.
  - `vocabulario.js`, `catalogo.js` e `estilo.js`: listas de palavras, fórmula dos casos e estilo das imagens.
  - Um `g-*.js` por gerador.
  - `app.js`: a interface.
- Gerador novo: chame `registrarGerador({ id, numero, grupo, nome, descricao, campos, gerar(v, ctx) })` e acrescente o script ao `index.html`.
  - `gerar` devolve `{ resumo, avisos, itens, colecao, extras, cartoes, tabelas, texto }`.
  - Tipos de campo: `numero`, `select`, `texto`, `area`, `check`, `checks`, `data` e `projeto` (escolhe um item salvo).
- Testes: `node --test tests/geradores.test.js` (também roda no `npm test`).
