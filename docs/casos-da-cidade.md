# Casos da cidade: o Pol-OS depois da campanha

> Documento de projeto (18/10/2026). **Ainda não implementado.** Entra **depois** da campanha completa (Módulos 5 e 6) e validada com iniciantes.

## A ideia

Depois da Operação Véio, o jogador é transferido para uma **cidade grande fictícia** e passa a trabalhar num núcleo de inteligência. Lá, ele encontra cerca de **100 casos de passatempo**: complexos, com tudo o que um analista experiente usa numa empresa grande, para quem já sabe SQL continuar sendo desafiado.

**Decisões já tomadas:**
- **Cidade fictícia**, com bairros de perfis diferentes e viagens a outras cidades. Nada de cidade, político, empresa ou órgão reais.
- **Casos não lineares:** cada jogador tem uma **mesa de casos sorteada** e uma **semente própria**. O mesmo tipo de caso vem com outros nomes, valores, bairros e datas, então "a resposta é a conta 4521" não serve para mais ninguém. O **método** pode ser compartilhado: isso é aprender SQL.
- **Caso do dia** (ideia): um caso igual para todos, no estilo Wordle, para comparar e comentar.
- **Facções com chefões**, com **arcos lineares** próprios, ao lado dos casos soltos.
- **Vários finais** sempre que fizer sentido (pelo menos 3).
- **Começar com um piloto de 10 casos**, testado com jogadores experientes, e só então escalar.

---

## 1. A cidade

A cidade é dividida em regiões, e cada perfil puxa crimes diferentes:

| Região | Crimes típicos |
|---|---|
| Centro financeiro | fraude, lavagem, golpe corporativo |
| Porto e rodovias | carga, contrabando, roubo de caminhão |
| Periferia | golpe do PIX em idosos, furto, receptação pequena |
| Condomínios de luxo | sonegação, laranjas, empresas de fachada |
| Distrito industrial | desvio de estoque, galpões, nota fria |
| Prefeitura e secretarias | licitação, servidor fantasma, propina |

**Viagens:** casos que atravessam cidades (a carga que sai do porto e aparece no interior, o laranja que mora numa cidade pequena).

**O princípio do gerador:** a cidade é **gente com rotina**. Cada pessoa tem casa, trabalho, carro, conta e celular, e todo dia gera dados normais. O gerador cria essa **normalidade** primeiro e depois **planta o crime como uma anomalia** no meio dela. É assim na vida real: o analista não procura "o crime", procura o que não se parece com o resto.

---

## 2. A fórmula do caso

> **Caso = Crime + Rastro + Técnica + Armadilha + Escala + Desfecho**

| Peça | Pergunta | Exemplos |
|---|---|---|
| **Crime** | O que aconteceu? | furto de chinelo, golpe do PIX, clonagem de placa, lavagem, cartel de licitação, rede de corrupção até o governador (fictício) |
| **Rastro** | Que dado o crime deixou? | câmera, radar, antena, transação, nota fiscal, catraca, cadastro de empresa, contrato, hotel, passagem, log de sistema |
| **Técnica** | Que padrão SQL revela o rastro? | ver o catálogo abaixo |
| **Armadilha** | O que engana quem vai rápido? | homônimo, dado sujo, NULL escondido, soma que infla, fuso horário, pista falsa plantada, laranja no lugar do chefe |
| **Escala** | Quantos dados? | bairro (milhares de linhas), cidade (dezenas de milhares), estado (centenas de milhares) |
| **Desfecho** | O que o jogador entrega? | um nome, um número, um mandado, o mapa de uma rede |

### Catálogo de técnicas (padrão do crime → como se acha)

| Padrão do crime | Técnica |
|---|---|
| Depósitos logo abaixo do limite (fracionamento) | GROUP BY + HAVING |
| Placa clonada: o mesmo carro em dois lugares longe em poucos minutos | JOIN da tabela com ela mesma + diferença de tempo |
| Servidor fantasma: salário sem nenhuma passagem na catraca | LEFT JOIN + IS NULL / NOT EXISTS |
| Superfaturamento: preço muito acima da média do produto | funções de janela (AVG OVER) |
| Dinheiro que dá voltas e volta à origem | CTE recursiva |
| Cartel: empresas que se revezam ganhando | LAG / sequência no tempo |
| Golpe em série: muitas vítimas, uma conta, poucas horas | agregação por janela de tempo |
| A mesma pessoa cadastrada de cinco jeitos | limpeza de texto + deduplicação |
| Encontro de suspeitos: dois celulares na mesma antena, na mesma hora | JOIN da tabela com ela mesma por lugar e tempo |
| Os 3 maiores de cada grupo | ROW_NUMBER / RANK |
| Sessões, "ilhas e lacunas", coortes | janelas + diferenças de data |
| Relatório gerencial (linhas viram colunas) | CASE dentro de SUM/COUNT |

---

## 3. As facções

> **Facção = Especialidade + Chefão + Hierarquia + Assinatura nos dados + Arco + Reação**

