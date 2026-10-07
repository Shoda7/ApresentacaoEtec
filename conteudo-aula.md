# Bancos de dados: do caderno da cantina ao Big Data

> Roteiro-fonte da aula na ETEC (Informática), com **Matheus** e **Leonardo**.
> Inspirado no vídeo do Fabio Akita, [*Discutindo sobre Banco de Dados - Dos primórdios a Big Data*](https://www.youtube.com/watch?v=Bfm3Ms2cTg0) ([transcrição](https://www.akitaonrails.com/2023/07/22/akitando-143-discutindo-sobre-banco-de-dados-dos-primordios-a-big-data)).
> Este arquivo é a base para o site com animações.
>
> **Formato:** na sala, a apresentação roda **como slides** (avança com o teclado ou o clique), mas é um **site** que nós mesmos vamos construir, com animações e partes interativas.

### Nomes editáveis no site
A tia e a cantina ganham **nome próprio** para aproximar a turma. Os nomes ficam num **campo editável no próprio site** (ex.: um painel de configuração ou um clique no nome), para trocar pelos nomes reais da ETEC no dia.

| Variável | Valor padrão | Onde aparece |
|---|---|---|
| `{TIA}` | Tia Cida | Toda a história do CantinaApp |
| `{CANTINA}` | Cantina da Cida | Abertura, capa, app fictício |

Neste roteiro, os textos usam `{TIA}` e `{CANTINA}` onde o nome deve ser trocado.

**Legenda**
- 🎤 quem apresenta · ⏱ tempo
- ❓ pergunta para a turma (com a resposta esperada)
- ⚔️ duelo de consultas (A x B)
- 🙋 dinâmica com a turma
- 🎬 ideia de animação para o site
- ⏭️ opcional: pular se o tempo apertar
- 📺 capítulo do vídeo do Akita
- ➕ complemento nosso (não está no vídeo)
- 📝 veio das anotações de vocês sobre o vídeo

---

## Visão geral

A aula ocupa um horário de 1h30. A **apresentação tem 70 min**; os outros 20 min ficam de folga para chegada da turma, perguntas e atrasos. Se sobrar tempo, usem a seção **"Conteúdo reserva"** no fim.

| # | Bloco | ⏱ | Duração | 🎤 |
|---|---|---|---|---|
| 1 | Abertura | 0–4 | 4 | Ambos |
| 2 | Cap. 0–1: do caderno ao arquivo (array JSON na memória) | 4–11 | 7 | Matheus |
| 3 | Cap. 2: índices e B-Tree (dinâmica com Leonardo, árvore crescendo) | 11–24 | 13 | Matheus (+ Leonardo) |
| 4 | Cap. 3: a queda de luz e as travas | 24–30 | 6 | Leonardo |
| 5 | Cap. 4: o estagiário e o loop | 30–40 | 10 | Leonardo |
| 6 | Cap. 5: dividir para conquistar (números reais, comparação das tias) | 40–50 | 10 | Ambos |
| 7 | Cap. 6: por que NoSQL e consistência | 50–57 | 7 | Leonardo (+ Matheus no caso Mercado Pago) |
| 8 | Cap. 7: distribuição e particionamento | 57–66 | 9 | **Matheus** |
| 9 | Fechamento | 66–70 | 4 | Ambos |

**Divisão:** Matheus 29 min · Leonardo 23 min · Juntos 18 min. O Leonardo também participa da dinâmica do bloco 3, e o Matheus conta o caso Mercado Pago no bloco 7.

**Opcionais ⏭️:** os duelos marcados com ⏭️ podem ser pulados se o tempo apertar.

### O fio condutor: a história do CantinaApp ➕
Uma história fictícia que atravessa a aula. Em cada capítulo o app cresce e algo quebra. A cantina também serve de analogia física, porque todo aluno conhece a fila do intervalo.

| Capítulo | Tamanho | O que quebra |
|---|---|---|
| 0. O caderno da {TIA} | 1 caderno | Achar quem está devendo exige folhear página por página |
| 1. Vira TCC | 1 turma, 40 alunos | Nada, e esse é o perigo |
| 2. A ETEC inteira adota | 2 mil alunos | A busca por nome fica lenta |
| 3. A queda de luz | — | Crédito debitado duas vezes |
| 4. O estagiário e o loop | — | A promoção "+10% de crédito" leva horas |
| 5. Todas as ETECs do estado | 229 ETECs, 224 mil alunos, intervalo às 10h em todas | O servidor não aguenta o pico |
| 6. Viralizou no Brasil | Milhões de pedidos | O saldo aparece diferente em cada tela |
| 7. Um servidor não guarda tudo | — | Como dividir os dados? |

### Sobre os números dos duelos
Todos os tempos foram **medidos de verdade** num SQLite, num notebook comum. A base tem 100 mil alunos e 300 mil pedidos, e cada tempo é a média de várias execuções. Os números exatos mudam de máquina para máquina; o que importa é a **proporção** entre A e B. Num servidor de verdade, com rede no meio, a diferença fica **ainda maior**.

---

## 1. Abertura
🎤 Ambos · ⏱ 0–4 min

**Ideia central**
Banco de dados não é "onde a gente faz SELECT". É um programa que resolve problemas difíceis:
- achar dados rápido;
- não perder nada quando a luz acaba;
- aguentar milhões de pessoas ao mesmo tempo.

Cada recurso que vocês usam hoje existe porque, um dia, alguém sofreu sem ele.

**Recado de escopo:** esta aula não é sobre modelagem ou diagrama entidade-relacionamento. É sobre **o que acontece por baixo dos panos**.

❓ **"Quantos bancos de dados vocês têm no bolso agora?"**
→ Dezenas. Quase todo app de celular guarda dados num SQLite: WhatsApp, agenda, navegador. Também tem SQLite na smart TV, no roteador e no relógio.

**Gancho:** apresentar a **{TIA}**, da **{CANTINA}**, e o caderno dela. "Vamos acompanhar o que acontece quando esse caderno vira um app, e o app vira um sucesso nacional."

🎬 A fachada da {CANTINA} com a {TIA} no balcão; o caderno com as páginas virando; os celulares da plateia acendendo com o ícone do SQLite.

---

## 2. Cap. 0–1: do caderno ao arquivo
🎤 Matheus · ⏱ 4–11 min · 📺 CAP 01

**História:** a {TIA} anota "fulano deve R$ 5" no caderno da {CANTINA}. Para saber quanto o João deve, ela folheia página por página. Uma turma transforma o caderno num app de TCC. Com 40 alunos, tudo é instantâneo.

### O que é um banco de dados? 📝
O banco de dados mais simples de todos é um **array na memória**: uma fileira de registros, um atrás do outro.

### Mostrar: o caderno da {TIA} como um array JSON na memória 📝
**Passo 1: o array.** É assim que o app de TCC guarda o caderno:
```js
const caderno = [
  { id: 1, aluno: "Ana",   deve: 5.00 },   // posição 0
  { id: 2, aluno: "Bruno", deve: 0.00 },   // posição 1
  { id: 3, aluno: "João",  deve: 12.50 },  // posição 2
  { id: 4, aluno: "Maria", deve: 3.00 },   // posição 3
  { id: 5, aluno: "Pedro", deve: 7.00 },   // posição 4
];

caderno[2];                                   // direto pela posição: instantâneo
caderno.find(r => r.aluno === "Pedro");       // sem saber a posição: olha um por um
```
- `caderno[2]` vai **direto** ao João: o computador calcula o endereço.
- `find` precisa olhar Ana, Bruno, João, Maria... até achar o Pedro.

**Passo 2: apagar um valor.** O João pagou a dívida e sai do caderno:
```js
caderno.splice(2, 1);   // remove a posição 2 (João)
// [Ana, Bruno, Maria, Pedro]  → Maria e Pedro "andaram" uma casa para a esquerda
```
❓ **"O que aconteceu com a Maria e o Pedro?"**
→ **Mudaram de posição.** Num array, os itens ficam **colados** na memória, então apagar do meio obriga a **mover todos os que vêm depois** para fechar o buraco.
- Com 5 itens, ninguém percebe. Com 1 milhão, apagar o primeiro item move 999.999.
- Quem guardou "o Pedro está na posição 4" agora está **errado**.

**Passo 3: o atalho.** Em vez de mover todo mundo, **marcar** o registro como apagado:
```js
caderno[2].apagado = true;   // ninguém se mexe; o "buraco" continua ocupando espaço
```
→ É exatamente o que o dBase fazia, e o que os bancos ainda fazem hoje (a **exclusão lógica** do bloco 3).

🎬
- Cinco caixinhas lado a lado com os nomes e as posições 0–4 em cima.
- No `splice`, a caixa do João explode e Maria e Pedro **deslizam** para a esquerda, com as posições piscando (3→2, 4→3).
- Na versão com `apagado: true`, a caixa do João só fica **cinza**, e ninguém se mexe.

### Endereço e tempo de acesso 📝
- Num array, todos os elementos têm o **mesmo tamanho**. Ex.: inteiros de 8 bytes.
- Para pegar o 5º elemento, basta calcular o **endereço**: pular 4 × 8 = 32 bytes desde o início.
- Isso leva o **mesmo tempo** com 10 ou com 10 milhões de elementos. É o chamado **tempo constante**.
- O problema é quando você **não sabe a posição**. Aí só resta olhar um por um, e o tempo cresce junto com os dados.

### Quando a memória acaba: o arquivo *append only* 📝
- Os dados não cabem mais na RAM, então vão para o disco.
- O jeito mais simples é um arquivo em que **só se acrescenta no fim** (*append only*).
- Cada registro tem tamanho fixo: nome com 100 bytes + telefone com 13 = 113 bytes. O registro 1 ocupa os bytes 0–112, o registro 2 ocupa os bytes 113–225, e assim por diante.
- Foi assim nos anos 80 com o **dBase** e o arquivo **.DBF** (*database file*), um arquivo por tabela.
- Procurar um dado era um loop `DO WHILE` comparando registro por registro.

**Contraste de época:**
- Um PC típico tinha **640 KB** de RAM e cerca de **15 MHz**. O celular de vocês tem milhares de vezes mais.
- O "backup" era copiar o arquivo para um **disquete** no fim do dia, porque arquivos corrompiam com frequência.

❓ **"Com 40 alunos, faz diferença procurar um por um?"**
→ Nenhuma perceptível. É exatamente por isso que o jeito errado parece certo no TCC: **"com 100 registros tudo parece rápido"**.

🎬
- Uma fileira de caixinhas na memória, com endereços em cima (0, 8, 16, 24...).
- Uma seta "pula" direto para a 5ª caixa, com um cronômetro mostrando sempre o mesmo tempo.
- Depois a fileira "cai" para dentro de um disco e vira uma fita que só cresce para a direita.

---

## 3. Cap. 2: índices e B-Tree
🎤 Matheus (Leonardo participa da dinâmica) · ⏱ 11–24 min · 📺 CAP 02 e 04

**História:** a ETEC inteira adotou o CantinaApp, com 2 mil alunos. A {TIA} digita "João" e espera... e espera.

### 🙋 Dinâmica: "Quem é o João?" 📝
Os alunos já estão sentados em fileiras, o que é perfeito para isso.

**Preparação (antes da aula):**
- Combinar com a turma, ou com o professor, quem é o "João". Se não houver um João na sala, um aluno topa ser o João.
- Numerar as fileiras e as cadeiras: um papel colado na ponta de cada fileira, ou um slide com o mapa da sala.

**Rodada 1: sem índice (Matheus)**
1. Matheus diz: "Preciso achar o João" e pergunta o nome de **cada aluno, fileira por fileira**, do primeiro em diante, até encontrar.
2. A turma conta em voz alta quantas perguntas foram feitas (ou um contador no slide).
3. "Se o João estivesse na última cadeira, eu teria perguntado para a sala inteira. Esse é o **pior caso**: a **busca sequencial**."

**Rodada 2: com índice (Matheus + Leonardo)**
1. **Leonardo sai da sala.**
2. Matheus escolhe **outro aluno** (ex.: "a Ana") e **já faz a busca** antes: consulta a lista da chamada ou pergunta, e anota a coordenada. Ex.: "Ana → **fileira 3, cadeira 2**".
3. Leonardo volta. Matheus **só passa a coordenada**: "fileira 3, cadeira 2".
4. Leonardo vai **direto** até a cadeira e acerta de primeira, **sem perguntar o nome de ninguém**.
5. Fechamento: "A anotação que eu fiz é o **índice**. Eu gastei tempo **antes** montando o índice para que a busca fosse instantânea **na hora**."

**Rodada 3: o custo do índice (perguntas para a turma)**
- "Se a Ana **trocar de lugar**, o que acontece com a minha anotação?" → Fica errada. Toda mudança obriga a **atualizar o índice**.
- "Chegaram 10 alunos novos." → Mais 10 anotações para fazer **antes** de poder buscá-los.
- "E se eu quiser achar alguém pela **data de aniversário**?" → A anotação por nome não serve; é preciso **outro índice**.
- Mais índices significam **mais papel** (espaço) e **mais trabalho** a cada mudança (tempo de escrita).

🎬 **Slide de apoio:** um mapa da sala visto de cima, com as cadeiras como quadradinhos.
- **Rodada 1:** cada cadeira acende em sequência e um contador sobe ("perguntas: 1, 2, 3...").
- **Rodada 2:** aparece uma "ficha de índice" com "Ana → F3·C2" e uma seta voa direto para a cadeira; contador: **1**.

### Ideia central
- **Índice** é uma estrutura separada e **ordenada** que aponta onde cada registro está, como a lista da dinâmica ou o índice no fim de um livro.
- A busca deixa de ser **linear** (dobrou os dados, dobrou o tempo) e passa a ser **logarítmica** (dobrou os dados, quase nada muda).
  - Conta do Akita: 10 mil registros a 1 ms cada levam cerca de **10 s** no pior caso; com índice, cerca de **10 ms**.
- **Índices ocupam espaço e gastam tempo** 📝:
  - No exemplo do Akita em dBase, os arquivos de índice ficaram quase **o dobro** do tamanho da tabela.
  - Cada `INSERT`, `UPDATE` ou `DELETE` precisa atualizar **todos** os índices. Com 3 índices, uma inserção pode custar cerca de 4 vezes mais.
  - Curiosidade: no dBase os índices corrompiam com frequência, e todo sistema tinha no menu a opção **"Reindexar"**.

❓ **"Vou criar índice em TODAS as colunas para deixar tudo rápido. Boa ideia?"** (mãos levantadas)
→ Não. É como ter uma lista para nome, outra para idade, outra para cor do tênis... e reescrever todas a cada aluno novo. Crie índice só para **as buscas que você realmente faz**.

### Apagar não apaga: exclusão lógica 📝
- **No .DBF:** apagar um registro só liga uma **marca de "apagado"**. O registro continua lá, ocupando espaço, e o arquivo **não diminui**.
  - Para recuperar o espaço, era preciso rodar o comando `PACK`, que **reescreve o arquivo inteiro** só com os registros válidos.
  - E você precisava ter espaço livre no disco do tamanho do arquivo para isso.
- **Hoje** a ideia continua. No SQLite e no Postgres, apagar libera espaço **dentro** do arquivo, mas o arquivo não encolhe sozinho.
  - O comando `VACUUM` (ou o `AUTO VACUUM`) **reprocessa e desfragmenta** o arquivo para devolver o espaço ao disco.

❓ **"Apaguei metade dos registros. O arquivo diminuiu?"**
→ Não. Só depois do `VACUUM`.

### 🚢 Curiosidade: o SQLite nasceu num navio de guerra 📝
- **Primavera de 2000.** D. Richard Hipp trabalhava para a General Dynamics num sistema de **controle de avarias** do **USS Oscar Austin**, um contratorpedeiro da Marinha dos EUA.
  - Controle de avarias: saber onde há fogo, água entrando ou um compartimento danificado.
- O sistema usava um banco **cliente-servidor** (Informix). Quando o servidor do banco ficava fora do ar, o sistema **não funcionava**, e num navio em combate isso é inaceitável.
- Hipp então criou um banco **sem servidor**, **sem instalação**, **sem configuração**: tudo num **único arquivo** que o próprio programa abre. Esse banco é o **SQLite**.
  - Versão 1.0: agosto de 2000.
  - Versão 2.0 (2001): passou a usar uma **árvore B** própria e ganhou **transações**.
- Hoje está em praticamente todo celular, navegador, smart TV e avião.
- Fonte: [Wikipedia: SQLite](https://en.wikipedia.org/wiki/SQLite)

❓ **"Por que um navio de guerra não pode depender de um servidor de banco de dados?"**
→ Se o servidor cai (ou o cabo de rede é atingido), tudo para. Um arquivo local não tem esse **ponto único de falha**. (Ganchos com os blocos 6 e 7.)

🎬 Um navio cinza no mar; um "servidor" no porão pisca em vermelho e o painel do navio apaga. Corta para um único arquivo `.db` brilhando, e o painel volta a acender.

### SQLite por dentro: a árvore B 📝
- O SQLite é o sucessor espiritual do dBase: um arquivo só com todas as tabelas, sem servidor, menos de 1 MB de RAM. É provavelmente o banco **mais usado do mundo**.
- Diferente do .DBF, **tanto a tabela quanto os índices** são **árvores B** (*B-Tree*). Postgres, MySQL, MongoDB e até sistemas de arquivos usam variantes dela.
- O "B" **não** é de binária. Pense em "**balanceada**": todas as folhas ficam na mesma profundidade, então qualquer busca leva mais ou menos o mesmo número de passos.
- Cada nó tem **muitos filhos**, então a árvore fica baixa e larga.
  - Com cerca de 100 chaves por nó, **3 níveis** já endereçam **1 milhão** de registros e **4 níveis**, 100 milhões.
- Os dados ficam agrupados em **páginas**, e registros vizinhos são lidos juntos do disco.

### Mostrar a árvore B crescendo 📝
Antes de buscar, a turma precisa **ver** a árvore. Mostrar a mesma ideia em **três tamanhos**, usando os nomes dos alunos (ou números) como chaves.

Para caber na tela, o exemplo usa **no máximo 2 nomes por nó**. Os bancos reais usam centenas.

**Tamanho 1: poucos alunos (só a raiz).** Tudo cabe num nó só:
```
[ Ana | João ]
```

**Tamanho 2: a folha encheu e se dividiu.** Ao inserir "Pedro", o nó estoura (3 nomes), se divide em dois e o nome do meio (**João**) **sobe** para virar a raiz. Depois entram Bruno e Maria:
```
              [ João ]
             /        \
   [ Ana | Bruno ]   [ Maria | Pedro ]
```

**Tamanho 3: muitos alunos.** Mais divisões, mais folhas. A árvore cresce **para os lados** e só ganha um andar quando a raiz também enche:
```
                         [ Gabi | Otávio ]
                /                |                  \
     [ Bruno | Diego ]     [ Isa | Leonardo ]     [ Rafa | Thiago ]
      /     |     \          /     |     \           /     |     \
  [Ana]  [Carla] [Eduarda] [Heitor] [João] [Matheus] [Paula] [Sofia] [Vitória]
```
- **Todas as folhas no mesmo andar**: é isso que significa "balanceada".
- **17 nomes** em 9 folhas e só **3 andares**. Com 100 chaves por nó, como nos bancos reais, 3 andares guardam cerca de **1 milhão** de registros.

**Comparar lado a lado:**
| | Poucas folhas (tamanho 1) | Muitas folhas (tamanho 3) | Banco real |
|---|---|---|---|
| Registros | 2 | 17 | ~1 milhão |
| Andares | 1 | 3 | 3 |
| Passos para achar qualquer um | 1 | até 3 | até 3 |

→ O número de registros **explodiu**, mas o número de passos **quase não mudou**. Isso é a busca **logarítmica**.

### Buscar nos galhos 📝
Agora a busca, passo a passo, na árvore do **tamanho 3**. **"Onde está o João?"**
1. **Raiz `[Gabi | Otávio]`:** "João" vem **depois** de Gabi e **antes** de Otávio, então desce pelo **galho do meio**.
2. **Nó `[Isa | Leonardo]`:** "João" vem **depois** de Isa e **antes** de Leonardo, então desce pelo **galho do meio**.
3. **Folha `[João]`:** achou! **3 passos**, contra até 17 comparações olhando nome por nome.

❓ **"E o Thiago? Por qual galho vocês desceriam?"** (a turma guia o apresentador)
→ Raiz: depois de Otávio, então direita. Nó `[Rafa | Thiago]`: é o próprio Thiago, achou em **2 passos**.

❓ **"E um nome que não existe, como 'Kevin'?"**
→ Desce Gabi → meio, Isa → meio, chega na folha `[João]` e **não está lá**. Em 3 passos o banco já sabe que **não existe**, sem olhar o resto.

🎬
- **Árvore crescendo:** a árvore começa com uma folha só; cada clique insere um nome; quando uma folha enche, ela **se parte em duas** com uma animação e a chave do meio **sobe**; quando a raiz enche, nasce um **andar novo** no topo. Um contador mostra "registros" x "andares".
- **Slider "poucas folhas ↔ muitas folhas":** a árvore se reorganiza ao vivo, e o contador "passos para achar" quase não muda.
- **Busca nos galhos:** digita-se um nome; o nó atual acende; uma seta mostra a comparação ("João > Gabi? sim · João < Otávio? sim → meio"); a seta desce pelo galho e o caminho percorrido fica destacado até a folha.
- **Modo turma:** o apresentador digita o nome que a turma escolher.

### ⚔️ Duelo 1: sem índice x com índice
```sql
SELECT * FROM alunos WHERE nome = 'João Costa Lima 99999';
-- A: sem índice
-- B: depois de  CREATE INDEX idx_nome ON alunos(nome);
```
| | Plano (`EXPLAIN QUERY PLAN`) | Tempo medido |
|---|---|---|
| A | `SCAN alunos` (lê a tabela inteira) | **8,3 ms** |
| B | `SEARCH alunos USING INDEX idx_nome` | **0,005 ms** |

→ Cerca de **1.600 vezes mais rápido**, e a diferença só cresce com mais dados. É a dinâmica das fileiras em números.

### ⚔️ Duelo 2: `LIKE` com o `%` no começo ou no fim ➕ ⏭️
```sql
SELECT id FROM alunos WHERE nome LIKE 'Leonardo Silva%';   -- A
SELECT id FROM alunos WHERE nome LIKE '%Silva 99999';      -- B
```
| | Plano | Tempo |
|---|---|---|
| A (prefixo) | `SEARCH ... (nome>? AND nome<?)` | **0,11 ms** |
| B (`%` no início) | `SCAN ...` | **4,9 ms** |

→ Ligar com a dinâmica: na lista alfabética, achar quem **começa** com "Leo" é fácil. Achar quem **termina** com "Silva" exige ler a lista inteira.

> **Nota técnica:**
> - No SQLite, o `LIKE` só usa índice com `PRAGMA case_sensitive_like = ON`, ou com um índice `COLLATE NOCASE`.
> - No Postgres, o índice precisa ser criado com `text_pattern_ops`.
> - Para busca no meio do texto existe outro tipo de índice: a busca textual (*full-text search*).

🎬
- **Corrida lado a lado:** à esquerda, um cursor percorre 100 mil registros com um contador de passos girando; à direita, a busca desce a árvore B em 3 pulos (raiz → nó interno → folha), com o nó atual destacado.
- **Inserção na árvore:** uma chave nova entra numa folha; a folha enche e **se divide em duas**; a chave do meio "sobe" para o pai. A árvore continua balanceada.
- **Custo da escrita:** um `INSERT` chega e acende **três árvores** de índice que precisam ser atualizadas.
- **Exclusão lógica:** apagar deixa o registro cinza, o arquivo continua do mesmo tamanho; o botão "VACUUM" compacta tudo.

---

## 4. Cap. 3: a queda de luz e as travas
🎤 Leonardo · ⏱ 24–30 min · 📺 CAP 03 e 06

**História:** sexta-feira, a tia roda a recarga de crédito de todos os alunos. No meio do processo, **acaba a luz**. Quando volta, alguns receberam crédito, outros não, e um foi debitado duas vezes.

### Se a energia acabar, posso confiar nos dados? 📝
- **No dBase,** o comando `REPLACE` escrevia **por cima** do registro antigo. Se a luz acabasse no meio de uma atualização em massa, o arquivo ficava pela metade e corrompido.
  - Exemplo do Akita: quando São Paulo ganhou o 9º dígito nos celulares, em 2012, foi preciso atualizar todos os telefones.
- **Hoje, com o *write-ahead log* (WAL):**
  - Primeiro o banco **anota** a mudança num arquivo de log separado; só depois aplica.
  - Se a luz cair, o original continua intacto e o log diz o que foi ou não confirmado.
  - Os sistemas de arquivos modernos (NTFS, ext4) fazem o mesmo com o *journal*.
- **ACID**, a promessa dos bancos relacionais:
  - **A**tomicidade: ou tudo acontece, ou nada.
  - **C**onsistência: as regras nunca são quebradas.
  - **I**solamento: transações em paralelo dão o mesmo resultado que em fila.
  - **D**urabilidade: se o banco disse "ok", está no disco.

❓ **"Acabou a luz no meio de uma transferência Pix. O que o banco deve fazer?"**
→ Voltar ao último estado consistente: ou o débito **e** o crédito aconteceram, ou **nenhum** dos dois.

### Controle de gravações e travas (*locks*) 📝
- **O problema:** dois computadores querem gravar no **mesmo arquivo** ao mesmo tempo.
- **Nos anos 90:** um computador da rede virava "servidor de arquivos" e todos abriam o mesmo .DBF pela rede.
  - Quem ia gravar **travava o arquivo**. Os outros recebiam "arquivo ocupado" e esperavam.
  - Se a trava falhasse, ou alguém usasse uma versão antiga do programa: **arquivo corrompido**.
- **Hoje:** o banco controla as travas sozinho e de forma muito mais fina (por linha, não pelo arquivo inteiro). Com o WAL, **quem só quer ler continua lendo** enquanto alguém grava.

❓ **"Dois caixas da cantina vendem o último salgado no mesmo segundo. Quem fica com ele?"**
→ Sem trava, os dois vendem e o estoque fica −1. Com trava, um espera o outro terminar, e o segundo recebe "esgotado".

🎬
- **Barra de progresso:** a recarga avança, a tela pisca e apaga ⚡.
- **Final A (dBase):** registros pela metade, em vermelho.
- **Final B (WAL):** o original intacto e o log "rebobinando".
- **Travas:** dois caixas estendem a mão para o mesmo salgado; um cadeado 🔒 aparece e um deles fica em "aguardando...".

---

## 5. Cap. 4: o estagiário e o loop
🎤 Leonardo · ⏱ 30–40 min · 📺 CAP 07, 08 e 09

**História:** o CantinaApp agora tem servidor de verdade e um estagiário novo. A diretoria pede: "dê 10% de crédito extra para todos os alunos do noturno". O script do estagiário roda... a tarde inteira.

### Do cliente que mexe no arquivo ao servidor que controla tudo 📝
| Antes (anos 80–90) | Depois (cliente-servidor) |
|---|---|
| Cada computador abria o arquivo .DBF **direto** | Só **um** programa, o servidor, toca nos arquivos |
| As regras dependiam da versão do programa em cada máquina | As regras ficam **no servidor**, iguais para todos |
| Gravação simultânea corrompia o arquivo | O servidor organiza a fila, as travas e as transações |
| Pedido inválido era executado mesmo assim | O servidor **recusa** o pedido inválido |

- Os clientes só pedem: "grava isso para mim" ou "me acha aquilo". E pedem **em SQL**.
- **Exemplo da cantina** 📝 (o Akita sempre dá um exemplo):
  - **Antes:** cada caixa tinha **uma cópia do caderno** e todos riscavam o mesmo caderno da secretaria ao mesmo tempo. Era confusão garantida.
  - **Depois:** só **a tia da secretaria** mexe no caderno; os caixas **pedem** para ela anotar ou consultar. Ela organiza a fila e recusa pedidos absurdos.

**A grande lição para quem já sabe SQL:** **peça o mínimo e deixe o servidor trabalhar.** Todo dado que atravessa a rede custa memória, CPU e tempo.

### Um de cada vez x em lote 📝
Regra de bolso do Akita: **"se você fez um loop para processar dados que vieram do banco, desconfie"**.

**Exemplo do dia a dia:** ir ao mercado **50 vezes** para comprar um item por vez, em vez de ir **uma vez** com a lista inteira. Cada ida e volta é uma "viagem pela rede".

### ⚔️ Duelo 3: a promoção do estagiário (loop de UPDATE x um UPDATE)
```python
# A: o script do estagiário
for c in db.execute("SELECT * FROM clientes WHERE cidade = 'São Paulo'"):
    db.execute("UPDATE clientes SET telefone = '9' || telefone WHERE id = ?", (c.id,))
    db.commit()
```
```sql
-- B: um comando
UPDATE clientes SET telefone = '9' || telefone WHERE cidade = 'São Paulo';
-- (MySQL: SET telefone = CONCAT('9', telefone))
```
| | 50 mil linhas |
|---|---|
| A | cerca de **48 s**, **sem rede**. Com só 1 ms de rede por ida e volta: **+50 s** |
| B | **0,03 s** |

→ Mais de **1.000 vezes** mais rápido.
- **A:** 50 mil comandos, 50 mil commits, 50 mil "ok" esperados.
- **B:** uma viagem, um commit. **A melhor operação é a que não traz nenhum dado do servidor.**

### ⚔️ Duelo 4: cadastrar um por um x em lote
```python
# A: um INSERT e um commit por pedido
for p in pedidos:
    db.execute("INSERT INTO pedidos VALUES (?, ?, ?)", p)
    db.commit()
```
```python
# B: todos numa transação só
db.executemany("INSERT INTO pedidos VALUES (?, ?, ?)", pedidos)
db.commit()
# (em SQL puro: INSERT INTO pedidos VALUES (...), (...), (...);)
```
| | 5 mil pedidos |
|---|---|
| A | **5,5 s** |
| B | **0,004 s** |

→ Cerca de **1.300 vezes** mais rápido. Cada `commit` obriga o banco a garantir que o dado chegou ao disco (o "D" do ACID). Em lote, ele faz isso **uma vez**.

### ⚔️ Duelo 5: filtrar no código x filtrar no banco
```python
# A: traz TUDO e filtra no código
pedidos = db.execute("SELECT * FROM pedidos").fetchall()
dezembro = [p for p in pedidos if p.criado_em >= '2026-12-01']
```
```sql
-- B: o banco filtra (e usa o índice em criado_em)
SELECT * FROM pedidos WHERE criado_em >= '2026-12-01';
```
| | Tempo (300 mil pedidos) |
|---|---|
| A | **227 ms** |
| B | **27,5 ms** |

→ Cerca de **8 vezes** mais rápido, sem rede. Com rede, A ainda precisa transferir 300 mil linhas.
→ Bônus: `SELECT *` x `SELECT id, nome` trouxe **48 MB** contra **3,5 MB** só por causa de uma coluna grande que ninguém usava.

### ⚔️ Duelo 6: N+1 x `JOIN` ➕ ⏭️
```python
# A: um SELECT por aluno para buscar a turma (1000 alunos -> 2001 consultas)
for aluno_id in ids:
    turma_id = db.execute("SELECT turma_id FROM alunos WHERE id = ?", (aluno_id,)).fetchone()
    turma    = db.execute("SELECT nome FROM turmas WHERE id = ?", (turma_id,)).fetchone()
```
```sql
-- B
SELECT a.id, t.nome FROM alunos a JOIN turmas t ON t.id = a.turma_id WHERE a.id <= 1000;
```
| | Sem rede | Com 1 ms de rede por consulta |
|---|---|---|
| A | 2,7 ms | cerca de **2 s** |
| B | 0,5 ms | cerca de **1,5 ms** |

→ Esse é o erro mais comum com ORM: o código parece inocente (`aluno.turma.nome`) e dispara uma consulta por item. É o "um de cada vez" escondido.

### Constraints: as regras moram no banco
`NOT NULL`, `UNIQUE`, `FOREIGN KEY`, `CHECK`. No dBase isso eram dezenas de `if` espalhados pelo código.

❓ **"O formulário já valida se o e-mail é repetido. Preciso de `UNIQUE` no banco?"**
→ Sim. Dois alunos clicam em "cadastrar" no mesmo milissegundo: os dois formulários checam, nenhum encontra o e-mail, e os dois gravam. Só o banco garante. O Akita diz: valide no front, no back **e** no banco, como lavar as mãos antes de uma cirurgia.

🎬
- **Viagens:** um caminhão viaja entre "Banco" e "App". No jeito A, ele faz 50 mil viagens de ida e volta, com um contador girando. No jeito B, faz **uma** viagem com a lista inteira.
- **Placar:** cada duelo termina com A x B e um multiplicador grande ("1.300×").

---

## 6. Cap. 5: dividir para conquistar
🎤 Ambos · ⏱ 40–50 min · 📺 CAP 11 e 12

**História:** o governo adotou o CantinaApp em **todas as ETECs do estado**: **229 escolas** e mais de **224 mil alunos**. O intervalo é **às 10h em todas**. Às 10h01 o servidor cai. E o Ministério da Educação já está ligando: "queremos no **Brasil inteiro**".

### Números reais: o tamanho do problema 📝
**As ETECs (só existem em São Paulo)**
| Dado | Valor |
|---|---|
| ETECs (Centro Paula Souza) | **229** escolas |
| Alunos matriculados nas ETECs | mais de **224 mil** |
| Cursos oferecidos | 262 |

Fonte: [Centro Paula Souza](https://www.cps.sp.gov.br/etec/) e [CPS: sobre](https://www.cps.sp.gov.br/institucional/sobre-o-centro-paula-souza/), 2025.

> As ETECs são do estado de São Paulo. Nos outros estados existem escolas técnicas estaduais com outros nomes, os Institutos Federais e o Sistema S. Por isso o mapa do Brasil usa os **alunos de ensino técnico de nível médio** de todas as redes.

**Brasil: alunos de ensino técnico de nível médio (2024)**
| Região | Alunos | % do ensino médio |
|---|---|---|
| **Brasil** | **1.337.160** | **17,2%** |
| Norte | 68.769 | 8,7% |
| Nordeste | 426.986 | 20,1% |
| Sudeste | 537.128 | 16,4% |
| Sul | 253.232 | 24,8% |
| Centro-Oeste | 51.045 | 8,6% |

<details>
<summary><b>Por estado (para o mapa)</b></summary>

| UF | Alunos | % do ensino médio |
|---|---|---|
| AC | 6.611 | 16,5% |
| AL | 14.010 | 11,0% |
| AP | 1.957 | 5,9% |
| AM | 17.371 | 9,0% |
| BA | 101.956 | 20,0% |
| CE | 75.780 | 20,8% |
| DF | 9.388 | 9,0% |
| ES | 46.555 | 36,4% |
| GO | 19.570 | 8,1% |
| MA | 50.779 | 17,4% |
| MT | 14.199 | 10,1% |
| MS | 7.888 | 7,5% |
| MG | 128.413 | 17,4% |
| PA | 26.954 | 7,7% |
| PB | 44.602 | 30,6% |
| PR | 109.040 | 26,1% |
| PE | 39.969 | 11,8% |
| PI | 62.768 | **48,3%** |
| RJ | 88.931 | 16,1% |
| RN | 29.590 | 23,2% |
| RS | 104.214 | 31,5% |
| RO | 6.855 | 9,4% |
| RR | 2.850 | 10,2% |
| SC | 39.978 | 14,7% |
| SP | **273.229** | 14,7% |
| SE | 7.532 | 8,8% |
| TO | 6.171 | 8,8% |

</details>

Fonte: [Anuário Brasileiro da Educação Básica 2025, Todos Pela Educação](https://anuario.todospelaeducacao.org.br/2025/capitulo-4b-ept.html), com dados do MEC/Inep (Censo Escolar 2024).

**O que mostrar com esses números:**
- **São Paulo sozinho** tem 273 mil alunos técnicos, mais que o **Norte e o Centro-Oeste juntos** (cerca de 120 mil). Esse é o mesmo problema da Receita Federal no bloco 8: dividir por estado **desbalanceia**.
- **Curiosidade:** no **Piauí**, quase **metade** (48,3%) dos alunos do ensino médio faz curso técnico, a maior proporção do país.
- **Para o CantinaApp:** se cada aluno fizer só 2 pedidos por dia, são cerca de **2,7 milhões de pedidos por dia**, quase todos **na mesma meia hora** do intervalo.

❓ **"Quantos alunos de ensino técnico vocês acham que existem no Brasil?"** (chute antes de mostrar o mapa)
→ Cerca de **1,3 milhão**, e só em SP são 273 mil.

🎬 **Mapa do Brasil:**
1. Começa com **só SP aceso** e 229 pontinhos (as ETECs) piscando às 10h00.
2. O zoom se afasta para o Brasil; cada estado ganha a cor pela quantidade de alunos (mapa de calor), com o número em cima.
3. Os estados se agrupam por **região**, com o total de cada uma.
4. Um contador "pedidos por minuto às 10h" sobe sem parar, e um único servidor no canto da tela começa a esquentar 🔥.
- Passar o mouse num estado mostra os alunos e a % do ensino médio.

### Vertical x horizontal: a fila da cantina ➕
❓ **"A fila da cantina está gigante no intervalo. Vocês contratam uma tia mais rápida ou abrem mais caixas?"** Deixar a turma votar. Depois: **"e se a tia faltar?"**

| | Vertical (*scale up*) | Horizontal (*scale out*) |
|---|---|---|
| O que é | Um servidor **mais forte** (mais CPU, RAM, SSD) | **Mais servidores** |
| Na cantina | Uma tia mais rápida | Mais caixas |
| ✅ | Simples: o código não muda e o ACID continua fácil | Quase não tem teto; se um cai, os outros seguem |
| ❌ | Tem **teto físico**; o preço sobe mais rápido que o desempenho; é ponto único de falha | Coordenar é difícil: **qual caixa sabe o meu saldo?** |

> Os bancos relacionais tradicionais nasceram para rodar **numa máquina forte**. Por muito tempo, crescer significou crescer na vertical.

### 🖼️ Slide: comparação das tias 📝
Um slide dividido ao meio, estilo "cartas de jogo" ou "ficha de personagem", comparando as duas estratégias como se fossem duas tias.

| | 🦸‍♀️ **{TIA} Turbo** (vertical) | 👩‍🍳👩‍🍳👩‍🍳 **Time de tias** (horizontal) |
|---|---|---|
| Ideia | **Uma** tia, cada vez mais rápida | **Várias** tias, cada uma num caixa |
| No banco de dados | Servidor maior: mais CPU, RAM, SSD | Mais servidores trabalhando juntos |
| Atendimentos por minuto | Sobe... até o **limite humano** | Sobe a cada tia contratada |
| Custo | Uma tia 2× mais rápida custa **muito mais** que 2× | Cada tia custa o mesmo; cresce aos poucos |
| Se ela faltar | 🛑 **A cantina fecha** | 😌 As outras continuam atendendo |
| Para trocar | Precisa **fechar a cantina** durante a troca | Contrata mais uma sem fechar |
| Caderno de saldos | ✅ **Um só**: sempre certo | ⚠️ **Um por tia?** Quem sabe o saldo certo do João? |
| Complexidade | 🟢 Simples | 🔴 Precisa combinar tudo entre elas |
| Exemplo real | Comprar um servidor maior para o Postgres | Réplicas, cache, sharding (blocos 7 e 8) |

**Barras de "atributos"**, como num jogo:
| Atributo | {TIA} Turbo | Time de tias |
|---|---|---|
| Velocidade máxima | ████████░░ (tem teto) | ██████████ (quase sem teto) |
| Simplicidade | ██████████ | ███░░░░░░░ |
| Resistência a falhas | ██░░░░░░░░ | █████████░ |
| Saldo sempre certo | ██████████ | █████░░░░░ |

**Fala de fechamento do slide:** "Na prática, as empresas **começam com a {TIA} Turbo**, que é mais simples, e só montam o **time de tias** quando a fila não cabe mais numa pessoa só. E o problema do caderno de saldos é o assunto dos próximos blocos."

🎬 As duas tias entram de lados opostos da tela, como numa luta de videogame ("VS" no meio); as barras de atributos enchem uma por uma; no fim, aparece o caderno de saldos se multiplicando do lado do time, com um ❓ em cima.

### Dividir para conquistar: leitura, escrita e cache 📝
A maior parte do tráfego é **leitura**: ver o cardápio, ver o saldo. As **escritas** (comprar) são bem menos.

| Estratégia | O que é | Na cantina |
|---|---|---|
| **Banco de cache** | Guarda na memória as respostas que todo mundo pede (Redis, Memcached). O app olha primeiro no cache; só se não achar, pergunta ao banco | O **cardápio pendurado na parede**: ninguém precisa perguntar o preço para a tia |
| **Bancos de leitura (réplicas)** | Cópias do banco principal que **só respondem consultas** | Várias pessoas consultam o saldo, mas **só a tia do caixa registra a venda** |
| **Banco principal (escrita)** | Só ele aceita `INSERT`, `UPDATE`, `DELETE` e repassa as mudanças para as réplicas | A tia do caixa |
| **Arquivar dados velhos** | Mover pedidos de anos atrás para outro lugar. **Mover, não apagar** | Encaixotar os cadernos dos anos anteriores |

⚠️ **O detalhe que volta no próximo bloco:** a réplica recebe as mudanças **um pouquinho depois** do principal, e o cache pode estar **desatualizado**.

❓ **"Qual destas mudanças vocês fariam primeiro?"**
→ Sempre a mais barata: consertar as consultas e criar índices (os blocos anteriores). Muita empresa "precisa de NoSQL" quando na verdade precisava de um índice.

### Exemplos de redes sociais crescendo 📝
- **Twitter (2007–2009):**
  - Nasceu como um app Ruby on Rails comum gravando os tweets num **MySQL**.
  - Com o crescimento explosivo, caía tanto que a tela de erro com uma baleia, a ***Fail Whale***, virou meme.
  - A saída foi reescrever partes do sistema e **dividir os dados**. A baleia foi aposentada em 2015.
  - [Fonte](https://highscalability.com/scaling-twitter-making-twitter-10000-percent-faster/)
- **Instagram (2012):** quando o Facebook comprou o app por US$ 1 bilhão, ele tinha cerca de **30 milhões de usuários e 13 funcionários**, rodando em **Postgres** (detalhes no bloco 8).
- **Discord:** guarda **trilhões** de mensagens. Começou no MongoDB, foi para o Cassandra e depois para o ScyllaDB. [Fonte](https://discord.com/blog/how-discord-stores-trillions-of-messages)
- **Pokémon GO (2016):** no lançamento, o tráfego chegou a cerca de **50 vezes** o esperado, 10 vezes acima até do "pior cenário" previsto. [Fonte](https://www.gamespot.com/articles/pokemon-go-traffic-was-50-times-more-than-expected/1100-6444074/)

🎬
- A fila da cantina crescendo às 10h00.
- **"Upgrade":** a tia cresce até bater numa linha vermelha de "teto".
- **"+ Caixa":** abre caixas e a fila anda.
- **"Cache":** um cardápio aparece na parede e metade da fila some.
- **"Réplicas":** surgem balcões "só consulta"; as vendas continuam indo para um caixa só.

---

## 7. Cap. 6: por que NoSQL e consistência
🎤 Leonardo · ⏱ 50–57 min · 📺 CAP 13 e 14

**História:** o CantinaApp viralizou no Brasil. Agora grava **cada clique**, cada "abriu o cardápio". E começam as reclamações: "meu saldo aparece diferente no celular e no computador!".

### Por que surgiu o NoSQL
- Redes sociais, celulares e games passaram a gerar volumes nunca vistos.
- Para **alguns** dados, perder ou duplicar uma linha **não faz diferença**: ninguém quer o clique individual, quer a média do dia.
- Os bancos NoSQL (Cassandra, DynamoDB, MongoDB...) trocam parte da consistência por **conseguir escrever em vários servidores ao mesmo tempo**.

❓ **"Posso perder uma linha?"** (a turma classifica)
| Dado | Posso perder? |
|---|---|
| Extrato bancário | ❌ Nunca |
| Nota do boletim | ❌ Nunca |
| Curtidas num post | ✅ Ninguém vai notar |
| Batimento cardíaco de 1 minuto atrás no smartwatch | ✅ O que importa é a média |
| "Abriu o cardápio" (estatística) | ✅ |

### Teorema CAP (Eric Brewer, 2000), em versão simples
Num banco espalhado em vários servidores, quando a rede entre eles falha, é preciso escolher:
- **Consistência:** recusar responder até ter certeza do dado certo.
- **Disponibilidade:** responder mesmo assim, talvez com um dado desatualizado.

**Consistência eventual:** os servidores podem discordar por alguns segundos, mas **eventualmente** ficam iguais. Exemplo: as curtidas aparecem diferentes no seu celular e no do seu amigo, e um segundo depois se acertam.

### 📝 História real: o saldo do Mercado Pago
🎤 **Matheus conta** (foi ele quem viveu). O Leonardo passa a palavra e retoma depois da história.

O front-end **continuava mostrando o saldo antigo** na conta mesmo **depois que o dinheiro já tinha saído**.
- **Por quê?** A tela leu de um lugar que ainda não tinha recebido a atualização: um cache, ou uma réplica de leitura atrasada.
- Os dados não estavam errados no banco principal. A tela é que mostrou uma versão **velha**.
- **Ligação com o bloco anterior:** foi exatamente o ⚠️ das réplicas e do cache.

❓ **Perguntas para a turma:**
- "Isso é aceitável num app de pagamento? E no contador de curtidas?"
- "Já aconteceu com vocês?" (pedido que aparece só depois, notificação atrasada, curtida que some e volta)

❓ **"O cabo submarino entre o Brasil e os EUA rompeu. O app do banco deve mostrar o saldo, mesmo podendo estar desatualizado, ou bloquear até voltar?"**
→ **Bloquear** (consistência). Um saldo errado leva alguém a gastar um dinheiro que não tem.
→ E o Instagram? **Mostrar** (disponibilidade). Um feed atrasado não machuca ninguém.

> Spoiler de faculdade: o CAP é bastante discutido e a escolha não é tão binária. Bancos como Cassandra e DynamoDB deixam **configurar o nível de consistência** por operação.

🎬
- **Dois servidores** (São Paulo e Virginia) ligados por um cabo; uma tesoura corta o cabo ✂️.
  - O botão "Consistência" deixa um lado com ⛔ "aguarde".
  - O botão "Disponibilidade" deixa os dois lados respondendo com saldos diferentes piscando.
- **Recriação do caso Mercado Pago:** o saldo cai no banco principal, a réplica ainda mostra o valor antigo, e um relógio mostra o atraso até ela "alcançar".

---

## 8. Cap. 7: distribuição e particionamento
🎤 **Matheus** 📝 · ⏱ 57–66 min · 📺 CAP 15 e 16

**História:** nenhum servidor sozinho guarda os pedidos do Brasil inteiro. É hora de **dividir os dados** entre vários servidores, o que se chama particionamento ou *sharding*. Mas como dividir?

### Estratégia de chave primária 📝
- Antigamente, como não havia poder de processamento para buscas "parecidas", era mais fácil lembrar o **código** do que o nome exato. Por isso toda tabela ganhou um **ID**, como todo brasileiro tem um CPF.
- **ID sequencial** (1, 2, 3...) exposto na URL (`cantinaapp.com/alunos/1000`) é um convite: alguém troca para `/999`, `/998`... Se existir **um** bug de permissão, os dados de outra pessoa vazam.
  - O certo é **também** checar a permissão e devolver o erro **403**.
- Prefira **IDs aleatórios grandes** (UUID): um inteiro de 64 bits tem cerca de 18 quintilhões de valores, impossíveis de adivinhar. São as **chaves surrogadas**.
- E com vários servidores, quem "dá o próximo número" de um ID sequencial? Ninguém sozinho. Mais um motivo para IDs aleatórios ou compostos.
  - O **Instagram** montou o ID juntando **horário + número do shard + sequência**.
  - [Fonte](https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c)

### Como dividir o banco da Receita Federal? 📝
❓ **"Vocês são da TI da Receita Federal. São milhões de declarações de imposto de renda, de décadas. Não cabe num servidor. Como dividir?"**
→ Deixar a turma responder. A resposta mais comum é **"por estado"**.

**Problema da divisão por estado:**
- São Paulo sozinho tem muito mais declarações que vários estados juntos. O servidor de SP fica **lotado** enquanto o do Acre fica ocioso.
- Então SP precisa ser dividido em **N servidores**: capital, interior... e depois a capital de novo...
- O código vira um monte de `if estado == 'SP' and cidade == ...` e cada mudança é uma obra.

### Usar o resto da divisão do ID (módulo) 📝
"E se a gente esquecer o estado e olhar **só para o ID**?" Com 3 servidores, usamos `id % 3`, o resto da divisão por 3:
- resto 0 → servidor A;
- resto 1 → servidor B;
- resto 2 → servidor C.

Fica **perfeitamente balanceado**. Resolvido? Até o **4º servidor** chegar.

❓ **"Temos 12 usuários (IDs de 1 a 12) em 3 servidores. Adicionei um 4º servidor e agora a conta é `id % 4`. Quantos usuários precisam mudar de servidor?"** (fazer no quadro)
| id | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `% 3` | 1 | 2 | 0 | 1 | 2 | 0 | 1 | 2 | 0 | 1 | 2 | 0 |
| `% 4` | 1 | 2 | **3** | **0** | **1** | **2** | **3** | **0** | **1** | **2** | **3** | 0 |

→ **9 de 12 (75%)** mudam de lugar. Testamos com 1 milhão de IDs e o resultado é o mesmo: 75%. Adicionar um servidor **perde a organização** e obriga a mover quase o banco inteiro.

### A solução: o anel de hash (hashing consistente) 📝
1. **Hash, em uma frase:** uma função que transforma qualquer coisa (um nome, um ID) num número. A mesma entrada sempre dá o mesmo número, e os números ficam bem espalhados.
2. **O anel:** imagine um **relógio** com todos os números possíveis do hash, de 0 até o máximo, com o fim encostando no começo.
3. **Os servidores no anel:** cada servidor passa pelo hash e ganha uma posição no relógio. Ex.: A no "12h", B no "4h", C no "8h".
4. **Os dados no anel:** cada dado também passa pelo hash e cai num ponto do relógio. A regra é: **ele vai para o primeiro servidor andando no sentido horário**.
   - Ex.: "João" cai às 2h e vai para o B (4h). "Maria" cai às 6h e vai para o C (8h).
5. **Entrou o servidor D às 10h?** Só os dados entre 8h e 10h, que antes iam para o A, passam a ir para o D. **B e C não mexem em nada.**
   - Com 4 servidores, cerca de **1/4** dos dados se move, em vez de **3/4** com o módulo.
6. **Saiu o servidor A?** Os dados dele vão para o próximo no sentido horário (o B), e ninguém mais se mexe.

> Na prática, cada servidor ocupa **várias posições** no anel (nós virtuais), para dividir melhor. Cassandra e DynamoDB usam essa ideia.

**O preço:** buscar um dado pela chave é rapidíssimo. Mas uma consulta que precisa olhar **todos** os servidores (ex.: "total de vendas de todo mundo") fica cara. No mundo distribuído, **a forma de dividir precisa ser pensada antes**.

### Isso aconteceu de verdade
- **Instagram:** em vez de correr atrás do hype do NoSQL, dividiu o **Postgres em milhares de shards lógicos**, que no começo moravam em poucas máquinas e depois foram sendo espalhados. [Fonte](https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c)
- **Discord:**
  - Com trilhões de mensagens, chegou a **177 servidores** de Cassandra.
  - Em 2022 migrou para o **ScyllaDB** e passou a precisar de **72**.
  - [Fonte](https://discord.com/blog/how-discord-stores-trillions-of-messages)

🎬 **Ilustração do anel de hash** 📝, a peça principal deste bloco no site:
1. Um relógio grande com três servidores coloridos (A, B, C) posicionados.
2. Os nomes da turma "caem" no anel, deslizam no sentido horário e "entram" no servidor da cor correspondente.
3. **Botão "+ servidor D":** ele aparece no anel e **só o arco entre C e D muda de cor**. As bolinhas daquele trecho pulam para o D; o resto não se mexe.
4. **Botão "− servidor A":** o arco do A passa para o B.
5. **Comparação lado a lado:** a tabela `% 3 → % 4` com 75% das células piscando x o anel com só um arco mudando.

Antes do anel, um **mapa do Brasil** com um servidor por estado: o servidor de SP "explode" de tão cheio e precisa se dividir de novo e de novo.

---

## 9. Fechamento
🎤 Ambos · ⏱ 66–70 min · 📺 CAP 18

**Ideia central**
- **O arroz com feijão do Akita**, que resolve a grande maioria dos casos:
  - um **Postgres ou MySQL** bem usado (consultas boas e índices certos);
  - **Redis** para cache;
  - **filas** para trabalhos em segundo plano.
  - Big Data de verdade é para empresas grandes, com time especializado. **"Você não é a Netflix."**
- **Nada dura pra sempre:** a Ashton-Tate (do dBase) e a Nantucket (do Clipper) dominaram os anos 80 e 90, e hoje quase ninguém lembra delas. **Ferramentas passam, fundamentos ficam**: estruturas de dados, árvores, redes.
- **Fuja do hype:** briga de "SQL x NoSQL" em rede social não conhece o seu problema. Entenda o problema primeiro e leia a **documentação oficial**.

❓ **Rodada final: "Qual banco vocês usariam?"**
| Cenário | Resposta esperada |
|---|---|
| App de TCC para controlar o empréstimo de livros da biblioteca | SQLite, ou Postgres/MySQL se tiver servidor. Sem drama. |
| App de academia que precisa funcionar **offline** no celular | SQLite no celular, sincronizando depois |
| Rede social com 10 milhões de usuários | Postgres para contas e pagamentos + Redis de cache + algo distribuído (ex.: Cassandra) para curtidas e eventos |

**Para se aprofundar:** o vídeo do Akita ([Discutindo sobre Banco de Dados](https://www.youtube.com/watch?v=Bfm3Ms2cTg0)), a documentação do SQLite e do PostgreSQL e o blog do Discord.

🎬 A linha do tempo inteira passando de trás para frente: caderno → array → DBF → árvore B → servidor → réplicas e cache → anel de shards. Termina de novo no caderno da tia, agora com "obrigado!".

---

## Conteúdo reserva (se sobrar tempo ou alguém perguntar)
| Tema | Onde encaixa | Resumo |
|---|---|---|
| ⚔️ Função na coluna x intervalo | Bloco 3 | `strftime('%Y', nascimento) = '2008'` fez SCAN em **20 ms**; `nascimento >= '2008-01-01' AND < '2009-01-01'` usou o índice em **3,9 ms** |
| ⚔️ Somar no código x `GROUP BY` | Bloco 5 | 209 ms x 116 ms localmente. O ganho real é não transferir 300 mil linhas, já que o banco devolve 12 |
| Mito do JSON | Bloco 4 | O MongoDB não guarda JSON, guarda BSON (binário) numa B+Tree. SQL é linguagem e JSON é formato; nenhum dos dois diz como o banco guarda os dados por dentro |
| Relatório em PDF com *streaming* | Bloco 5 | Ler e gravar linha a linha mantém a memória com um teto fixo, em vez de crescer com as vendas |
| Monitoramento | Bloco 5 | "Se você não mede, não conserta" |
| Cartão SD e SSD duvidoso | Bloco 4 | Não são lugar para guardar dados importantes |
| Data Warehouse e Data Lake | Bloco 7 | Onde se guardam e analisam montanhas de dados históricos |

## Fora da aula
- **Bancos em nuvem e preços** (DynamoDB, Firebase, MongoDB Atlas, Aurora...): decisão de vocês; o tema envelhece rápido.
- Partição C:/D: e velocidade na borda do disco (o Akita publicou errata).
- Redes dos anos 90 (Novell, IPX/SPX).
- B+Tree e páginas em detalhe.
- Replicação bidirecional.

## Apêndice: como os números foram medidos
- **Ambiente:** Python 3 + `sqlite3`.
- **Duelos 1, 2, 5 e 6 e reserva:** banco em memória com 100 mil alunos (com uma coluna `obs` de 400 caracteres para simular "colunas que ninguém usa") e 300 mil pedidos. Média de 5 a 20 execuções; planos obtidos com `EXPLAIN QUERY PLAN`.
- **Duelo 3 (loop de UPDATE):** banco em arquivo, com um commit por linha. Medimos 2 mil e extrapolamos para cerca de 50 mil.
- **Duelo 4 (lote):** banco em arquivo, 5 mil `INSERT`s, cada um na sua transação x todos numa transação só.
- **Rede:** os valores "com rede" usam uma estimativa conservadora de **1 ms por ida e volta**.
