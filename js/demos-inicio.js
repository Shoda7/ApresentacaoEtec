/* Demos dos blocos 2 e 3: array, memória, arquivo append-only, sala, dobrar dados, VACUUM, navio, capacidade da árvore. */

/* ===================== Array JSON na memória ===================== */
Deck.registrar('array', el => {
  const nomes = [
    { id: 1, aluno: 'Ana', deve: 5 },
    { id: 2, aluno: 'Bruno', deve: 0 },
    { id: 3, aluno: 'João', deve: 12.5 },
    { id: 4, aluno: 'Maria', deve: 3 },
    { id: 5, aluno: 'Pedro', deve: 7 },
  ];
  const W = 210, G = 26;
  const area = $('.arr-area', el);
  const leg = $('.arr-legenda', el);
  const perg = $('.arr-pergunta', el);
  const resp = $('.arr-resposta', el);
  const linhas = $$('.linha-cod', el);
  const ponteiro = h('div', { class: 'arr-ponteiro' }, h('span', { class: 'rot' }));
  area.append(ponteiro);
  const caixas = nomes.map(n => {
    const c = h('div', { class: 'arr-caixa' },
      h('div', { class: 'pos' }, 'posição ', h('b')),
      h('div', { class: 'nome' }, n.aluno),
      h('div', { class: 'deve' }, `deve R$ ${fmt(n.deve, 2)}`),
      h('div', { class: 'carimbo' }, 'apagado'));
    area.append(c);
    return c;
  });
  const LEG = [
    'Cinco registros colados na memória, um atrás do outro.',
    '<b>caderno[2]</b> vai direto ao João: o computador calcula o endereço. <b class="caneta">1 passo.</b>',
    '<b>find</b> não sabe a posição: olha Ana, Bruno, João, Maria… até o Pedro. <b class="vermelho">5 comparações.</b>',
    '<b>splice(2, 1)</b> tira o João. Olhem a Maria e o Pedro.',
    '<b>splice(2, 1)</b> tira o João. Olhem a Maria e o Pedro.',
    'O atalho: <b>marcar</b> como apagado. Ninguém se mexe, mas o buraco continua ocupando espaço. É o que o dBase fazia.',
  ];
  const LINHA_DO_PASSO = { 1: 'acesso', 2: 'find', 3: 'splice', 4: 'splice', 5: 'apagado' };
  const g = geracao();
  let passo = 0;

  function posicionar(removido, apagado) {
    let p = 0;
    caixas.forEach((c, i) => {
      const fora = removido && i === 2;
      c.classList.toggle('explode', fora);
      c.classList.toggle('apagada', apagado && i === 2);
      if (!fora) {
        c.style.left = (p * (W + G)) + 'px';
        const novo = String(p);
        const b = $('.pos b', c);
        if (b.textContent !== novo && b.textContent !== '') { c.classList.remove('mudou'); void c.offsetWidth; c.classList.add('mudou'); }
        b.textContent = novo;
        p++;
      } else {
        c.style.left = (i * (W + G)) + 'px';
      }
    });
  }
  function ponteiroEm(i, rotulo) {
    if (i == null) { ponteiro.classList.remove('vis'); return; }
    ponteiro.classList.add('vis');
    ponteiro.style.left = (i * (W + G) + W / 2) + 'px';
    $('.rot', ponteiro).textContent = rotulo;
  }
  function destaque(i, cls = 'achou') {
    caixas.forEach((c, j) => c.classList.toggle(cls, j === i));
  }
  function limparMarcas() { caixas.forEach(c => c.classList.remove('achou', 'olhando', 'nao')); }

  function render(p, animar) {
    const gg = g.nova();
    passo = p;
    limparMarcas();
    linhas.forEach(l => l.classList.toggle('ativa', l.dataset.p === LINHA_DO_PASSO[p]));
    leg.innerHTML = LEG[p];
    posicionar(p === 3 || p === 4, p === 5);
    perg.classList.toggle('on', p === 3 || p === 4);
    resp.classList.toggle('on', p === 4);
    ponteiroEm(null);
    if (p === 1) { ponteiroEm(2, 'caderno[2]'); destaque(2); }
    if (p === 2) {
      if (!animar) { ponteiroEm(4, 'Pedro!'); destaque(4); return; }
      (async () => {
        for (let i = 0; i < 5; i++) {
          if (!g.viva(gg)) return;
          ponteiroEm(i, i === 4 ? 'Pedro!' : `${nomes[i].aluno}? não`);
          caixas.forEach((c, j) => { c.classList.toggle('olhando', j === i); if (j < i) c.classList.add('nao'); });
          await espera(650);
        }
        if (!g.viva(gg)) return;
        caixas.forEach(c => c.classList.remove('olhando'));
        destaque(4);
      })();
    }
  }
  render(0, false);
  $$('.arr-passos button', el).forEach(b => b.addEventListener('click', () => render(Number(b.dataset.p), true)));

  return {
    enter(deTras) { render(deTras ? 5 : 0, false); },
    leave() { g.cancela(); },
    next() { if (passo < 5) { render(passo + 1, true); return true; } return false; },
    prev() { if (passo > 0) { render(passo - 1, false); return true; } return false; },
  };
});

