/* Demos dos blocos 4 e 5: duelos, queda de luz, travas, caminhão de dados, placar e constraints. */

function fmtMs(ms) {
  if (ms >= 1000) { const s = ms / 1000; return `${fmt(s, s < 10 ? 1 : 0)} s`; }
  if (ms >= 1) return `${fmt(ms, ms < 10 ? 1 : 0)} ms`;
  return `${fmt(ms, 3)} ms`;
}

/* ===================== Duelo genérico A x B ===================== */
Deck.registrar('duelo', el => {
  const pistas = $$('.pista', el);
  const carimbo = $('.carimbo-mult', el);
  const voto = $('.voto', el);
  const g = geracao();
  let corrido = false;
  const cancelas = [];

  function zerar() {
    g.cancela(); cancelas.splice(0).forEach(c => c());
    corrido = false;
    pistas.forEach(p => { $('i', p).style.width = '0%'; $('.tempo', p).textContent = ''; p.classList.remove('venceu', 'perdeu'); });
    if (carimbo) carimbo.classList.remove('on');
    if (voto) voto.classList.remove('some');
  }
  function correr() {
    corrido = true;
    const gg = g.nova();
    if (voto) voto.classList.add('some');
    const ms = pistas.map(p => Number(p.dataset.ms));
    const max = Math.max(...ms);
    const DUR = 2600;
    pistas.forEach((p, i) => {
      const barra = $('i', p), tempo = $('.tempo', p);
      const alvo = Math.max(ms[i] / max * 100, 0.8);
      const dur = Math.max(160, DUR * ms[i] / max);
      cancelas.push(interpola(0, 1, dur, t => {
        barra.style.width = (alvo * t) + '%';
        tempo.textContent = fmtMs(ms[i] * t);
      }, () => {
        tempo.textContent = p.dataset.rot || fmtMs(ms[i]);
        p.classList.add(ms[i] === max ? 'perdeu' : 'venceu');
      }));
    });
    setTimeout(() => { if (g.viva(gg) && carimbo) carimbo.classList.add('on'); }, Deck.reduzido ? 0 : DUR + 200);
  }
  $$('.correr', el).forEach(b => b.addEventListener('click', () => { zerar(); correr(); }));
  zerar();
  return {
    enter(deTras) { zerar(); if (deTras) correr(); },
    leave() { g.cancela(); },
    next() { if (!corrido) { correr(); return true; } return false; },
  };
});

