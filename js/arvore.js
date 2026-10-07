/* Árvore B didática: no máximo 2 nomes por nó (os bancos reais usam centenas).
   data-modo="crescer": inserir nomes, ver nós se dividirem, slider de poucas/muitas folhas.
   data-modo="buscar": descer pelos galhos destacando o caminho. */
Deck.registrar('arvore', el => {
  const modo = el.dataset.modo || 'crescer';
  const svgEl = $('.arv-svg', el);
  const msg = $('.arv-msg', el);
  const cReg = $('.arv-c-reg', el), cAnd = $('.arv-c-and', el), cFol = $('.arv-c-fol', el), cPas = $('.arv-c-pas', el);
  const lista = $('.arv-passos', el);
  const g = geracao();
  const CW = 150, H = 66, GAP = 24, LH = 140, MARGEM = 20;
  const cmp = (a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });

  const NOMES = ['Ana', 'João', 'Pedro', 'Bruno', 'Maria', 'Gabi', 'Otávio', 'Diego', 'Isa', 'Leonardo', 'Rafa', 'Thiago',
    'Carla', 'Eduarda', 'Heitor', 'Matheus', 'Paula', 'Sofia', 'Vitória', 'Lucas', 'Bia', 'Kaique', 'Nina', 'Yasmin',
    'Fernanda', 'Caio', 'Wesley', 'Luana', 'Igor', 'Zeca'];

  let seq = 0;
  const novoNo = (keys, kids = []) => ({ id: ++seq, keys, kids });
  let raiz = novoNo([]);

  function andar(fn, no = raiz) { fn(no); no.kids.forEach(k => andar(fn, k)); }
  function existe(nome) {
    let no = raiz;
    while (no) {
      let i = 0;
      while (i < no.keys.length && cmp(nome, no.keys[i]) > 0) i++;
      if (i < no.keys.length && cmp(nome, no.keys[i]) === 0) return true;
      no = no.kids[i];
    }
    return false;
  }
  function inserir(nome) {
    const info = { splits: [], novaRaiz: false, origem: new Map() };
    function ins(no) {
      if (!no.kids.length) { no.keys.push(nome); no.keys.sort(cmp); }
      else {
        let i = 0;
        while (i < no.keys.length && cmp(nome, no.keys[i]) > 0) i++;
        const r = ins(no.kids[i]);
        if (r) { no.keys.splice(i, 0, r.meio); no.kids.splice(i + 1, 0, r.dir); }
      }
      if (no.keys.length > 2) {
        const dir = novoNo([no.keys[2]], no.kids.slice(2));
        const meio = no.keys[1];
        no.keys = [no.keys[0]];
        no.kids = no.kids.slice(0, 2);
        info.splits.push(meio);
        info.origem.set(dir.id, no.id);
        return { meio, dir };
      }
      return null;
    }
    const r = ins(raiz);
    if (r) {
      const nova = novoNo([r.meio], [raiz, r.dir]);
      info.origem.set(nova.id, raiz.id);
      raiz = nova;
      info.novaRaiz = true;
    }
    return info;
  }
  function arvoreDoRoteiro() {
    const f = n => novoNo([n]);
    return novoNo(['Gabi', 'Otávio'], [
      novoNo(['Bruno', 'Diego'], [f('Ana'), f('Carla'), f('Eduarda')]),
      novoNo(['Isa', 'Leonardo'], [f('Heitor'), f('João'), f('Matheus')]),
      novoNo(['Rafa', 'Thiago'], [f('Paula'), f('Sofia'), f('Vitória')]),
    ]);
  }

  /* ---------- layout ---------- */
  function layout() {
    const pos = new Map();
    const folhas = [];
    let prof = 0;
    (function p(n, d) { n._d = d; prof = Math.max(prof, d); if (!n.kids.length) folhas.push(n); else n.kids.forEach(k => p(k, d + 1)); })(raiz, 0);
    let x = 0;
    folhas.forEach(f => { const w = Math.max(1, f.keys.length) * CW; pos.set(f.id, { x, y: f._d * LH, w }); x += w + GAP; });
    (function pi(n) {
      if (!n.kids.length) return;
      n.kids.forEach(pi);
      const a = pos.get(n.kids[0].id), b = pos.get(n.kids[n.kids.length - 1].id);
      const c = (a.x + a.w / 2 + b.x + b.w / 2) / 2;
      const w = n.keys.length * CW;
      pos.set(n.id, { x: c - w / 2, y: n._d * LH, w });
    })(raiz);
    let minX = Infinity, maxX = -Infinity;
    pos.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x + p.w); });
    const vb = { x: minX - MARGEM, y: -MARGEM, w: Math.max(maxX - minX + 2 * MARGEM, 900), h: prof * LH + H + 2 * MARGEM };
    if (vb.w === 900) vb.x = (minX + maxX) / 2 - 450;
    return { pos, vb, andares: prof + 1, folhas: folhas.length };
  }

  /* ---------- desenho ---------- */
  const gAr = svg('g'), gNo = svg('g');
  svgEl.append(gAr, gNo);
  const elNos = new Map();
  let arestas = [];
  let atualLayout = null;
  let cancelaAnim = () => {};

  function sincronizar() {
    const vivos = new Set();
    gAr.innerHTML = '';
    arestas = [];
    andar(n => {
      vivos.add(n.id);
      let e = elNos.get(n.id);
      if (!e) { e = { g: svg('g', { class: 'arv-no' }) }; gNo.append(e.g); elNos.set(n.id, e); }
      e.g.innerHTML = '';
      const w = Math.max(1, n.keys.length) * CW;
      e.g.append(svg('rect', { x: 0, y: 0, width: w, height: H, rx: 10, class: 'arv-caixa' }));
      n.keys.forEach((k, j) => {
        if (j > 0) e.g.append(svg('line', { x1: j * CW, y1: 6, x2: j * CW, y2: H - 6, class: 'arv-sep' }));
        e.g.append(svg('text', { x: j * CW + CW / 2, y: H / 2 + 10, class: 'arv-chave', 'data-k': k, text: k }));
      });
      n.kids.forEach((k, i) => {
        const l = svg('line', { class: 'arv-aresta' });
        gAr.append(l);
        arestas.push({ p: n, i, k, el: l });
      });
    });
    for (const [id, e] of elNos) if (!vivos.has(id)) { e.g.remove(); elNos.delete(id); }
  }
  function desenhar(pos, vb) {
    andar(n => {
      const p = pos.get(n.id), e = elNos.get(n.id);
      if (p && e) e.g.setAttribute('transform', `translate(${p.x},${p.y})`);
    });
    arestas.forEach(a => {
      const pp = pos.get(a.p.id), pk = pos.get(a.k.id);
      if (!pp || !pk) return;
      a.el.setAttribute('x1', pp.x + a.i * CW * (a.p.keys.length ? 1 : 0));
      a.el.setAttribute('y1', pp.y + H);
      a.el.setAttribute('x2', pk.x + pk.w / 2);
      a.el.setAttribute('y2', pk.y);
    });
    svgEl.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  }
  function atualizar(origem = new Map(), animar = true) {
    cancelaAnim();
    const antes = atualLayout;
    sincronizar();
    const novo = layout();
    atualLayout = novo;
    contadores(novo);
    if (!antes || !animar) { desenhar(novo.pos, novo.vb); return; }
    const de = new Map();
    novo.pos.forEach((p, id) => {
      const a = antes.pos.get(id) || antes.pos.get(origem.get(id));
      de.set(id, a ? { ...a, w: p.w } : { ...p, y: p.y - 30 });
      if (!antes.pos.get(id)) { const e = elNos.get(id); if (e) e.g.classList.add('nasce'); }
    });
    cancelaAnim = interpola(0, 1, 750, t => {
      const pos = new Map();
      novo.pos.forEach((p, id) => {
        const a = de.get(id);
        pos.set(id, { x: a.x + (p.x - a.x) * t, y: a.y + (p.y - a.y) * t, w: p.w });
      });
      const A = antes.vb, B = novo.vb;
      desenhar(pos, { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, w: A.w + (B.w - A.w) * t, h: A.h + (B.h - A.h) * t });
    }, () => { elNos.forEach(e => e.g.classList.remove('nasce')); });
  }
  function contadores(L) {
    let reg = 0;
    andar(n => { reg += n.keys.length; });
    if (cReg) cReg.textContent = reg;
    if (cAnd) cAnd.textContent = L.andares;
    if (cFol) cFol.textContent = L.folhas;
    if (cPas && modo === 'crescer') cPas.textContent = `até ${L.andares}`;
  }
  function limparDestaques() {
    elNos.forEach(e => e.g.classList.remove('caminho', 'atual', 'achou-no', 'falhou'));
    svgEl.querySelectorAll('.arv-chave').forEach(t => t.classList.remove('achou-chave'));
    arestas.forEach(a => a.el.classList.remove('caminho'));
  }

  /* ---------- crescer ---------- */
  let proximo = 0;
  const btnProx = $('.arv-prox', el);
  const slider = $('.arv-slider', el);
  const sliderOut = $('.arv-slider-out', el);
  function rotuloProx() { if (btnProx) btnProx.textContent = proximo < NOMES.length ? `Inserir “${NOMES[proximo]}”` : 'Todos inseridos'; }
  function inserirNome(nome, animar = true) {
    nome = (nome || '').trim();
    if (!nome) return;
    nome = nome[0].toUpperCase() + nome.slice(1);
    if (existe(nome)) { msg.innerHTML = `“${nome}” já está na árvore.`; return; }
    const info = inserir(nome);
    atualizar(info.origem, animar);
    if (!info.splits.length) msg.innerHTML = `<b>${nome}</b> entrou numa folha que ainda tinha espaço.`;
    else {
      const subiu = info.splits.map(s => `<b class="caneta">${s}</b>`).join(', depois ');
      msg.innerHTML = `<b>${nome}</b> não coube: o nó estourou com 3 nomes, <b>se dividiu em dois</b> e ${subiu} <b>subiu</b>.` +
        (info.novaRaiz ? ' A raiz também encheu: <b class="vermelho">nasceu um andar novo</b> no topo.' : '');
    }
  }
  function construir(n) {
    seq = 0; raiz = novoNo([]); elNos.forEach(e => e.g.remove()); elNos.clear(); atualLayout = null;
    for (let i = 0; i < n; i++) inserir(NOMES[i]);
    proximo = n;
    atualizar(new Map(), false);
    rotuloProx();
  }
  function preset(qual) {
    g.cancela(); limparDestaques();
    if (qual === 1) { construir(2); msg.innerHTML = '<b>Tamanho 1:</b> poucos alunos, tudo cabe num nó só, a raiz.'; }
    if (qual === 2) { construir(5); msg.innerHTML = '<b>Tamanho 2:</b> a folha encheu e se dividiu. O <b class="caneta">João</b> subiu e virou a raiz.'; }
    if (qual === 3) {
      const antes = atualLayout;
      seq = 100; raiz = arvoreDoRoteiro(); elNos.forEach(e => e.g.remove()); elNos.clear();
      atualLayout = antes ? { ...antes, pos: new Map() } : null;
      atualizar(new Map(), !!antes);
      proximo = NOMES.length;
      rotuloProx();
      msg.innerHTML = '<b>Tamanho 3:</b> 17 nomes em 9 folhas e só <b class="caneta">3 andares</b>. Todas as folhas no mesmo andar: isso é ser <b>balanceada</b>.';
    }
    if (slider) { slider.value = qual === 1 ? 2 : qual === 2 ? 5 : 17; sliderOut.textContent = slider.value; }
  }

  /* ---------- buscar ---------- */
  function decide(no, alvo) {
    for (let i = 0; i < no.keys.length; i++) {
      const c = cmp(alvo, no.keys[i]);
      if (c === 0) return { achou: true, i };
      if (c < 0) return { i };
    }
    return { i: no.keys.length };
  }
  function galho(no, i) {
    if (no.keys.length === 1) return ['da esquerda', 'da direita'][i];
    return ['da esquerda', 'do meio', 'da direita'][i] || `nº ${i + 1}`;
  }
  async function buscar(nome) {
    nome = (nome || '').trim();
    if (!nome) return;
    nome = nome[0].toUpperCase() + nome.slice(1);
    const gg = g.nova();
    limparDestaques();
    if (lista) lista.innerHTML = '';
    msg.innerHTML = `Onde está <b>“${nome}”</b>?`;
    let no = raiz, passos = 0;
    while (no && g.viva(gg)) {
      passos++;
      if (cPas) cPas.textContent = passos;
      const e = elNos.get(no.id);
      elNos.forEach(x => x.g.classList.remove('atual'));
      e.g.classList.add('caminho', 'atual');
      await espera(450);
      if (!g.viva(gg)) return;
      const d = decide(no, nome);
      const nomeNo = `[${no.keys.join(' | ')}]`;
      let txt;
      if (d.achou) {
        e.g.classList.add('achou-no');
        const t = [...e.g.querySelectorAll('.arv-chave')].find(x => cmp(x.dataset.k, nome) === 0);
        if (t) t.classList.add('achou-chave');
        txt = `<b>${nomeNo}</b>: é o próprio ${nome}. <b class="verde">Achou em ${passos} ${passos === 1 ? 'passo' : 'passos'}!</b>`;
      } else {
        const partes = [];
        if (d.i > 0) partes.push(`depois de ${no.keys[d.i - 1]}`);
        if (d.i < no.keys.length) partes.push(`antes de ${no.keys[d.i]}`);
        if (!no.kids.length) {
          e.g.classList.add('falhou');
          txt = `<b>${nomeNo}</b>: não está aqui. Em ${passos} passos o banco já sabe que <b class="vermelho">${nome} não existe</b>, sem olhar o resto.`;
        } else {
          txt = `<b>${nomeNo}</b>: “${nome}” vem ${partes.join(' e ')} → desce pelo <b class="caneta">galho ${galho(no, d.i)}</b>`;
        }
      }
      if (lista) lista.append(h('li', { html: txt }));
      if (d.achou || !no.kids.length) {
        msg.innerHTML = d.achou
          ? `<b>${passos} passos</b>, contra até ${contaChaves()} comparações olhando nome por nome.`
          : `Nome que não existe também se resolve em <b>${passos} passos</b>.`;
        return;
      }
      const a = arestas.find(x => x.p === no && x.i === d.i);
      if (a) a.el.classList.add('caminho');
      no = no.kids[d.i];
      await espera(900);
    }
  }
  function contaChaves() { let r = 0; andar(n => { r += n.keys.length; }); return r; }

  /* ---------- controles ---------- */
  const inNome = $('.arv-nome', el);
  const form = $('.arv-form', el);
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    if (modo === 'buscar') buscar(inNome.value); else inserirNome(inNome.value);
    inNome.value = '';
  });
  if (btnProx) btnProx.addEventListener('click', () => { if (proximo < NOMES.length) inserirNome(NOMES[proximo++]); rotuloProx(); });
  $$('.arv-preset', el).forEach(b => b.addEventListener('click', () => preset(Number(b.dataset.t))));
  $$('.arv-busca-rapida', el).forEach(b => b.addEventListener('click', () => buscar(b.dataset.n)));
  if (slider) slider.addEventListener('input', () => {
    g.cancela(); limparDestaques();
    const n = Number(slider.value);
    sliderOut.textContent = n;
    construir(n);
    const L = atualLayout;
    msg.innerHTML = `<b>${n}</b> nomes · <b>${L.folhas}</b> folhas · <b class="caneta">${L.andares} andares</b>. Os registros explodem; os passos quase não mudam.`;
  });

  let passo = 0;
  const ROTEIRO_CRESCER = [
    () => preset(1),
    () => { inserirNome('Pedro'); proximo = 3; rotuloProx(); },
    () => { inserirNome('Bruno'); proximo = 4; rotuloProx(); },
    () => { inserirNome('Maria'); proximo = 5; rotuloProx(); msg.innerHTML += ' Chegamos ao <b>tamanho 2</b>.'; },
    () => preset(3),
  ];
  const ROTEIRO_BUSCAR = [
    () => { preset(3); msg.innerHTML = 'A árvore do tamanho 3. Digitem um nome ou usem os botões.'; if (lista) lista.innerHTML = ''; if (cPas) cPas.textContent = '0'; },
    () => buscar('João'),
    () => buscar('Thiago'),
    () => buscar('Kevin'),
  ];
  const roteiro = modo === 'buscar' ? ROTEIRO_BUSCAR : ROTEIRO_CRESCER;

  function inicio() { g.cancela(); passo = 0; roteiro[0](); }
  inicio();

  return {
    enter(deTras) { if (!deTras) inicio(); },
    leave() { g.cancela(); },
    next() { if (passo < roteiro.length - 1) { passo++; roteiro[passo](); return true; } return false; },
  };
});