/* ===================== Endereço e tempo constante ===================== */
Deck.registrar('memoria', el => {
  const valores = [42, 17, 8, 99, 23, 73, 5, 61, 30, 12];
  const fila = $('.mem-fila', el);
  const cel = valores.map((v, i) => {
    const c = h('div', { class: 'mem-cel' }, h('span', { class: 'end' }, String(i * 8)), h('b', {}, String(v)), h('span', { class: 'idx' }, `[${i}]`));
    fila.append(c);
    return c;
  });
  const seta = h('div', { class: 'mem-seta' });
  fila.append(seta);
  const conta = $('.mem-conta', el);
  const inPos = $('.mem-pos', el);
  const tam = $('.mem-tam', el);
  const outPos = $('.mem-out-pos', el);
  const outBusca = $('.mem-out-busca', el);
  const outTam = $('.mem-out-tam', el);
  const TAMS = [10, 100, 1000, 10000, 100000, 1000000, 10000000];
  const g = geracao();
  let passo = 0;

  function mostraSeta(i) {
    seta.style.left = (i * 118 + 54) + 'px';
    seta.classList.add('vis');
  }
  function irDireto() {
    g.cancela();
    const i = Math.max(0, Math.min(9, Number(inPos.value) || 0));
    cel.forEach((c, j) => c.classList.toggle('achou', j === i));
    cel.forEach(c => c.classList.remove('nao'));
    mostraSeta(i);
    conta.innerHTML = `endereço = início + <b>${i}</b> × 8 bytes = <b class="caneta">${i * 8}</b> → <b>1 cálculo</b>, não importa o tamanho do array`;
  }
  async function procurar() {
    const gg = g.nova();
    cel.forEach(c => c.classList.remove('achou', 'nao'));
    conta.innerHTML = 'Procurando o valor <b>73</b> sem saber a posição…';
    for (let i = 0; i < valores.length; i++) {
      if (!g.viva(gg)) return;
      mostraSeta(i);
      if (valores[i] === 73) { cel[i].classList.add('achou'); conta.innerHTML = `Achou o 73 depois de olhar <b class="vermelho">${i + 1} casas</b>. Se fosse o último, olharia todas.`; return; }
      cel[i].classList.add('nao');
      await espera(450);
    }
  }
  function atualizaTam() {
    const n = TAMS[Number(tam.value)];
    outTam.textContent = fmt(n);
    outPos.textContent = '1';
    outBusca.textContent = fmt(n);
  }
  $('.mem-ir', el).addEventListener('click', irDireto);
  $('.mem-procurar', el).addEventListener('click', procurar);
  tam.addEventListener('input', atualizaTam);
  atualizaTam();

  function reset() {
    g.cancela(); passo = 0;
    cel.forEach(c => c.classList.remove('achou', 'nao'));
    seta.classList.remove('vis');
    conta.innerHTML = 'Todos os elementos têm o <b>mesmo tamanho</b>: 8 bytes cada.';
  }
  reset();
  return {
    enter() { reset(); },
    leave() { g.cancela(); },
    next() {
      if (passo === 0) { inPos.value = 4; irDireto(); passo = 1; return true; }
      if (passo === 1) { procurar(); passo = 2; return true; }
      return false;
    },
    prev() { if (passo > 0) { reset(); return true; } return false; },
  };
});

