/* Motor dos slides: navegação, fragmentos, nomes editáveis, notas, cronômetro e visão geral.
   Cada slide é uma <section class="slide">. Um slide pode ter data-demo="nome"; a demo
   registrada com Deck.registrar(nome, fn) recebe o elemento e devolve { enter, leave, next, prev }.
   next()/prev() devolvem true quando consumiram o passo (a demo tem passos internos). */
(function () {
  const PADRAO = { tia: 'Tia Cida', cantina: 'Cantina da Cida' };
  const CHAVE = 'cantinaapp-nomes';

  const Deck = window.Deck = {
    demos: {},
    vars: { ...PADRAO },
    ouvintes: [],
    reduzido: matchMedia('(prefers-reduced-motion: reduce)').matches,
    registrar(nome, fn) { this.demos[nome] = fn; },
    v(k) { return this.vars[k]; },
    aoMudarNomes(fn) { this.ouvintes.push(fn); },
  };

  const palco = document.getElementById('palco');
  const slides = [...palco.querySelectorAll('.slide')];
  const instancias = new Map();
  let atual = 0;

  /* ---------- escala ---------- */
  function escala() {
    const s = Math.min(innerWidth / 1600, innerHeight / 900);
    palco.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  addEventListener('resize', escala);
  escala();

  /* ---------- nomes {TIA} e {CANTINA} ---------- */
  function carregarNomes() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (salvo) Object.assign(Deck.vars, salvo);
    } catch (e) { /* sem storage: fica o padrão */ }
  }
  function aplicarNomes() {
    document.querySelectorAll('[data-v]').forEach(el => { el.textContent = Deck.vars[el.dataset.v] || ''; });
    Deck.ouvintes.forEach(fn => fn());
  }
  function salvarNomes() {
    try { localStorage.setItem(CHAVE, JSON.stringify(Deck.vars)); } catch (e) { /* ok */ }
  }
  Deck.aplicarNomes = aplicarNomes;

  /* ---------- demos ---------- */
  function inst(i) {
    const el = slides[i];
    const nome = el.dataset.demo;
    if (!nome) return null;
    if (!instancias.has(i)) {
      const fn = Deck.demos[nome];
      let obj = {};
      try { obj = fn ? (fn(el) || {}) : {}; } catch (e) { console.error('demo', nome, e); }
      instancias.set(i, obj);
    }
    return instancias.get(i);
  }

  /* ---------- fragmentos ---------- */
  const frags = el => [...el.querySelectorAll('.frag')].filter(f => !f.closest('.notas'));

  /* ---------- navegação ---------- */
  function ir(i, deTras = false) {
    if (i < 0 || i >= slides.length) return;
    const ant = slides[atual];
    if (ant.classList.contains('ativo')) {
      const d = instancias.get(atual);
      if (d && d.leave) d.leave();
      ant.classList.remove('ativo', 'de-tras');
    }
    atual = i;
    const el = slides[i];
    frags(el).forEach(f => f.classList.toggle('on', deTras));
    el.classList.toggle('de-tras', deTras);
    el.classList.add('ativo');
    const d = inst(i);
    if (d && d.enter) d.enter(deTras);
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { location.hash = String(i + 1); }
    atualizarHud();
    atualizarNotas();
    if (!sobreVisao.hidden) montarVisao();
  }
  Deck.ir = ir;

  function avancar() {
    const d = inst(atual);
    if (d && d.next && d.next()) return;
    const f = frags(slides[atual]).find(x => !x.classList.contains('on'));
    if (f) { f.classList.add('on'); return; }
    ir(atual + 1);
  }
  function voltar() {
    const on = frags(slides[atual]).filter(x => x.classList.contains('on'));
    if (on.length) { on[on.length - 1].classList.remove('on'); return; }
    const d = inst(atual);
    if (d && d.prev && d.prev()) return;
    ir(atual - 1, true);
  }
  Deck.avancar = avancar;
  Deck.voltar = voltar;

  /* ---------- HUD ---------- */
  const hud = document.getElementById('hud');
  const blocos = [];
  slides.forEach((s, i) => {
    const b = s.dataset.bloco;
    let bl = blocos.find(x => x.id === b);
    if (!bl) { bl = { id: b, nome: s.dataset.nomeBloco || '', quem: s.dataset.quem || '', tempo: s.dataset.tempo || '', slides: [] }; blocos.push(bl); }
    if (s.dataset.nomeBloco) bl.nome = s.dataset.nomeBloco;
    bl.slides.push(i);
  });
  const barras = hud.querySelector('.barras');
  blocos.forEach(bl => {
    const i = document.createElement('i');
    i.className = (bl.quem || '').toLowerCase().startsWith('vono') ? 'leo' : (bl.quem || '').toLowerCase().startsWith('ambos') ? 'ambos' : '';
    i.style.flex = bl.slides.length;
    i.appendChild(document.createElement('b'));
    barras.appendChild(i);
    bl.el = i.firstChild;
  });
  const hudNum = hud.querySelector('.num');
  const hudCron = hud.querySelector('.cronometro');

  function blocoDe(i) { return blocos.find(bl => bl.slides.includes(i)); }
  function atualizarHud() {
    blocos.forEach(bl => {
      const ult = bl.slides[bl.slides.length - 1], pri = bl.slides[0];
      const pct = atual >= ult ? 100 : atual < pri ? 0 : ((atual - pri + 1) / bl.slides.length) * 100;
      bl.el.style.width = pct + '%';
    });
    hudNum.textContent = `${atual + 1} / ${slides.length}`;
  }

  /* ---------- cronômetro ---------- */
  let inicio = null, pausado = 0, rodando = false;
  function decorrido() { return rodando ? (Date.now() - inicio) : pausado; }
  function fmtTempo(ms) {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  function alternarCronometro() {
    if (rodando) { pausado = Date.now() - inicio; rodando = false; }
    else { inicio = Date.now() - pausado; rodando = true; }
    hudCron.hidden = false;
    tique();
  }
  function fimDoBloco(i) {
    const t = (slides[i].dataset.tempo || '').split(/[–-]/);
    return t.length === 2 ? Number(t[1]) : null;
  }
  function tique() {
    const ms = decorrido();
    const atrasado = (() => { const f = fimDoBloco(atual); return f != null && ms / 60000 > f; })();
    hudCron.textContent = fmtTempo(ms);
    hudCron.classList.toggle('atrasado', atrasado);
    const r = document.querySelector('#painel-notas .relogio');
    if (r) { r.textContent = fmtTempo(ms); r.classList.toggle('atrasado', atrasado); }
  }
  setInterval(() => { if (rodando) tique(); }, 500);

  /* ---------- notas ---------- */
  const painelNotas = document.getElementById('painel-notas');
  function atualizarNotas() {
    if (painelNotas.hidden) return;
    const s = slides[atual];
    const n = s.querySelector('.notas');
    painelNotas.innerHTML = `
      <div class="meta">
        <strong>${s.dataset.quem || ''}</strong>
        <span>Bloco ${s.dataset.bloco} · ⏱ ${s.dataset.tempo || ''} min</span>
        <span>Slide ${atual + 1} de ${slides.length}</span>
        <span class="relogio">${fmtTempo(decorrido())}</span>
        <span>T inicia/pausa · N fecha</span>
      </div>
      <div class="texto">${n ? n.innerHTML : '<p>Sem notas.</p>'}</div>`;
    painelNotas.querySelectorAll('[data-v]').forEach(el => { el.textContent = Deck.vars[el.dataset.v]; });
    tique();
  }

  /* ---------- visão geral ---------- */
  const sobreVisao = document.getElementById('visao');
  function montarVisao() {
    const g = sobreVisao.querySelector('.visao-geral');
    g.innerHTML = '';
    blocos.forEach(bl => {
      const d = document.createElement('div');
      d.className = 'bloco';
      d.innerHTML = `<h4>${bl.id}. ${bl.nome} · ${bl.quem} · ${bl.tempo}′</h4>`;
      bl.slides.forEach(i => {
        const b = document.createElement('button');
        b.className = i === atual ? 'atual' : '';
        b.innerHTML = `<span>${i + 1}</span><span>${slides[i].dataset.titulo || 'Slide'}</span>`;
        b.addEventListener('click', () => { sobreVisao.hidden = true; ir(i); });
        d.appendChild(b);
      });
      g.appendChild(d);
    });
  }
  function alternarVisao() {
    sobreVisao.hidden = !sobreVisao.hidden;
    if (!sobreVisao.hidden) montarVisao();
  }

  /* ---------- configuração ---------- */
  const sobreConfig = document.getElementById('config');
  const inTia = document.getElementById('cfg-tia');
  const inCantina = document.getElementById('cfg-cantina');
  function abrirConfig() {
    inTia.value = Deck.vars.tia;
    inCantina.value = Deck.vars.cantina;
    sobreConfig.hidden = false;
    inTia.focus();
  }
  document.getElementById('cfg-form').addEventListener('submit', e => {
    e.preventDefault();
    Deck.vars.tia = inTia.value.trim() || PADRAO.tia;
    Deck.vars.cantina = inCantina.value.trim() || PADRAO.cantina;
    salvarNomes(); aplicarNomes(); atualizarNotas();
    sobreConfig.hidden = true;
  });
  document.getElementById('cfg-restaurar').addEventListener('click', () => {
    inTia.value = PADRAO.tia; inCantina.value = PADRAO.cantina;
  });
  document.querySelectorAll('.sobre').forEach(s => s.addEventListener('click', e => { if (e.target === s) s.hidden = true; }));
  document.querySelectorAll('[data-fechar]').forEach(b => b.addEventListener('click', () => { b.closest('.sobre').hidden = true; }));

  /* ---------- tela cheia / tela preta ---------- */
  function telaCheia() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    } catch (e) { /* sem suporte */ }
  }
  const telaPreta = document.getElementById('tela-preta');

  document.getElementById('btn-visao').addEventListener('click', alternarVisao);
  document.getElementById('btn-config').addEventListener('click', abrirConfig);
  document.getElementById('btn-notas').addEventListener('click', () => { painelNotas.hidden = !painelNotas.hidden; atualizarNotas(); });
  document.getElementById('btn-tela').addEventListener('click', telaCheia);

  /* ---------- teclado ---------- */
  addEventListener('keydown', e => {
    const alvo = e.target;
    const digitando = alvo.matches && alvo.matches('input, textarea, select, [contenteditable]');
    if (e.key === 'Escape') {
      if (digitando) { alvo.blur(); return; }
      if (!sobreConfig.hidden) { sobreConfig.hidden = true; return; }
      alternarVisao(); return;
    }
    if (digitando || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!sobreConfig.hidden) return;
    const k = e.key;
    if (!telaPreta.hidden && k !== 'b' && k !== 'B' && k !== '.') { telaPreta.hidden = true; }
    switch (k) {
      case 'ArrowRight': case 'PageDown': case ' ': case 'ArrowDown':
        if (k === ' ' && alvo.matches && alvo.matches('button')) return;
        e.preventDefault(); avancar(); break;
      case 'ArrowLeft': case 'PageUp': case 'ArrowUp': case 'Backspace':
        e.preventDefault(); voltar(); break;
      case 'Home': ir(0); break;
      case 'End': ir(slides.length - 1); break;
      case 'o': case 'O': alternarVisao(); break;
      case 'n': case 'N': painelNotas.hidden = !painelNotas.hidden; atualizarNotas(); break;
      case 'c': case 'C': abrirConfig(); break;
      case 'f': case 'F': telaCheia(); break;
      case 't': case 'T': alternarCronometro(); break;
      case 'b': case 'B': case '.': telaPreta.hidden = !telaPreta.hidden; break;
    }
  });

  /* ---------- clique avança (fora de elementos interativos) ---------- */
  palco.addEventListener('click', e => {
    if (e.target.closest('button, input, select, label, a, textarea, .interativo, .frag-click')) return;
    if (getSelection && String(getSelection()).length) return;
    avancar();
  });
  palco.addEventListener('contextmenu', e => {
    if (e.target.closest('.interativo')) return;
    e.preventDefault(); voltar();
  });
  // depois de clicar num botão, devolve o teclado para a navegação
  palco.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) setTimeout(() => b.blur(), 0);
  });

  /* ---------- trilha do CantinaApp ---------- */
  const CAPS = [
    { t: 'O caderno da <span data-v="tia"></span>', tam: '1 caderno', q: 'Achar quem deve exige folhear página por página' },
    { t: 'Vira TCC', tam: '1 turma, 40 alunos', q: 'Nada, e esse é o perigo' },
    { t: 'A ETEC inteira adota', tam: '2 mil alunos', q: 'A busca por nome fica lenta' },
    { t: 'A queda de luz', tam: '', q: 'Crédito debitado duas vezes' },
    { t: 'O estagiário e o loop', tam: '', q: 'A promoção “+10%” leva horas' },
    { t: 'Todas as ETECs', tam: '229 ETECs, 224 mil alunos', q: 'O servidor não aguenta o pico das 10h' },
    { t: 'Viralizou no Brasil', tam: 'Milhões de pedidos', q: 'O saldo aparece diferente em cada tela' },
    { t: 'Um servidor não guarda tudo', tam: '', q: 'Como dividir os dados?' },
  ];
  document.querySelectorAll('.trilha').forEach(tr => {
    const cap = tr.dataset.cap != null ? Number(tr.dataset.cap) : -1;
    const completa = tr.classList.contains('completa');
    CAPS.forEach((c, i) => {
      const d = document.createElement('div');
      d.className = 'cap' + (i < cap ? ' passado' : i === cap ? ' atual' : '') + (completa ? ' frag' : '');
      d.innerHTML = `<span class="bola">${i}</span><span class="nome">${c.t}</span>` +
        (completa ? `<span>${c.tam}</span><span class="quebra">${c.q}</span>` : (i === cap && c.tam ? `<span>${c.tam}</span>` : ''));
      tr.appendChild(d);
    });
  });

  /* ---------- ilustração da tia ---------- */
  Deck.tia = function (opts = {}) {
    const avental = opts.avental || '#2048C2';
    const largura = opts.largura || 160;
    const capa = opts.capa ? `<path d="M40 112 L10 210 L70 196 L80 120 Z" fill="#D63F48"/><path d="M120 112 L150 210 L90 196 L80 120 Z" fill="#B3333B"/>` : '';
    const linhas = opts.rapida ? `<g stroke="#2048C2" stroke-width="5" stroke-linecap="round" opacity=".6"><path d="M2 140h26"/><path d="M-6 162h30"/><path d="M4 184h22"/></g>` : '';
    return `<svg class="tia-svg" viewBox="0 0 160 230" width="${largura}" aria-hidden="true">
      ${capa}${linhas}
      <ellipse cx="80" cy="222" rx="54" ry="7" fill="rgba(21,33,60,.15)"/>
      <path d="M36 220 Q34 140 80 118 Q126 140 124 220 Z" fill="#F2F4F8" stroke="#15213C" stroke-width="3"/>
      <path d="M52 220 L56 146 Q80 138 104 146 L108 220 Z" fill="${avental}"/>
      <rect x="62" y="166" width="36" height="22" rx="4" fill="rgba(255,255,255,.25)"/>
      <circle cx="80" cy="78" r="38" fill="#E9B48A" stroke="#15213C" stroke-width="3"/>
      <path d="M42 74 Q44 34 80 34 Q116 34 118 74 Q110 52 80 52 Q50 52 42 74 Z" fill="#5A3A2A"/>
      <path d="M44 62 Q80 22 116 62 Q112 40 80 36 Q48 40 44 62 Z" fill="#fff" opacity=".9"/>
      <g fill="#C9D2E6"><circle cx="58" cy="46" r="2"/><circle cx="70" cy="40" r="2"/><circle cx="84" cy="39" r="2"/><circle cx="98" cy="43" r="2"/></g>
      <circle cx="67" cy="80" r="4" fill="#15213C"/><circle cx="93" cy="80" r="4" fill="#15213C"/>
      <path d="M68 96 Q80 106 92 96" fill="none" stroke="#15213C" stroke-width="3" stroke-linecap="round"/>
      <circle cx="58" cy="92" r="6" fill="#F08A7A" opacity=".5"/><circle cx="102" cy="92" r="6" fill="#F08A7A" opacity=".5"/>
    </svg>`;
  };
  document.querySelectorAll('[data-tia]').forEach(el => {
    el.innerHTML = Deck.tia(JSON.parse(el.dataset.tia || '{}'));
  });

  /* ---------- início ---------- */
  carregarNomes();
  document.addEventListener('DOMContentLoaded', () => {
    aplicarNomes();
    const n = parseInt((location.hash || '').slice(1), 10);
    ir(Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), slides.length - 1) : 0);
  });
})();