/* ===================== A queda de luz ===================== */
Deck.registrar('luz', el => {
  const ALUNOS = [['Ana', 15], ['Bruno', 0], ['Carla', 32], ['Diego', 8], ['João', 12.5], ['Maria', 3], ['Pedro', 7], ['Sofia', 21]];
  const corpo = $('.luz-corpo', el);
  const barra = $('.luz-barra i', el);
  const pct = $('.luz-pct', el);
  const apagao = $('.luz-apagao', el);
  const log = $('.luz-log', el);
  const msg = $('.luz-msg', el);
  const titulo = $('.luz-titulo', el);
  const g = geracao();
  const CORTE = 4;
  let passo = 0;

  const linhas = ALUNOS.map(([n, s]) => {
    const tr = h('tr', {}, h('td', {}, n), h('td', { class: 'num saldo' }, `R$ ${fmt(s, 2)}`), h('td', { class: 'st' }, ''));
    corpo.append(tr);
    return tr;
  });
  function setLinha(i, saldo, st, cls) {
    const tr = linhas[i];
    $('.saldo', tr).textContent = typeof saldo === 'number' ? `R$ ${fmt(saldo, 2)}` : saldo;
    $('.st', tr).innerHTML = st || '';
    tr.className = cls || '';
  }
  function progresso(p) { barra.style.width = p + '%'; pct.textContent = Math.round(p) + '%'; }
  function inicial() {
    g.cancela(); passo = 0;
    ALUNOS.forEach(([, s], i) => setLinha(i, s, '', ''));
    progresso(0);
    log.innerHTML = ''; log.classList.remove('vis');
    el.classList.remove('final-a', 'final-b');
    titulo.textContent = 'Sexta-feira: recarga de +R$ 20 para todos';
    msg.innerHTML = 'A recarga roda aluno por aluno…';
  }
  async function rodar() {
    const gg = g.nova(); passo = 1;
    log.innerHTML = ''; log.classList.add('vis');
    log.append(h('li', { class: 'ini' }, 'BEGIN;'));
    for (let i = 0; i <= CORTE; i++) {
      if (!g.viva(gg)) return;
      linhas.forEach(l => l.classList.remove('rodando'));
      linhas[i].classList.add('rodando');
      log.append(h('li', {}, `UPDATE ${ALUNOS[i][0]} +20`));
      await espera(520);
      if (!g.viva(gg)) return;
      if (i < CORTE) setLinha(i, ALUNOS[i][1] + 20, '✔', 'feito');
      progresso(((i + 1) / ALUNOS.length) * 100);
    }
    apagao.classList.remove('on'); void apagao.offsetWidth; apagao.classList.add('on');
    linhas.forEach(l => l.classList.remove('rodando'));
    msg.innerHTML = '<b class="vermelho">⚡ Acabou a luz</b> no meio do João. E agora, o que tem no disco?';
  }
  function finalA() {
    g.cancela(); passo = 2;
    el.classList.add('final-a'); el.classList.remove('final-b');
    titulo.textContent = 'Final A: dBase, escrevendo por cima';
    ALUNOS.forEach(([, s], i) => {
      if (i === 1) setLinha(i, s + 40, '⚠ recebeu 2×', 'erro');
      else if (i < CORTE) setLinha(i, s + 20, '✔ recebeu', 'feito');
      else if (i === CORTE) setLinha(i, 'R$ 3▒,#0', '⚠ corrompido', 'erro');
      else setLinha(i, s, '✖ não recebeu', 'nao');
    });
    log.classList.remove('vis');
    msg.innerHTML = 'O <code>REPLACE</code> escrevia <b>por cima</b> do registro antigo. Uns receberam, outros não, um registro ficou pela metade e, quando rodaram de novo, alguém <b class="vermelho">recebeu duas vezes</b>.';
  }
  async function finalB() {
    const gg = g.nova(); passo = 3;
    el.classList.add('final-b'); el.classList.remove('final-a');
    titulo.textContent = 'Final B: com write-ahead log (WAL)';
    if (!log.children.length) {
      log.append(h('li', { class: 'ini' }, 'BEGIN;'));
      for (let i = 0; i <= CORTE; i++) log.append(h('li', {}, `UPDATE ${ALUNOS[i][0]} +20`));
    }
    log.classList.add('vis');
    msg.innerHTML = 'O banco <b>anotou no log antes</b> de mexer. Não tem <code>COMMIT</code> no fim, então ele <b>rebobina</b>…';
    const itens = [...log.children].reverse();
    for (const li of itens) {
      if (!g.viva(gg)) return;
      li.classList.add('desfeito');
      await espera(300);
    }
    if (!g.viva(gg)) return;
    ALUNOS.forEach(([, s], i) => setLinha(i, s, '↺ intacto', 'intacto'));
    progresso(0);
    msg.innerHTML = 'O original ficou <b class="verde">intacto</b>. Quando a luz voltar, roda de novo: <b>ou todos recebem, ou ninguém</b>.';
  }
  $('.luz-rodar', el).addEventListener('click', () => { inicial(); rodar(); });
  $('.luz-a', el).addEventListener('click', finalA);
  $('.luz-b', el).addEventListener('click', finalB);
  $('.luz-reset', el).addEventListener('click', inicial);
  inicial();
  return {
    enter(deTras) { if (deTras) { finalB(); } else inicial(); },
    leave() { g.cancela(); },
    next() {
      if (passo === 0) { rodar(); return true; }
      if (passo === 1) { finalA(); return true; }
      if (passo === 2) { finalB(); return true; }
      return false;
    },
  };
});