/* ===================== Arquivo append-only (.DBF) ===================== */
Deck.registrar('fita', el => {
  const fita = $('.fita-trilho', el);
  const formula = $('.fita-formula', el);
  const NOMES = ['Ana', 'Bruno', 'João', 'Maria', 'Pedro', 'Gabi', 'Diego', 'Isa', 'Rafa', 'Sofia', 'Thiago', 'Paula'];
  let n = 0;
  function adiciona(animar = true) {
    const i = n++;
    const ini = i * 113, fim = ini + 112;
    const r = h('div', { class: 'fita-reg' + (animar ? ' novo' : '') },
      h('span', { class: 'n' }, `registro ${i + 1}`),
      h('span', { class: 'campos' }, h('i', { class: 'c-nome' }, NOMES[i % NOMES.length]), h('i', { class: 'c-tel' }, '11 9…')),
      h('span', { class: 'bytes' }, `bytes ${fmt(ini)}–${fmt(fim)}`));
    fita.append(r);
    const desloca = Math.max(0, n * 236 - 1280);
    fita.style.transform = `translateX(${-desloca}px)`;
    formula.innerHTML = `O registro <b>${i + 1}</b> começa no byte (${i + 1} − 1) × 113 = <b class="caneta">${fmt(ini)}</b>`;
  }
  function reset() {
    fita.innerHTML = ''; n = 0; fita.style.transform = '';
    for (let i = 0; i < 3; i++) adiciona(false);
  }
  $('.fita-add', el).addEventListener('click', () => adiciona());
  reset();
  let passos = 0;
  return {
    enter(deTras) { if (!deTras) { reset(); passos = 0; } },
    next() { if (passos < 2) { adiciona(); passos++; return true; } return false; },
  };
});