- **Especialidade:** no que ganham dinheiro.
- **Chefão:** quem manda, com uma fraqueza humana (vaidade, um filho, um hábito).
- **Hierarquia:** chefão → 2 tenentes → operadores → laranjas.
- **Assinatura nos dados:** o "jeito" deles, que se repete em todos os crimes da facção e que o jogador aprende a reconhecer.
- **Arco:** 5 a 8 casos **lineares**, cada um subindo um degrau da hierarquia.
- **Reação:** o que fazem quando o jogador chega perto (trocam de laranja, apagam dados, oferecem propina).

### As cinco facções (nomes aprovados)

| Facção | Especialidade | Assinatura nos dados | Técnica principal |
|---|---|---|---|
| **O Livro-Caixa** | lavagem e empresas de fachada | dinheiro que dá voltas e volta à origem | CTE recursiva |
| **Os Atravessadores** | roubo de carga e receptação | caminhão que some entre dois radares | sequência no tempo (LAG) |
| **O Balcão** | licitações e prefeituras | empresas que se revezam ganhando | janelas + padrão de revezamento |
| **Os Fantasmas** | golpes digitais em massa | muitas vítimas, uma conta, poucas horas | agregação por janela de tempo |
| **A Maré** | contrabando no porto | notas com peso que não bate com o produto | JOIN + soma que infla + anomalia |

**Casos soltos como fragmentos:** alguns casos aleatórios são, por baixo, operações de uma facção. Cada fragmento resolvido acende uma pista no **mural da facção**. Assim, os casos soltos alimentam os arcos, e o chefão aparece no fim de uma rede que o próprio jogador montou.

### Regra dos nomes (vale para facções, chefões, empresas e órgãos)

Antes de fixar qualquer nome, pesquisar na internet: *"[nome] facção"*, *"[nome] polícia"*, *"[nome] empresa"*. Evitar:
- siglas de três letras (muitas são de forças policiais ou facções reais);
- nomes de profissões, que soam como acusação a quem trabalha nelas;
- cores, números e símbolos associados a grupos reais.

Nomes descartados: **"A Rota"** (ROTA é a tropa da Polícia Militar de São Paulo) e **"A Família"** (lembra a Família do Norte, facção real). "Os Contadores" virou **O Livro-Caixa** para não soar como acusação à profissão.

**Tom:** facção é tema sensível no Brasil. O foco é crime de colarinho branco e inteligência, sem violência explícita e sem glamourizar o crime. O jogo continua servindo para escolas.

---

## 4. Os finais

> **Final = Profundidade + Precisão + Escolha**

- **Profundidade:** até onde o jogador foi na hierarquia (laranja, operador, chefe). Cada degrau pede SQL mais difícil: o laranja aparece com um filtro, o operador com um JOIN, o chefe só com uma CTE ou uma função de janela. **O final mede até onde o SQL do jogador chegou.**
- **Precisão:** acertou a pessoa e as provas, ou acusou errado.
- **Escolha:** uma decisão ética no caminho.

| Final | Quando | Consequência |
|---|---|---|
| **Completo** | foi até o topo, com as provas certas | prende o chefe; a facção enfraquece |
| **Parcial** | parou um degrau abaixo (operador ou laranja) | o chefe escapa e **volta mais forte** num caso futuro |
| **Fracasso** | acusou a pessoa errada | o caso é arquivado, a Corregedoria sobe e o chefe ganha confiança |
| **Moral** *(só nos arcos dos chefões)* | aceitou a propina, vazou, protegeu quem não devia | ganha no curto prazo e paga caro depois |

**O final moral fica só nos arcos dos chefões, e com moderação.** Ele pesa mais quando é raro e a consequência volta depois, como na cena da Marina na campanha.

---

## 5. A ficha do caso (em branco)

Todo caso nasce desta ficha. Copie, preencha e ela vira o caso.

```
FICHA DO CASO
─────────────────────────────────────────────
Título .............. (curto, de jornal)
Tipo ................ solto | fragmento de facção | arco linear
Facção .............. (se houver)
Dificuldade ......... ★ a ★★★★★
Bairro / cidade ..... (onde acontece)

1. CRIME ............ o que aconteceu, em uma frase
2. RASTRO ........... quais tabelas o crime sujou
3. TÉCNICA .......... o padrão SQL que revela o crime
4. ARMADILHA ........ o que engana quem vai rápido demais
5. ESCALA ........... quantas linhas, quantas tabelas
6. DESFECHO ......... o que o jogador entrega (nome, número, mandado)

7. HIERARQUIA ........ quem aparece em cada degrau
   - laranja ......... achado com ______
   - operador ........ achado com ______
   - chefe ........... achado com ______

8. FINAIS
   - completo ........ condição + texto
   - parcial ......... condição + texto + quem volta depois
   - fracasso ........ condição + texto
   - moral ........... (só arcos de chefão) a tentação + a consequência

9. VARIAÇÃO .......... o que muda de jogador para jogador
                        (nomes, valores, bairro, data)

10. IMAGENS .......... quais usa do banco e quais são novas

11. TESTES ........... resposta única? dá para acertar por sorte?
                        a consulta de referência passa?
```

