/* Demos dos blocos 6, 7 e 8: mapa do Brasil, votação, fila da cantina, CAP, Mercado Pago,
   chave primária, Receita Federal, módulo e anel de hash. */

/* Alunos de ensino técnico de nível médio, 2024 (Anuário Brasileiro da Educação Básica 2025 / Censo Escolar 2024).
   [nome, região, alunos, % do ensino médio, coluna, linha] — a grade é um mapa estilizado, não geográfico. */
const UFS = {
  RR: ['Roraima', 'N', 2850, 10.2, 1, 0], AP: ['Amapá', 'N', 1957, 5.9, 3, 0],
  AM: ['Amazonas', 'N', 17371, 9.0, 1, 1], PA: ['Pará', 'N', 26954, 7.7, 3, 1], MA: ['Maranhão', 'NE', 50779, 17.4, 4, 1], CE: ['Ceará', 'NE', 75780, 20.8, 5, 1], RN: ['Rio Grande do Norte', 'NE', 29590, 23.2, 6, 1],
  AC: ['Acre', 'N', 6611, 16.5, 0, 2], RO: ['Rondônia', 'N', 6855, 9.4, 1, 2], MT: ['Mato Grosso', 'CO', 14199, 10.1, 2, 2], TO: ['Tocantins', 'N', 6171, 8.8, 3, 2], PI: ['Piauí', 'NE', 62768, 48.3, 4, 2], PE: ['Pernambuco', 'NE', 39969, 11.8, 5, 2], PB: ['Paraíba', 'NE', 44602, 30.6, 6, 2],
  MS: ['Mato Grosso do Sul', 'CO', 7888, 7.5, 2, 3], GO: ['Goiás', 'CO', 19570, 8.1, 3, 3], DF: ['Distrito Federal', 'CO', 9388, 9.0, 4, 3], BA: ['Bahia', 'NE', 101956, 20.0, 5, 3], AL: ['Alagoas', 'NE', 14010, 11.0, 6, 3],
  SP: ['São Paulo', 'SE', 273229, 14.7, 2, 4], MG: ['Minas Gerais', 'SE', 128413, 17.4, 3, 4], ES: ['Espírito Santo', 'SE', 46555, 36.4, 4, 4], SE: ['Sergipe', 'NE', 7532, 8.8, 6, 4],
  PR: ['Paraná', 'S', 109040, 26.1, 2, 5], RJ: ['Rio de Janeiro', 'SE', 88931, 16.1, 3, 5],
  SC: ['Santa Catarina', 'S', 39978, 14.7, 2, 6],
  RS: ['Rio Grande do Sul', 'S', 104214, 31.5, 2, 7],
};
const REGIOES = {
  N: { nome: 'Norte', total: 68769, pct: 8.7, cor: '#138257' },
  NE: { nome: 'Nordeste', total: 426986, pct: 20.1, cor: '#E0761B' },
  SE: { nome: 'Sudeste', total: 537128, pct: 16.4, cor: '#2048C2' },
  S: { nome: 'Sul', total: 253232, pct: 24.8, cor: '#7637C4' },
  CO: { nome: 'Centro-Oeste', total: 51045, pct: 8.6, cor: '#C2307F' },
};
const MAX_UF = 273229;

function corCalor(v) {
  const t = Math.sqrt(v / MAX_UF);
  const a = [232, 238, 251], b = [20, 47, 134];
  const c = a.map((x, i) => Math.round(x + (b[i] - x) * t));
  return { fundo: `rgb(${c.join(',')})`, texto: t > .45 ? '#fff' : '#15213C' };
}

function montarGradeUF(alvo, { tile = 74, gap = 6, aoPassar } = {}) {
  alvo.style.setProperty('--tile', tile + 'px');
  alvo.style.setProperty('--gap', gap + 'px');
  const tiles = {};
  Object.entries(UFS).forEach(([uf, d]) => {
    const t = h('div', { class: 'uf', 'data-uf': uf, style: { gridColumn: d[4] + 1, gridRow: d[5] + 1 } },
      h('b', {}, uf), h('span', { class: 'v' }, ''));
    if (aoPassar) {
      t.addEventListener('mouseenter', () => aoPassar(uf, t));
      t.addEventListener('mouseleave', () => aoPassar(null, t));
    }
    alvo.append(t);
    tiles[uf] = t;
  });
  return tiles;
}
const milhar = v => (v >= 1000 ? `${fmt(v / 1000, v < 10000 ? 1 : 0)} mil` : fmt(v));

