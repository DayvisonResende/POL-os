/* Vocabulário dos geradores: nomes, aparência, profissões, lugares, empresas, veículos.
   Tudo fictício. Pares {pt, en}: o português vai para a descrição; o inglês, para o prompt de imagem. */
'use strict';

/* ---------- Nomes por geração (nome da época em que a pessoa nasceu) ---------- */
const NOMES = {
  F: {
    antiga: ['Benedita', 'Aparecida', 'Maria das Dores', 'Lourdes', 'Conceição', 'Terezinha', 'Sebastiana', 'Antônia', 'Raimunda', 'Francisca', 'Josefa', 'Cecília', 'Neusa', 'Iracema', 'Odete', 'Dirce', 'Zuleica', 'Nair', 'Ivone', 'Celina', 'Marlene', 'Glória', 'Dalva', 'Rosa'],
    media: ['Ana', 'Patrícia', 'Fernanda', 'Juliana', 'Adriana', 'Cristiane', 'Renata', 'Simone', 'Luciana', 'Vanessa', 'Camila', 'Daniela', 'Aline', 'Priscila', 'Tatiane', 'Sabrina', 'Mariana', 'Elaine', 'Kelly', 'Rosângela', 'Viviane', 'Denise', 'Sandra', 'Márcia', 'Cláudia', 'Andréa', 'Raquel', 'Débora'],
    nova: ['Valentina', 'Helena', 'Alice', 'Laura', 'Manuela', 'Sophia', 'Isabela', 'Lívia', 'Giovanna', 'Beatriz', 'Yasmin', 'Lorena', 'Heloísa', 'Rafaela', 'Ana Clara', 'Maria Eduarda', 'Larissa', 'Bianca', 'Emanuelly', 'Kauane', 'Nicole', 'Vitória'],
  },
  M: {
    antiga: ['Sebastião', 'Benedito', 'Geraldo', 'Antônio', 'José Carlos', 'Raimundo', 'Joaquim', 'Osvaldo', 'Valdemar', 'Ademar', 'Arlindo', 'Lázaro', 'Nelson', 'Waldir', 'Orlando', 'Edson', 'Milton', 'Agenor', 'Darcy', 'Hélio', 'Jair', 'Expedito'],
    media: ['Carlos', 'Marcelo', 'Fábio', 'Rodrigo', 'Anderson', 'Alexandre', 'Leandro', 'Fernando', 'Ricardo', 'Márcio', 'Paulo', 'Rogério', 'Cristiano', 'Wesley', 'Diego', 'Thiago', 'Bruno', 'Rafael', 'Leonardo', 'Daniel', 'Eduardo', 'Gustavo', 'André', 'Júlio', 'Sérgio', 'Wagner'],
    nova: ['Miguel', 'Arthur', 'Heitor', 'Davi', 'Gabriel', 'Enzo', 'Pedro Henrique', 'Lorenzo', 'Bernardo', 'Théo', 'Samuel', 'Benjamin', 'Matheus', 'Guilherme', 'Lucas', 'Kauã', 'Ryan', 'Nicolas', 'João Pedro', 'Vinícius', 'Igor', 'Caio'],
  },
};
// Geração pelo ano de nascimento
function geracaoNome(ano) { return ano < 1966 ? 'antiga' : ano < 1996 ? 'media' : 'nova'; }

const SOBRENOMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos', 'Gonçalves', 'Santana', 'Teixeira', 'Araújo', 'Pinto', 'Cavalcanti', 'Batista', 'Campos', 'Monteiro', 'Correia', 'Reis', 'Duarte', 'Farias', 'Siqueira', 'Toledo', 'Queiroz', 'Nogueira', 'Fonseca', 'Bezerra', 'Brito', 'Leite', 'Pires', 'Tavares', 'Barros', 'Sales', 'Matos', 'Coelho', 'Viana', 'Xavier', 'Bastos', 'Guimarães', 'Antunes', 'Paiva', 'Brandão', 'Amaral', 'Moraes', 'Castro', 'Macedo', 'Sampaio', 'Medeiros', 'Lacerda', 'Fagundes', 'Conceição', 'Assunção', 'Vasconcelos', 'Aguiar', 'Rezende', 'Bueno', 'Godói', 'Vilela'];
// Sobrenomes de famílias imigrantes, comuns no Brasil (usados às vezes, junto com um sobrenome brasileiro)
const SOBRENOMES_ORIGEM = {
  japonesa: ['Nakamura', 'Yamamoto', 'Tanaka', 'Suzuki', 'Sato', 'Watanabe', 'Kobayashi', 'Hirata', 'Matsumoto', 'Okada', 'Takahashi', 'Inoue'],
  italiana: ['Rossi', 'Bianchi', 'Romano', 'Colombo', 'Marchetti', 'Zanetti', 'Ferraro', 'Mancini', 'Bertolini', 'Gallo'],
  arabe: ['Haddad', 'Khoury', 'Nassar', 'Salomão', 'Maluf', 'Jorge', 'Abdalla', 'Farah'],
  alema: ['Schmidt', 'Becker', 'Müller', 'Klein', 'Wagner', 'Hoffmann', 'Weber', 'Krause'],
  outra: ['Kowalski', 'Novak', 'Cohen', 'Petrov', 'Lee', 'Park', 'Chen', 'Mendoza', 'Rojas'],
};