/* ===================== Dinâmica: Quem é o João? ===================== */
Deck.registrar('sala', el => {
  const mapa = $('.sala-mapa', el);
  const inF = $('.sala-f', el), inC = $('.sala-c', el);
  const cont = $('.sala-contador b', el);
  const contRot = $('.sala-contador span', el);
  const msg = $('.sala-msg', el);
  const ficha = $('.sala-ficha', el);
  const fichaTxt = $('.sala-ficha b', el);
  const modoBtns = $$('.sala-modo', el);
  const voo = h('div', { class: 'sala-voo' });
  let F = 5, C = 6;
  let modo = 1;
  let joao = [4, 3], ana = [3, 2];
  let perguntas = 0, achou = false, voou = false;
  let cadeiras = [];
  const g = geracao();

  function idx(f, c) { return (f - 1) * C + (c - 1); }
  function montar() {
    F = Math.max(2, Math.min(9, Number(inF.value) || 5));
    C = Math.max(2, Math.min(9, Number(inC.value) || 6));
    joao = [Math.min(joao[0], F), Math.min(joao[1], C)];
    ana = [Math.min(ana[0], F), Math.min(ana[1], C)];
    mapa.innerHTML = '';
    mapa.style.gridTemplateColumns = `56px repeat(${C}, 1fr)`;
    mapa.append(h('div', { class: 'lousa', style: { gridColumn: `1 / span ${C + 1}` } }, 'lousa · frente da sala'));
    cadeiras = [];
    for (let f = 1; f <= F; f++) {
      mapa.append(h('div', { class: 'rot-f' }, `F${f}`));
      for (let c = 1; c <= C; c++) {
        const b = h('button', { class: 'cadeira', title: `Fileira ${f}, cadeira ${c}` }, h('span', {}, `F${f}·C${c}`));
        b.addEventListener('click', () => escolher(f, c));
        mapa.append(b);
        cadeiras.push(b);
      }
    }
    mapa.append(voo);
    reiniciar();
  }
  function escolher(f, c) {
    if (modo === 1) joao = [f, c]; else ana = [f, c];
    reiniciar();
    const alvo = cadeiras[idx(f, c)];
    alvo.classList.add('alvo-config');
    setTimeout(() => alvo.classList.remove('alvo-config'), 900);
  }
  function reiniciar() {
    g.cancela();
    perguntas = 0; achou = false; voou = false;
    cadeiras.forEach(c => c.classList.remove('perguntada', 'achou', 'atual'));
    voo.classList.remove('vis', 'voando');
    cont.textContent = '0';
    modoBtns.forEach(b => b.classList.toggle('sel', Number(b.dataset.modo) === modo));
    el.classList.toggle('modo-indice', modo === 2);
    ficha.classList.toggle('vis', modo === 2);
    fichaTxt.textContent = `Ana → F${ana[0]}·C${ana[1]}`;
    contRot.textContent = modo === 1 ? 'perguntas' : 'perguntas';
    msg.innerHTML = modo === 1
      ? '“Preciso achar o João.” Pergunto o nome de cada aluno, fileira por fileira.'
      : 'O Vono saiu da sala. Eu já fiz a busca e anotei a coordenada.';
  }
  function perguntar() {
    if (modo !== 1 || achou) return false;
    const total = F * C;
    const i = perguntas;
    if (i >= total) return false;
    cadeiras.forEach(c => c.classList.remove('atual'));
    const cad = cadeiras[i];
    perguntas++;
    cont.textContent = String(perguntas);
    if (i === idx(...joao)) {
      cad.classList.add('achou');
      achou = true;
      msg.innerHTML = `Achei o João na pergunta <b>${perguntas}</b>. Se ele estivesse na última cadeira, seriam <b class="vermelho">${total}</b>: o <b>pior caso</b> da <b>busca sequencial</b>.`;
    } else {
      cad.classList.add('perguntada', 'atual');
    }
    return true;
  }
  async function automatico() {
    const gg = g.nova();
    while (g.viva(gg) && perguntar()) await espera(380);
  }
  function voar() {
    if (modo !== 2 || voou) return false;
    voou = true;
    const alvo = cadeiras[idx(...ana)];
    const rm = mapa.getBoundingClientRect(), ra = alvo.getBoundingClientRect(), rf = ficha.getBoundingClientRect();
    const esc = rm.width / mapa.offsetWidth || 1;
    voo.style.left = ((rf.left - rm.left) / esc) + 'px';
    voo.style.top = ((rf.top - rm.top + rf.height / 2) / esc) + 'px';
    voo.classList.add('vis');
    void voo.offsetWidth;
    voo.classList.add('voando');
    voo.style.left = ((ra.left - rm.left + ra.width / 2) / esc) + 'px';
    voo.style.top = ((ra.top - rm.top + ra.height / 2) / esc) + 'px';
    setTimeout(() => {
      alvo.classList.add('achou');
      cont.textContent = '1';
      msg.innerHTML = 'O Vono foi <b>direto</b>, sem perguntar o nome de ninguém. A anotação é o <b class="caneta">índice</b>: gastei tempo <b>antes</b> para a busca ser instantânea <b>na hora</b>.';
    }, Deck.reduzido ? 0 : 900);
    return true;
  }
  function mudarModo(m) { modo = m; reiniciar(); }

  inF.addEventListener('change', montar);
  inC.addEventListener('change', montar);
  modoBtns.forEach(b => b.addEventListener('click', () => mudarModo(Number(b.dataset.modo))));
  $('.sala-perguntar', el).addEventListener('click', () => (modo === 1 ? perguntar() : voar()));
  $('.sala-auto', el).addEventListener('click', () => (modo === 1 ? automatico() : voar()));
  $('.sala-reset', el).addEventListener('click', reiniciar);
  montar();

  return {
    enter(deTras) { if (!deTras) { modo = 1; reiniciar(); } },
    leave() { g.cancela(); },
    next() {
      if (modo === 1 && !achou) return perguntar();
      if (modo === 1 && achou) { mudarModo(2); return true; }
      if (modo === 2 && !voou) return voar();
      return false;
    },
  };
});