/* ===================== Mapa do Brasil ===================== */
Deck.registrar('mapa', el => {
  const grade = $('.mapa-grade', el);
  const dica = $('.mapa-dica', el);
  const paineis = $$('.mapa-painel', el);
  const pontos = $('.mapa-etecs', el);
  const contador = $('.mapa-pedidos', el);
  const servidor = $('.mapa-servidor', el);
  const legenda = $('.mapa-legenda', el);
  const g = geracao();
  let passo = 0;
  let cancelaCont = () => {};

  const tiles = montarGradeUF(grade, {
    tile: 80,
    aoPassar(uf) {
      if (!uf) { dica.classList.remove('vis'); return; }
      const d = UFS[uf];
      dica.innerHTML = `<b>${d[0]}</b><br>${fmt(d[2])} alunos técnicos<br>${fmt(d[3], 1)}% do ensino médio`;
      dica.classList.add('vis');
    },
  });
  for (let i = 0; i < 229; i++) pontos.append(h('i', { style: { animationDelay: `${(i * 37) % 1500}ms` } }));
  legenda.innerHTML = Object.values(REGIOES).map(r => `<div><i style="background:${r.cor}"></i><span>${r.nome}</span><b>${fmt(r.total)}</b><small>${fmt(r.pct, 1)}%</small></div>`).join('');

  function render(p) {
    g.cancela(); cancelaCont();
    passo = p;
    paineis.forEach(pn => pn.classList.toggle('on', Number(pn.dataset.p) === p));
    el.dataset.passo = p;
    Object.entries(tiles).forEach(([uf, t]) => {
      const d = UFS[uf];
      const v = $('.v', t);
      if (p === 0) {
        const sp = uf === 'SP';
        t.style.background = sp ? 'var(--caneta)' : '';
        t.style.color = sp ? '#fff' : '';
        t.classList.toggle('apagado', !sp);
        v.textContent = sp ? '229 ETECs' : '';
      } else if (p === 2) {
        t.classList.remove('apagado');
        t.style.background = REGIOES[d[1]].cor; t.style.color = '#fff';
        v.textContent = milhar(d[2]);
      } else {
        t.classList.remove('apagado');
        const c = corCalor(d[2]);
        t.style.background = c.fundo; t.style.color = c.texto;
        v.textContent = milhar(d[2]);
      }
      t.classList.toggle('quente', p === 3 && uf === 'SP');
    });
    if (p === 3) {
      servidor.classList.remove('frito');
      cancelaCont = interpola(0, 90000, 5000, (t, x) => {
        contador.textContent = fmt(Math.round(x));
        servidor.style.setProperty('--calor', t);
      }, () => servidor.classList.add('frito'));
    } else { contador.textContent = '0'; servidor.style.setProperty('--calor', 0); servidor.classList.remove('frito'); }
  }
  $$('.mapa-ir', el).forEach(b => b.addEventListener('click', () => render(Number(b.dataset.p))));
  render(0);
  return {
    enter(deTras) { render(deTras ? 3 : 0); },
    leave() { cancelaCont(); },
    next() { if (passo < 3) { render(passo + 1); return true; } return false; },
    prev() { if (passo > 0) { render(passo - 1); return true; } return false; },
  };
});

/* ===================== Votação da turma ===================== */
Deck.registrar('votacao', el => {
  const botoes = $$('.voto-btn', el);
  const zerar = () => botoes.forEach(b => { $('b', b).textContent = '0'; });
  botoes.forEach(b => b.addEventListener('click', () => {
    const c = $('b', b); c.textContent = Number(c.textContent) + 1;
    b.classList.remove('pulso'); void b.offsetWidth; b.classList.add('pulso');
  }));
  $('.voto-zerar', el).addEventListener('click', zerar);
  return {};
});