/* ---------- Aparência ---------- */
// Ascendência, tons de pele e cabelos possíveis. Pesos "populacao": aproximação do Censo 2022 (IBGE).
// O papel da pessoa no caso (vítima, suspeito…) é sorteado SEM olhar a aparência: nunca ligar aparência a crime.
const ASCENDENCIAS = [
  { id: 'parda', pt: 'parda', en: 'mixed-race Brazilian', populacao: 45, equilibrado: 25,
    pele: [['pele morena clara', 'light olive skin'], ['pele morena', 'warm tan skin'], ['pele parda', 'medium brown skin']],
    cabelo: [['ondulado', 'wavy'], ['cacheado', 'curly'], ['liso', 'straight'], ['crespo', 'coily']], cor: [['preto', 'black'], ['castanho escuro', 'dark brown'], ['castanho', 'brown']],
    olhos: [['castanhos escuros', 'dark brown'], ['castanhos', 'brown'], ['verdes', 'green'], ['cor de mel', 'hazel']] },
  { id: 'branca', pt: 'branca', en: 'white Brazilian', populacao: 43, equilibrado: 25,
    pele: [['pele clara', 'fair skin'], ['pele clara bronzeada', 'lightly tanned skin'], ['pele rosada', 'rosy fair skin']],
    cabelo: [['liso', 'straight'], ['ondulado', 'wavy'], ['cacheado', 'curly']], cor: [['castanho', 'brown'], ['castanho claro', 'light brown'], ['loiro', 'blond'], ['preto', 'black'], ['ruivo', 'red']],
    olhos: [['castanhos', 'brown'], ['verdes', 'green'], ['azuis', 'blue'], ['cor de mel', 'hazel']] },
  { id: 'preta', pt: 'preta', en: 'Afro-Brazilian', populacao: 10, equilibrado: 25,
    pele: [['pele negra', 'dark brown skin'], ['pele negra retinta', 'deep dark skin'], ['pele negra clara', 'medium dark brown skin']],
    cabelo: [['crespo', 'coily'], ['cacheado', 'curly'], ['crespo', 'kinky']], cor: [['preto', 'black'], ['castanho escuro', 'dark brown']],
    olhos: [['castanhos escuros', 'dark brown'], ['pretos', 'deep brown'], ['castanhos', 'brown']] },
  { id: 'amarela', pt: 'amarela (ascendência asiática)', en: 'Brazilian of East Asian descent', populacao: 0.5, equilibrado: 12.5, origem: 'japonesa',
    pele: [['pele clara', 'fair skin'], ['pele dourada', 'light golden skin']],
    cabelo: [['liso', 'straight'], ['levemente ondulado', 'slightly wavy']], cor: [['preto', 'black'], ['castanho escuro', 'dark brown']],
    olhos: [['castanhos escuros', 'dark brown'], ['pretos', 'deep brown']] },
  { id: 'indigena', pt: 'indígena', en: 'Indigenous Brazilian', populacao: 0.6, equilibrado: 12.5,
    pele: [['pele morena', 'warm tan skin'], ['pele acobreada', 'copper-brown skin']],
    cabelo: [['liso', 'straight'], ['liso e grosso', 'thick straight']], cor: [['preto', 'black']],
    olhos: [['castanhos escuros', 'dark brown'], ['pretos', 'deep brown']] },
];
// [pt, en, posição no inglês: 'a' antes de "hair" (adjetivo) ou 'd' depois (expressão), idade mínima]
const COMPRIMENTO_CABELO = {
  F: [['curto na altura do queixo', 'short chin-length', 'a', 0], ['na altura dos ombros', 'shoulder-length', 'a', 0], ['longo', 'long', 'a', 0], ['preso num coque', 'tied in a bun', 'd', 0], ['preso em rabo de cavalo', 'pulled back in a ponytail', 'd', 0], ['com tranças', 'in braids', 'd', 0], ['raspado nas laterais', 'with an undercut', 'd', 0]],
  M: [['bem curto', 'close-cropped', 'a', 0], ['curto', 'short', 'a', 0], ['cabeça raspada', 'shaved', 'careca', 0], ['médio', 'medium-length', 'a', 0], ['com topete', 'with a quiff', 'd', 0], ['careca', 'bald', 'careca', 28], ['com entradas', 'with a receding hairline', 'd', 30]],
};
// [masculino, feminino, inglês]
const TIPO_FISICO = [['magro', 'magra', 'slim build'], ['atlético', 'atlética', 'athletic build'], ['de porte mediano', 'de porte mediano', 'average build'], ['robusto', 'robusta', 'stocky build'], ['acima do peso', 'acima do peso', 'heavyset build'], ['alto e magro', 'alta e magra', 'tall and lanky build']];
const BARBA = [['sem barba', 'clean-shaven'], ['barba por fazer', '5 o\'clock shadow stubble'], ['cavanhaque', 'goatee'], ['bigode', 'thick mustache'], ['barba cheia', 'full beard'], ['barba bem aparada', 'neatly trimmed beard']];
const MARCAS = [['óculos de grau', 'prescription glasses'], ['óculos de armação grossa', 'thick-framed glasses'], ['tatuagem discreta no antebraço', 'small forearm tattoo'], ['cicatriz fina na sobrancelha', 'thin scar on the eyebrow'], ['sardas', 'freckles'], ['piercing no nariz', 'nose piercing'], ['brincos pequenos', 'small earrings'], ['relógio dourado', 'gold wristwatch'], ['corrente fina no pescoço', 'thin neck chain'], ['rugas marcadas', 'deep wrinkles'], ['olheiras fundas', 'dark under-eye circles'], ['aparelho nos dentes', 'dental braces'], ['pinta no rosto', 'beauty mark on the cheek'], ['nenhuma marca marcante', '']];
const EXPRESSOES = {
  vitima: [['preocupada', 'worried'], ['cansada', 'tired and anxious'], ['abalada', 'shaken'], ['indignada', 'indignant']],
  testemunha: [['desconfiada', 'wary'], ['nervosa', 'nervous'], ['séria', 'serious'], ['curiosa', 'curious']],
  suspeito: [['fechada', 'guarded'], ['calculista', 'calculating'], ['arrogante', 'smug'], ['impassível', 'expressionless']],
  laranja: [['confusa', 'confused'], ['humilde e assustada', 'humble and frightened'], ['ingênua', 'naive']],
  operador: [['tensa', 'tense'], ['desconfiada', 'suspicious'], ['debochada', 'sarcastic smirk']],
  tenente: [['fria', 'cold'], ['ameaçadora', 'quietly menacing'], ['confiante', 'confident']],
  chefao: [['confiante e fria', 'cold and confident'], ['sorriso de quem manda', 'knowing smirk of someone in charge'], ['calma demais', 'unsettlingly calm']],
  servidor: [['cansada', 'tired'], ['burocrática', 'bored bureaucratic'], ['simpática', 'friendly']],
  neutro: [['neutra', 'neutral'], ['séria', 'serious'], ['simpática', 'friendly'], ['pensativa', 'thoughtful']],
};
const PERSONALIDADE = ['desconfiado(a)', 'falante', 'metódico(a)', 'ansioso(a)', 'orgulhoso(a)', 'generoso(a)', 'impaciente', 'calmo(a)', 'vaidoso(a)', 'religioso(a)', 'piadista', 'reservado(a)', 'ambicioso(a)', 'leal', 'rancoroso(a)', 'perfeccionista', 'distraído(a)', 'teimoso(a)', 'prestativo(a)', 'dramático(a)'];
const JEITO_DE_FALAR = ['fala rápido e engole o fim das palavras', 'formal, quase de cartório', 'usa diminutivo pra tudo', 'responde pergunta com outra pergunta', 'fala baixo e pausado', 'enche de gírias da cidade', 'conta história comprida antes de responder', 'interrompe o tempo todo', 'muito educado(a), "senhor" e "senhora"', 'cheio(a) de certezas', 'chora com facilidade', 'ri de nervoso'];
const FRAQUEZAS = ['vaidade: precisa ser reconhecido(a)', 'um filho que não sabe de nada', 'aposta em jogo e cavalo', 'coleciona relógios caros', 'tem medo de avião', 'é supersticioso(a) com números', 'a mãe idosa, que visita todo domingo', 'não resiste a um bom vinho', 'confia demais num afilhado', 'mania de anotar tudo num caderno', 'time de futebol: nunca perde um jogo', 'precisa vencer qualquer discussão'];