/* ===================== Travas: o último salgado ===================== */
Deck.registrar('travas', el => {
  const est = $('.trv-estoque b', el);
  const cx1 = $('.trv-cx1', el), cx2 = $('.trv-cx2', el);
  const msg = $('.trv-msg', el);
  const cadeado = $('.trv-cadeado', el);
  const g = geracao();
  let passo = 0;
  function balao(cx, txt, cls = '') { $('.balao', cx).innerHTML = txt; $('.balao', cx).className = 'balao ' + cls; }
  function zerar() {
    g.cancela();
    est.textContent = '1'; est.parentElement.classList.remove('neg', 'zero');
    balao(cx1, ''); balao(cx2, '');
    cadeado.className = 'trv-cadeado';
    msg.innerHTML = 'Os dois caixas vendem <b>o último salgado</b> no mesmo segundo.';
  }
  async function semTrava() {
    zerar(); const gg = g.nova(); passo = 1;
    $$('.trv-modo', el).forEach(b => b.classList.toggle('sel', b.dataset.m === 'sem'));
    balao(cx1, 'estoque? <b>1</b>', 'vis'); balao(cx2, 'estoque? <b>1</b>', 'vis');
    await espera(1000); if (!g.viva(gg)) return;
    balao(cx1, 'vendi! 🧾', 'vis ok'); balao(cx2, 'vendi! 🧾', 'vis ok');
    await espera(600); if (!g.viva(gg)) return;
    est.textContent = '−1'; est.parentElement.classList.add('neg');
    msg.innerHTML = '<b class="vermelho">Estoque −1.</b> Os dois leram “1” antes de qualquer um gravar. Um aluno pagou por um salgado que não existe.';
  }
  async function comTrava() {
    zerar(); const gg = g.nova(); passo = 2;
    $$('.trv-modo', el).forEach(b => b.classList.toggle('sel', b.dataset.m === 'com'));
    cadeado.className = 'trv-cadeado vis cx1';
    balao(cx1, '🔒 travei: estoque <b>1</b>', 'vis'); balao(cx2, 'aguardando…', 'vis espera');
    await espera(1400); if (!g.viva(gg)) return;
    balao(cx1, 'vendi! 🧾', 'vis ok');
    est.textContent = '0'; est.parentElement.classList.add('zero');
    cadeado.className = 'trv-cadeado vis cx2';
    await espera(700); if (!g.viva(gg)) return;
    balao(cx2, 'estoque? <b>0</b> → esgotado', 'vis erro');
    cadeado.className = 'trv-cadeado';
    msg.innerHTML = '<b class="verde">Com trava</b>, um espera o outro terminar. O segundo recebe “esgotado”. Hoje o banco trava <b>só a linha</b>, não o arquivo inteiro.';
  }
  $$('.trv-modo', el).forEach(b => b.addEventListener('click', () => (b.dataset.m === 'sem' ? semTrava() : comTrava())));
  zerar();
  return {
    enter() { zerar(); passo = 0; $$('.trv-modo', el).forEach(b => b.classList.remove('sel')); },
    leave() { g.cancela(); },
    next() {
      if (passo === 0) { semTrava(); return true; }
      if (passo === 1) { comTrava(); return true; }
      return false;
    },
  };
});