/* ===================== A fila da cantina às 10h ===================== */
Deck.registrar('fila', el => {
  const filaEl = $('.fila-pessoas', el);
  const vFila = $('.fila-n', el), vDem = $('.fila-dem', el), vCap = $('.fila-cap', el);
  const balcao = $('.fila-balcao', el);
  const consulta = $('.fila-consulta', el);
  const cardapio = $('.fila-cardapio', el);
  const turboBarra = $('.fila-turbo i', el);
  const turboTxt = $('.fila-turbo-txt', el);
  const msg = $('.fila-msg', el);
  const TURBO = [40, 55, 65, 70];
  const DEM = { cardapio: 40, saldo: 30, compra: 50 };
  let st, timer = null, ultimaChave = '';

  function estadoInicial() { return { caixas: 1, turbo: 0, cache: false, replicas: 0, fila: 30 }; }
  function carga() {
    const card = st.cache ? 0 : DEM.cardapio;
    const saldo = Math.max(0, DEM.saldo - st.replicas * 40);
    return { card, saldo, compra: DEM.compra, total: card + saldo + DEM.compra };
  }
  function capacidade() { return TURBO[st.turbo] + (st.caixas - 1) * 40; }
  function desenhar() {
    const c = carga();
    const cap = capacidade();
    vDem.textContent = c.total;
    vCap.textContent = cap;
    vFila.textContent = Math.round(st.fila);
    vFila.parentElement.classList.toggle('ruim', c.total > cap);
    const n = Math.min(70, Math.round(st.fila));
    const tipos = [];
    const tot = c.total || 1;
    for (let i = 0; i < n; i++) {
      const r = (i * 0.618) % 1;
      tipos.push(r < c.card / tot ? 'card' : r < (c.card + c.saldo) / tot ? 'saldo' : 'compra');
    }
    filaEl.innerHTML = tipos.map(t => `<i class="${t}"></i>`).join('') + (st.fila > 70 ? `<span>+${Math.round(st.fila - 70)}</span>` : '');
    turboBarra.style.width = (TURBO[st.turbo] / 80 * 100) + '%';
    turboTxt.textContent = `${TURBO[st.turbo]}/min`;
    const chave = `${st.caixas}-${st.turbo}-${st.replicas}`;
    if (chave !== ultimaChave) {
      ultimaChave = chave;
      const tias = [];
      for (let i = 0; i < st.caixas; i++) tias.push(`<div class="fila-tia">${Deck.tia({ largura: 96, avental: i === 0 ? '#2048C2' : '#138257', capa: i === 0 && st.turbo > 0, rapida: i === 0 && st.turbo > 0 })}<small>caixa ${i + 1}</small></div>`);
      balcao.innerHTML = tias.join('');
      consulta.innerHTML = Array.from({ length: st.replicas }, (_, i) => `<div class="fila-rep">balcão só de consulta ${i + 1}</div>`).join('');
    }
    cardapio.classList.toggle('vis', st.cache);
  }
  function tique() {
    const d = carga().total - capacidade();
    st.fila = Math.max(0, Math.min(400, st.fila + d / 4));
    desenhar();
  }
  function acao(a) {
    if (a === 'turbo') {
      if (st.turbo < TURBO.length - 1) {
        st.turbo++;
        msg.innerHTML = st.turbo === TURBO.length - 1
          ? `A ${Deck.v('tia')} Turbo bateu no <b class="vermelho">teto</b>: não dá para ficar mais rápida. E cada nível custou mais caro que o anterior.`
          : `Upgrade: a ${Deck.v('tia')} ficou mais rápida (${TURBO[st.turbo]} por minuto). <b>Vertical</b>.`;
      }
    }
    if (a === 'caixa') { st.caixas = Math.min(4, st.caixas + 1); msg.innerHTML = 'Mais um caixa: <b>horizontal</b>. A fila anda, mas qual caixa sabe o saldo certo do João?'; }
    if (a === 'cache') { st.cache = true; msg.innerHTML = '<b>Cache:</b> o cardápio pendurado na parede. Ninguém mais pergunta o preço; as bolinhas amarelas somem da fila.'; }
    if (a === 'replica') { st.replicas = Math.min(2, st.replicas + 1); msg.innerHTML = '<b>Réplica de leitura:</b> um balcão só para consultar o saldo. As <b>vendas</b> continuam indo para o caixa.'; }
    if (a === 'reset') { st = estadoInicial(); msg.innerHTML = '10h00. Toca o sinal do intervalo.'; }
    desenhar();
  }
  $$('.fila-acao', el).forEach(b => b.addEventListener('click', () => acao(b.dataset.a)));
  st = estadoInicial();
  desenhar();
  return {
    enter() { st = estadoInicial(); msg.innerHTML = '10h00. Toca o sinal do intervalo.'; desenhar(); clearInterval(timer); timer = setInterval(tique, 400); },
    leave() { clearInterval(timer); },
  };
});