/* ---------- Profissões ---------- */
// [nome masc|fem, idade mín, idade máx, renda mín, renda máx, estilo de roupa, horário, peso]
const PROFISSOES = [
  ['estudante', 16, 26, 0, 1500, 'casual', [8, 17], 6], ['estagiário|estagiária', 18, 26, 1200, 2200, 'casual', [9, 15], 3],
  ['atendente', 18, 45, 1500, 2200, 'uniforme', [8, 17], 5], ['vendedor|vendedora', 18, 60, 1800, 4500, 'casual', [9, 18], 6],
  ['caixa de supermercado', 18, 50, 1500, 2100, 'uniforme', [7, 16], 4], ['auxiliar administrativo|auxiliar administrativa', 18, 60, 2000, 3200, 'social', [8, 17], 5],
  ['motorista de aplicativo', 22, 65, 2000, 5000, 'casual', [6, 22], 4], ['entregador|entregadora', 18, 45, 1500, 3500, 'esportivo', [10, 22], 4],
  ['professor|professora', 23, 65, 3000, 6500, 'social', [7, 17], 4], ['enfermeiro|enfermeira', 23, 60, 3500, 7000, 'uniforme', [7, 19], 3],
  ['médico|médica', 26, 70, 12000, 35000, 'social', [7, 19], 1], ['advogado|advogada', 24, 70, 5000, 25000, 'social', [9, 19], 2],
  ['engenheiro|engenheira', 24, 65, 7000, 18000, 'social', [8, 18], 2], ['analista de sistemas', 22, 60, 5000, 14000, 'casual', [9, 18], 3],
  ['contador|contadora', 24, 70, 4000, 12000, 'social', [8, 18], 2], ['pedreiro|pedreira', 18, 65, 2200, 4000, 'uniforme', [7, 17], 3],
  ['eletricista', 20, 65, 2500, 5500, 'uniforme', [8, 17], 2], ['mecânico|mecânica', 18, 65, 2500, 5000, 'uniforme', [8, 18], 2],
  ['cabeleireiro|cabeleireira', 18, 65, 1800, 5000, 'casual', [9, 19], 3], ['cozinheiro|cozinheira', 18, 65, 2000, 4500, 'uniforme', [10, 22], 3],
  ['garçom|garçonete', 18, 50, 1700, 3000, 'uniforme', [11, 23], 3], ['vigilante', 21, 60, 2200, 3200, 'uniforme', [19, 7], 3],
  ['porteiro|porteira', 21, 70, 1800, 2600, 'uniforme', [7, 19], 3], ['diarista', 20, 70, 1800, 3500, 'casual', [8, 16], 3],
  ['servidor público|servidora pública', 22, 70, 3500, 15000, 'social', [9, 17], 4], ['empresário|empresária', 25, 75, 8000, 60000, 'luxo', [9, 19], 2],
  ['comerciante', 25, 75, 3000, 12000, 'casual', [8, 19], 3], ['feirante', 20, 75, 1800, 4000, 'casual', [5, 13], 2],
  ['aposentado|aposentada', 60, 95, 1412, 6000, 'casual', [8, 16], 8], ['corretor de imóveis|corretora de imóveis', 22, 70, 3000, 15000, 'social', [9, 19], 2],
  ['bancário|bancária', 22, 65, 4500, 11000, 'social', [10, 16], 2], ['farmacêutico|farmacêutica', 23, 65, 5000, 9000, 'uniforme', [8, 20], 2],
  ['jornalista', 22, 70, 3500, 12000, 'casual', [10, 20], 1], ['arquiteto|arquiteta', 24, 70, 5000, 15000, 'social', [9, 18], 1],
  ['operador de telemarketing|operadora de telemarketing', 18, 40, 1500, 2100, 'casual', [8, 14], 3], ['auxiliar de logística', 18, 55, 1800, 2800, 'uniforme', [6, 15], 3],
  ['caminhoneiro|caminhoneira', 23, 70, 3500, 8000, 'casual', [4, 18], 2], ['estivador|estivadora', 21, 60, 3000, 7000, 'uniforme', [6, 18], 1],
  ['despachante aduaneiro|despachante aduaneira', 25, 70, 5000, 14000, 'social', [8, 18], 1], ['agricultor|agricultora', 18, 80, 1500, 6000, 'casual', [5, 16], 1],
  ['do lar', 20, 85, 0, 0, 'casual', [0, 0], 2], ['desempregado|desempregada', 18, 65, 0, 600, 'casual', [0, 0], 3], ['autônomo|autônoma', 20, 70, 1500, 8000, 'casual', [8, 18], 3],
].map(p => ({ nome: p[0], min: p[1], max: p[2], rendaMin: p[3], rendaMax: p[4], roupa: p[5], horario: p[6], peso: p[7] }));
const ROUPAS = {
  casual: [['camiseta lisa e calça jeans', 'a plain t-shirt and jeans'], ['camisa xadrez de botão', 'a plaid button-up shirt'], ['moletom com capuz', 'a hoodie'], ['blusa de malha e jaqueta jeans', 'a knit top and a denim jacket']],
  social: [['camisa social e calça de alfaiataria', 'a dress shirt and tailored trousers'], ['blazer sobre camisa clara', 'a blazer over a light shirt'], ['camisa social com as mangas dobradas', 'a dress shirt with rolled-up sleeves']],
  uniforme: [['uniforme de trabalho com crachá', 'a work uniform with an ID badge'], ['camisa polo da empresa', 'a company polo shirt'], ['jaleco', 'a work coat']],
  esportivo: [['jaqueta corta-vento e boné', 'a windbreaker jacket and a cap'], ['camiseta esportiva', 'a sports t-shirt']],
  luxo: [['terno escuro bem cortado', 'a sharp dark tailored suit'], ['camisa de linho e relógio caro', 'a linen shirt and an expensive watch'], ['blazer de grife', 'a designer blazer']],
};
const CENARIOS = {
  neutro: 'plain dark neutral studio background', escritorio: 'cluttered fluorescent-lit office', rua: 'busy city street at dusk', interrogatorio: 'dim police interrogation room',
  casa: 'modest living room at home', luxo: 'upscale apartment with city lights', porto: 'container port at night', galpao: 'dim industrial warehouse', reparticao: 'government office with old filing cabinets',
};

