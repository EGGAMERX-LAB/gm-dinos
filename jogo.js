/* GM – Gabriel e Matheus na Terra dos Dinos · EG Gamer X
   Jogo para 2 e 3 anos: nunca perde, sem tempo, sem texto, 100% offline.
   v0.4: 5 mundos (floresta, cidade, praia, neve, vulcão) com 8 fases cada, 5 dinos e 5 carros para escolher. */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const sorteio = n => Math.floor(Math.random() * n);
const embaralha = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = sorteio(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const JOG = { gabriel: { nome: 'Gabriel', cor: '#1e88ff', letra: 'G' }, matheus: { nome: 'Matheus', cor: '#ff7a00', letra: 'M' } };
const CORES = ['#e53935', '#ffd600', '#43a047', '#1e88ff', '#ff7a00', '#ec407a', '#8e24aa', '#ffffff'];
const DINOS = ['🦕', '🦖', '🐊', '🐢', '🦎', '🦣', '🐉', '🦤', '🐸', '🦜'];
const COMIDAS = ['🍎', '🍌', '🍉', '🍇', '🥕', '🍓', '🥦', '🍐'];
const DCOR = ['#66bb6a', '#42a5f5', '#ffa726', '#ab47bc', '#ef5350', '#26c6da'];

/* Os 5 dinos e os 5 carros que a criança escolhe */
const TIPOS = [
  { nome: 'Rex', cor: '#ef6c00', bar: '#ffe0b2', esp: '#5d4037' },
  { nome: 'Pescoçudo', cor: '#66bb6a', bar: '#dcedc8', esp: '#2e7d32' },
  { nome: 'Tricerátops', cor: '#42a5f5', bar: '#e3f2fd', esp: '#ffb74d' },
  { nome: 'Estego', cor: '#ab47bc', bar: '#f3e5f5', esp: '#ff7043' },
  { nome: 'Anquilo', cor: '#fbc02d', bar: '#fff8e1', esp: '#8d6e63' }
];
const MODELOS = ['Carrinho', 'Jipe', 'Carro de corrida', 'Caminhão de bombeiro', 'Carro gigante'];
const RODAS = [[[-.28, .11], [.28, .11]], [[-.3, .14], [.3, .14]], [[-.32, .1], [.3, .1]], [[-.32, .11], [-.08, .11], [.3, .11]], [[-.3, .2], [.3, .2]]];

/* Os 5 mundos, cada um com 8 fases (jogo + figurinha) */
const MUNDOS = [
  { id: 'floresta', nome: 'Floresta', ic: '🌳', cor: '#43a047', fases: ['chocar', 'comida', 'esconde', 'cesta', 'pegadas', 'pulapula', 'ponte', 'boanoite'], figs: ['🦕', '🍄', '🦋', '🐿️', '🦉', '🐞', '🦔', '🌙'] },
  { id: 'cidade', nome: 'Cidade', ic: '🏙️', cor: '#546e7a', fases: ['pintar', 'estrada', 'semaforo', 'estacionar', 'posto', 'lava', 'corrida', 'fogos'], figs: ['🚗', '🚕', '🚦', '🚌', '⛽', '🚒', '🏁', '🎆'] },
  { id: 'praia', nome: 'Praia', ic: '🏖️', cor: '#039be5', fases: ['bolhas', 'baloes', 'banho', 'rodas', 'estrada', 'danca', 'encaixe', 'comida'], figs: ['🦀', '🐠', '🐚', '🐬', '🌴', '🐙', '🐢', '⛱️'] },
  { id: 'neve', nome: 'Neve', ic: '❄️', cor: '#5c9ce6', fases: ['estrada', 'esconde', 'pulapula', 'corrida', 'chocar', 'cesta', 'ponte', 'boanoite'], figs: ['⛄', '🐧', '❄️', '🦌', '🦊', '🧤', '🛷', '🏔️'] },
  { id: 'vulcao', nome: 'Vulcão', ic: '🌋', cor: '#e64a19', fases: ['corrida', 'pegadas', 'chocar', 'encaixe', 'estacionar', 'rodas', 'danca', 'fogos'], figs: ['🌋', '🦖', '🔥', '💎', '🦎', '🐉', '⭐', '🏆'] }
];
const FASES = MUNDOS.flatMap((m, mi) => m.fases.map((mec, j) => ({ id: m.id + '-' + j + '-' + mec, mundo: mi, j, amb: m.id, mec, fig: m.figs[j] })));

/* Cenários */
const AMB = {
  floresta: { ceu: ['#6ec6ff', '#d4f1ff'], chao: '#4caf50', deco: ['🌲', '🌳', '🍄', '🌲', '🌳'], agua: '#4fc3f7', itens: ['🥚', '⭐', '🍎'] },
  cidade: { ceu: ['#90caf9', '#e3f2fd'], chao: '#9e9e9e', deco: ['🏢', '🌳', '🏬', '🚦', '🏠'], agua: '#4fc3f7', itens: ['⭐', '🎁', '🍩'] },
  praia: { ceu: ['#4fc3f7', '#e1f5fe'], chao: '#ffe082', deco: ['🌴', '⛱️', '🦀', '🌴', '🐚'], agua: '#29b6f6', itens: ['🐚', '⭐', '🍉'] },
  neve: { ceu: ['#b3e5fc', '#f5fbff'], chao: '#f1f8fc', deco: ['🌲', '⛄', '🌲', '🏔️', '🌲'], agua: '#b3e5fc', itens: ['❄️', '⭐', '🧁'] },
  vulcao: { ceu: ['#ff8a65', '#ffe0b2'], chao: '#795548', deco: ['🌋', '🌵', '🦴', '🌋', '🌵'], agua: '#ff7043', itens: ['🥚', '💎', '⭐'] }
};

/* ---------- Dados salvos (cada criança tem o seu) ---------- */
const ler = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
const gravarEm = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
let cfg = Object.assign({ som: true, musica: true, tudo: false }, ler('gm_cfg'));
let jog = 'gabriel', save = null;
function carregar(j) {
  jog = j;
  save = Object.assign({ e: {}, cor: JOG[j].cor, roupa: 0, modelo: 0, dino: j === 'matheus' ? 0 : 2, dcor: null }, ler('gm_save_' + j));
  delete save.estrelas;                       // estrelas da v0.3 eram de outras fases
  if (!save.e || typeof save.e !== 'object') save.e = {};
}
const gravar = () => gravarEm('gm_save_' + jog, save);
const est = i => save.e[FASES[i].id] || 0;
const feitasNoMundo = m => FASES.filter((f, i) => f.mundo === m && est(i) > 0).length;
const mundoLivre = m => cfg.tudo || m === 0 || feitasNoMundo(m - 1) >= 4;
const faseLivre = i => cfg.tudo || (mundoLivre(FASES[i].mundo) && FASES[i].j <= feitasNoMundo(FASES[i].mundo));

/* ---------- Sons (feitos na hora, sem arquivos) ---------- */
let AC = null;
function ac() {
  if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function nota(f, d, tipo = 'sine', v = .2, t0 = 0, f2) {
  const a = ac(), o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
  o.type = tipo; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02);
}
function ruido(d, v = .2, freq = 900) {
  const a = ac(), b = a.createBuffer(1, a.sampleRate * d, a.sampleRate), ch = b.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = b; f.type = 'lowpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(v, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + d);
  s.connect(f).connect(g).connect(a.destination); s.start();
}
const S = f => (...a) => { if (cfg.som) try { f(...a); } catch (e) {} };
const BUZ = [[440, 349], [392, 311], [660, 523], [262, 208], [220, 175]];   // cada carro tem a sua buzina
const som = {
  pop: S(() => nota(500, .12, 'sine', .25, 0, 1100)),
  ding: S(() => { nota(880, .15, 'triangle', .18); nota(1320, .25, 'triangle', .18, .09); }),
  buzina: S((m = save ? save.modelo : 0) => { const [a, b] = BUZ[m] || BUZ[0]; for (const t of [0, .26]) { nota(a, .2, 'square', .1, t); nota(b, .2, 'square', .1, t); } }),
  rugido: S(() => { nota(170, .9, 'sawtooth', .22, 0, 55); nota(110, .9, 'square', .1, 0, 40); ruido(.9, .25, 500); }),
  rugidinho: S(() => { nota(420, .35, 'sawtooth', .14, 0, 200); ruido(.3, .08, 1200); }),
  festa: S(() => [523, 659, 784, 1047, 1319].forEach((f, i) => nota(f, .25, 'triangle', .18, i * .11))),
  splash: S(() => { ruido(.3, .25, 1800); nota(300, .2, 'sine', .15, 0, 120); }),
  crack: S(() => { ruido(.08, .3, 3000); nota(900, .06, 'square', .08); }),
  motor: S(() => nota(90, .15, 'sawtooth', .16, 0, 160)),
  pulo: S(() => nota(300, .3, 'sine', .2, 0, 800)),
  fogo: S(() => { ruido(.5, .25, 1500); nota(1200, .4, 'sine', .1, 0, 300); }),
  nham: S(() => { nota(260, .07, 'square', .1); nota(200, .07, 'square', .1, .11); nota(160, .09, 'square', .08, .22); }),
  ninar: S(() => [784, 659, 523, 659, 587, 494, 523].forEach((f, i) => nota(f, .5, 'sine', .1, i * .35))),
  glub: S(() => nota(300, .1, 'sine', .12, 0, 520))
};
function falar(t) {
  if (!cfg.som) return;
  if (window.Android && Android.falar) { Android.falar(t); return; }   // no APK usa a voz do aparelho
  if (!window.speechSynthesis) return;
  try { const u = new SpeechSynthesisUtterance(t); u.lang = 'pt-BR'; u.pitch = 1.4; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
}
const MELODIA = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 880, 784, 659, 587];
let mi = 0;
setInterval(() => {
  if (!cfg.musica || !AC || AC.state !== 'running' || document.hidden || tela === 'pais') return;
  try { nota(MELODIA[mi % 16], .25, 'triangle', .04); if (mi % 4 === 0) nota(MELODIA[mi % 16] / 4, .5, 'sine', .07); } catch (e) {}
  mi++;
}, 300);

/* ---------- Desenho ---------- */
const cv = $('#cv');
let c = cv.getContext('2d'), W = 1, H = 1, U = 1, relogio = 0;
function ajustar() {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  W = document.body.clientWidth; H = document.body.clientHeight; U = Math.min(W, H) / 100;
  cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0);
}
addEventListener('resize', ajustar); ajustar();
/* Desenha num outro canvas (menu, garagem, dinos) usando as mesmas funções */
function comCanvas(cnv, fn) {
  const r = cnv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  if (!r.width || !r.height) return;
  if (cnv.width !== Math.round(r.width * d) || cnv.height !== Math.round(r.height * d)) { cnv.width = Math.round(r.width * d); cnv.height = Math.round(r.height * d); }
  const antes = [c, W, H, U];
  c = cnv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); W = r.width; H = r.height; U = Math.min(W, H) / 100;
  try { fn(); } finally { [c, W, H, U] = antes; }
}