/* ===================== CAP: o cabo submarino ===================== */
Deck.registrar('cap', el => {
  const cena = $('.cap-cena', el);
  const sSP = $('.cap-saldo-sp', el), sVA = $('.cap-saldo-va', el);
  const msg = $('.cap-msg', el);
  const pacote = $('.cap-pacote', el);
  const btnModo = $$('.cap-modo', el);
  let st;
  const g = geracao();
  function zerar() {
    g.cancela();
    st = { sp: 100, va: 100, cabo: true, modo: 'A', pendente: false };
    desenhar();
    msg.innerHTML = 'Dois servidores com o saldo do João. Tudo que muda num lado vai pelo cabo para o outro.';
  }
  function desenhar() {
    cena.classList.toggle('cortado', !st.cabo);
    sSP.innerHTML = `R$ ${fmt(st.sp, 2)}`;
    const bloqueado = !st.cabo && st.pendente && st.modo === 'C';
    const velho = !st.cabo && st.pendente && st.modo === 'A';
    sVA.parentElement.classList.toggle('bloq', bloqueado);
    sVA.parentElement.classList.toggle('velho', velho);
    sVA.innerHTML = bloqueado ? '⛔ aguarde…' : `R$ ${fmt(st.va, 2)}`;
    btnModo.forEach(b => b.classList.toggle('sel', b.dataset.m === st.modo));
  }
  async function gastar() {
    const gg = g.nova();
    st.sp -= 30; st.pendente = true; desenhar();
    if (st.cabo) {
      pacote.classList.remove('vai'); void pacote.offsetWidth; pacote.classList.add('vai');
      await espera(1100); if (!g.viva(gg)) return;
      st.va = st.sp; st.pendente = false; desenhar();
      msg.innerHTML = 'João gastou R$ 30 em São Paulo. A mudança atravessou o cabo e os dois lados <b>concordam</b>.';
    } else {
      msg.innerHTML = st.modo === 'C'
        ? '<b>Consistência:</b> Virginia não tem certeza do saldo, então <b>recusa responder</b> até o cabo voltar.'
        : '<b>Disponibilidade:</b> Virginia responde mesmo assim, com o saldo <b class="vermelho">desatualizado</b>.';
    }
  }
  function cortar() { st.cabo = false; desenhar(); msg.innerHTML = '✂️ <b>O cabo rompeu.</b> Os servidores não se falam mais. E agora João gasta R$ 30 em São Paulo…'; }
  async function religar() {
    const gg = g.nova();
    st.cabo = true; desenhar();
    if (st.pendente) {
      pacote.classList.remove('vai'); void pacote.offsetWidth; pacote.classList.add('vai');
      await espera(1100); if (!g.viva(gg)) return;
    }
    st.va = st.sp; st.pendente = false; desenhar();
    msg.innerHTML = 'O cabo voltou e os servidores <b>se acertaram</b>. É a <b>consistência eventual</b>: discordaram por um tempo, mas ficaram iguais.';
  }
  function modo(m) {
    st.modo = m; desenhar();
    if (!st.cabo && st.pendente) msg.innerHTML = m === 'C'
      ? '<b>Consistência:</b> Virginia <b>recusa responder</b> até ter certeza. Num banco, é o certo.'
      : '<b>Disponibilidade:</b> Virginia mostra <b class="vermelho">R$ 100</b>, mas o saldo real é R$ 70. No Instagram, tudo bem; no banco, não.';
  }
  $('.cap-cortar', el).addEventListener('click', cortar);
  $('.cap-gastar', el).addEventListener('click', gastar);
  $('.cap-religar', el).addEventListener('click', religar);
  btnModo.forEach(b => b.addEventListener('click', () => modo(b.dataset.m)));
  zerar();
  let passo = 0;
  const ROTEIRO = [() => cortar(), () => gastar(), () => modo('C'), () => religar()];
  return {
    enter() { zerar(); passo = 0; },
    leave() { g.cancela(); },
    next() { if (passo < ROTEIRO.length) { ROTEIRO[passo++](); return true; } return false; },
  };
});

/* ===================== Mercado Pago: a réplica atrasada ===================== */
Deck.registrar('replica', el => {
  const sPri = $('.rep-pri b', el), sRep = $('.rep-rep b', el), sApp = $('.rep-app-saldo', el);
  const appEl = $('.rep-app', el);
  const atraso = $('.rep-atraso', el), atrasoOut = $('.rep-atraso-out', el);
  const relogio = $('.rep-relogio', el);
  const pacote = $('.rep-pacote', el);
  const msg = $('.rep-msg', el);
  const g = geracao();
  let feito = false;
  function zerar() {
    g.cancela(); feito = false;
    sPri.textContent = 'R$ 500,00'; sRep.textContent = 'R$ 500,00'; sApp.textContent = 'R$ 500,00';
    appEl.classList.remove('velho', 'certo');
    relogio.textContent = '0,0 s';
    pacote.classList.remove('vai');
    msg.innerHTML = 'A tela do app lê o saldo de uma <b>réplica de leitura</b>. As escritas vão para o <b>principal</b>.';
  }
  async function pix() {
    zerar(); const gg = g.nova(); feito = true;
    const seg = Number(atraso.value);
    sPri.textContent = 'R$ 0,00';
    appEl.classList.add('velho');
    msg.innerHTML = 'O Pix saiu: no principal o saldo já é <b>R$ 0</b>. Mas a tela continua mostrando <b class="vermelho">R$ 500</b>…';
    pacote.style.animationDuration = (Deck.reduzido ? 0.01 : seg) + 's';
    void pacote.offsetWidth; pacote.classList.add('vai');
    const t0 = performance.now();
    while (g.viva(gg)) {
      const t = (performance.now() - t0) / 1000;
      relogio.textContent = `${fmt(Math.min(t, seg), 1)} s`;
      if (t >= seg || Deck.reduzido) break;
      await new Promise(r => requestAnimationFrame(r));
    }
    if (!g.viva(gg)) return;
    sRep.textContent = 'R$ 0,00'; sApp.textContent = 'R$ 0,00';
    appEl.classList.remove('velho'); appEl.classList.add('certo');
    msg.innerHTML = `A réplica “alcançou” o principal depois de <b>${fmt(seg, 1)} s</b>. Os dados nunca estiveram errados no banco: a tela mostrou uma versão <b>velha</b>.`;
  }
  atraso.addEventListener('input', () => { atrasoOut.textContent = `${fmt(Number(atraso.value), 1)} s`; });
  atrasoOut.textContent = `${fmt(Number(atraso.value), 1)} s`;
  $('.rep-pix', el).addEventListener('click', pix);
  $('.rep-zerar', el).addEventListener('click', zerar);
  zerar();
  return {
    enter() { zerar(); },
    leave() { g.cancela(); },
    next() { if (!feito) { pix(); return true; } return false; },
  };
});