/* ===================== Caminhão: um de cada vez x em lote ===================== */
Deck.registrar('caminhao', el => {
  const estrada = $('.cam-estrada', el);
  const cam = $('.cam-caminhao', el);
  const carga = $('.cam-carga', el);
  const vViagens = $('.cam-viagens', el), vItens = $('.cam-itens', el), vRede = $('.cam-rede', el);
  const msg = $('.cam-msg', el);
  const g = geracao();
  const N = 50;
  let passo = 0;
  function pos(lado, dur) {
    cam.style.transitionDuration = (Deck.reduzido ? 0 : dur) + 'ms';
    cam.classList.toggle('volta', lado === 0);
    cam.style.left = lado === 0 ? '0px' : `${estrada.offsetWidth - cam.offsetWidth}px`;
  }
  function zerar() {
    g.cancela();
    pos(0, 0);
    vViagens.textContent = '0'; vItens.textContent = '0'; vRede.textContent = '0 ms';
    carga.textContent = '';
    msg.innerHTML = 'Buscar <b>50 itens</b> no banco. Cada ida e volta pela rede custa pelo menos <b>1 ms</b>.';
  }
  async function umPorUm() {
    zerar(); const gg = g.nova(); passo = 1;
    $$('.cam-modo', el).forEach(b => b.classList.toggle('sel', b.dataset.m === 'a'));
    for (let i = 1; i <= N; i++) {
      if (!g.viva(gg)) return;
      const d = i <= 3 ? 650 : i <= 8 ? 220 : 60;
      carga.textContent = '';
      pos(1, d); await espera(d + 20); if (!g.viva(gg)) return;
      carga.textContent = '1';
      pos(0, d); await espera(d + 20); if (!g.viva(gg)) return;
      vViagens.textContent = i; vItens.textContent = i; vRede.textContent = `${i} ms`;
    }
    msg.innerHTML = '<b class="vermelho">50 viagens</b> para 50 itens. Com 50 mil linhas, só a rede soma <b>50 segundos</b>. É ir ao mercado 50 vezes, um item por vez.';
  }
  async function lote() {
    zerar(); const gg = g.nova(); passo = 2;
    $$('.cam-modo', el).forEach(b => b.classList.toggle('sel', b.dataset.m === 'b'));
    carga.textContent = '';
    pos(1, 900); await espera(920); if (!g.viva(gg)) return;
    carga.textContent = '50';
    pos(0, 900); await espera(920); if (!g.viva(gg)) return;
    vViagens.textContent = '1'; vItens.textContent = '50'; vRede.textContent = '1 ms';
    msg.innerHTML = '<b class="verde">Uma viagem</b> com a lista inteira. Melhor ainda: mandar o banco fazer o trabalho e <b>não trazer nada</b>.';
  }
  $$('.cam-modo', el).forEach(b => b.addEventListener('click', () => (b.dataset.m === 'a' ? umPorUm() : lote())));
  return {
    enter() { passo = 0; $$('.cam-modo', el).forEach(b => b.classList.remove('sel')); zerar(); },
    leave() { g.cancela(); },
    next() {
      if (passo === 0) { umPorUm(); return true; }
      if (passo === 1) { lote(); return true; }
      return false;
    },
  };
});

/* ===================== Placar dos duelos (escala logarítmica) ===================== */
Deck.registrar('placar', el => {
  const alvo = $('.placar-svg', el);
  const DADOS = [
    { n: 'Com índice x sem índice', v: 1600, rot: '≈ 1.600×', duelo: 'Duelo 1' },
    { n: 'Inserir em lote x um por um', v: 1300, rot: '≈ 1.300×', duelo: 'Duelo 4' },
    { n: 'Um UPDATE x loop de UPDATE', v: 1000, rot: '> 1.000×', duelo: 'Duelo 3' },
    { n: 'WHERE no banco x filtrar no código', v: 8, rot: '≈ 8×', duelo: 'Duelo 5' },
  ];
  const W = 1300, X0 = 470, X1 = W - 140, ROW = 92, TOP = 40;
  const esc = v => X0 + (Math.log10(v) / 4) * (X1 - X0);
  const s = svg('svg', { viewBox: `0 0 ${W} ${TOP + DADOS.length * ROW + 60}`, width: '100%', role: 'img', 'aria-label': 'Placar dos duelos em escala logarítmica' });
  [1, 10, 100, 1000, 10000].forEach(t => {
    s.append(svg('line', { x1: esc(t), x2: esc(t), y1: TOP - 10, y2: TOP + DADOS.length * ROW, class: 'pl-grade' }));
    s.append(svg('text', { x: esc(t), y: TOP + DADOS.length * ROW + 34, class: 'pl-eixo', 'text-anchor': 'middle', text: `${fmt(t)}×` }));
  });
  const barras = DADOS.map((d, i) => {
    const y = TOP + i * ROW;
    s.append(svg('text', { x: 0, y: y + 32, class: 'pl-duelo', text: d.duelo }));
    s.append(svg('text', { x: 0, y: y + 62, class: 'pl-nome', text: d.n }));
    const r = svg('rect', { x: X0, y: y + 14, height: 52, width: 0, rx: 6, class: 'pl-barra' + (d.v < 100 ? ' menor' : '') });
    const t = svg('text', { x: X0 + 12, y: y + 50, class: 'pl-rot', text: d.rot });
    s.append(r, t);
    return { r, t, w: esc(d.v) - X0 };
  });
  alvo.append(s);
  function crescer(animar) {
    barras.forEach((b, i) => {
      b.r.setAttribute('width', 0); b.t.setAttribute('x', X0 + 12);
      const ir = () => interpola(0, 1, animar ? 900 : 0, t => {
        b.r.setAttribute('width', b.w * t);
        b.t.setAttribute('x', X0 + b.w * t + 14);
      });
      if (animar) setTimeout(ir, 200 + i * 250); else ir();
    });
  }
  return { enter() { crescer(true); } };
});