/* ---------- Cidade, bairros e ruas ---------- */
const PERFIS_BAIRRO = [
  { id: 'financeiro', nome: 'Centro financeiro', renda: [6000, 25000], pop: [8000, 30000], crimes: ['fraude corporativa', 'lavagem de dinheiro', 'golpe de investimento'], cenaEn: 'glass office towers of a financial district at dusk', prefixos: ['Centro', 'Jardim', 'Alto da'], nomes: ['Bela Aurora', 'das Nações', 'dos Ipês Altos', 'do Mirante', 'Alto Comércio', 'dos Bancos'] },
  { id: 'porto', nome: 'Porto e retroporto', renda: [2200, 6000], pop: [15000, 50000], crimes: ['contrabando', 'roubo de carga', 'desvio de contêiner'], cenaEn: 'busy container port with cranes at night', prefixos: ['Porto', 'Vila', 'Cais do'], nomes: ['Velho', 'das Gaivotas', 'Novo', 'do Mangue', 'Marítimo', 'da Maré'] },
  { id: 'periferia', nome: 'Periferia', renda: [1200, 3500], pop: [40000, 150000], crimes: ['golpe do PIX em idosos', 'furto de celular', 'receptação'], cenaEn: 'dense hillside neighborhood of brick houses at sunset', prefixos: ['Jardim', 'Vila', 'Conjunto', 'Parque'], nomes: ['Esperança', 'São Benedito', 'das Flores', 'Primavera', 'Santa Luzia', 'Novo Horizonte', 'Boa Vista'] },
  { id: 'condominios', nome: 'Condomínios de alto padrão', renda: [15000, 80000], pop: [5000, 20000], crimes: ['sonegação', 'empresas de fachada', 'laranjas'], cenaEn: 'gated luxury condominium with palm trees', prefixos: ['Residencial', 'Portal', 'Recanto', 'Jardins'], nomes: ['das Palmeiras', 'Montecarlo', 'do Lago', 'Imperial', 'Bosque Real', 'Vale Verde'] },
  { id: 'industrial', nome: 'Distrito industrial', renda: [2500, 7000], pop: [3000, 12000], crimes: ['desvio de estoque', 'nota fria', 'galpão clandestino'], cenaEn: 'industrial district with warehouses and trucks', prefixos: ['Distrito Industrial', 'Polo', 'Parque Industrial'], nomes: ['Norte', 'Sul', 'das Indústrias', 'Leste', 'do Anel Viário'] },
  { id: 'governo', nome: 'Centro administrativo', renda: [4000, 15000], pop: [10000, 25000], crimes: ['fraude em licitação', 'servidor fantasma', 'propina'], cenaEn: 'old government buildings and a city hall plaza', prefixos: ['Centro Cívico', 'Praça', 'Vila'], nomes: ['dos Três Poderes', 'da Matriz', 'Administrativa', 'do Palácio'] },
  { id: 'historico', nome: 'Centro histórico', renda: [2000, 6000], pop: [20000, 60000], crimes: ['furto a turistas', 'falsificação', 'golpe do cartão'], cenaEn: 'colonial historic downtown with cobblestone streets', prefixos: ['Centro', 'Largo', 'Vila'], nomes: ['Velho', 'da Sé', 'do Rosário', 'das Artes', 'São Bento'] },
  { id: 'universitario', nome: 'Bairro universitário', renda: [2500, 9000], pop: [15000, 40000], crimes: ['golpe de aluguel', 'venda de ingressos falsos', 'fraude em bolsa'], cenaEn: 'lively university neighborhood with bars and bikes', prefixos: ['Cidade', 'Vila', 'Jardim'], nomes: ['Universitária', 'Acadêmica', 'dos Estudantes', 'do Saber'] },
  { id: 'litoral', nome: 'Orla e praia', renda: [3000, 20000], pop: [10000, 40000], crimes: ['furto na praia', 'aluguel de temporada falso', 'lavagem em restaurante'], cenaEn: 'beachfront boardwalk with kiosks at golden hour', prefixos: ['Praia', 'Orla', 'Enseada'], nomes: ['Brava', 'do Sol', 'dos Coqueiros', 'Mansa', 'da Gaivota'] },
  { id: 'rodoviaria', nome: 'Rodoviária e entorno', renda: [1800, 4000], pop: [10000, 30000], crimes: ['contrabando de cigarros', 'golpe de passagem', 'furto de bagagem'], cenaEn: 'crowded bus terminal at night with neon signs', prefixos: ['Vila', 'Largo', 'Jardim'], nomes: ['Terminal', 'dos Viajantes', 'da Estação', 'Rodoviária'] },
];
const RUAS_TIPO = [['Rua', 10], ['Avenida', 3], ['Travessa', 1], ['Alameda', 1], ['Praça', 0.5], ['Estrada', 0.5]];
const RUAS_NOME = ['das Acácias', 'dos Ipês', 'das Palmeiras', 'XV de Novembro', 'Sete de Setembro', 'das Hortênsias', 'dos Pescadores', 'do Comércio', 'Santa Cruz', 'São José', 'da Liberdade', 'das Rosas', 'do Sol', 'dos Jacarandás', 'Primavera', 'do Rosário', 'da Paz', 'Boa Esperança', 'das Mangueiras', 'do Progresso', 'dos Operários', 'das Andorinhas', 'do Mercado', 'da Estação'];
const HOMENAGEM = ['Dr.', 'Prof.', 'Profa.', 'Cel.', 'Dona', 'Seu', 'Padre', 'Maestro', 'Vereador'];
const PONTOS_REFERENCIA = ['radar de velocidade', 'antena de celular', 'agência bancária', 'câmera de monitoramento', 'posto de combustível', 'farmácia 24 h', 'supermercado', 'escola estadual', 'UBS', 'ponto de ônibus', 'estacionamento', 'shopping', 'feira livre', 'igreja matriz', 'praça'];
// Nomes possíveis para a cidade fictícia (sempre conferir na lista de municípios do IBGE antes de adotar)
const CIDADE_PARTES = { a: ['Porto', 'Vale', 'Nova', 'Santa', 'São', 'Alto', 'Campos', 'Serra', 'Rio', 'Monte'], b: ['Aurora', 'Ventania', 'Sereno', 'Alvorada', 'Andorinha', 'Tamarindo', 'Graúna', 'Coruja', 'Ipê Roxo', 'Seriema', 'Jaçanã', 'Quaresma'], c: ['do Sul', 'do Oeste', 'da Serra', 'do Mar', 'Paulista', 'Grande', 'Velha', ''] };