/* ===================== Chave primária na URL ===================== */
Deck.registrar('chave', el => {
  const url = $('.ch-url', el);
  const card = $('.ch-card', el);
  const msg = $('.ch-msg', el);
  const bits = $('.ch-bits', el);
  const OUTROS = [['Ana Souza', 'R$ 15,00'], ['Bruno Lima', 'R$ 0,00'], ['Carla Dias', 'R$ 32,00'], ['Diego Alves', 'R$ 8,00'], ['Eduarda Reis', 'R$ 4,50'], ['Gabi Rocha', 'R$ 9,00']];
  const g = geracao();
  let passo = 0;
  function mostra(id, nome, saldo, cls = '') {
    url.innerHTML = `cantinaapp.com/alunos/<b>${id}</b>`;
    card.className = 'ch-card ' + cls;
    card.innerHTML = cls === 'proibido'
      ? '<div class="erro403">403</div><div>Proibido: este aluno não é você.</div>'
      : `<div class="nome">${nome}</div><div>Saldo na <span data-v="cantina">${Deck.v('cantina')}</span>: <b>${saldo}</b></div><div class="peq">e-mail, telefone, turma…</div>`;
  }
  async function render(p) {
    const gg = g.nova(); passo = p;
    bits.classList.toggle('vis', p === 4);
    if (p === 0) { mostra(1000, 'Você', 'R$ 12,50'); msg.innerHTML = 'Seu perfil no CantinaApp. Repare no número na URL.'; }
    if (p === 1) {
      for (let i = 0; i < OUTROS.length; i++) {
        if (!g.viva(gg)) return;
        mostra(999 - i, OUTROS[i][0], OUTROS[i][1], 'vazou');
        if (i === 0) msg.innerHTML = 'Alguém troca 1000 por <b>999</b>… <b class="vermelho">e vê os dados de outra pessoa.</b>';
        await espera(i === 0 ? 1600 : 450);
      }
      if (g.viva(gg)) msg.innerHTML = 'Com ID sequencial, dá para <b>varrer</b> todos os alunos. Basta <b>um</b> bug de permissão.';
    }
    if (p === 2) { mostra(999, '', '', 'proibido'); msg.innerHTML = 'O certo é <b>também</b> checar a permissão no servidor e devolver <b class="verde">403</b>.'; }
    if (p === 3) {
      url.innerHTML = 'cantinaapp.com/alunos/<b>7f3c9a1e-52b4-4d0e-9a8c-1e6f2b7d04aa</b>';
      card.className = 'ch-card'; card.innerHTML = '<div class="nome">Você</div><div>Um <b>UUID</b>: 2<sup>122</sup> combinações. Impossível de adivinhar.</div>';
      msg.innerHTML = 'Prefira <b>IDs aleatórios grandes</b>. E com vários servidores, quem daria “o próximo número” de um ID sequencial?';
    }
    if (p === 4) msg.innerHTML = 'O <b>Instagram</b> monta o ID juntando horário + número do shard + sequência. Cada servidor gera IDs sozinho, sem colidir.';
  }
  render(0);
  return {
    enter() { render(0); },
    leave() { g.cancela(); },
    next() { if (passo < 4) { render(passo + 1); return true; } return false; },
    prev() { if (passo > 0) { render(passo - 1); return true; } return false; },
  };
});