function circ(x, y, r, cor) { c.fillStyle = cor; c.beginPath(); c.arc(x, y, Math.max(0, r), 0, 7); c.fill(); }
function elip(x, y, rx, ry, cor, rot = 0) { c.fillStyle = cor; c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, 7); c.fill(); }
function rrp(x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function rr(x, y, w, h, r, cor) {
  rrp(x, y, w, h, r); c.fillStyle = cor; c.fill();
  c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = Math.max(1, Math.min(w, h) * .03); c.stroke();
}
function em(ch, x, y, s, rot = 0, alfa = 1, vira = false) {
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (vira) c.scale(-1, 1);
  c.globalAlpha = alfa; c.fillStyle = '#000'; c.font = s + 'px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(ch, 0, 0); c.restore();
}
const amb = () => AMB[(fs && fs.amb) || 'floresta'];
function fundo(noite, a = amb()) {
  const g = c.createLinearGradient(0, 0, 0, H);
  if (noite) { g.addColorStop(0, '#0b1040'); g.addColorStop(1, '#3a2a7a'); }
  else { g.addColorStop(0, a.ceu[0]); g.addColorStop(1, a.ceu[1]); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (!noite) {
    circ(W * .84, H * .13, 8 * U, a === AMB.vulcao ? '#ffcc80' : '#ffe14d');
    const n = x => ((x + relogio * 3 * U) % (W * 1.4)) - W * .2;
    em('☁️', n(W * .2), H * .14, 14 * U); em('☁️', n(W * .9), H * .24, 9 * U);
  }
}
function chao(y, cor = amb().chao) {
  c.fillStyle = cor; c.fillRect(0, y, W, H - y);
  c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(0, y, W, 1.2 * U);
}
/* Céu + paisagem do mundo + chão a partir da altura y */
function cenario(y, a = amb()) {
  fundo(false, a);
  if (a === AMB.cidade) {
    for (let k = 0; k < 7; k++) {
      const x = k * W / 6 - W * .06, w = W * .14, h = (16 + (k * 37 % 5) * 6) * U;
      rr(x, y - h, w, h, U, ['#78909c', '#90a4ae', '#b0bec5'][k % 3]);
      c.fillStyle = 'rgba(255,241,118,.8)';
      for (let r = 0; r < h / (6 * U) - 1; r++) for (let q = 0; q < 2; q++) c.fillRect(x + w * (.2 + q * .4), y - h + (2 + r * 6) * U, w * .2, 2.5 * U);
    }
  } else if (a === AMB.praia) {
    c.fillStyle = a.agua; c.fillRect(0, y - 8 * U, W, 8 * U);
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .6 * U;
    for (let k = 0; k < 6; k++) { const x = ((k * W * .22 + relogio * 6 * U) % (W * 1.3)) - W * .1; c.beginPath(); c.arc(x, y - 3 * U, 3 * U, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    em('🌴', W * .07, y - 5 * U, 16 * U); em('⛱️', W * .92, y + U, 11 * U);
  } else {
    for (let k = 0; k < 5; k++) em(a.deco[k], W * (.08 + k * .21), y - 6 * U + (k % 2) * 1.5 * U, (k % 2 ? 12 : 17) * U);
  }
  chao(y, a.chao);
  if (a === AMB.neve) for (let i = 0; i < 30; i++) {
    const x = ((i * .37) % 1) * W + Math.sin(relogio + i) * 2 * U, yy = (((i * .61) + relogio * .04 * (1 + i % 3)) % 1) * H;
    circ(x, yy, (.4 + (i % 3) * .2) * U, '#fff');
  }
}
function piloto(x, y, r) {
  const rp = save.roupa;
  circ(x, y, r, '#ffd2a6');
  c.fillStyle = '#222'; c.beginPath(); c.arc(x - r * .35, y + r * .05, r * .12, 0, 7); c.arc(x + r * .35, y + r * .05, r * .12, 0, 7); c.fill();
  c.strokeStyle = '#222'; c.lineWidth = r * .12; c.beginPath(); c.arc(x, y + r * .25, r * .38, .3, Math.PI - .3); c.stroke();
  c.fillStyle = rp === 2 ? '#43a047' : JOG[jog].cor;
  c.beginPath(); c.arc(x, y - r * .15, r * 1.05, Math.PI, 0); c.fill();
  if (rp === 0) { rrp(x - r * .2, y - r * .32, r * 1.6, r * .26, r * .12); c.fill(); }             // Fofinho: boné
  if (rp === 1) { c.fillStyle = 'rgba(190,235,255,.6)'; rrp(x - r * .85, y - r * .25, r * 1.7, r * .5, r * .2); c.fill(); } // Piloto: capacete
  if (rp === 2) for (let i = -1; i <= 1; i++) {                                                   // Dino: espinhos
    c.beginPath(); c.moveTo(x + i * r * .6 - r * .25, y - r * 1.05); c.lineTo(x + i * r * .6, y - r * 1.6); c.lineTo(x + i * r * .6 + r * .25, y - r * 1.05); c.fill();
  }
}
function roda(x, y, r, giro) {
  circ(x, y, r, '#263238'); circ(x, y, r * .5, '#cfd8dc');
  c.strokeStyle = '#78909c'; c.lineWidth = r * .14; c.beginPath();
  c.moveTo(x - Math.cos(giro) * r * .5, y - Math.sin(giro) * r * .5); c.lineTo(x + Math.cos(giro) * r * .5, y + Math.sin(giro) * r * .5); c.stroke();
}
/* Carro de lado: x = centro, y = chão, L = comprimento. o.mod = modelo, o.semRodas para a oficina */
function carro(x, y, L, cor, giro = 0, o = {}) {
  const mod = o.mod != null ? o.mod : save.modelo, vidro = '#c8ecff';
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(x, y, L * .5, L * .05, 0, 0, 7); c.fill();
  if (mod === 1) {                                                         // Jipe
    const h = L * .3, by = y - L * .16 - h;
    roda(x - L * .53, by + h * .45, L * .12, giro);
    rr(x - L * .32, by - L * .26, L * .5, L * .28, L * .04, cor);
    rr(x - L * .27, by - L * .21, L * .2, L * .18, L * .03, vidro); rr(x - L * .03, by - L * .21, L * .17, L * .18, L * .03, vidro);
    piloto(x + L * .055, by - L * .1, L * .07);
    c.fillStyle = '#424242'; c.fillRect(x - L * .3, by - L * .31, L * .46, L * .025);
    rr(x - L * .48, by, L * .96, h, L * .05, cor);
    rr(x + L * .4, by + h * .55, L * .12, L * .08, L * .02, '#424242');
    rr(x + L * .4, by + h * .15, L * .07, L * .07, L * .02, '#fff59d');
  } else if (mod === 2) {                                                  // Corrida
    const h = L * .16, by = y - L * .12 - h;
    elip(x - L * .05, by, L * .17, L * .13, vidro);
    piloto(x - L * .05, by - L * .02, L * .07);
    c.fillStyle = '#263238'; c.fillRect(x - L * .47, by - L * .12, L * .03, L * .12);
    rr(x - L * .56, by - L * .16, L * .22, L * .05, L * .02, '#263238');
    c.beginPath(); c.moveTo(x - L * .5, by + h); c.lineTo(x - L * .5, by); c.lineTo(x - L * .1, by - L * .02);
    c.quadraticCurveTo(x + L * .3, by, x + L * .53, by + h * .6); c.lineTo(x + L * .53, by + h); c.closePath();
    c.fillStyle = cor; c.fill(); c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = L * .008; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(x - L * .5, by + h * .35, L * .98, L * .025);
    circ(x + L * .1, by + h * .55, L * .065, '#fff');
    c.fillStyle = '#222'; c.font = `900 ${L * .09}px Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1', x + L * .1, by + h * .57);
  } else if (mod === 3) {                                                  // Caminhão de bombeiro
    const h = L * .24, by = y - L * .14 - h;
    rr(x - L * .52, by, L * .68, h, L * .04, cor);
    rr(x + L * .14, by - L * .18, L * .38, h + L * .18, L * .06, cor);
    rr(x + L * .22, by - L * .13, L * .24, L * .14, L * .03, vidro);
    piloto(x + L * .33, by - L * .05, L * .065);
    c.strokeStyle = '#cfd8dc'; c.lineWidth = L * .015;
    c.beginPath(); c.moveTo(x - L * .5, by - L * .07); c.lineTo(x + L * .1, by - L * .07); c.moveTo(x - L * .5, by - L * .02); c.lineTo(x + L * .1, by - L * .02);
    for (let k = 0; k < 7; k++) { c.moveTo(x - L * .48 + k * L * .09, by - L * .07); c.lineTo(x - L * .48 + k * L * .09, by - L * .02); }
    c.stroke();
    circ(x + L * .33, by - L * .2, L * .035, Math.floor(relogio * 4) % 2 ? '#f44336' : '#2196f3');
    c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(x - L * .52, by + h * .55, L * 1.04, L * .03);
    circ(x - L * .2, by + h * .45, L * .07, '#90a4ae'); circ(x - L * .2, by + h * .45, L * .035, '#607d8b');
    rr(x + L * .45, by + h * .2, L * .06, L * .06, L * .02, '#fff59d');
  } else if (mod === 4) {                                                  // Carro gigante
    const h = L * .2, by = y - L * .44;
    c.fillStyle = '#455a64'; c.fillRect(x - L * .33, by + h, L * .06, L * .2); c.fillRect(x + L * .27, by + h, L * .06, L * .2);
    rr(x - L * .26, by - L * .2, L * .42, L * .22, L * .06, cor);
    rr(x - L * .2, by - L * .16, L * .3, L * .14, L * .04, vidro);
    piloto(x - L * .05, by - L * .07, L * .07);
    c.strokeStyle = '#263238'; c.lineWidth = L * .02; c.beginPath(); c.moveTo(x - L * .24, by - L * .2); c.lineTo(x - L * .2, by - L * .27); c.lineTo(x + L * .1, by - L * .27); c.lineTo(x + L * .14, by - L * .2); c.stroke();
    rr(x - L * .46, by, L * .92, h, L * .06, cor);
    c.fillStyle = 'rgba(255,255,255,.6)'; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x - L * .3 + k * L * .2, by + h * .8); c.lineTo(x - L * .22 + k * L * .2, by + h * .2); c.lineTo(x - L * .18 + k * L * .2, by + h * .2); c.lineTo(x - L * .26 + k * L * .2, by + h * .8); c.fill(); }
    circ(x + L * .43, by + h * .4, L * .035, '#fff59d');
  } else {                                                                 // Carrinho
    const h = L * .26, by = y - L * .14 - h;
    rr(x - L * .3, by - L * .22, L * .52, L * .3, L * .1, cor);
    rr(x - L * .24, by - L * .17, L * .4, L * .19, L * .06, vidro);
    piloto(x - L * .04, by - L * .06, L * .085);
    rr(x - L * .5, by, L, h, L * .1, cor);
    c.fillStyle = 'rgba(255,255,255,.28)'; rrp(x - L * .44, by + L * .035, L * .88, L * .05, L * .025); c.fill();
    circ(x + L * .46, by + h * .45, L * .035, '#fff59d');
  }
  if (!o.semRodas) for (const [dx, r] of RODAS[mod] || RODAS[0]) roda(x + dx * L, y - r * L, r * L, giro);
}
/* Carro visto de cima (aponta para cima) */
function carroTopo(x, y, w, cor, mod = save.modelo) {
  const h = w * (mod === 2 ? 2 : mod === 3 ? 2.3 : 1.7), rw = mod === 4 ? .34 : mod === 1 ? .26 : .2, rl = mod === 4 ? .44 : .32;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) rr(x + sx * w * .5 - w * rw / 2, y + sy * h * .3 - w * rl / 2, w * rw, w * rl, w * .06, '#263238');
  rr(x - w / 2, y - h / 2, w, h, w * (mod === 1 || mod === 3 ? .12 : .28), cor);
  if (mod === 2) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(x - w * .08, y - h / 2, w * .16, h); }
  if (mod === 3) {
    c.strokeStyle = '#cfd8dc'; c.lineWidth = w * .06; c.beginPath(); c.moveTo(x - w * .2, y - h * .05); c.lineTo(x - w * .2, y + h * .45); c.moveTo(x + w * .2, y - h * .05); c.lineTo(x + w * .2, y + h * .45); c.stroke();
    circ(x - w * .2, y - h * .3, w * .08, '#f44336'); circ(x + w * .2, y - h * .3, w * .08, '#2196f3');
  }
  if (mod === 1) circ(x, y + h * .5, w * .2, '#263238');
  rr(x - w * .36, y - h * (mod === 3 ? .45 : .28), w * .72, h * (mod === 3 ? .12 : .2), w * .1, '#c8ecff');
  if (mod !== 3) rr(x - w * .36, y + h * .2, w * .72, h * .12, w * .08, '#c8ecff');
  piloto(x, mod === 3 ? y - h * .26 : y + h * .04, w * .2);
  circ(x - w * .3, y - h * .46, w * .07, '#fff59d'); circ(x + w * .3, y - h * .46, w * .07, '#fff59d');
}
function ovo(x, y, w, h, rot, rach) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, 7); c.fillStyle = '#fff8e1'; c.fill();
  c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = U * .6; c.stroke();
  for (const [px, py, pr] of [[-.2, -.25, .09], [.22, -.05, .12], [-.12, .22, .1], [.15, .3, .06]]) circ(px * w, py * h, pr * w, JOG[jog].cor);
  c.strokeStyle = '#5d4037'; c.lineWidth = U * .7; c.lineJoin = 'round';
  for (let i = 0; i < rach; i++) {
    const a = i * 1.05 - 1.2; c.beginPath(); c.moveTo(0, 0);
    for (let k = 1; k <= 4; k++) c.lineTo(Math.cos(a + (k % 2 ? .25 : -.25)) * w * .12 * k, Math.sin(a + (k % 2 ? .25 : -.25)) * h * .12 * k);
    c.stroke();
  }
  c.restore();
}

/* ---------- Os 5 dinos, desenhados e animados (olham para a direita) ----------
   x, y = pés no chão; s = tamanho. o.tipo (0 Rex, 1 Pescoçudo, 2 Tricerátops, 3 Estego, 4 Anquilo; sem tipo = o dino escolhido)
   o.boca 0..1 abre a boca · o.dorme 0..1 deita e fecha os olhos · o.anda mexe as pernas · o.vira olha para a esquerda */
const GEO = [   // cabeça (x, y, tamanho), base do pescoço, corpo (y, rx, ry), altura da perna, quatro patas?
  { hx: .44, hy: -.92, hk: 1.2, nx: .2, ny: -.6, by: -.48, rx: .36, ry: .3, pe: .34, q: 0 },
  { hx: .66, hy: -1.42, hk: .75, nx: .22, ny: -.6, by: -.5, rx: .42, ry: .3, pe: .32, q: 1 },
  { hx: .52, hy: -.56, hk: 1, nx: .3, ny: -.45, by: -.44, rx: .4, ry: .28, pe: .28, q: 1 },
  { hx: .5, hy: -.42, hk: .75, nx: .3, ny: -.38, by: -.44, rx: .4, ry: .27, pe: .28, q: 1 },
  { hx: .52, hy: -.34, hk: .85, nx: .34, ny: -.32, by: -.32, rx: .46, ry: .21, pe: .18, q: 1 }
];
const bocaDoDino = (x, y, s, o = {}) => { const g = GEO[o.tipo != null ? o.tipo : save.dino], k = (o.vira ? -1 : 1); return [x + k * (g.hx + .2 * g.hk) * s, y + (g.hy + .09 * g.hk) * s]; };
function dino(x, y, s, o = {}) {
  const tipo = o.tipo != null ? o.tipo : save.dino, T = TIPOS[tipo], g = GEO[tipo], t = relogio;
  const cor = o.cor || (o.tipo == null && save.dcor) || T.cor, bar = o.barriga || T.bar, esp = o.esp || T.esp;
  const dorme = o.dorme || 0, boca = o.boca || 0, resp = 1 + Math.sin(t * (dorme > .5 ? 1.5 : 2.5)) * .03;
  const escuro = 'rgba(0,0,0,.18)';
  c.save(); c.translate(x, y); if (o.vira) c.scale(-1, 1); c.scale(s, s);
  elip(0, 0, .5, .06, 'rgba(0,0,0,.15)');
  c.translate(0, dorme * (g.pe - .05));
  if (dorme < .5) {                                           // pernas (as de trás mais escuras)
    const pa = o.anda ? Math.sin(t * 14) * .07 : 0, pw = tipo === 4 ? .13 : .15;
    const pernas = g.q ? [[-.12 + pa, 1], [.26 - pa, 1], [-.24 - pa, 0], [.14 + pa, 0]] : [[-.2 - pa, 0], [.17 + pa, 0]];
    for (const [px, tras] of pernas) {
      rrp(px - pw / 2, -g.pe, pw, g.pe, .06); c.fillStyle = cor; c.fill();
      if (tras) { c.fillStyle = escuro; c.fill(); }
      elip(px + .02, -.015, .09, .035, 'rgba(0,0,0,.15)');
    }
  }
  const cy = g.by;
  c.save(); c.translate(-g.rx * .8, cy); c.rotate(Math.sin(t * (dorme > .5 ? 1 : 4)) * .15);   // cauda
  const cl2 = tipo === 1 ? 1.3 : 1;
  c.fillStyle = cor; c.beginPath(); c.moveTo(.05, -.14); c.quadraticCurveTo(-.35 * cl2, -.13, -.58 * cl2, .06); c.quadraticCurveTo(-.3 * cl2, .1, .05, .14); c.fill();
  if (tipo === 4) { circ(-.58, .06, .09, esp); circ(-.6, .03, .04, 'rgba(255,255,255,.3)'); }
  if (tipo === 3) { c.fillStyle = '#eceff1'; for (const [a, b] of [[-.42, -.06], [-.5, -.02]]) { c.beginPath(); c.moveTo(a, b); c.lineTo(a - .04, b - .14); c.lineTo(a + .04, b); c.fill(); } }
  c.restore();
  if (tipo === 3) {                                           // placas do Estego
    c.fillStyle = esp;
    for (const [sx, sy, r] of [[-.3, cy - .2, .1], [-.13, cy - .27, .13], [.05, cy - .28, .13], [.22, cy - .22, .1]]) {
      c.beginPath(); c.moveTo(sx - r * .7, sy + r * .5); c.lineTo(sx - r * .5, sy - r * .4); c.lineTo(sx, sy - r); c.lineTo(sx + r * .5, sy - r * .4); c.lineTo(sx + r * .7, sy + r * .5); c.fill();
    }
  } else if (tipo === 0) {                                    // espinhos do Rex
    c.fillStyle = esp;
    for (const [sx, sy] of [[-.3, cy - .2], [-.15, cy - .27], [.0, cy - .29], [.14, cy - .26]]) { c.beginPath(); c.moveTo(sx - .05, sy + .05); c.lineTo(sx, sy - .07); c.lineTo(sx + .05, sy + .05); c.fill(); }
  }
  c.save(); c.translate(0, cy); c.scale(1, resp); elip(0, 0, g.rx, g.ry, cor); elip(.06, g.ry * .3, g.rx * .65, g.ry * .6, bar);
  if (tipo === 4) { for (let k = 0; k < 5; k++) circ(-.3 + k * .15, -.12 + Math.abs(k - 2) * .03, .045, esp); }   // casco do Anquilo
  c.restore();
  const hx = g.hx + dorme * (.5 - g.hx), hy = g.hy + dorme * (-.4 - g.hy) + (tipo === 1 ? Math.sin(t * 1.5) * .03 : 0);
  if (Math.hypot(hx - g.nx, hy - g.ny) > .08) { c.strokeStyle = cor; c.lineWidth = tipo === 1 ? .17 : .2; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.nx, g.ny); c.quadraticCurveTo(g.nx + .1, hy + .1, hx - .02, hy + .05); c.stroke(); }
  c.save(); c.translate(hx, hy); c.scale(g.hk, g.hk);
  if (tipo === 2) {                                           // gola e chifres do Tricerátops
    elip(-.12, -.05, .2, .26, esp, -.3);
    for (let k = 0; k < 4; k++) circ(-.2 + k * .04, -.24 + k * .08, .025, 'rgba(255,255,255,.5)');
    c.fillStyle = '#fffde7';
    for (const [a, b] of [[.0, -.15], [.1, -.14]]) { c.beginPath(); c.moveTo(a - .03, b + .02); c.lineTo(a + .2, b - .2); c.lineTo(a + .04, b + .02); c.fill(); }
    c.beginPath(); c.moveTo(.26, -.03); c.lineTo(.33, -.13); c.lineTo(.31, .0); c.fill();
  }
  elip(0, 0, .22, .19, cor); elip(.17, .04, .16, .12, cor);   // cabeça e focinho
  circ(.29, -.01, .016, 'rgba(0,0,0,.35)');
  if (boca > .05) {
    elip(.2, .09, .1, .02 + .09 * boca, '#7b1f2b'); elip(.2, .1 + .05 * boca, .06, .03 * boca, '#f48fb1');
    if (tipo === 0) { c.fillStyle = '#fff'; for (const a of [.13, .19, .25]) { c.beginPath(); c.moveTo(a - .02, .07); c.lineTo(a, .1); c.lineTo(a + .02, .07); c.fill(); } }
  } else { c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = .018; c.beginPath(); c.arc(.17, .02, .08, .4, 1.35); c.stroke(); }
  elip(.05, .07, .045, .03, 'rgba(255,120,150,.5)');
  if (dorme > .5 || (t + tipo * .7) % 3.3 < .13) {            // olho fechado (piscando ou dormindo)
    c.strokeStyle = '#222'; c.lineWidth = .022; c.beginPath(); c.arc(.03, -.07, .05, .3, Math.PI - .3); c.stroke();
  } else { circ(.03, -.07, .07, '#fff'); circ(.05, -.07, .04, '#222'); circ(.06, -.085, .014, '#fff'); }
  c.restore();
  if (tipo === 0 && dorme < .5) elip(.28, cy + .08, .04, .07, cor, .6);   // bracinho do Rex
  c.restore();
}
function pegada(x, y, r, alfa = 1) {
  c.globalAlpha = alfa;
  elip(x, y + r * .3, r * .7, r * .9, '#5d4037');
  circ(x - r * .6, y - r * .9, r * .3, '#5d4037'); circ(x, y - r * 1.15, r * .32, '#5d4037'); circ(x + r * .6, y - r * .9, r * .3, '#5d4037');
  c.globalAlpha = 1;
}
function bolhaDes(x, y, r) {
  const g = c.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(.6, 'rgba(170,220,255,.15)'); g.addColorStop(1, 'rgba(255,170,255,.4)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = .4 * U; c.stroke();
}

/* ---------- Partículas (confete, bolhas, fogos) ---------- */
let parts = [];
function festa(x, y, n = 14) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 7, v = (20 + Math.random() * 50) * U;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30 * U, g: 120 * U, vida: 1, cor: CORES[sorteio(7)], s: (1 + Math.random() * 1.5) * U, ch: Math.random() < .2 ? '⭐' : null });
  }
}
function respingo(x, y, cor, n = 18) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 7, v = (10 + Math.random() * 45) * U; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 90 * U, vida: .8, cor, s: (1 + Math.random() * 2) * U, r: 1 }); }
}
function bolha(x, y) { parts.push({ x: x + (Math.random() - .5) * 8 * U, y, vx: (Math.random() - .5) * 10 * U, vy: -20 * U, g: -10 * U, vida: .8, cor: 'rgba(255,255,255,.85)', s: (1 + Math.random() * 2) * U, r: 1 }); }
function fogos(x, y) {
  const cor = CORES[sorteio(7)];
  for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, v = (25 + Math.random() * 25) * U; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 25 * U, vida: 1.2, cor, s: 1.2 * U, r: 1 }); }
}
const nota1 = (x, y) => parts.push({ x, y, vx: (Math.random() - .5) * 30 * U, vy: -40 * U, g: 10 * U, vida: 1.2, s: 3 * U, ch: Math.random() < .5 ? '🎵' : '🎶' });
function particulas(dt) {
  for (const p of parts) {
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt;
    const a = cl(p.vida * 2, 0, 1);
    if (p.ch) em(p.ch, p.x, p.y, p.s * 3, 0, a);
    else { c.globalAlpha = a; if (p.r) circ(p.x, p.y, p.s, p.cor); else { c.fillStyle = p.cor; c.fillRect(p.x, p.y, p.s * 1.6, p.s); } }
  }
  c.globalAlpha = 1;
  parts = parts.filter(p => p.vida > 0);
  if (parts.length > 500) parts.splice(0, parts.length - 500);
}

/* ---------- Motor das fases ---------- */
let F = null, fs = null, idx = 0, fim = false, mostraFim = false, ocioso = 0, tela = 'abertura';
function iniciarFase(i) {
  idx = i; const f = FASES[i]; F = MEC[f.mec]; fim = false; mostraFim = false; ocioso = 0; parts = [];
  let meta = F.fixo ? F.base : Math.round(F.base * (1 + .5 * Math.min(est(i), 2)));   // cada estrela deixa a fase mais longa
  if (F.passo) meta = Math.ceil(meta / F.passo) * F.passo;
  fs = { t: 0, feito: 0, meta, amb: f.amb };
  $('#fim').hidden = true;
  mostrar('jogo');
  F.ini(fs);
}
function ponto(x, y) {
  if (fim) return;
  fs.feito++; som.ding(); festa(x, y, 12);
  if (fs.feito >= fs.meta) vencer();
}
function vencer() {
  if (fim) return;
  fim = true;
  const id = FASES[idx].id; save.e[id] = Math.min(3, (save.e[id] || 0) + 1); gravar();
  for (let k = 0; k < 6; k++) setTimeout(() => festa(Math.random() * W, H * (.2 + Math.random() * .4), 22), k * 180);
  som.festa();
  if (F.calmo) setTimeout(som.ninar, 600);            // fases de dormir: canção de ninar em vez de rugido
  else { setTimeout(som.rugido, 500); setTimeout(som.buzina, 1300); }
  setTimeout(() => {
    if (tela !== 'jogo' || !fim) return;
    $('#premio').textContent = FASES[idx].fig;
    $('#estrelas').textContent = '⭐'.repeat(est(idx)) + '☆'.repeat(3 - est(idx));
    $('#fim').hidden = false; mostraFim = true;
    falar('Muito bem, ' + JOG[jog].nome + '!');
  }, F.calmo ? 2300 : 1500);
}
function barra() {
  const x = W * .28, w = W * .6, y = 6 * U, h = 4 * U;
  c.fillStyle = 'rgba(0,0,0,.2)'; rrp(x, y, w, h, h / 2); c.fill();
  const p = cl(fs.feito / fs.meta, 0, 1);
  if (p > 0) { c.fillStyle = '#ffd600'; rrp(x, y, Math.max(h, w * p), h, h / 2); c.fill(); }
  em('⭐', x + w, y + h / 2, 8 * U);
}
let ult = 0;
function quadro(t) {
  const dt = Math.min(.05, (t - ult) / 1000 || 0); ult = t; relogio = t / 1000;
  if (tela === 'jogo' && F) {
    fs.t += dt; ocioso += dt;
    F.upd(fs, dt); F.des(fs);
    if (mostraFim) {                                    // o dino e o carro comemoram junto
      dino(W * .25, H * .97 - Math.abs(Math.sin(relogio * 6)) * 4 * U, 14 * U, { boca: .6 });
      carro(W * .74, H * .97 - Math.abs(Math.sin(relogio * 6 + 1)) * 2 * U, 26 * U, save.cor, relogio * 4);
    }
    particulas(dt); barra();
    if (!fim && ocioso > 4) {      // mãozinha mostrando onde tocar
      const d = F.dica(fs);
      if (d) em('👆', d[0] + 3 * U, d[1] + 8 * U + Math.sin(fs.t * 6) * 2 * U, 14 * U, 0, .6 + .4 * Math.sin(fs.t * 6));
    }
  } else if (tela === 'menu') desenharMenu();
  else if (tela === 'garagem') comCanvas($('#previa'), () => { c.clearRect(0, 0, W, H); carro(W * .5, H * .95, Math.min(W * .8, H * 1.3), save.cor, relogio * 3); });
  else if (tela === 'dinos') comCanvas($('#previaDino'), () => { c.clearRect(0, 0, W, H); dino(W * .47, H * .96, H * .55, { anda: Math.sin(relogio) > .6, boca: Math.sin(relogio * 1.3) > .85 ? .7 : 0 }); });
  requestAnimationFrame(quadro);
}
/* Fundo do menu: os mundos vão mudando, o dino passeia e o carro passa */
function desenharMenu() {
  comCanvas($('#cvMenu'), () => {
    const ids = Object.keys(AMB), a = AMB[ids[Math.floor(relogio / 8) % ids.length]];
    cenario(H * .6, a);
    const xc = ((relogio * 16 * U) % (W + 70 * U)) - 35 * U;
    carro(xc, H * .99, 26 * U, save.cor, relogio * 4);
    const xd = W + 25 * U - ((relogio * 9 * U) % (W + 50 * U));
    dino(xd, H * .9, 13 * U, { anda: true, vira: true });
  });
}

let apertado = false;
const xy = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); apertado = true; ocioso = 0; ac();
  if (F && !fim && F.toque) F.toque(fs, ...xy(e));
});
cv.addEventListener('pointermove', e => { if (apertado && F && !fim && F.mover) { ocioso = 0; F.mover(fs, ...xy(e)); } });
for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) cv.addEventListener(ev, () => { apertado = false; if (F && F.solta) F.solta(fs); });
addEventListener('contextmenu', e => e.preventDefault());

/* Arrastar (ou só tocar e soltar) um item: ele sempre voa para o lugar certo.
   Só um item fica na mão por vez: se outro dedo (ou a palma) tocar a tela, o primeiro é solto. */
const levar = {
  toque(s, x, y) {
    levar.solta(s);
    let m = null, md = 17 * U;
    for (const it of s.itens) { if (it.est !== 'casa') continue; const d = Math.hypot(it.x * W - x, it.y * H - y); if (d < md) { md = d; m = it; } }
    if (m) { m.est = 'mao'; s.mao = m; som.pop(); }
  },
  mover(s, x, y) { if (s.mao) { s.mao.x = x / W; s.mao.y = y / H; } },
  solta(s) { for (const it of s.itens) if (it.est === 'mao') it.est = 'voa'; s.mao = null; },
  upd(s, dt, chegou) {
    for (const it of s.itens) if (it.est === 'voa') {
      const k = Math.min(1, dt * 9); it.x += (it.tx - it.x) * k; it.y += (it.ty - it.y) * k;
      if (Math.hypot((it.tx - it.x) * W, (it.ty - it.y) * H) < 3 * U) { it.x = it.tx; it.y = it.ty; it.est = 'ok'; chegou(it); }
    }
  }
};

/* Esfregar manchas de lama (carro e dino usam o mesmo jogo) */
function faseEsfregar(o) {
  return {
    ic: o.ic, base: o.base,
    ini(s) { s.m = []; for (let i = 0; i < s.meta; i++) s.m.push({ dx: o.x0 + Math.random() * (o.x1 - o.x0), dy: o.y0 + Math.random() * (o.y1 - o.y0), v: 1, r: 4.5 + Math.random() * 3 }); s.px = null; },
    pos(b) { const r = o.ref(); return [r.x + b.dx * r.L, r.y + b.dy * r.L]; },
    upd() {},
    des(s) {
      o.des(s);
      for (const b of s.m) if (b.v > 0) {
        const [x, y] = this.pos(b), r = b.r * U * (.5 + .5 * b.v);
        circ(x, y, r, '#6d4c2f'); circ(x - r * .3, y - r * .25, r * .35, '#8a6238');
      }
      if (s.px != null) em('🧽', s.px, s.py, 13 * U);
    },
    esfrega(s, x, y, f) {
      s.px = x; s.py = y;
      for (const b of s.m) {
        if (b.v <= 0) continue;
        const [bx, by] = this.pos(b);
        if (Math.hypot(bx - x, by - y) < 12 * U) { b.v -= f; bolha(x, y); if (b.v <= 0) ponto(bx, by); }
      }
    },
    toque(s, x, y) { this.esfrega(s, x, y, .4); },
    mover(s, x, y) { this.esfrega(s, x, y, .13); },
    dica(s) { const b = s.m.find(b => b.v > 0); return b ? this.pos(b) : null; }
  };
}
const refCarro = () => ({ x: W * .5, y: H * .68, L: Math.min(W * .86, H * .6) });
const refDino = () => ({ x: W * .45, y: H * .66, L: Math.min(W * .5, H * .3) });
const novoCarro = s => s.feito ? { cor: CORES[sorteio(8)], mod: sorteio(5) } : { cor: save.cor, mod: save.modelo };   // o primeiro é o seu

/* ---------- Os jogos (cada mundo usa estes jogos com o seu cenário) ---------- */
const MEC = {
  /* Garagem: pintar o carrinho com as 8 latas */
  pintar: { ic: '🎨', base: 8, fixo: true,
    ini(s) { s.cor = save.cor; s.us = []; s.pulo = 0; },
    lata(i) { return [(.14 + .24 * (i % 4)) * W, (i < 4 ? .74 : .89) * H]; },
    upd(s, dt) { s.pulo = Math.max(0, s.pulo - dt * 2.5); },
    des(s) {
      c.fillStyle = '#ffe0b2'; c.fillRect(0, 0, W, H); em('🔧', W * .15, H * .2, 10 * U, -.4); em('🔩', W * .85, H * .22, 10 * U);
      chao(H * .58, '#b0bec5');
      carro(W * .5, H * .56 - Math.sin(s.pulo * Math.PI) * 4 * U, Math.min(W * .8, H * .5), s.cor);
      for (let i = 0; i < 8; i++) {
        const [x, y] = this.lata(i);
        rr(x - 5 * U, y - 5 * U, 10 * U, 11 * U, 2 * U, '#cfd8dc');
        c.fillStyle = CORES[i]; c.beginPath(); c.ellipse(x, y - 5 * U, 4.5 * U, 1.8 * U, 0, 0, 7); c.fill();
        rrp(x - 5 * U, y - .5 * U, 10 * U, 4.5 * U, 1 * U); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = .3 * U; c.stroke();
        if (s.us.includes(i)) em('⭐', x + 5 * U, y - 7 * U, 6 * U);
      }
    },
    toque(s, x, y) {
      for (let i = 0; i < 8; i++) {
        const [lx, ly] = this.lata(i);
        if (Math.hypot(lx - x, ly - y) < 11 * U) {
          s.cor = save.cor = CORES[i]; gravar(); s.pulo = 1; som.splash(); respingo(W * .5, H * .42, CORES[i], 26);
          if (!s.us.includes(i)) { s.us.push(i); ponto(lx, ly); }
          break;
        }
      }
    },
    dica(s) { for (let i = 0; i < 8; i++) if (!s.us.includes(i)) return this.lata(i); return null; } },

  /* Estrada: o carro anda sozinho e segue o dedo, pegando os presentes do mundo */
  estrada: { ic: '🛣️', base: 30,
    ini(s) { s.cx = .5; s.al = .5; s.ov = []; s.sp = 0; },
    upd(s, dt) {
      s.cx += (s.al - s.cx) * Math.min(1, dt * 10); s.sp -= dt;
      if (s.sp <= 0 && !fim) { s.sp = .8; const r = Math.random(), it = amb().itens; s.ov.push({ x: .22 + Math.random() * .56, y: -.1, ch: r < .7 ? it[0] : r < .9 ? it[1] : it[2] }); }
      for (const o of s.ov) {
        o.y += dt * .3;
        if (!o.p && Math.abs(o.x - s.cx) * W < 15 * U && Math.abs(o.y - .8) * H < 11 * U) { o.p = 1; som.pop(); ponto(o.x * W, o.y * H); }
      }
      s.ov = s.ov.filter(o => !o.p && o.y < 1.1);
    },
    des(s) {
      const a = amb();
      c.fillStyle = a.chao; c.fillRect(0, 0, W, H); c.fillStyle = a === AMB.neve ? '#90a4ae' : '#555d66'; c.fillRect(W * .1, 0, W * .8, H);
      c.fillStyle = '#ffd600'; c.fillRect(W * .1, 0, U, H); c.fillRect(W * .9 - U, 0, U, H);
      c.fillStyle = '#fff'; const p = H * .16, off = (s.t * .3 * H) % p;
      for (let y = -p + off; y < H; y += p) c.fillRect(W * .5 - U, y, 2 * U, p * .5);
      for (let k = 0; k < 4; k++) { const y = ((k * .3 + s.t * .3) % 1.2 - .1) * H; em(a.deco[k % 5], W * .05, y, 9 * U); em(a.deco[(k + 2) % 5], W * .95, y + H * .12, 9 * U); }
      for (const o of s.ov) em(o.ch, o.x * W, o.y * H, 11 * U);
      carroTopo(s.cx * W, H * .8, 15 * U, save.cor);
    },
    toque(s, x) { s.al = cl(x / W, .2, .8); }, mover(s, x) { s.al = cl(x / W, .2, .8); },
    dica: s => [(.5 + .25 * Math.sin(s.t * 2)) * W, H * .8] },

  /* Ovos chocando: tocar várias vezes até nascer um dino (cada vez um diferente) */
  chocar: { ic: '🐣', base: 6,
    ini(s) { s.tq = 0; s.nasc = 0; s.bal = 0; s.d = sorteio(5); s.cor = DCOR[sorteio(DCOR.length)]; },
    upd(s, dt) {
      s.bal = Math.max(0, s.bal - dt * 3);
      if (s.nasc > 0) { s.nasc -= dt; if (s.nasc <= 0 && !fim) { s.tq = 0; s.d++; s.cor = DCOR[sorteio(DCOR.length)]; s.nasc = 0; } else if (s.nasc <= 0) s.nasc = .01; }
    },
    des(s) {
      cenario(H * .66); const x = W * .5, y = H * .55;
      c.fillStyle = '#8d6e63'; c.beginPath(); c.ellipse(x, y + 15 * U, 24 * U, 7 * U, 0, 0, 7); c.fill();
      if (s.nasc > 0) {
        ovo(x - 18 * U, y + 10 * U, 16 * U, 14 * U, -.6, 3); ovo(x + 18 * U, y + 10 * U, 16 * U, 14 * U, .6, 3);
        const cresce = Math.min(1, (1.8 - s.nasc) * 4);
        dino(x - 3 * U, y + 13 * U - Math.abs(Math.sin(s.t * 7)) * 5 * U, 22 * U * cresce + U, { tipo: s.d % 5, cor: s.cor, boca: Math.sin(s.t * 6) > .3 ? .7 : 0 });
      } else ovo(x, y, 26 * U, 34 * U, Math.sin(s.t * 40) * s.bal * .15, s.tq);
    },
    toque(s) {
      if (s.nasc > 0) return;
      s.tq++; s.bal = 1; som.crack(); respingo(W * .5, H * .55, '#fff8e1', 6);
      if (s.tq >= 6) { s.nasc = 1.8; som.rugidinho(); falar(TIPOS[s.d % 5].nome + '!'); ponto(W * .5, H * .5); }
    },
    dica: s => s.nasc > 0 ? null : [W * .5, H * .55] },

  /* Lava-rápido: esfregar a lama do carro */
  lava: faseEsfregar({ ic: '🧽', base: 26, ref: refCarro, x0: -.44, x1: .44, y0: -.5, y1: -.12,
    des() { c.fillStyle = '#b3e5fc'; c.fillRect(0, 0, W, H); em('🚿', W * .2, H * .16, 14 * U); em('💧', W * .8, H * .2, 10 * U); chao(H * .66, '#90a4ae'); const r = refCarro(); carro(r.x, r.y, r.L, save.cor); } }),

  /* Corrida com o T-Rex: tocar sem parar; todo mundo ganha medalha */
  corrida: { ic: '🏁', base: 60,
    ini(s) { s.v = 0; s.sc = 0; },
    upd(s, dt) { s.v = Math.max(0, s.v - dt * 1.5); s.sc += s.v * dt * 45 * U; },
    des(s) {
      const a = amb();
      fundo(); chao(H * .6); c.fillStyle = a === AMB.neve ? '#cfd8dc' : '#a1887f'; c.fillRect(0, H * .68, W, H * .2);
      const larg = W * 2.4;
      for (let k = 0; k < 6; k++) { const x = (((k * larg / 6 - s.sc) % larg) + larg) % larg - W * .2; em(a.deco[k % 5], x, H * .56, (k % 2 ? 16 : 20) * U); }
      const fx = W * .62 + (s.meta - s.feito) * 7 * U; if (fx < W * 1.3) em('🏁', fx + 14 * U, H * .66, 22 * U);
      const corre = s.v > .05 ? 1 : .25;
      dino(W * .2, H * .86 - Math.abs(Math.sin(s.t * 9)) * 3 * U * corre, 19 * U, { tipo: 0, anda: corre > .5, boca: s.v > 1.6 ? .8 : 0 });
      carro(W * .62, H * .86 - Math.abs(Math.sin(s.t * 14)) * U * corre, 34 * U, save.cor, s.sc / (4 * U));
      if (fim) { em('🏅', W * .22, H * .6, 12 * U); em('🏅', W * .62, H * .62, 12 * U); }
    },
    toque(s) {
      s.v = Math.min(3, s.v + .8); s.feito++; som.motor();
      parts.push({ x: W * .46, y: H * .84, vx: -30 * U, vy: -8 * U, g: 0, vida: .5, cor: 'rgba(160,140,120,.7)', s: 2.5 * U, r: 1 });
      if (s.feito >= s.meta) vencer();
    },
    dica: () => [W * .5, H * .45] },

  /* Comidinha: o dino abre a boca, come, e no fim dorme */
  comida: { ic: '🍎', base: 14, calmo: true,
    S: () => Math.min(W * .45, H * .26),
    ini(s) { s.b = 0; s.mast = 0; s.dorme = 0; s.pulo = 0; s.itens = [.2, .5, .8].map(x => ({ ch: COMIDAS[sorteio(COMIDAS.length)], x, y: .86, hx: x, hy: .86, tx: .6, ty: .5, est: 'casa' })); },
    upd(s, dt) {
      const [bx, by] = bocaDoDino(W * .4, H * .6, this.S());
      for (const it of s.itens) { it.tx = bx / W; it.ty = by / H; }
      const quer = s.itens.some(i => i.est === 'mao' || i.est === 'voa');
      s.mast = Math.max(0, s.mast - dt); s.pulo = Math.max(0, s.pulo - dt * 2);
      const alvo = fim ? 0 : s.mast > 0 ? (Math.sin(s.mast * 25) > 0 ? .6 : .1) : quer ? 1 : 0;
      s.b += (alvo - s.b) * Math.min(1, dt * 12);
      if (fim) s.dorme = Math.min(1, s.dorme + dt * .8);
      levar.upd(s, dt, it => {
        s.mast = .7; s.pulo = 1; som.nham(); ponto(it.x * W, it.y * H);
        const ativos = s.itens.filter(i => i !== it && i.est !== 'fora').length;
        if (s.feito + ativos < s.meta) Object.assign(it, { ch: COMIDAS[sorteio(COMIDAS.length)], x: it.hx, y: it.hy, est: 'casa' }); else it.est = 'fora';
      });
    },
    des(s) {
      cenario(H * .6);
      const S = this.S();
      dino(W * .4, H * .6 - Math.sin(s.pulo * Math.PI) * 3 * U, S, { boca: s.b, dorme: s.dorme });
      if (s.dorme > 0) { c.fillStyle = `rgba(10,15,60,${.45 * s.dorme})`; c.fillRect(0, 0, W, H); em('💤', W * .4 + .6 * S, H * .6 - S * (.95 + .08 * Math.sin(s.t * 2)), 10 * U, 0, s.dorme); }
      for (const it of s.itens) if (it.est !== 'fora' && it.est !== 'ok') em(it.ch, it.x * W, it.y * H, (it.est === 'mao' ? 20 : 16) * U);
    },
    toque: levar.toque, mover: levar.mover, solta: levar.solta,
    dica(s) { const it = s.itens.find(i => i.est === 'casa'); return it ? [it.x * W, it.y * H] : null; } },

  /* Balões: estourar muitos balões */
  baloes: { ic: '🎈', base: 40,
    novo(y) { return { x: .12 + Math.random() * .76, y: y == null ? 1.12 : y, cor: CORES[sorteio(7)], v: .07 + Math.random() * .06, f: Math.random() * 6, d: Math.random() < .2 }; },
    bx: (s, b) => (b.x + Math.sin(s.t * 1.5 + b.f) * .02) * W,
    ini(s) { s.b = []; for (let i = 0; i < 7; i++) s.b.push(this.novo(.3 + Math.random() * .7)); },
    upd(s, dt) { for (const b of s.b) { b.y -= b.v * dt; if (b.y < -.12) Object.assign(b, this.novo()); } },
    des(s) {
      cenario(H * .9);
      for (const b of s.b) {
        const x = this.bx(s, b), y = b.y * H;
        c.strokeStyle = '#fff'; c.lineWidth = U * .4; c.beginPath(); c.moveTo(x, y + 10 * U); c.quadraticCurveTo(x + 3 * U, y + 16 * U, x, y + 22 * U); c.stroke();
        if (b.d) em('🦕', x, y + 25 * U, 8 * U);
        c.fillStyle = b.cor; c.beginPath(); c.ellipse(x, y, 8.5 * U, 10.5 * U, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(x - 3 * U, y - 4 * U, 2 * U, 3.2 * U, .5, 0, 7); c.fill();
      }
    },
    toque(s, x, y) {
      let m = null, md = 15 * U;
      for (const b of s.b) { const d = Math.hypot(this.bx(s, b) - x, b.y * H - y); if (d < md) { md = d; m = b; } }
      if (m) { som.pop(); respingo(x, y, m.cor, 12); Object.assign(m, this.novo()); ponto(x, y); }
    },
    dica(s) { const b = s.b.filter(b => b.y > .15 && b.y < .85)[0]; return b ? [this.bx(s, b), b.y * H] : null; } },

  /* Ponte de pedras: cada toque é um pulo (no vulcão, a ponte é sobre a lava!) */
  ponte: { ic: '🌉', base: 24,
    ini(s) { s.i = 0; s.j = 0; s.cam = 0; },
    upd(s, dt) {
      if (s.j > 0) { s.j += dt / .45; if (s.j >= 1) { s.j = 0; s.i++; ponto(W * .35, H * .5); } }
      s.cam += (s.i + s.j - s.cam) * Math.min(1, dt * 6);
    },
    des(s) {
      fundo(); chao(H * .6, amb().agua); const sp = 30 * U, py = H * .68;
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = U * .6;
      for (let k = 0; k < 6; k++) { const x = (((k * W * .3 - s.t * 8 * U) % (W * 1.5)) + W * 1.5) % (W * 1.5) - W * .2, y = H * (.74 + .05 * (k % 3)); c.beginPath(); c.arc(x, y, 4 * U, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
      for (let k = Math.floor(s.cam) - 2; k <= s.cam + 5; k++) {
        if (k < 0 || k > s.meta) continue;
        const x = W * .35 + (k - s.cam) * sp;
        c.fillStyle = '#78909c'; c.beginPath(); c.ellipse(x, py + 2 * U, 12 * U, 4.5 * U, 0, 0, 7); c.fill();
        c.fillStyle = '#90a4ae'; c.beginPath(); c.ellipse(x, py + U, 11 * U, 3.5 * U, 0, 0, 7); c.fill();
        if (k > s.i) em(k === s.meta ? '🏁' : '⭐', x, py - 16 * U + Math.sin(s.t * 4 + k) * U, (k === s.meta ? 14 : 8) * U);
      }
      carro(W * .35 + (s.i + s.j - s.cam) * sp, py - Math.sin(s.j * Math.PI) * 15 * U, 22 * U, save.cor, s.t * 5);
    },
    toque(s) { if (s.j === 0) { s.j = .001; som.pulo(); } },
    dica: () => [W * .5, H * .4] },

  /* Esconde-esconde: achar os dinos nas moitas */
  esconde: { ic: '👀', base: 16, passo: 4,
    ini(s) { this.rod(s); },
    rod(s) { s.m = embaralha(DINOS).slice(0, 4).map((ch, i) => ({ ch, x: i % 2 ? .72 : .28, y: i < 2 ? .42 : .78, a: 0, ok: 0 })); s.esp = 0; },
    upd(s, dt) { for (const m of s.m) if (m.ok) m.a = Math.min(1, m.a + dt * 4); if (!fim && s.m.every(m => m.ok)) { s.esp += dt; if (s.esp > 1.3) this.rod(s); } },
    des(s) {
      cenario(H * .22); const neve = amb() === AMB.neve;
      for (const m of s.m) {
        const x = m.x * W, y = m.y * H;
        if (m.ok) em(m.ch, x, y - m.a * 15 * U - Math.abs(Math.sin(s.t * 6)) * 2 * U, 18 * U);
        else em('👀', x, y - 12.5 * U + Math.sin(s.t * 2 + m.x * 9) * 1.5 * U, 8 * U);
        circ(x - 8 * U, y + 3 * U, 9 * U, '#2e7d32'); circ(x + 8 * U, y + 3 * U, 9 * U, '#2e7d32'); circ(x, y - U, 11 * U, '#388e3c'); circ(x - 3 * U, y - 4 * U, 3 * U, '#4caf50');
        if (neve) { elip(x, y - 9 * U, 8 * U, 3 * U, '#fff'); elip(x - 9 * U, y - 3 * U, 5 * U, 2 * U, '#fff'); }
      }
    },
    toque(s, x, y) {
      let m = null, md = 19 * U;
      for (const b of s.m) { if (b.ok) continue; const d = Math.hypot(b.x * W - x, b.y * H - y); if (d < md) { md = d; m = b; } }
      if (m) { m.ok = 1; som.rugidinho(); ponto(m.x * W, m.y * H - 10 * U); }
    },
    dica(s) { const m = s.m.find(m => !m.ok); return m ? [m.x * W, m.y * H] : null; } },

  /* Banho no dino: esfregar a lama do dinossauro */
  banho: faseEsfregar({ ic: '🛁', base: 26, ref: refDino, x0: -.35, x1: .45, y0: -.85, y1: -.25,
    des(s) {
      cenario(H * .66); const r = refDino();
      elip(r.x, r.y + 2 * U, r.L * .7, 6 * U, 'rgba(129,212,250,.8)');
      dino(r.x, r.y - (fim ? Math.abs(Math.sin(s.t * 8)) * 4 * U : 0), r.L, { boca: fim ? .8 : 0 });
    } }),

  /* Encaixe: cada dino na sua sombra */
  encaixe: { ic: '🧩', base: 12, passo: 3,
    ini(s) { this.rod(s); },
    rod(s) {
      const xs = [.2, .5, .8], ord = embaralha([0, 1, 2]);
      s.itens = embaralha(DINOS).slice(0, 3).map((ch, i) => ({ ch, tx: xs[i], ty: .32, hx: xs[ord[i]], hy: .78, x: xs[ord[i]], y: .78, est: 'casa' }));
      s.esp = 0; s.mao = null;
    },
    upd(s, dt) {
      levar.upd(s, dt, it => ponto(it.x * W, it.y * H));
      if (!fim && s.itens.every(i => i.est === 'ok')) { s.esp += dt; if (s.esp > 1.1) this.rod(s); }
    },
    des(s) {
      cenario(H * .55);
      for (const it of s.itens) {
        c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = U; c.setLineDash([2 * U, 2 * U]);
        c.beginPath(); c.arc(it.tx * W, it.ty * H, 13 * U, 0, 7); c.stroke(); c.setLineDash([]);
        if (it.est !== 'ok') em(it.ch, it.tx * W, it.ty * H, 19 * U, 0, .25);
      }
      for (const it of s.itens) em(it.ch, it.x * W, it.y * H + (it.est === 'ok' ? -Math.abs(Math.sin(s.t * 6)) * 2 * U : 0), (it.est === 'mao' ? 23 : 19) * U);
    },
    toque: levar.toque, mover: levar.mover, solta: levar.solta,
    dica(s) { const it = s.itens.find(i => i.est === 'casa'); return it ? [it.x * W, it.y * H] : null; } },

  /* Cesta de frutas: o dino anda atrás do dedo e pega as frutas que caem */
  cesta: { ic: '🧺', base: 25,
    S: () => Math.min(W * .3, H * .18),
    ini(s) { s.cx = .5; s.al = .5; s.fr = []; s.sp = 0; s.vira = false; s.b = 0; s.pulo = 0; s.anda = false; },
    upd(s, dt) {
      const ant = s.cx; s.cx += (s.al - s.cx) * Math.min(1, dt * 5);
      s.anda = Math.abs(s.cx - ant) > dt * .02; if (Math.abs(s.al - s.cx) > .02) s.vira = s.al < s.cx;
      s.sp -= dt; s.pulo = Math.max(0, s.pulo - dt * 3);
      if (s.sp <= 0 && !fim) { s.sp = 1.1; s.fr.push({ x: .15 + Math.random() * .7, y: .14, ch: COMIDAS[sorteio(COMIDAS.length)], r: 0 }); }
      const S = this.S(), topo = H * .9 - S * .95;
      let perto = false;
      for (const f of s.fr) {
        f.y += dt * .2; f.r += dt * 3;
        const dx = Math.abs(f.x - s.cx) * W, fy = f.y * H;
        if (dx < .7 * S && fy > topo - 25 * U) perto = true;
        if (!f.p && dx < .6 * S && fy > topo) { f.p = 1; s.pulo = 1; som.nham(); ponto(f.x * W, fy); }
      }
      s.fr = s.fr.filter(f => !f.p && f.y < .95);
      s.b += ((perto ? 1 : 0) - s.b) * Math.min(1, dt * 10);
    },
    des(s) {
      cenario(H * .9); const neve = amb() === AMB.neve;
      for (let k = 0; k < 5; k++) { circ(W * (k * .25), H * .05, 16 * U, k % 2 ? '#2e7d32' : '#388e3c'); if (neve) elip(W * k * .25, H * .05 - 12 * U, 10 * U, 4 * U, '#fff'); }
      for (let k = 0; k < 6; k++) em(COMIDAS[k], W * (.1 + k * .16), H * (.08 + (k % 2) * .04), 6 * U);
      for (const f of s.fr) em(f.ch, f.x * W, f.y * H, 11 * U, Math.sin(f.r) * .3);
      dino(s.cx * W, H * .9 - Math.sin(s.pulo * Math.PI) * 4 * U, this.S(), { vira: s.vira, anda: s.anda, boca: s.b });
    },
    toque(s, x) { s.al = cl(x / W, .12, .88); }, mover(s, x) { s.al = cl(x / W, .12, .88); },
    dica(s) { const f = s.fr.find(f => f.y < .7); return f ? [f.x * W, H * .82] : null; } },

  /* Dança: cada toque é um passo de dança, e os 5 dinos se revezam no palco */
  danca: { ic: '🎶', base: 24,
    ini(s) { s.mv = -1; s.mt = 1; s.d = save.dino; },
    upd(s, dt) { s.mt = Math.min(1, s.mt + dt * 1.6); },
    des(s) {
      c.fillStyle = amb() === AMB.praia ? '#0d47a1' : '#2a1b4a'; c.fillRect(0, 0, W, H);
      for (let k = 0; k < 3; k++) {
        c.fillStyle = `hsla(${(s.t * 60 + k * 120) % 360},90%,60%,.2)`;
        c.beginPath(); c.moveTo(W * (.15 + .35 * k), 0); c.lineTo(W * .5 - 32 * U, H * .82); c.lineTo(W * .5 + 32 * U, H * .82); c.fill();
      }
      c.fillStyle = amb() === AMB.praia ? '#ffe082' : '#6d4c41'; c.fillRect(0, H * .8, W, H * .2);
      for (let k = 0; k < 8; k++) circ(W * (k + .5) / 8, H * .03, 2 * U, `hsl(${(k * 45 + s.t * 120) % 360},90%,65%)`);
      const S = Math.min(W * .4, H * .23), x = W * .5, y = H * .8, p = s.mt < 1 ? Math.sin(s.mt * Math.PI) : 0;
      let dx = 0, dy = 0, rot = Math.sin(s.t * 3) * .05, boca = 0, sx = 1;
      if (s.mt < 1) {
        if (s.mv === 0) dy = -p * 24 * U;
        if (s.mv === 1) rot = Math.sin(s.mt * Math.PI * 2) * .3;
        if (s.mv === 2) boca = p;
        if (s.mv === 3) { const k = Math.cos(s.mt * Math.PI * 2); sx = Math.sign(k || 1) * Math.max(.06, Math.abs(k)); }
        if (s.mv === 4) dx = Math.sin(s.mt * Math.PI * 4) * 9 * U;
      }
      c.save(); c.translate(x + dx, y + dy); c.rotate(rot); c.scale(sx, 1);
      dino(0, 0, S, { tipo: s.d % 5, boca, anda: s.mv === 4 && s.mt < 1 });
      c.restore();
    },
    toque(s) {
      s.mv = (s.mv + 1) % 5; s.mt = 0; if (s.mv === 0 && s.feito > 0) { s.d++; falar(TIPOS[s.d % 5].nome + '!'); }
      if (s.mv === 2) som.rugidinho(); else som.pulo();
      nota1(W * .3, H * .5); nota1(W * .7, H * .5); ponto(W * .5, H * .45);
    },
    dica: () => [W * .5, H * .62] },

  /* Bolhas de sabão: o dino sopra, a criança estoura */
  bolhas: { ic: '🧼', base: 35,
    S: () => Math.min(W * .4, H * .24),
    ini(s) { s.bo = []; s.sp = 0; s.sopro = 0; },
    upd(s, dt) {
      s.sp -= dt; s.sopro = Math.max(0, s.sopro - dt * 2);
      const [mx, my] = bocaDoDino(W * .28, H * .85, this.S());
      if (s.sp <= 0 && s.bo.length < 8 && !fim) { s.sp = .6; s.sopro = 1; s.bo.push({ x: mx, y: my, vx: (12 + Math.random() * 25) * U, vy: -(7 + Math.random() * 12) * U, r: (5.5 + Math.random() * 4) * U, f: Math.random() * 6 }); }
      for (const b of s.bo) {
        b.x += b.vx * dt; b.y += b.vy * dt + Math.sin(s.t * 3 + b.f) * .3 * U; b.vx *= 1 - dt * .5;
        if (b.x > W - b.r) b.vx = -Math.abs(b.vx);
      }
      s.bo = s.bo.filter(b => b.y > -b.r * 2 && !b.p);
    },
    des(s) {
      cenario(H * .85);
      dino(W * .28, H * .85, this.S(), { boca: .25 + .5 * s.sopro });
      for (const b of s.bo) bolhaDes(b.x, b.y, b.r);
    },
    toque(s, x, y) {
      let m = null, md = 1e9;
      for (const b of s.bo) { const d = Math.hypot(b.x - x, b.y - y); if (d < b.r + 9 * U && d < md) { md = d; m = b; } }
      if (m) { m.p = 1; som.pop(); respingo(m.x, m.y, 'rgba(200,240,255,.9)', 10); ponto(m.x, m.y); }
    },
    dica(s) { const b = s.bo.find(b => b.y < H * .7); return b ? [b.x, b.y] : null; } },

  /* Boa noite, dino: mamadeira, ursinho, cobertor e apagar a luz */
  boanoite: { ic: '🌙', base: 8, passo: 4, calmo: true,
    S: () => Math.min(W * .42, H * .25),
    obj: i => [[.16, .9], [.4, .91], [.64, .9], [.86, .3]][i],
    ini(s) { this.rod(s); },
    rod(s) { s.et = 0; s.luz = 1; s.dorme = 0; s.bebe = 0; s.esp = 0; },
    upd(s, dt) {
      s.bebe = Math.max(0, s.bebe - dt);
      if (s.et >= 4) {
        s.luz = Math.max(0, s.luz - dt * 1.5); s.dorme = Math.min(1, s.dorme + dt * .7);
        if (!fim) { s.esp += dt; if (s.esp > 3.2) this.rod(s); }
      }
    },
    cobertor(x, y, w, h) {
      c.fillStyle = '#ec407a'; rrp(x, y, w, h, 2.5 * U); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 1; k < 4; k++) c.fillRect(x + w * k / 4 - w * .04, y, w * .08, h);
    },
    des(s) {
      c.fillStyle = amb() === AMB.neve ? '#7986cb' : '#5c6bc0'; c.fillRect(0, 0, W, H);
      rr(W * .1, H * .1, W * .34, H * .17, 2 * U, '#1a237e'); em('🌙', W * .27, H * .185, 10 * U);
      for (let i = 0; i < 6; i++) circ(W * (.14 + i * .05), H * (.12 + (i % 3) * .04), .5 * U, '#fff');
      c.fillStyle = '#8d6e63'; c.fillRect(0, H * .8, W, H * .2);
      rr(W * .08, H * .5, W * .07, H * .3, 2 * U, '#a1887f');
      rr(W * .1, H * .66, W * .8, H * .13, 3 * U, '#ffcc80');
      const S = this.S(), dx = W * .5, dy = H * .7, [bx, by] = bocaDoDino(dx, dy, S);
      dino(dx, dy, S, { dorme: s.dorme, boca: s.bebe > 0 ? .5 : 0 });
      if (s.bebe > 0) em('🍼', bx + 4 * U, by - 3 * U, 9 * U, -.9);
      if (s.et >= 2) em('🧸', dx - .62 * S, dy - .3 * S, 12 * U);
      if (s.et >= 3) this.cobertor(dx - .62 * S, dy - .45 * S + s.dorme * .18 * S, 1.15 * S, .45 * S);
      const ch = ['🍼', '🧸', null, '💡'];
      for (let i = 0; i < 4; i++) {
        if (i < s.et && i !== 3) continue;
        const [ox, oy] = this.obj(i), vez = i === s.et, k = vez ? 1 + .12 * Math.sin(s.t * 6) : .85, a = i === 3 && s.et >= 4 ? .35 : vez ? 1 : .55;
        if (i === 2) { c.globalAlpha = a; this.cobertor(ox * W - 7 * U * k, oy * H - 5 * U * k, 14 * U * k, 10 * U * k); c.globalAlpha = 1; }
        else em(ch[i], ox * W, oy * H, 13 * U * k, 0, a);
      }
      if (s.luz < 1) { c.fillStyle = `rgba(5,8,40,${.6 * (1 - s.luz)})`; c.fillRect(0, 0, W, H); }
      if (s.dorme > .3) em('💤', dx + .5 * S, dy - 1.05 * S - Math.sin(s.t * 2) * 2 * U, 10 * U, 0, s.dorme);
    },
    toque(s, x, y) {
      if (s.et >= 4) return;
      const [ox, oy] = this.obj(s.et);
      if (Math.hypot(ox * W - x, oy * H - y) > 24 * U) return;
      if (s.et === 0) { s.bebe = 1.4; som.nham(); } else if (s.et === 3) som.ninar(); else som.pop();
      s.et++; ponto(ox * W, oy * H);
    },
    dica(s) { if (s.et >= 4) return null; const [ox, oy] = this.obj(s.et); return [ox * W, oy * H]; } },

  /* Festa: soltar fogos tocando no céu, com os 5 dinos dançando */
  fogos: { ic: '🎆', base: 40,
    ini() {}, upd() {},
    des(s) {
      fundo(true);
      for (let i = 0; i < 40; i++) circ((i * .137 % 1) * W, (i * .291 % 1) * H * .7, (.3 + (i % 3) * .2) * U * (1 + .3 * Math.sin(s.t * 3 + i)), '#fff');
      em('🌙', W * .82, H * .14, 12 * U); chao(H * .8, amb() === AMB.vulcao ? '#3e2723' : '#1b5e20');
      for (let i = 0; i < 5; i++) dino((i + .5) / 5 * W, H * .88 - Math.abs(Math.sin(s.t * 5 + i)) * 4 * U, 9 * U, { tipo: i, boca: Math.sin(s.t * 3 + i) > .5 ? .6 : 0 });
      carro(W * .5, H * .99, 24 * U, save.cor, s.t * 3);
    },
    toque(s, x, y) { fogos(x, y); som.fogo(); ponto(x, y); },
    dica: () => [W * .5, H * .35] },

  /* Estacionamento: tocar e o carro estaciona na vaga piscando */
  estacionar: { ic: '🅿️', base: 12,
    vaga(i) { return [(.2 + .3 * (i % 3)) * W, (i < 3 ? .24 : .48) * H]; },
    ini(s) { s.v = [null, null, null, null, null, null]; this.novo(s); },
    novo(s) {
      let livres = s.v.map((v, i) => v ? -1 : i).filter(i => i >= 0);
      if (!livres.length) { s.v = s.v.map(() => null); livres = [0, 1, 2, 3, 4, 5]; }
      s.alvo = livres[sorteio(livres.length)];
      s.car = Object.assign({ x: W * .5, y: H * 1.15, ang: 0, est: 'entra', p: 0, esp: 0 }, novoCarro(s));
    },
    upd(s, dt) {
      const k = s.car;
      if (k.est === 'entra') { k.y += (H * .84 - k.y) * Math.min(1, dt * 4); if (Math.abs(k.y - H * .84) < 2) { k.y = H * .84; k.est = 'espera'; } }
      else if (k.est === 'vai') {
        k.p = Math.min(1, k.p + dt / 1.3);
        const [vx, vy] = this.vaga(s.alvo), p = k.p, q = 1 - p, sx = W * .5, sy = H * .84;
        const nx = q * q * q * sx + 3 * q * q * p * sx + 3 * q * p * p * vx + p * p * p * vx;
        const ny = q * q * q * sy + 3 * q * q * p * (H * .62) + 3 * q * p * p * (vy + H * .16) + p * p * p * vy;
        if (Math.hypot(nx - k.x, ny - k.y) > .3) k.ang = Math.atan2(nx - k.x, -(ny - k.y));
        k.x = nx; k.y = ny;
        if (p >= 1) { k.est = 'ok'; k.esp = .7; s.v[s.alvo] = { cor: k.cor, mod: k.mod }; som.buzina(k.mod); ponto(vx, vy); }
      } else if (k.est === 'ok') { k.esp -= dt; if (k.esp <= 0 && !fim) this.novo(s); }
    },
    des(s) {
      cenario(H * .12);
      c.fillStyle = '#546e7a'; c.fillRect(0, H * .12, W, H * .88);
      for (let i = 0; i < 6; i++) {
        const [x, y] = this.vaga(i), w = 24 * U, h = 34 * U;
        c.strokeStyle = '#fff'; c.lineWidth = U; c.strokeRect(x - w / 2, y - h / 2, w, h);
        if (i === s.alvo && s.car.est !== 'ok') { c.fillStyle = `rgba(255,214,0,${.35 + .25 * Math.sin(s.t * 6)})`; c.fillRect(x - w / 2, y - h / 2, w, h); em('🅿️', x, y, 10 * U); }
        if (s.v[i]) carroTopo(x, y, 11 * U, s.v[i].cor, s.v[i].mod);
      }
      const k = s.car;
      if (k.est !== 'ok') { c.save(); c.translate(k.x, k.y); c.rotate(k.ang); carroTopo(0, 0, 11 * U, k.cor, k.mod); c.restore(); }
    },
    toque(s) { if (s.car.est === 'espera') { s.car.est = 'vai'; s.car.p = 0; som.motor(); } },
    dica(s) { return s.car.est === 'espera' ? this.vaga(s.alvo) : null; } },

  /* Semáforo: o carro para no vermelho; tocar no semáforo deixa verde e ele passa */
  semaforo: { ic: '🚦', base: 12,
    ini(s) { this.novo(s); },
    novo(s) { s.car = Object.assign({ x: -.25 * W, v: 0, giro: 0 }, novoCarro(s)); s.luz = 0; s.lt = 0; },
    upd(s, dt) {
      const k = s.car, pare = W * .42;
      if (s.luz === 1) { s.lt -= dt; if (s.lt <= 0) { s.luz = 2; som.ding(); } }
      const alvo = s.luz === 2 ? 60 * U : k.x < pare ? Math.min(45 * U, (pare - k.x) * 2.5) : 0;
      k.v += (alvo - k.v) * Math.min(1, dt * 3); k.x += k.v * dt; k.giro += k.v * dt / (4 * U);
      if (s.luz === 2 && k.x > W * 1.3) { som.buzina(k.mod); ponto(W * .8, H * .6); if (!fim) this.novo(s); }
    },
    des(s) {
      cenario(H * .62);
      c.fillStyle = '#455a64'; c.fillRect(0, H * .68, W, H * .2);
      c.fillStyle = '#fff'; for (let x = 0; x < W; x += 14 * U) c.fillRect(x, H * .775, 7 * U, U);
      for (let k = 0; k < 5; k++) c.fillRect(W * .58 + k * 3 * U, H * .69, 1.6 * U, H * .18);
      c.fillStyle = '#bdbdbd'; c.fillRect(0, H * .88, W, H * .12);
      const px = W * .76;
      rr(px - U, H * .3, 2 * U, H * .4, U, '#424242'); rr(px - 6 * U, H * .14, 12 * U, 31 * U, 3 * U, '#263238');
      ['#f44336', '#ffeb3b', '#4caf50'].forEach((cor, i) => {
        const y = H * .14 + (5.5 + i * 10) * U;
        if (i === s.luz) { c.globalAlpha = .35; circ(px, y, 6.5 * U, cor); c.globalAlpha = 1; circ(px, y, 4 * U, cor); } else circ(px, y, 4 * U, '#555');
      });
      carro(s.car.x, H * .86, 30 * U, s.car.cor, s.car.giro, { mod: s.car.mod });
      if (s.luz === 0) dino(((s.t * 12 * U) % (W * 1.4)) - W * .2, H * .99, 8 * U, { anda: true });
    },
    toque(s) { if (s.luz === 0 && s.car.x > W * .1) { s.luz = 1; s.lt = .6; som.pop(); } },
    dica(s) { return s.luz === 0 && s.car.x > W * .1 && s.car.v < 5 * U ? [W * .76, H * .28] : null; } },

  /* Posto de gasolina: segurar o dedo (ou tocar várias vezes) para encher o tanque */
  posto: { ic: '⛽', base: 8,
    ini(s) { s.segura = false; this.novo(s); },
    novo(s) { s.car = Object.assign({ x: -.3 * W, est: 'entra', giro: 0 }, novoCarro(s)); s.tanque = 0; s.gl = 0; },
    upd(s, dt) {
      const k = s.car, pare = W * .38;
      if (k.est === 'entra') { const nx = k.x + (pare - k.x) * Math.min(1, dt * 2.5); k.giro += (nx - k.x) / (4 * U); k.x = nx; if (pare - k.x < 2) k.est = 'enche'; }
      else if (k.est === 'enche') {
        if (s.segura) { s.tanque = Math.min(1, s.tanque + dt / 2.2); s.gl -= dt; if (s.gl <= 0) { s.gl = .2; som.glub(); bolha(k.x, H * .56); } }
        if (s.tanque >= 1) { k.est = 'sai'; som.buzina(k.mod); ponto(k.x, H * .6); }
      } else if (k.est === 'sai') { k.x += 70 * U * dt; k.giro += 70 * U * dt / (4 * U); if (k.x > W * 1.3 && !fim) this.novo(s); }
    },
    des(s) {
      cenario(H * .62);
      rr(W * .04, H * .2, W * .92, 6 * U, U, '#e53935'); rr(W * .1, H * .2 + 6 * U, 2.5 * U, H * .5, U, '#eeeeee'); rr(W * .88, H * .2 + 6 * U, 2.5 * U, H * .5, U, '#eeeeee');
      c.fillStyle = '#78909c'; c.fillRect(0, H * .7, W, H * .3);
      const px = W * .7, py = H * .42;
      rr(px, py, 18 * U, 32 * U, 3 * U, '#ffd600'); rr(px + 3 * U, py + 3 * U, 12 * U, 8 * U, U, '#263238');
      rr(px + 3 * U, py + 14 * U, 12 * U, 14 * U, U, '#fff');
      c.fillStyle = '#43a047'; c.fillRect(px + 3 * U, py + 28 * U - 14 * U * s.tanque, 12 * U, 14 * U * s.tanque);
      em('⛽', px + 9 * U, py + 7 * U, 6 * U);
      const k = s.car;
      if (k.est === 'enche') {
        c.strokeStyle = '#263238'; c.lineWidth = 1.4 * U; c.beginPath(); c.moveTo(px, py + 20 * U); c.quadraticCurveTo(px - 10 * U, H * .9, k.x - 6 * U, H * .8); c.stroke();
        rr(k.x - 16 * U, H * .64, 32 * U, 5 * U, 2.5 * U, 'rgba(0,0,0,.25)');
        if (s.tanque > 0) { c.fillStyle = '#43a047'; rrp(k.x - 16 * U, H * .64, Math.max(5 * U, 32 * U * s.tanque), 5 * U, 2.5 * U); c.fill(); }
      }
      carro(k.x, H * .86, 32 * U, k.cor, k.giro, { mod: k.mod });
    },
    toque(s) { s.segura = true; if (s.car.est === 'enche') s.tanque = Math.min(1, s.tanque + .06); },
    solta(s) { s.segura = false; },
    dica(s) { return s.car.est === 'enche' ? [W * .7 + 9 * U, H * .42 + 18 * U] : null; } },

  /* Oficina: levar os pneus até o carro; com todos no lugar, ele desce e vai embora */
  rodas: { ic: '🔧', base: 10,
    L: () => Math.min(W * .62, 44 * U),
    ini(s) { this.novo(s); },
    novo(s) {
      const k = novoCarro(s), R = RODAS[k.mod], L = this.L(), xs = R.length === 3 ? [.2, .5, .8] : [.3, .7];
      s.car = Object.assign({ x: W * .5, est: 'espera', t: 0, giro: 0 }, k);
      s.itens = R.map(([dx, r], i) => ({ dx, r, x: xs[i], y: .88, hx: xs[i], hy: .88, tx: (W * .5 + dx * L) / W, ty: (H * .6 - r * L) / H, est: 'casa' }));
      s.mao = null;
    },
    upd(s, dt) {
      levar.upd(s, dt, it => { som.crack(); ponto(it.x * W, it.y * H); });
      const k = s.car;
      if (k.est === 'espera' && s.itens.every(i => i.est === 'ok')) { k.est = 'desce'; k.t = 0; }
      if (k.est === 'desce') { k.t += dt; if (k.t > .7) { k.est = 'sai'; som.buzina(k.mod); } }
      if (k.est === 'sai') { k.x += 60 * U * dt; k.giro += 60 * U * dt / (4 * U); if (k.x > W * 1.5 && !fim) this.novo(s); }
    },
    des(s) {
      c.fillStyle = '#ffe0b2'; c.fillRect(0, 0, W, H); em('🔧', W * .12, H * .12, 9 * U, -.5); em('🔩', W * .88, H * .14, 9 * U);
      rr(W * .3, H * .08, W * .4, 10 * U, 2 * U, '#8d6e63'); em('🔧', W * .5, H * .08 + 5 * U, 6 * U);
      chao(H * .64, '#b0bec5');
      const k = s.car, L = this.L(), sobe = k.est === 'espera' ? 1 : k.est === 'desce' ? 1 - Math.min(1, k.t / .4) : 0, gy = H * .64 - H * .04 * sobe;
      if (sobe > 0) rr(k.x - 4 * U, gy - 2 * U, 8 * U, H * .64 - gy + 2 * U, U, '#e53935');
      carro(k.x, gy, L, k.cor, k.giro, { mod: k.mod, semRodas: true });
      for (const it of s.itens) {
        const x = k.x + it.dx * L, y = gy - it.r * L;
        if (it.est === 'ok') roda(x, y, it.r * L, k.giro);
        else { c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = .6 * U; c.setLineDash([1.5 * U, 1.5 * U]); c.beginPath(); c.arc(x, y, it.r * L, 0, 7); c.stroke(); c.setLineDash([]); }
      }
      for (const it of s.itens) if (it.est !== 'ok') roda(it.x * W, it.y * H, it.r * L * (it.est === 'mao' ? 1.15 : 1), it.est === 'voa' ? s.t * 8 : 0);
    },
    toque: levar.toque, mover: levar.mover, solta: levar.solta,
    dica(s) { const it = s.itens.find(i => i.est === 'casa'); return it ? [it.x * W, it.y * H] : null; } },

  /* Pegadas: tocar na próxima pegada e o dino vai seguindo até o ninho */
  pegadas: { ic: '🐾', base: 16, passo: 8,
    ini(s) { this.trilha(s); s.dx = .5; s.dy = .97; },
    trilha(s) {
      const f = Math.random() * 6;
      s.p = []; for (let i = 0; i < 8; i++) s.p.push({ x: .5 + Math.sin(i * 1.1 + f) * .28, y: .88 - i * .08, ok: 0 });
      s.i = 0; s.fimT = 0;
    },
    upd(s, dt) {
      const alvo = s.i > 0 ? s.p[s.i - 1] : { x: .5, y: .97 };
      const ax = alvo.x - s.dx, ay = alvo.y - s.dy; s.anda = Math.hypot(ax, ay) > .01;
      s.dx += ax * Math.min(1, dt * 3); s.dy += ay * Math.min(1, dt * 3); if (Math.abs(ax) > .01) s.vira = ax < 0;
      if (s.i >= 8 && !fim) { s.fimT += dt; if (s.fimT > 1.8) { this.trilha(s); s.dx = .5; s.dy = .97; } }
    },
    des(s) {
      cenario(H * .16);
      const n = s.p[7], nx = n.x * W, ny = (n.y - .09) * H;
      elip(nx, ny + 3 * U, 11 * U, 4 * U, '#8d6e63');
      if (s.i >= 8) em('🐣', nx, ny - 3 * U - Math.abs(Math.sin(s.t * 7)) * 3 * U, 12 * U); else em('🥚', nx, ny - U, 10 * U);
      s.p.forEach((p, i) => pegada(p.x * W, p.y * H, (i === s.i ? 3 + .4 * Math.sin(s.t * 6) : 3) * U, p.ok ? .3 : i === s.i ? 1 : .7));
      dino(s.dx * W, s.dy * H, 12 * U, { anda: s.anda, vira: s.vira });
    },
    toque(s, x, y) {
      if (s.i >= 8) return;
      const p = s.p[s.i];
      if (Math.hypot(p.x * W - x, p.y * H - y) < 20 * U) { p.ok = 1; s.i++; som.pop(); ponto(x, y); if (s.i === 8) som.rugidinho(); }
    },
    dica(s) { if (s.i >= 8) return null; const p = s.p[s.i]; return [p.x * W, p.y * H]; } },

  /* Pula-pula: o dino corre e espera perto do tronco; cada toque é um pulo */
  pulapula: { ic: '🐸', base: 15,
    ini(s) { s.sc = 0; s.j = 0; s.v = 0; s.ob = []; let x = W * .9; for (let i = 0; i < s.meta; i++) { x += (50 + Math.random() * 25) * U; s.ob.push({ x, ok: 0 }); } },
    upd(s, dt) {
      const dx = W * .3, prox = s.ob.find(o => !o.ok), rel = prox ? prox.x - s.sc - dx : 1e9;
      const alvo = s.j > 0 ? 45 * U : (rel < 16 * U && rel > -6 * U) ? 0 : 32 * U;
      s.v += (alvo - s.v) * Math.min(1, dt * 6); s.sc += s.v * dt;
      if (s.j > 0) { s.j += dt / .75; if (s.j >= 1) s.j = 0; }
      for (const o of s.ob) if (!o.ok && o.x - s.sc < dx - 9 * U) { o.ok = 1; ponto(dx, H * .55); }
    },
    obst(x, y) {
      const a = amb();
      if (a === AMB.neve) em('⛄', x, y - 7 * U, 14 * U);
      else if (a === AMB.vulcao) { elip(x, y - 4 * U, 8 * U, 5 * U, '#616161'); elip(x - 2 * U, y - 6 * U, 3 * U, 1.5 * U, '#9e9e9e'); }
      else { rr(x - 7 * U, y - 7 * U, 14 * U, 7 * U, 3.5 * U, '#8d6e63'); circ(x + 5.5 * U, y - 3.5 * U, 3 * U, '#d7ccc8'); circ(x + 5.5 * U, y - 3.5 * U, 1.5 * U, '#a1887f'); }
    },
    des(s) {
      fundo(); chao(H * .66);
      const a = amb(), larg = W * 1.6;
      for (let k = 0; k < 5; k++) { const x = (((k * larg / 5 - s.sc * .5) % larg) + larg) % larg - W * .2; em(a.deco[k], x, H * .62, (k % 2 ? 13 : 18) * U); }
      const gy = H * .82;
      c.fillStyle = 'rgba(0,0,0,.07)'; c.fillRect(0, gy, W, 2 * U);
      for (const o of s.ob) { const x = o.x - s.sc; if (x > -20 * U && x < W + 20 * U) { this.obst(x, gy); if (!o.ok) em('⭐', x, gy - 30 * U + Math.sin(s.t * 4 + o.x) * U, 7 * U); } }
      dino(W * .3, gy - Math.sin(s.j * Math.PI) * 24 * U, 14 * U, { anda: s.v > 3 * U && s.j === 0, boca: s.j > 0 ? .5 : 0 });
    },
    toque(s) { if (s.j === 0) { s.j = .001; s.v = Math.max(s.v, 35 * U); som.pulo(); } },
    dica(s) { return s.v < 3 * U && s.j === 0 ? [W * .5, H * .5] : null; } }
};

/* ---------- Telas ---------- */
const LOGO = `<svg viewBox="0 0 300 230" xmlns="http://www.w3.org/2000/svg">
  <g fill="#43a047" stroke="#fff" stroke-width="5" stroke-linejoin="round">
    <path d="M40 62l18-34 18 34zM88 50l20-40 20 40zM172 50l20-40 20 40zM224 62l18-34 18 34z"/></g>
  <g font-family="Arial Black,Arial Rounded MT Bold,Arial,sans-serif" font-weight="900" font-size="150" text-anchor="middle"
     stroke="#fff" stroke-width="14" stroke-linejoin="round" paint-order="stroke">
    <text x="82" y="172" fill="#1e88ff">G</text><text x="212" y="172" fill="#ff7a00">M</text></g>
  <g><circle cx="82" cy="196" r="26" fill="#263238" stroke="#fff" stroke-width="5"/><circle cx="82" cy="196" r="11" fill="#cfd8dc"/>
     <circle cx="212" cy="196" r="26" fill="#263238" stroke="#fff" stroke-width="5"/><circle cx="212" cy="196" r="11" fill="#cfd8dc"/></g></svg>`;
const rostoSvg = j => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="68" r="44" fill="#ffd2a6" stroke="#fff" stroke-width="5"/>
  <circle cx="36" cy="84" r="8" fill="#ffab91" opacity=".7"/><circle cx="84" cy="84" r="8" fill="#ffab91" opacity=".7"/>
  <circle cx="44" cy="72" r="6" fill="#222"/><circle cx="76" cy="72" r="6" fill="#222"/><circle cx="46" cy="70" r="2" fill="#fff"/><circle cx="78" cy="70" r="2" fill="#fff"/>
  <path d="M42 88q18 18 36 0" fill="none" stroke="#222" stroke-width="5" stroke-linecap="round"/>
  <path d="M14 58a46 46 0 0 1 92 0z" fill="${JOG[j].cor}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
  <rect x="58" y="50" width="58" height="13" rx="6.5" fill="${JOG[j].cor}" stroke="#fff" stroke-width="4"/>
  <text x="56" y="48" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="30" text-anchor="middle" fill="#fff">${JOG[j].letra}</text></svg>`;

let mundoAtual = 0;
function mostrar(id) {
  tela = id;
  $$('.tela').forEach(t => t.classList.toggle('on', t.id === id));
  if (id !== 'jogo') { F = null; mostraFim = false; }
  if (id === 'jogo') ajustar();
  if (id === 'menu') { $('#bQuem').innerHTML = rostoSvg(jog); $('#placar').textContent = '⭐ ' + FASES.reduce((a, f, i) => a + est(i), 0) + ' / ' + FASES.length * 3; }
  if (id === 'mapa') montarMapa();
  if (id === 'mundo') montarMundo();
  if (id === 'album') montarAlbum();
  if (id === 'garagem') montarGaragem();
  if (id === 'dinos') montarDinos();
  if (id === 'pais') montarPais();
}
function proximaFase() {
  const livres = FASES.map((f, i) => i).filter(faseLivre);
  const nova = livres.find(i => est(i) === 0);
  if (nova != null) return nova;
  return livres.reduce((m, i) => est(i) < est(m) ? i : m, livres[0]);
}
function montarMapa() {
  $('#mundos').innerHTML = MUNDOS.map((m, i) => {
    const st = FASES.reduce((a, f, k) => a + (f.mundo === i ? est(k) : 0), 0);
    return mundoLivre(i)
      ? `<button class="mundoCard" data-mundo="${i}" style="background:${m.cor}"><span>${m.ic}</span><div><b>${m.nome}</b><small>⭐ ${st} / ${m.fases.length * 3}</small></div></button>`
      : `<button class="mundoCard trancada" style="background:${m.cor}"><span>🔒</span><div><b>${m.nome}</b></div></button>`;
  }).join('');
}
function montarMundo() {
  const m = MUNDOS[mundoAtual];
  $('#tituloMundo').textContent = m.ic + ' ' + m.nome;
  $('#mundo').style.background = `linear-gradient(${m.cor}, #e3f2fd)`;
  $('#fases').innerHTML = FASES.map((f, i) => [f, i]).filter(([f]) => f.mundo === mundoAtual).map(([f, i]) => faseLivre(i)
    ? `<button class="fase" data-fase="${i}"><i>${f.j + 1}</i>${MEC[f.mec].ic}<small>${'⭐'.repeat(est(i)) + '☆'.repeat(3 - est(i))}</small></button>`
    : `<button class="fase trancada">🔒</button>`).join('');
}
function montarAlbum() {
  $('#figs').innerHTML = MUNDOS.map((m, mi) => `<div class="secao">${m.ic} ${m.nome}</div>` +
    FASES.map((f, i) => [f, i]).filter(([f]) => f.mundo === mi).map(([f, i]) => `<div class="fase fig ${est(i) ? '' : 'falta'}">${f.fig}</div>`).join('')).join('');
}
function miniaturas(sel, n, desenha) {
  $$(sel + ' canvas').forEach((cnv, i) => comCanvas(cnv, () => { c.clearRect(0, 0, W, H); desenha(i); }));
}
function montarGaragem() {
  $('#modelos').innerHTML = MODELOS.map((m, i) => `<button class="escolha ${i === save.modelo ? 'sel' : ''}" data-modelo="${i}"><canvas></canvas></button>`).join('');
  $('#cores').innerHTML = CORES.map(k => `<button class="cor ${k === save.cor ? 'sel' : ''}" data-cor="${k}" style="background:${k}"></button>`).join('');
  $('#roupas').innerHTML = ['🧢', '⛑️', '🦖'].map((e, i) => `<button class="bola ${i === save.roupa ? 'sel' : ''}" data-roupa="${i}">${e}</button>`).join('');
  miniaturas('#modelos', 5, i => carro(W * .5, H * .8, W * .95, save.cor, 0, { mod: i }));
}
function montarDinos() {
  $('#tipos').innerHTML = TIPOS.map((t, i) => `<button class="escolha ${i === save.dino ? 'sel' : ''}" data-tipo="${i}"><canvas></canvas></button>`).join('');
  $('#dcores').innerHTML = [null, ...DCOR].map(k => `<button class="cor ${k === save.dcor ? 'sel' : ''}" data-dcor="${k || ''}" style="background:${k || TIPOS[save.dino].cor}">${k ? '' : '⭐'}</button>`).join('');
  miniaturas('#tipos', 5, i => dino(W * .5, H * .93, H * .5, { tipo: i, cor: i === save.dino && save.dcor ? save.dcor : null }));
}
let certa = 0;
function montarPais() {
  const a = 3 + sorteio(7), b = 3 + sorteio(7); certa = a + b;
  $('#pergunta').textContent = a + ' + ' + b; $('#resposta').value = '';
  $('#conta').hidden = false; $('#opcoes').hidden = true;
  $('#oSom').checked = cfg.som; $('#oMusica').checked = cfg.musica; $('#oTudo').checked = cfg.tudo;
}

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  ac();
  const d = b.dataset;
  if (d.jog) { carregar(d.jog); som.buzina(); falar(JOG[jog].nome + '!'); mostrar('menu'); }
  else if (d.ir) { som.pop(); mostrar(d.ir); }
  else if (d.mundo) { som.pop(); mundoAtual = +d.mundo; falar(MUNDOS[mundoAtual].nome + '!'); mostrar('mundo'); }
  else if (d.fase) { som.pop(); iniciarFase(+d.fase); }
  else if (d.cor) { save.cor = d.cor; gravar(); som.splash(); montarGaragem(); }
  else if (d.roupa) { save.roupa = +d.roupa; gravar(); som.pop(); montarGaragem(); }
  else if (d.modelo) { save.modelo = +d.modelo; gravar(); som.buzina(); falar(MODELOS[save.modelo] + '!'); montarGaragem(); }
  else if (d.tipo) { save.dino = +d.tipo; save.dcor = null; gravar(); som.rugidinho(); falar(TIPOS[save.dino].nome + '!'); montarDinos(); }
  else if (d.dcor != null && b.classList.contains('cor')) { save.dcor = d.dcor || null; gravar(); som.splash(); montarDinos(); }
  else if (b.classList.contains('trancada')) som.pop();
});
$('#bJogar').onclick = () => { som.buzina(); iniciarFase(proximaFase()); };
$('#bSair').onclick = () => mostrar('menu');
$('#bDeNovo').onclick = () => iniciarFase(idx);
$('#bMapa').onclick = () => { mundoAtual = FASES[idx].mundo; mostrar('mundo'); };
$('#bProxima').onclick = () => {
  const n = idx + 1;
  if (FASES[n] && FASES[n].mundo === FASES[idx].mundo && faseLivre(n)) iniciarFase(n); else mostrar('mapa');
};
$('#bConta').onclick = () => { if (+$('#resposta').value === certa) { $('#conta').hidden = true; $('#opcoes').hidden = false; } else montarPais(); };
const guardaCfg = () => { cfg = { som: $('#oSom').checked, musica: $('#oMusica').checked, tudo: $('#oTudo').checked }; gravarEm('gm_cfg', cfg); };
for (const id of ['#oSom', '#oMusica', '#oTudo']) $(id).onchange = guardaCfg;
$('#bTrocar').onclick = () => mostrar('quem');
$('#bZerar').onclick = () => {
  if (!confirm('Zerar todo o progresso de ' + JOG[jog].nome + '?')) return;
  localStorage.removeItem('gm_save_' + jog); carregar(jog); mostrar('menu');
};

/* Botão "voltar" do Android: volta uma tela; no menu, sai do jogo */
window.appVoltar = () => {
  if (['menu', 'quem', 'logo', 'abertura'].includes(tela)) return false;
  if (tela === 'mundo') mostrar('mapa');
  else if (tela === 'jogo') { mundoAtual = FASES[idx].mundo; mostrar('mundo'); }
  else mostrar('menu');
  return true;
};

/* ---------- Abertura ---------- */
$$('.gmlogo').forEach(d => d.innerHTML = LOGO);
$$('.rosto').forEach(b => b.innerHTML = rostoSvg(b.dataset.jog));
carregar('gabriel');
function irQuem() { if (tela === 'logo') mostrar('quem'); }
setTimeout(() => { mostrar('logo'); som.rugido(); setTimeout(som.buzina, 900); setTimeout(irQuem, 3500); }, 3000);
$('#logo').onclick = () => { som.rugido(); som.buzina(); irQuem(); };
requestAnimationFrame(quadro);
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