/* ===================== Dobrou os dados ===================== */
Deck.registrar('dobra', el => {
  const corpo = $('.dobra-corpo', el);
  let n = 0;
  function tempo(ms) {
    if (ms < 1000) return `${fmt(ms)} ms`;
    const s = ms / 1000;
    if (s < 120) return `${fmt(s, s < 10 ? 1 : 0)} s`;
    const min = s / 60;
    if (min < 120) return `${fmt(min, 0)} min`;
    return `${fmt(min / 60, 1)} h`;
  }
  const BASES = [10000, 20000, 40000, 80000, 160000, 1000000, 100000000];
  function linha(i) {
    const qtd = BASES[i];
    const seq = qtd; // 1 ms por registro lido
    const idx = Math.ceil(Math.log2(qtd));
    const tr = h('tr', { class: 'nova' },
      h('td', { class: 'num' }, fmt(qtd)),
      h('td', { class: 'num vermelho' }, tempo(seq)),
      h('td', { class: 'num caneta' }, tempo(idx)));
    corpo.append(tr);
    setTimeout(() => tr.classList.remove('nova'), 30);
  }
  function reset() { corpo.innerHTML = ''; n = 0; linha(n++); }
  $('.dobra-mais', el).addEventListener('click', () => { if (n < BASES.length) linha(n++); });
  reset();
  return {
    enter(deTras) { if (!deTras) reset(); },
    next() { if (n < BASES.length) { linha(n++); return true; } return false; },
  };
});

/* ===================== Exclusão lógica e VACUUM ===================== */
Deck.registrar('vacuum', el => {
  const grade = $('.vac-grade', el);
  const tamanho = $('.vac-tam', el);
  const status = $('.vac-status', el);
  const TOTAL = 48;
  let passo = 0;
  const APAGAR = new Set([1, 2, 5, 7, 8, 11, 12, 14, 17, 19, 20, 22, 25, 26, 29, 31, 33, 34, 36, 39, 41, 42, 45, 47]);

  function montar() {
    grade.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) grade.append(h('div', { class: 'vac-bloco', 'data-i': i }, String(i + 1)));
    tamanho.textContent = '48 KB';
    status.innerHTML = 'Arquivo <code>alunos.db</code> com 48 registros.';
    passo = 0;
  }
  function apagar() {
    $$('.vac-bloco', grade).forEach(b => { if (APAGAR.has(Number(b.dataset.i))) b.classList.add('apagado'); });
    status.innerHTML = '<code>DELETE</code> em metade: os registros só ganham a marca de apagado. <b class="vermelho">O arquivo não diminuiu.</b>';
    passo = 1;
  }
  function vacuum() {
    const blocos = $$('.vac-bloco', grade);
    const antes = new Map(blocos.map(b => [b, b.getBoundingClientRect()]));
    blocos.filter(b => b.classList.contains('apagado')).forEach(b => b.remove());
    const esc = grade.getBoundingClientRect().width / grade.offsetWidth || 1;
    $$('.vac-bloco', grade).forEach(b => {
      const a = antes.get(b), d = b.getBoundingClientRect();
      const dx = (a.left - d.left) / esc, dy = (a.top - d.top) / esc;
      b.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: Deck.reduzido ? 1 : 700, easing: 'cubic-bezier(.2,.7,.2,1)' });
    });
    tamanho.textContent = '24 KB';
    status.innerHTML = '<code>VACUUM</code> reescreveu o arquivo só com os registros válidos. <b class="verde">Agora sim o espaço voltou para o disco.</b>';
    passo = 2;
  }
  $('.vac-del', el).addEventListener('click', () => { if (passo === 0) apagar(); });
  $('.vac-vac', el).addEventListener('click', () => { if (passo === 1) vacuum(); });
  $('.vac-reset', el).addEventListener('click', montar);
  montar();
  return {
    enter(deTras) { if (!deTras) montar(); },
    next() {
      if (passo === 0) { apagar(); return true; }
      if (passo === 1) { vacuum(); return true; }
      return false;
    },
  };
});