/* ===================== Receita Federal: dividir por estado ===================== */
Deck.registrar('receita', el => {
  const grade = $('.rec-grade', el);
  const cod = $('.rec-codigo', el);
  const msg = $('.rec-msg', el);
  const CAP = 110000;
  const tiles = montarGradeUF(grade, { tile: 66, gap: 6 });
  Object.entries(tiles).forEach(([uf, t]) => {
    t.classList.add('servidor');
    t.prepend(h('i', { class: 'enche' }));
  });
  const CODIGOS = [
    `<span class="k">def</span> servidor(declaracao):
    <span class="k">return</span> servidores[declaracao.estado]`,
    `<span class="k">def</span> servidor(declaracao):
    <span class="k">if</span> declaracao.estado == <span class="s">'SP'</span>:
        <span class="k">if</span> declaracao.cidade == <span class="s">'São Paulo'</span>:
            <span class="k">return</span> sp_capital
        <span class="k">return</span> sp_interior
    <span class="k">return</span> servidores[declaracao.estado]`,
    `<span class="k">def</span> servidor(declaracao):
    <span class="k">if</span> declaracao.estado == <span class="s">'SP'</span>:
        <span class="k">if</span> declaracao.cidade == <span class="s">'São Paulo'</span>:
            <span class="k">if</span> declaracao.cep &lt; <span class="s">'03000'</span>:
                <span class="k">return</span> sp_capital_1
            <span class="k">return</span> sp_capital_2
        <span class="k">if</span> declaracao.regiao == <span class="s">'Campinas'</span>:
            <span class="k">return</span> sp_campinas
        <span class="k">return</span> sp_interior
    <span class="k">if</span> declaracao.estado == <span class="s">'MG'</span>:
        <span class="c"># ... e lá vamos nós de novo</span>
    <span class="k">return</span> servidores[declaracao.estado]`,
  ];
  const MSGS = [
    'Um servidor por estado. São Paulo <b class="vermelho">transborda</b> enquanto o do Acre fica quase vazio.',
    'Divide SP em capital e interior… e a capital continua cheia.',
    'O código vira um monte de <code>if</code>, e cada mudança é uma obra. Precisa de um jeito que <b>não dependa do estado</b>.',
  ];
  let passo = 0;
  function render(p) {
    passo = p;
    const partesSP = [1, 2, 4][p];
    Object.entries(tiles).forEach(([uf, t]) => {
      const carga = UFS[uf][2] / (uf === 'SP' ? partesSP : 1);
      const pct = carga / CAP;
      $('.enche', t).style.height = Math.min(100, pct * 100) + '%';
      t.classList.toggle('lotado', pct > 1);
      t.classList.toggle('ocioso', pct < .1);
      $('.v', t).textContent = uf === 'SP' && partesSP > 1 ? `${partesSP} × ${Math.round(pct * 100)}%` : `${Math.round(pct * 100)}%`;
    });
    cod.innerHTML = CODIGOS[p];
    msg.innerHTML = MSGS[p];
  }
  render(0);
  return {
    enter(deTras) { render(deTras ? 2 : 0); },
    next() { if (passo < 2) { render(passo + 1); return true; } return false; },
    prev() { if (passo > 0) { render(passo - 1); return true; } return false; },
  };
});

/* ===================== Módulo: id % 3 → id % 4 ===================== */
Deck.registrar('modulo', el => {
  const tab = $('.mod-tab', el);
  const n = $('.mod-n', el), nOut = $$('.mod-n-out', el);
  const res = $('.mod-res', el);
  const milhao = $('.mod-milhao', el);
  const IDS = 12;
  let mostrando = false;
  function render() {
    const N = Number(n.value);
    nOut.forEach(o => { o.textContent = N; });
    let mud = 0;
    const lin = (rot, f, cls = '') => `<tr class="${cls}"><th>${rot}</th>${Array.from({ length: IDS }, (_, i) => f(i + 1)).join('')}</tr>`;
    const cores = ['var(--srv-a)', 'var(--srv-b)', 'var(--srv-c)', 'var(--srv-d)', '#8C6D1F', '#0E7C86', '#9A3B3B', '#5B6680'];
    const cel = (v, muda) => `<td class="${muda ? 'muda' : ''}"><span style="--cor:${cores[v]}">${v}</span></td>`;
    let html = lin('id', i => `<td class="id">${i}</td>`);
    html += lin('id % 3', i => cel(i % 3, false));
    if (mostrando) {
      html += lin(`id % ${N}`, i => { const m = (i % N) !== (i % 3); if (m) mud++; return cel(i % N, m); }, 'nova');
    }
    tab.innerHTML = html;
    res.innerHTML = mostrando
      ? `<b class="${mud / IDS > .5 ? 'vermelho' : ''}">${mud} de ${IDS}</b> (${fmt(mud / IDS * 100, 0)}%) mudam de servidor.`
      : `Com 3 servidores, fica <b>perfeitamente balanceado</b>. Até o ${N}º servidor chegar…`;
  }
  function testarMilhao() {
    const N = Number(n.value);
    let mud = 0;
    for (let i = 1; i <= 1000000; i++) if (i % N !== i % 3) mud++;
    milhao.innerHTML = `Com <b>1 milhão</b> de IDs e <code>id % ${N}</code>: <b class="vermelho">${fmt(mud)}</b> mudam (${fmt(mud / 1e6 * 100, 1)}%).`;
    milhao.classList.add('vis');
  }
  n.addEventListener('input', () => { milhao.classList.remove('vis'); render(); });
  $('.mod-mostrar', el).addEventListener('click', () => { mostrando = true; render(); });
  $('.mod-testar', el).addEventListener('click', () => { mostrando = true; render(); testarMilhao(); });
  render();
  let passo = 0;
  return {
    enter(deTras) { if (!deTras) { mostrando = false; n.value = 4; milhao.classList.remove('vis'); passo = 0; render(); } },
    next() {
      if (passo === 0) { mostrando = true; render(); passo = 1; return true; }
      if (passo === 1) { testarMilhao(); passo = 2; return true; }
      return false;
    },
  };
});