/* ---------- Empresas ---------- */
const RAMOS = [
  { id: 'logistica', nome: 'transporte e logística', termos: ['Transportes', 'Logística', 'Cargas', 'Expresso'], func: [10, 300], capital: [100000, 5000000] },
  { id: 'varejo', nome: 'comércio varejista', termos: ['Comércio', 'Magazine', 'Distribuidora', 'Atacadão'], func: [3, 120], capital: [20000, 2000000] },
  { id: 'construcao', nome: 'construção civil', termos: ['Construtora', 'Engenharia', 'Obras', 'Edificações'], func: [5, 400], capital: [50000, 10000000] },
  { id: 'alimentos', nome: 'alimentação', termos: ['Restaurante', 'Alimentos', 'Padaria', 'Lanchonete'], func: [3, 80], capital: [10000, 800000] },
  { id: 'tecnologia', nome: 'tecnologia', termos: ['Tecnologia', 'Sistemas', 'Digital', 'Software'], func: [2, 200], capital: [10000, 3000000] },
  { id: 'consultoria', nome: 'consultoria', termos: ['Consultoria', 'Assessoria', 'Gestão', 'Soluções'], func: [1, 40], capital: [1000, 500000] },
  { id: 'importacao', nome: 'importação e exportação', termos: ['Importadora', 'Comércio Exterior', 'Trading', 'Import & Export'], func: [2, 60], capital: [100000, 8000000] },
  { id: 'armazem', nome: 'armazéns gerais', termos: ['Armazéns Gerais', 'Armazenagem', 'Depósitos', 'Estocagem'], func: [2, 50], capital: [50000, 3000000] },
  { id: 'eventos', nome: 'eventos', termos: ['Eventos', 'Produções', 'Promoções', 'Festas'], func: [1, 30], capital: [5000, 300000] },
  { id: 'seguranca', nome: 'segurança privada', termos: ['Segurança', 'Vigilância', 'Proteção', 'Monitoramento'], func: [10, 500], capital: [100000, 2000000] },
  { id: 'limpeza', nome: 'limpeza e conservação', termos: ['Serviços Gerais', 'Limpeza', 'Conservação', 'Facilities'], func: [10, 600], capital: [20000, 1500000] },
  { id: 'saude', nome: 'saúde', termos: ['Clínica', 'Laboratório', 'Saúde', 'Diagnósticos'], func: [5, 150], capital: [50000, 4000000] },
  { id: 'combustivel', nome: 'posto de combustível', termos: ['Auto Posto', 'Combustíveis', 'Posto'], func: [5, 40], capital: [200000, 3000000] },
  { id: 'autopecas', nome: 'autopeças', termos: ['Autopeças', 'Peças', 'Auto Center'], func: [3, 50], capital: [30000, 1000000] },
  { id: 'fomento', nome: 'fomento mercantil (factoring)', termos: ['Fomento Mercantil', 'Factoring', 'Créditos', 'Capital'], func: [1, 15], capital: [100000, 5000000] },
  { id: 'instituto', nome: 'instituto / associação sem fins lucrativos', termos: ['Instituto', 'Associação', 'Fundação'], func: [1, 40], capital: [0, 0] },
  { id: 'cambio', nome: 'câmbio e turismo', termos: ['Câmbio', 'Turismo', 'Viagens'], func: [2, 30], capital: [100000, 2000000] },
  { id: 'joalheria', nome: 'joalheria', termos: ['Joias', 'Joalheria', 'Ourives'], func: [2, 20], capital: [50000, 3000000] },
  { id: 'veiculos', nome: 'revenda de veículos', termos: ['Veículos', 'Multimarcas', 'Automóveis', 'Motors'], func: [3, 40], capital: [100000, 5000000] },
  { id: 'imobiliaria', nome: 'imobiliária', termos: ['Imóveis', 'Imobiliária', 'Empreendimentos', 'Participações'], func: [2, 60], capital: [50000, 10000000] },
];
const MARCA_EMPRESA = ['Aurora', 'Horizonte', 'Vértice', 'Primavera', 'Atlas', 'Nexo', 'Prisma', 'Seriema', 'Ipê', 'Bandeira', 'Cruzeiro', 'Estrela Guia', 'Rumo Sul', 'Três Irmãos', 'Bom Jesus', 'Nova Era', 'Pioneira', 'Real', 'Imperial', 'Capital', 'Litoral', 'Serrana', 'Paulistana', 'Ponte Alta', 'Boa Viagem', 'Santa Fé'];
const NATUREZA_JURIDICA = [['Ltda', 6], ['ME', 3], ['S.A.', 1], ['SLU', 2], ['EPP', 1]];   // EIRELI não existe mais (Lei 14.195/2021)
const BANCOS_FICTICIOS = ['Banco Seriema', 'Banco Ipê Roxo', 'Banco Mandacaru', 'Caixa Pitanga', 'Banco Quaresmeira', 'NuvemBank', 'Coop Crédito Vale', 'Banco Graúna'];