### Exemplo preenchido

**"O dízimo do porto"** · fragmento de A Maré · ★★★ · Porto
1. **Crime:** contêineres declarados como "peças de roupa" entram com contrabando de eletrônicos.
2. **Rastro:** notas de importação, itens, pesagem na balança do porto, importadoras.
3. **Técnica:** JOIN entre notas e pesagem; função de janela para comparar o peso declarado com a média do produto.
4. **Armadilha:** a soma que infla (uma nota tem vários contêineres).
5. **Escala:** 30 mil notas, 4 tabelas.
6. **Desfecho:** o CNPJ da importadora e quem responde por ela.
7. **Hierarquia:** o despachante (filtro) → a importadora de fachada (JOIN) → o tenente de A Maré, que só aparece cruzando com as viagens dele (CTE).
8. **Finais:** completo, o tenente é preso e o mural de A Maré acende; parcial, só o despachante cai e o tenente volta com outra importadora; fracasso, a importadora errada é autuada, o dono era inocente, e a Corregedoria sobe.
9. **Variação:** produto, valores, despachante e data mudam com a semente.
10. **Imagens:** porto (lugar), 2 rostos genéricos, o tenente. **Nenhuma nova.**

---

## 6. As imagens

**Regra de ouro:** imagem só onde faz diferença. Documentos, notas, extratos, conversas, mapas e fichas são **desenhados por código**: mudam de jogador para jogador e não custam nada. Imagem de verdade só para **rostos, lugares e momentos marcantes**.

| Tipo | O que é | Quantidade | Reuso |
|---|---|---|---|
| Equipe nova | chefe, parceiro, perito e analista da cidade | 4–5 | o jogo inteiro |
| Chefões | um retrato marcante por facção | 5 | o arco inteiro |
| Tenentes | 2 por facção | 10 | vários casos |
| Rostos genéricos | suspeitos, vítimas e testemunhas variados (idade, gênero, etnia) | 30–40 | sorteados nos casos soltos |
| Lugares | porto, centro financeiro, prefeitura, galpão, condomínio, periferia, rodoviária… | 10–12 | fundo de todos os casos |
| Emblemas das facções | um símbolo fictício por facção | 5 | mural de investigação |
| Cenas de final dos chefões | completo, parcial e fracasso de cada arco | 15 | uma vez cada |
| Cenas de final genéricas | prisão, fuga, arquivamento | 3 | todos os casos soltos |
| **Total** | | **cerca de 85 a 95** | |

**Os 100 casos não precisam de 100 imagens:** um caso solto usa, em média, nenhuma imagem nova.

**Ordem de produção:** rostos genéricos → lugares → equipe nova → chefões e tenentes (um por facção, quando o arco dela for feito) → cenas de final.

**Estilo:** sempre a mesma fórmula no gerador de imagens e o mesmo enquadramento (do peito para cima, fundo escuro, luz lateral), combinando com a logo e os personagens atuais.

---

## 7. O que o sistema precisa ter (lado técnico)

1. **Gerador da cidade:** a normalidade (população, rotinas, empresas, contas, celulares), a partir de uma semente por jogador.
2. **Catálogo de padrões criminosos:** cada um sabe se plantar nos dados (fracionamento, clonagem, carrossel…).
3. **Catálogo de perguntas:** o texto do caso e o que o jogador entrega, com variações para não ficar repetitivo.
4. **Validador:** confere que cada caso sorteado tem **uma só resposta certa** e que não dá para acertar por sorte; descarta os sorteios ambíguos.
5. **Narrador:** monta o texto do caso a partir de modelos, com o tom dos personagens.
6. **Mural das facções:** mostra as pistas acesas por facção.
7. **Dados sujos de propósito:** duplicados, vazios, nomes com espaço, datas fora de ordem.
8. **Testes e telemetria:** a telemetria calibra a dificuldade real (se 90% acertam, não é ★★★★★).

**Cuidado com a qualidade:** texto gerado tende a ficar sem graça. O antídoto é misturar: casos gerados para dar volume e **arcos escritos à mão** (os chefões) para dar alma.

---

## 8. Plano

1. Terminar e validar a campanha (playtests atuais, Módulos 5 e 6).
2. Montar a base grande da cidade, com dados sujos.
3. **Piloto de 10 casos:** temas variados, dificuldade de ★★ a ★★★★★, incluindo o primeiro capítulo de um arco de facção.
4. Testar com jogadores experientes; ajustar a ficha, os finais e a dificuldade.
5. Escalar até ~100 casos, uma facção de cada vez.

**Para pensar com calma:** um pacote grande de casos avançados é o tipo de conteúdo que muitos jogos vendem à parte, ou como versão completa nas lojas, mantendo a campanha gratuita. Não precisa decidir agora, mas muda como se planeja.