/* ===================== O navio do SQLite ===================== */
Deck.registrar('navio', el => {
  const cena = $('.navio-cena', el);
  const legenda = $('.navio-legenda', el);
  const ESTADOS = [
    { cls: 'ok-servidor', txt: 'O sistema de controle de avarias consulta um <b>servidor de banco</b> (Informix) no porão.' },
    { cls: 'caiu', txt: 'O servidor do banco ficou fora do ar. <b class="vermelho">O painel apaga.</b> Num navio em combate, isso é inaceitável.' },
    { cls: 'sqlite', txt: 'Sem servidor: <b class="caneta">um único arquivo</b> que o próprio programa abre. O painel volta. Nasce o SQLite.' },
  ];
  let passo = 0;
  function render(p) {
    passo = p;
    cena.classList.remove('ok-servidor', 'caiu', 'sqlite');
    cena.classList.add(ESTADOS[p].cls);
    legenda.innerHTML = ESTADOS[p].txt;
    $$('.navio-btn', el).forEach(b => b.classList.toggle('sel', Number(b.dataset.p) === p));
  }
  $$('.navio-btn', el).forEach(b => b.addEventListener('click', () => render(Number(b.dataset.p))));
  render(0);
  return {
    enter(deTras) { render(deTras ? 2 : 0); },
    next() { if (passo < 2) { render(passo + 1); return true; } return false; },
    prev() { if (passo > 0) { render(passo - 1); return true; } return false; },
  };
});

/* ===================== Capacidade da árvore B ===================== */
Deck.registrar('capacidade', el => {
  const k = $('.cap-k', el), n = $('.cap-n', el);
  const outK = $('.cap-out-k', el), outN = $('.cap-out-n', el), outT = $('.cap-out-total', el), outFrase = $('.cap-frase', el);
  function nome(v) {
    if (v >= 1e12) return `${fmt(v / 1e12, 0)} trilhões`;
    if (v >= 1e9) return `${fmt(v / 1e9, 0)} bilhões`;
    if (v >= 1e6) return `${fmt(v / 1e6, 0)} ${v / 1e6 === 1 ? 'milhão' : 'milhões'}`;
    if (v >= 1e3) return `${fmt(v / 1e3, 0)} mil`;
    return fmt(v);
  }
  function calc() {
    const kv = Number(k.value), nv = Number(n.value);
    const total = Math.pow(kv, nv);
    outK.textContent = kv; outN.textContent = nv;
    outT.textContent = nome(total);
    outFrase.innerHTML = `Com <b>${kv}</b> chaves por nó, <b>${nv}</b> ${nv === 1 ? 'andar guarda' : 'andares guardam'} cerca de <b class="caneta">${nome(total)}</b> de registros. Para achar qualquer um: <b>${nv} ${nv === 1 ? 'passo' : 'passos'}</b>.`;
  }
  k.addEventListener('input', calc); n.addEventListener('input', calc);
  calc();
  return {};
});