/* ===================== Constraints: dois cliques no mesmo milissegundo ===================== */
Deck.registrar('unique', el => {
  const tl1 = $('.unq-a', el), tl2 = $('.unq-b', el);
  const tabela = $('.unq-tabela tbody', el);
  const msg = $('.unq-msg', el);
  const g = geracao();
  let passo = 0;
  function zerar() {
    g.cancela();
    tl1.innerHTML = ''; tl2.innerHTML = ''; tabela.innerHTML = '';
    msg.innerHTML = 'Dois alunos clicam em <b>Cadastrar</b> com o mesmo e-mail, no mesmo milissegundo.';
  }
  async function rodar(comUnique) {
    zerar(); const gg = g.nova(); passo = comUnique ? 2 : 1;
    $$('.unq-modo', el).forEach(b => b.classList.toggle('sel', (b.dataset.m === 'com') === comUnique));
    const ev = (tl, txt, cls = '') => tl.append(h('li', { class: cls, html: txt }));
    ev(tl1, 'clicou em <b>Cadastrar</b>'); ev(tl2, 'clicou em <b>Cadastrar</b>');
    await espera(700); if (!g.viva(gg)) return;
    ev(tl1, 'formulário: e-mail já existe? <b>não</b>'); ev(tl2, 'formulário: e-mail já existe? <b>não</b>');
    await espera(900); if (!g.viva(gg)) return;
    ev(tl1, '<code>INSERT</code> ✔', 'ok');
    tabela.append(h('tr', {}, h('td', {}, '1'), h('td', {}, 'joao@etec.sp.gov.br')));
    await espera(500); if (!g.viva(gg)) return;
    if (comUnique) {
      ev(tl2, '<code>INSERT</code> ✖ UNIQUE constraint failed', 'erro');
      msg.innerHTML = '<b class="verde">Só o banco garante.</b> O segundo cadastro é recusado e o app mostra “e-mail já cadastrado”.';
    } else {
      ev(tl2, '<code>INSERT</code> ✔', 'ok');
      tabela.append(h('tr', { class: 'dup' }, h('td', {}, '2'), h('td', {}, 'joao@etec.sp.gov.br')));
      msg.innerHTML = '<b class="vermelho">Dois cadastros com o mesmo e-mail.</b> Os dois formulários checaram, nenhum achou, e os dois gravaram.';
    }
  }
  $$('.unq-modo', el).forEach(b => b.addEventListener('click', () => rodar(b.dataset.m === 'com')));
  zerar();
  return {
    enter() { passo = 0; zerar(); $$('.unq-modo', el).forEach(b => b.classList.remove('sel')); },
    leave() { g.cancela(); },
    next() {
      if (passo === 0) { rodar(false); return true; }
      if (passo === 1) { rodar(true); return true; }
      return false;
    },
  };
});