/* ===================== Anel de hash ===================== */
Deck.registrar('anel', el => {
  const alvo = $('.anel-svg', el);
  const msg = $('.anel-msg', el);
  const vAnel = $('.anel-v-anel', el), vMod = $('.anel-v-mod', el);
  const form = $('.anel-form', el), inNome = $('.anel-nome', el);
  const CX = 330, CY = 330, R = 250;
  const SERV = { A: { ang: 0, cor: 'var(--srv-a)' }, B: { ang: 120, cor: 'var(--srv-b)' }, C: { ang: 240, cor: 'var(--srv-c)' }, D: { ang: 300, cor: 'var(--srv-d)' } };
  // João e Maria ficam nas posições do roteiro (2h e 6h); os outros nomes vêm do hash.
  const FIXOS = { 'João': 60, 'Maria': 180 };
  const BASE = ['João', 'Maria', 'Ana', 'Bruno', 'Pedro', 'Gabi', 'Diego', 'Isa', 'Rafa', 'Thiago', 'Carla', 'Heitor', 'Paula', 'Sofia', 'Vitória', 'Lucas', 'Nina', 'Caio', 'Yasmin', 'Igor'];
  let ativos, nomes, dono;

  const ang = nome => (nome in FIXOS ? FIXOS[nome] : (hash32(nome) / 4294967296) * 360);
  const ponto = (a, r = R) => { const rad = (a - 90) * Math.PI / 180; return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)]; };
  function donoDe(a, lista) {
    const ord = lista.map(s => [s, SERV[s].ang]).sort((x, y) => x[1] - y[1]);
    for (const [s, sa] of ord) if (sa >= a) return s;
    return ord[0][0];
  }
  function donoModulo(nome, lista) { return lista[hash32(nome) % lista.length]; }

  const s = svg('svg', { viewBox: '0 0 660 660', width: '100%', role: 'img', 'aria-label': 'Anel de hash com servidores e dados' });
  const gArcos = svg('g'), gHoras = svg('g'), gDados = svg('g'), gServ = svg('g');
  s.append(svg('circle', { cx: CX, cy: CY, r: R, class: 'anel-base' }), gArcos, gHoras, gDados, gServ);
  for (let hr = 1; hr <= 12; hr++) {
    const [x, y] = ponto(hr * 30, R - 104);
    gHoras.append(svg('text', { x, y: y + 8, class: 'anel-hora', 'text-anchor': 'middle', text: `${hr}h` }));
  }
  alvo.append(s);

  function arco(a0, a1, cor) {
    if (a1 <= a0) a1 += 360;
    const [x0, y0] = ponto(a0), [x1, y1] = ponto(a1);
    const grande = a1 - a0 > 180 ? 1 : 0;
    return svg('path', { d: `M ${x0} ${y0} A ${R} ${R} 0 ${grande} 1 ${x1} ${y1}`, class: 'anel-arco', style: `stroke:${cor}` });
  }
  function desenhar(movidos = new Set()) {
    gArcos.innerHTML = ''; gServ.innerHTML = '';
    const ord = ativos.map(x => [x, SERV[x].ang]).sort((a, b) => a[1] - b[1]);
    ord.forEach(([sv, a], i) => {
      const ant = ord[(i - 1 + ord.length) % ord.length][1];
      gArcos.append(arco(ord.length === 1 ? a + .01 : ant, a, SERV[sv].cor));
    });
    ord.forEach(([sv, a]) => {
      const [x, y] = ponto(a);
      gServ.append(svg('g', { class: 'anel-serv', transform: `translate(${x},${y})` },
        svg('rect', { x: -30, y: -30, width: 60, height: 60, rx: 12, style: `fill:${SERV[sv].cor}` }),
        svg('text', { x: 0, y: 12, 'text-anchor': 'middle', text: sv })));
    });
    gDados.innerHTML = '';
    // rótulos escalonados: nomes que caem perto alternam entre fora e dentro do anel
    const ordem = [...nomes].sort((x, y) => ang(x) - ang(y));
    const nivel = {};
    ordem.forEach((nm, i) => {
      const ant = ordem[i - 1];
      nivel[nm] = ant && ang(nm) - ang(ant) < 10 ? (nivel[ant] + 1) % 4 : 0;
    });
    const RAIOS = [R + 40, R - 36, R + 66, R - 62];
    ordem.forEach(nm => {
      const a = ang(nm);
      const [x, y] = ponto(a, R + 2);
      const n = nivel[nm];
      const [lx, ly] = ponto(a, RAIOS[n]);
      const dentro = n % 2 === 1;
      const lado = a > 10 && a < 170 ? 'start' : a > 190 && a < 350 ? 'end' : 'middle';
      const ancora = lado === 'middle' ? 'middle' : dentro ? (lado === 'start' ? 'end' : 'start') : lado;
      const d = dono[nm];
      const g = svg('g', { class: 'anel-dado' + (movidos.has(nm) ? ' moveu' : '') });
      g.append(svg('circle', { cx: x, cy: y, r: 11, style: `fill:${SERV[d].cor}` }));
      g.append(svg('text', { x: lx, y: ly + 7, 'text-anchor': ancora, class: 'anel-rot', text: nm }));
      gDados.append(g);
    });
  }
  function recalcular() {
    const novo = {};
    nomes.forEach(nm => { novo[nm] = donoDe(ang(nm), ativos); });
    return novo;
  }
  function mudar(novaLista, texto) {
    const antes = ativos;
    ativos = novaLista;
    const novo = recalcular();
    const movidos = new Set(nomes.filter(nm => novo[nm] !== dono[nm]));
    const movMod = nomes.filter(nm => donoModulo(nm, antes) !== donoModulo(nm, ativos)).length;
    dono = novo;
    desenhar(movidos);
    vAnel.textContent = `${movidos.size} de ${nomes.length}`;
    vMod.textContent = `${movMod} de ${nomes.length}`;
    msg.innerHTML = texto;
  }
  function zerar() {
    ativos = ['A', 'B', 'C'];
    nomes = [...BASE];
    dono = recalcular();
    desenhar();
    vAnel.textContent = '–'; vMod.textContent = '–';
    msg.innerHTML = 'Cada nome cai num ponto do relógio e vai para o <b>primeiro servidor no sentido horário</b>. O João (2h) vai para o B; a Maria (6h), para o C.';
  }
  function addD() {
    if (ativos.includes('D')) return;
    mudar([...ativos, 'D'], 'Entrou o <b style="color:var(--srv-d)">servidor D</b> às 10h. Só os dados entre 8h e 10h, que iam para o A, mudam. <b>B e C não mexem em nada.</b>');
  }
  function tirarA() {
    if (!ativos.includes('A') || ativos.length < 2) return;
    mudar(ativos.filter(x => x !== 'A'), 'Saiu o <b style="color:var(--srv-a)">servidor A</b>. Os dados dele vão para o próximo no sentido horário, e ninguém mais se mexe.');
  }
  $('.anel-d', el).addEventListener('click', addD);
  $('.anel-a', el).addEventListener('click', tirarA);
  $('.anel-reset', el).addEventListener('click', zerar);
  form.addEventListener('submit', e => {
    e.preventDefault();
    let nm = inNome.value.trim();
    if (!nm) return;
    nm = nm[0].toUpperCase() + nm.slice(1);
    inNome.value = '';
    if (nomes.includes(nm)) return;
    nomes.push(nm);
    dono[nm] = donoDe(ang(nm), ativos);
    desenhar(new Set([nm]));
    const horas = ang(nm) / 30;
    let hh = Math.floor(horas), mm = Math.round((horas - hh) * 60);
    if (mm === 60) { hh++; mm = 0; }
    msg.innerHTML = `<b>${nm}</b> caiu às ${hh || 12}h${String(mm).padStart(2, '0')} e foi para o servidor <b style="color:${SERV[dono[nm]].cor}">${dono[nm]}</b>.`;
  });
  zerar();
  let passo = 0;
  return {
    enter() { zerar(); passo = 0; },
    next() {
      if (passo === 0) { addD(); passo = 1; return true; }
      if (passo === 1) { tirarA(); passo = 2; return true; }
      return false;
    },
  };
});