/* ---------- Veículos ---------- */
// [marca, modelo, tipo, preço aproximado novo em 2026 (R$), ano de lançamento mais antigo, descontinuado em]
const MODELOS = [
  ['Fiat', 'Mobi', 'carro', 75000, 2016], ['Fiat', 'Argo', 'carro', 90000, 2017], ['Fiat', 'Strada', 'caminhonete', 115000, 2008], ['Fiat', 'Toro', 'caminhonete', 170000, 2016],
  ['Volkswagen', 'Polo', 'carro', 100000, 2018], ['Volkswagen', 'Virtus', 'carro', 120000, 2018], ['Volkswagen', 'T-Cross', 'carro', 155000, 2019], ['Volkswagen', 'Saveiro', 'caminhonete', 105000, 2010], ['Volkswagen', 'Gol', 'carro', 65000, 2008, 2022],
  ['Chevrolet', 'Onix', 'carro', 95000, 2013], ['Chevrolet', 'Tracker', 'carro', 145000, 2014], ['Chevrolet', 'S10', 'caminhonete', 260000, 2008], ['Chevrolet', 'Spin', 'carro', 120000, 2013],
  ['Hyundai', 'HB20', 'carro', 95000, 2013], ['Hyundai', 'Creta', 'carro', 150000, 2017], ['Toyota', 'Corolla', 'carro', 165000, 2008], ['Toyota', 'Hilux', 'caminhonete', 310000, 2008], ['Toyota', 'Yaris', 'carro', 110000, 2018],
  ['Honda', 'Civic', 'carro', 180000, 2008], ['Honda', 'HR-V', 'carro', 165000, 2015], ['Honda', 'City', 'carro', 125000, 2009], ['Renault', 'Kwid', 'carro', 72000, 2017], ['Renault', 'Sandero', 'carro', 85000, 2008],
  ['Jeep', 'Renegade', 'carro', 135000, 2015], ['Jeep', 'Compass', 'carro', 195000, 2016], ['Nissan', 'Kicks', 'carro', 125000, 2016], ['Ford', 'Ranger', 'caminhonete', 290000, 2008], ['Peugeot', '208', 'carro', 95000, 2013],
  ['Honda', 'CG 160', 'moto', 19000, 2016], ['Honda', 'Biz', 'moto', 16000, 2008], ['Yamaha', 'Fazer 250', 'moto', 26000, 2008], ['Honda', 'XRE 300', 'moto', 32000, 2009], ['Honda', 'PCX', 'moto', 21000, 2013],
  ['Volkswagen', 'Delivery 11.180', 'caminhão', 320000, 2017], ['Mercedes-Benz', 'Accelo 1016', 'caminhão', 380000, 2012], ['Scania', 'R 450', 'caminhão', 850000, 2013], ['Volvo', 'FH 540', 'caminhão', 900000, 2010],
].map(m => ({ marca: m[0], modelo: m[1], tipo: m[2], preco: m[3], desde: m[4], ate: m[5] || 2026 }));
// Cores mais vendidas no Brasil (aproximação): branco, prata, cinza e preto dominam.
const CORES_VEICULO = [['branco', 30], ['prata', 20], ['cinza', 20], ['preto', 20], ['vermelho', 5], ['azul', 4], ['verde', 0.5], ['bege', 0.5]];

/* ---------- Transações ---------- */
const DESCRICOES_PIX = ['PIX', 'PIX', 'PIX', 'aluguel', 'mercado', 'conserto', 'empréstimo', 'presente', 'mensalidade', 'venda de usado', 'rachar a conta', 'pagamento', 'devolução', null, null];

if (typeof module !== 'undefined') module.exports = { NOMES, geracaoNome, SOBRENOMES, SOBRENOMES_ORIGEM, ASCENDENCIAS, PROFISSOES };
