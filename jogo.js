/* GM – Gabriel e Matheus na Terra dos Dinos · EG Gamer X
   Jogo para 2 e 3 anos: nunca perde, sem tempo, sem texto, 100% offline. */
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
const FIGURINHAS = ['🦕', '🦖', '🐣', '🐊', '🏅', '🦎', '🎈', '🐢', '🦤', '🦣', '🐉', '🏆'];

/* ---------- Dados salvos (cada criança tem o seu) ---------- */
const ler = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
const gravarEm = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
let cfg = Object.assign({ som: true, musica: true, tudo: false }, ler('gm_cfg'));
let jog = 'gabriel', save = null;
function carregar(j) {
  jog = j;
  save = Object.assign({ estrelas: [], cor: JOG[j].cor, roupa: 0 }, ler('gm_save_' + j));
  while (save.estrelas.length < FASES.length) save.estrelas.push(0);
}
const gravar = () => gravarEm('gm_save_' + jog, save);

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
const som = {
  pop: S(() => nota(500, .12, 'sine', .25, 0, 1100)),
  ding: S(() => { nota(880, .15, 'triangle', .18); nota(1320, .25, 'triangle', .18, .09); }),
  buzina: S(() => { for (const t of [0, .26]) { nota(440, .2, 'square', .1, t); nota(349, .2, 'square', .1, t); } }),
  rugido: S(() => { nota(170, .9, 'sawtooth', .22, 0, 55); nota(110, .9, 'square', .1, 0, 40); ruido(.9, .25, 500); }),
  rugidinho: S(() => { nota(420, .35, 'sawtooth', .14, 0, 200); ruido(.3, .08, 1200); }),
  festa: S(() => [523, 659, 784, 1047, 1319].forEach((f, i) => nota(f, .25, 'triangle', .18, i * .11))),
  splash: S(() => { ruido(.3, .25, 1800); nota(300, .2, 'sine', .15, 0, 120); }),
  crack: S(() => { ruido(.08, .3, 3000); nota(900, .06, 'square', .08); }),
  motor: S(() => nota(90, .15, 'sawtooth', .16, 0, 160)),
  pulo: S(() => nota(300, .3, 'sine', .2, 0, 800)),
  fogo: S(() => { ruido(.5, .25, 1500); nota(1200, .4, 'sine', .1, 0, 300); })
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
let c = cv.getContext('2d'), W = 1, H = 1, U = 1;
function ajustar() {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  W = document.body.clientWidth; H = document.body.clientHeight; U = Math.min(W, H) / 100;
  cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0);
}
addEventListener('resize', ajustar); ajustar();

function circ(x, y, r, cor) { c.fillStyle = cor; c.beginPath(); c.arc(x, y, Math.max(0, r), 0, 7); c.fill(); }
function rrp(x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function rr(x, y, w, h, r, cor) {
  rrp(x, y, w, h, r); c.fillStyle = cor; c.fill();
  c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = Math.max(1, w * .012); c.stroke();
}
function em(ch, x, y, s, rot = 0, alfa = 1, vira = false) {
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (vira) c.scale(-1, 1);
  c.globalAlpha = alfa; c.fillStyle = '#000'; c.font = s + 'px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(ch, 0, 0); c.restore();
}
function fundo(noite) {
  const g = c.createLinearGradient(0, 0, 0, H);
  if (noite) { g.addColorStop(0, '#0b1040'); g.addColorStop(1, '#3a2a7a'); }
  else { g.addColorStop(0, '#6ec6ff'); g.addColorStop(1, '#d4f1ff'); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (!noite) { circ(W * .84, H * .13, 8 * U, '#ffe14d'); em('☁️', W * .25, H * .14, 14 * U); em('☁️', W * .62, H * .24, 9 * U); }
}
function chao(y, cor = '#5cc94a') {
  c.fillStyle = cor; c.fillRect(0, y, W, H - y);
  c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(0, y, W, 1.2 * U);
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
/* Carro de lado: x = centro, y = chão, L = comprimento */
function carro(x, y, L, cor, giro = 0) {
  const h = L * .26, by = y - L * .14 - h;
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(x, y, L * .5, L * .05, 0, 0, 7); c.fill();
  rr(x - L * .3, by - L * .22, L * .52, L * .3, L * .1, cor);
  rr(x - L * .24, by - L * .17, L * .4, L * .19, L * .06, '#c8ecff');
  piloto(x - L * .04, by - L * .06, L * .085);
  rr(x - L * .5, by, L, h, L * .1, cor);
  c.fillStyle = 'rgba(255,255,255,.28)'; rrp(x - L * .44, by + L * .035, L * .88, L * .05, L * .025); c.fill();
  circ(x + L * .46, by + h * .45, L * .035, '#fff59d');
  roda(x - L * .28, y - L * .11, L * .11, giro); roda(x + L * .28, y - L * .11, L * .11, giro);
}
/* Carro visto de cima (aponta para cima) */
function carroTopo(x, y, w, cor) {
  const h = w * 1.7;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) rr(x + sx * w * .5 - w * .1, y + sy * h * .3 - w * .16, w * .2, w * .32, w * .06, '#263238');
  rr(x - w / 2, y - h / 2, w, h, w * .28, cor);
  rr(x - w * .36, y - h * .28, w * .72, h * .2, w * .1, '#c8ecff');
  rr(x - w * .36, y + h * .2, w * .72, h * .12, w * .08, '#c8ecff');
  piloto(x, y + h * .04, w * .2);
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
function particulas(dt) {
  for (const p of parts) {
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt;
    c.globalAlpha = cl(p.vida * 2, 0, 1);
    if (p.ch) em(p.ch, p.x, p.y, p.s * 3, 0, c.globalAlpha);
    else if (p.r) circ(p.x, p.y, p.s, p.cor);
    else { c.fillStyle = p.cor; c.fillRect(p.x, p.y, p.s * 1.6, p.s); }
  }
  c.globalAlpha = 1;
  parts = parts.filter(p => p.vida > 0);
  if (parts.length > 500) parts.splice(0, parts.length - 500);
}

/* ---------- Motor das fases ---------- */
let F = null, fs = null, idx = 0, fim = false, ocioso = 0, tela = 'abertura';
function iniciarFase(i) {
  idx = i; F = FASES[i]; fim = false; ocioso = 0; parts = [];
  let meta = F.fixo ? F.base : Math.round(F.base * (1 + .5 * Math.min(save.estrelas[i], 2)));   // cada estrela deixa a fase mais longa
  if (F.passo) meta = Math.ceil(meta / F.passo) * F.passo;
  fs = { t: 0, feito: 0, meta };
  F.ini(fs);
  $('#fim').hidden = true;
  mostrar('jogo');
}
function ponto(x, y) {
  if (fim) return;
  fs.feito++; som.ding(); festa(x, y, 12);
  if (fs.feito >= fs.meta) vencer();
}
function vencer() {
  if (fim) return;
  fim = true;
  save.estrelas[idx] = Math.min(3, save.estrelas[idx] + 1); gravar();
  for (let k = 0; k < 6; k++) setTimeout(() => festa(Math.random() * W, H * (.2 + Math.random() * .4), 22), k * 180);
  som.festa(); setTimeout(som.rugido, 500); setTimeout(som.buzina, 1300);
  setTimeout(() => {
    if (tela !== 'jogo' || !fim) return;
    $('#premio').textContent = FIGURINHAS[idx];
    $('#estrelas').textContent = '⭐'.repeat(save.estrelas[idx]) + '☆'.repeat(3 - save.estrelas[idx]);
    $('#fim').hidden = false;
    falar('Muito bem, ' + JOG[jog].nome + '!');
  }, 1500);
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
  const dt = Math.min(.05, (t - ult) / 1000 || 0); ult = t;
  if (tela === 'jogo' && F) {
    fs.t += dt; ocioso += dt;
    F.upd(fs, dt); F.des(fs); particulas(dt); barra();
    if (!fim && ocioso > 4) {      // mãozinha mostrando onde tocar
      const d = F.dica(fs);
      if (d) em('👆', d[0] + 3 * U, d[1] + 8 * U + Math.sin(fs.t * 6) * 2 * U, 14 * U, 0, .6 + .4 * Math.sin(fs.t * 6));
    }
  }
  requestAnimationFrame(quadro);
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

/* Arrastar (ou só tocar e soltar) um item: ele sempre voa para o lugar certo */
const levar = {
  toque(s, x, y) {
    let m = null, md = 17 * U;
    for (const it of s.itens) { if (it.est !== 'casa') continue; const d = Math.hypot(it.x * W - x, it.y * H - y); if (d < md) { md = d; m = it; } }
    if (m) { m.est = 'mao'; s.mao = m; som.pop(); }
  },
  mover(s, x, y) { if (s.mao) { s.mao.x = x / W; s.mao.y = y / H; } },
  solta(s) { if (s.mao) { s.mao.est = 'voa'; s.mao = null; } },
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
const refDino = () => ({ x: W * .5, y: H * .5, L: Math.min(W * .8, H * .55) });

const FASES = [
  /* 1 — Garagem: pintar o carrinho */
  { ic: '🎨', base: 6, fixo: true,
    ini(s) { s.cor = save.cor; s.us = []; s.pulo = 0; },
    lata(i) { return [(.2 + .3 * (i % 3)) * W, (i < 3 ? .73 : .89) * H]; },
    upd(s, dt) { s.pulo = Math.max(0, s.pulo - dt * 2.5); },
    des(s) {
      c.fillStyle = '#ffe0b2'; c.fillRect(0, 0, W, H); em('🔧', W * .15, H * .2, 10 * U, -.4); em('🛞', W * .85, H * .22, 12 * U);
      chao(H * .58, '#b0bec5');
      carro(W * .5, H * .56 - Math.sin(s.pulo * Math.PI) * 4 * U, Math.min(W * .8, H * .5), s.cor);
      for (let i = 0; i < 6; i++) {
        const [x, y] = this.lata(i);
        rr(x - 6 * U, y - 5 * U, 12 * U, 12 * U, 2 * U, '#cfd8dc');
        c.fillStyle = CORES[i]; c.beginPath(); c.ellipse(x, y - 5 * U, 5.4 * U, 2 * U, 0, 0, 7); c.fill();
        rrp(x - 6 * U, y - 1 * U, 12 * U, 5 * U, 1 * U); c.fill();
        if (s.us.includes(i)) em('⭐', x + 6 * U, y - 7 * U, 6 * U);
      }
    },
    toque(s, x, y) {
      for (let i = 0; i < 6; i++) {
        const [lx, ly] = this.lata(i);
        if (Math.hypot(lx - x, ly - y) < 13 * U) {
          s.cor = save.cor = CORES[i]; gravar(); s.pulo = 1; som.splash(); respingo(W * .5, H * .42, CORES[i], 26);
          if (!s.us.includes(i)) { s.us.push(i); ponto(lx, ly); }
          break;
        }
      }
    },
    dica(s) { for (let i = 0; i < 6; i++) if (!s.us.includes(i)) return this.lata(i); return null; } },

  /* 2 — Estrada dos ovos: o carro anda sozinho e segue o dedo */
  { ic: '🥚', base: 12,
    ini(s) { s.cx = .5; s.al = .5; s.ov = []; s.sp = 0; },
    upd(s, dt) {
      s.cx += (s.al - s.cx) * Math.min(1, dt * 10); s.sp -= dt;
      if (s.sp <= 0 && !fim) { s.sp = .9; s.ov.push({ x: .22 + Math.random() * .56, y: -.1, ch: Math.random() < .8 ? '🥚' : '⭐' }); }
      for (const o of s.ov) {
        o.y += dt * .3;
        if (!o.p && Math.abs(o.x - s.cx) * W < 15 * U && Math.abs(o.y - .8) * H < 11 * U) { o.p = 1; som.pop(); ponto(o.x * W, o.y * H); }
      }
      s.ov = s.ov.filter(o => !o.p && o.y < 1.1);
    },
    des(s) {
      c.fillStyle = '#5cc94a'; c.fillRect(0, 0, W, H); c.fillStyle = '#555d66'; c.fillRect(W * .1, 0, W * .8, H);
      c.fillStyle = '#ffd600'; c.fillRect(W * .1, 0, U, H); c.fillRect(W * .9 - U, 0, U, H);
      c.fillStyle = '#fff'; const p = H * .16, off = (s.t * .3 * H) % p;
      for (let y = -p + off; y < H; y += p) c.fillRect(W * .5 - U, y, 2 * U, p * .5);
      for (let k = 0; k < 4; k++) { const y = ((k * .3 + s.t * .3) % 1.2 - .1) * H; em(k % 2 ? '🌴' : '🌿', W * .05, y, 9 * U); em(k % 2 ? '🌿' : '🌴', W * .95, y + H * .12, 9 * U); }
      for (const o of s.ov) em(o.ch, o.x * W, o.y * H, 11 * U);
      carroTopo(s.cx * W, H * .8, 15 * U, save.cor);
    },
    toque(s, x) { s.al = cl(x / W, .2, .8); }, mover(s, x) { s.al = cl(x / W, .2, .8); },
    dica: s => [(.5 + .25 * Math.sin(s.t * 2)) * W, H * .8] },

  /* 3 — Ovos chocando: tocar várias vezes até nascer */
  { ic: '🐣', base: 3,
    ini(s) { s.tq = 0; s.nasc = 0; s.bal = 0; s.d = sorteio(DINOS.length); },
    upd(s, dt) { s.bal = Math.max(0, s.bal - dt * 3); if (s.nasc > 0) { s.nasc -= dt; if (s.nasc <= 0 && !fim) { s.tq = 0; s.d++; s.nasc = 0; } else if (s.nasc <= 0) s.nasc = .01; } },
    des(s) {
      fundo(); chao(H * .66); const x = W * .5, y = H * .55;
      c.fillStyle = '#8d6e63'; c.beginPath(); c.ellipse(x, y + 15 * U, 24 * U, 7 * U, 0, 0, 7); c.fill();
      if (s.nasc > 0) {
        ovo(x - 14 * U, y + 10 * U, 16 * U, 14 * U, -.6, 3); ovo(x + 14 * U, y + 10 * U, 16 * U, 14 * U, .6, 3);
        em(DINOS[s.d % DINOS.length], x, y - Math.abs(Math.sin(s.t * 7)) * 4 * U, 30 * U);
      } else ovo(x, y, 26 * U, 34 * U, Math.sin(s.t * 40) * s.bal * .15, s.tq);
    },
    toque(s) {
      if (s.nasc > 0) return;
      s.tq++; s.bal = 1; som.crack(); respingo(W * .5, H * .55, '#fff8e1', 6);
      if (s.tq >= 6) { s.nasc = 1.8; som.rugidinho(); ponto(W * .5, H * .5); }
    },
    dica: s => s.nasc > 0 ? null : [W * .5, H * .55] },

  /* 4 — Lava-rápido: esfregar a lama do carro */
  faseEsfregar({ ic: '🧽', base: 14, ref: refCarro, x0: -.44, x1: .44, y0: -.5, y1: -.12,
    des() { c.fillStyle = '#b3e5fc'; c.fillRect(0, 0, W, H); em('🚿', W * .2, H * .16, 14 * U); em('💧', W * .8, H * .2, 10 * U); chao(H * .66, '#90a4ae'); const r = refCarro(); carro(r.x, r.y, r.L, save.cor); } }),

  /* 5 — Corrida com o T-Rex: tocar sem parar; todo mundo ganha medalha */
  { ic: '🏁', base: 30,
    ini(s) { s.v = 0; s.sc = 0; },
    upd(s, dt) { s.v = Math.max(0, s.v - dt * 1.5); s.sc += s.v * dt * 45 * U; },
    des(s) {
      fundo(); chao(H * .6); c.fillStyle = '#a1887f'; c.fillRect(0, H * .68, W, H * .2);
      const larg = W * 2.4;
      for (let k = 0; k < 6; k++) { const x = (((k * larg / 6 - s.sc) % larg) + larg) % larg - W * .2; em(k % 2 ? '🌴' : '🌋', x, H * .56, (k % 2 ? 16 : 20) * U); }
      const fx = W * .62 + (s.meta - s.feito) * 7 * U; if (fx < W * 1.3) em('🏁', fx + 14 * U, H * .66, 22 * U);
      const corre = s.v > .05 ? 1 : .25;
      em('🦖', W * .2, H * .74 - Math.abs(Math.sin(s.t * 9)) * 3 * U * corre, 28 * U, 0, 1, true);
      carro(W * .62, H * .86 - Math.abs(Math.sin(s.t * 14)) * U * corre, 34 * U, save.cor, s.sc / (4 * U));
      if (fim) { em('🏅', W * .2, H * .58, 12 * U); em('🏅', W * .62, H * .62, 12 * U); }
    },
    toque(s) {
      s.v = Math.min(3, s.v + .8); s.feito++; som.motor();
      parts.push({ x: W * .46, y: H * .84, vx: -30 * U, vy: -8 * U, g: 0, vida: .5, cor: 'rgba(160,140,120,.7)', s: 2.5 * U, r: 1 });
      if (s.feito >= s.meta) vencer();
    },
    dica: () => [W * .5, H * .45] },

  /* 6 — Comidinha: levar as frutas até o dino */
  { ic: '🍎', base: 8,
    ini(s) { s.boca = 0; s.itens = [.2, .5, .8].map(x => ({ ch: COMIDAS[sorteio(COMIDAS.length)], x, y: .8, hx: x, hy: .8, tx: .4, ty: .3, est: 'casa' })); },
    upd(s, dt) {
      s.boca = Math.max(0, s.boca - dt * 2.5);
      levar.upd(s, dt, it => {
        s.boca = 1; som.rugidinho(); ponto(it.x * W, it.y * H);
        const ativos = s.itens.filter(i => i !== it && i.est !== 'fora').length;
        if (s.feito + ativos < s.meta) Object.assign(it, { ch: COMIDAS[sorteio(COMIDAS.length)], x: it.hx, y: it.hy, est: 'casa' }); else it.est = 'fora';
      });
    },
    des(s) {
      fundo(); chao(H * .55); em('🌴', W * .12, H * .46, 22 * U); em('🌴', W * .9, H * .5, 18 * U);
      em('🦕', W * .52, H * .36, (46 + Math.sin(s.boca * Math.PI) * 6) * U);
      for (const it of s.itens) if (it.est !== 'fora' && it.est !== 'ok') em(it.ch, it.x * W, it.y * H, (it.est === 'mao' ? 20 : 16) * U);
    },
    toque: levar.toque, mover: levar.mover, solta: levar.solta,
    dica(s) { const it = s.itens.find(i => i.est === 'casa'); return it ? [it.x * W, it.y * H] : null; } },

  /* 7 — Balões: estourar os balões */
  { ic: '🎈', base: 15,
    novo(y) { return { x: .12 + Math.random() * .76, y: y == null ? 1.12 : y, cor: CORES[sorteio(7)], v: .07 + Math.random() * .06, f: Math.random() * 6 }; },
    bx: (s, b) => (b.x + Math.sin(s.t * 1.5 + b.f) * .02) * W,
    ini(s) { s.b = []; for (let i = 0; i < 6; i++) s.b.push(this.novo(.3 + Math.random() * .7)); },
    upd(s, dt) { for (const b of s.b) { b.y -= b.v * dt; if (b.y < -.12) Object.assign(b, this.novo()); } },
    des(s) {
      fundo(); chao(H * .9);
      for (const b of s.b) {
        const x = this.bx(s, b), y = b.y * H;
        c.strokeStyle = '#fff'; c.lineWidth = U * .4; c.beginPath(); c.moveTo(x, y + 10 * U); c.quadraticCurveTo(x + 3 * U, y + 16 * U, x, y + 22 * U); c.stroke();
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

  /* 8 — Ponte de pedras: cada toque é um pulo */
  { ic: '🪨', base: 10,
    ini(s) { s.i = 0; s.j = 0; s.cam = 0; },
    upd(s, dt) {
      if (s.j > 0) { s.j += dt / .45; if (s.j >= 1) { s.j = 0; s.i++; ponto(W * .35, H * .5); } }
      s.cam += (s.i + s.j - s.cam) * Math.min(1, dt * 6);
    },
    des(s) {
      fundo(); chao(H * .6, '#4fc3f7'); const sp = 30 * U, py = H * .68;
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

  /* 9 — Esconde-esconde: achar os dinos nas moitas */
  { ic: '🌳', base: 8, passo: 4,
    ini(s) { this.rod(s); },
    rod(s) { s.m = embaralha(DINOS).slice(0, 4).map((ch, i) => ({ ch, x: i % 2 ? .72 : .28, y: i < 2 ? .42 : .78, a: 0, ok: 0 })); s.esp = 0; },
    upd(s, dt) { for (const m of s.m) if (m.ok) m.a = Math.min(1, m.a + dt * 4); if (!fim && s.m.every(m => m.ok)) { s.esp += dt; if (s.esp > 1.3) this.rod(s); } },
    des(s) {
      fundo(); chao(H * .22, '#7ed56f');
      for (const m of s.m) {
        const x = m.x * W, y = m.y * H;
        if (m.ok) em(m.ch, x, y - m.a * 15 * U - Math.abs(Math.sin(s.t * 6)) * 2 * U, 18 * U);
        else em('👀', x, y - 12.5 * U + Math.sin(s.t * 2 + m.x * 9) * 1.5 * U, 8 * U);
        circ(x - 8 * U, y + 3 * U, 9 * U, '#2e7d32'); circ(x + 8 * U, y + 3 * U, 9 * U, '#2e7d32'); circ(x, y - U, 11 * U, '#388e3c'); circ(x - 3 * U, y - 4 * U, 3 * U, '#4caf50');
      }
    },
    toque(s, x, y) {
      let m = null, md = 19 * U;
      for (const b of s.m) { if (b.ok) continue; const d = Math.hypot(b.x * W - x, b.y * H - y); if (d < md) { md = d; m = b; } }
      if (m) { m.ok = 1; som.rugidinho(); ponto(m.x * W, m.y * H - 10 * U); }
    },
    dica(s) { const m = s.m.find(m => !m.ok); return m ? [m.x * W, m.y * H] : null; } },

  /* 10 — Banho no dino: esfregar a lama do dinossauro */
  faseEsfregar({ ic: '🛁', base: 16, ref: refDino, x0: -.3, x1: .3, y0: -.28, y1: .28,
    des() { fundo(); chao(H * .7, '#81d4fa'); em('💧', W * .15, H * .3, 9 * U); em('💧', W * .88, H * .42, 7 * U); const r = refDino(); em('🦕', r.x, r.y, r.L * .85); } }),

  /* 11 — Encaixe: cada dino na sua sombra */
  { ic: '🧩', base: 6, passo: 3,
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
      fundo(); chao(H * .55);
      for (const it of s.itens) {
        c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = U; c.setLineDash([2 * U, 2 * U]);
        c.beginPath(); c.arc(it.tx * W, it.ty * H, 13 * U, 0, 7); c.stroke(); c.setLineDash([]);
        if (it.est !== 'ok') em(it.ch, it.tx * W, it.ty * H, 19 * U, 0, .25);
      }
      for (const it of s.itens) em(it.ch, it.x * W, it.y * H + (it.est === 'ok' ? -Math.abs(Math.sin(s.t * 6)) * 2 * U : 0), (it.est === 'mao' ? 23 : 19) * U);
    },
    toque: levar.toque, mover: levar.mover, solta: levar.solta,
    dica(s) { const it = s.itens.find(i => i.est === 'casa'); return it ? [it.x * W, it.y * H] : null; } },

  /* 12 — Festa dos dinos: soltar fogos tocando no céu */
  { ic: '🎆', base: 20,
    ini() {}, upd() {},
    des(s) {
      fundo(true);
      for (let i = 0; i < 40; i++) circ((i * .137 % 1) * W, (i * .291 % 1) * H * .7, (.3 + (i % 3) * .2) * U * (1 + .3 * Math.sin(s.t * 3 + i)), '#fff');
      em('🌙', W * .82, H * .14, 12 * U); chao(H * .84, '#1b5e20');
      DINOS.forEach((d, i) => em(d, (i + .5) / DINOS.length * W, H * .88 - Math.abs(Math.sin(s.t * 5 + i)) * 4 * U, 9 * U));
      carro(W * .5, H * .99, 24 * U, save.cor);
    },
    toque(s, x, y) { fogos(x, y); som.fogo(); ponto(x, y); },
    dica: () => [W * .5, H * .35] }
];

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

function mostrar(id) {
  tela = id;
  $$('.tela').forEach(t => t.classList.toggle('on', t.id === id));
  if (id !== 'jogo') F = null;
  if (id === 'jogo') ajustar();
  if (id === 'menu') { $('#bQuem').innerHTML = rostoSvg(jog); $('#placar').textContent = '⭐ ' + save.estrelas.reduce((a, b) => a + b, 0) + ' / ' + FASES.length * 3; }
  if (id === 'mapa') montarMapa();
  if (id === 'album') montarAlbum();
  if (id === 'garagem') montarGaragem();
  if (id === 'pais') montarPais();
}
const feitas = () => save.estrelas.filter(e => e > 0).length;
function proximaFase() {
  const i = save.estrelas.findIndex(e => e === 0);
  return i >= 0 ? i : save.estrelas.indexOf(Math.min(...save.estrelas));
}
function montarMapa() {
  const livre = cfg.tudo ? FASES.length : feitas();
  $('#fases').innerHTML = FASES.map((f, i) => i <= livre
    ? `<button class="fase" data-fase="${i}"><i>${i + 1}</i>${f.ic}<small>${'⭐'.repeat(save.estrelas[i]) + '☆'.repeat(3 - save.estrelas[i])}</small></button>`
    : `<button class="fase trancada">🔒</button>`).join('');
}
function montarAlbum() {
  $('#figs').innerHTML = FIGURINHAS.map((f, i) => `<div class="fase fig ${save.estrelas[i] ? '' : 'falta'}">${f}</div>`).join('');
}
function montarGaragem() {
  $('#cores').innerHTML = CORES.map(k => `<button class="cor ${k === save.cor ? 'sel' : ''}" data-cor="${k}" style="background:${k}"></button>`).join('');
  $('#roupas').innerHTML = ['🧢', '⛑️', '🦖'].map((e, i) => `<button class="bola ${i === save.roupa ? 'sel' : ''}" data-roupa="${i}">${e}</button>`).join('');
  const p = $('#previa'), antes = c;
  c = p.getContext('2d'); c.clearRect(0, 0, p.width, p.height); carro(300, 320, 520, save.cor); c = antes;
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
  if (b.dataset.jog) { carregar(b.dataset.jog); som.buzina(); falar(JOG[jog].nome + '!'); mostrar('menu'); }
  else if (b.dataset.ir) { som.pop(); mostrar(b.dataset.ir); }
  else if (b.dataset.fase) { som.pop(); iniciarFase(+b.dataset.fase); }
  else if (b.dataset.cor) { save.cor = b.dataset.cor; gravar(); som.splash(); montarGaragem(); }
  else if (b.dataset.roupa) { save.roupa = +b.dataset.roupa; gravar(); som.pop(); montarGaragem(); }
  else if (b.classList.contains('trancada')) som.pop();
});
$('#bJogar').onclick = () => { som.buzina(); iniciarFase(proximaFase()); };
$('#bSair').onclick = () => mostrar('menu');
$('#bDeNovo').onclick = () => iniciarFase(idx);
$('#bMapa').onclick = () => mostrar('mapa');
$('#bProxima').onclick = () => idx + 1 < FASES.length ? iniciarFase(idx + 1) : mostrar('album');
$('#bConta').onclick = () => { if (+$('#resposta').value === certa) { $('#conta').hidden = true; $('#opcoes').hidden = false; } else montarPais(); };
const guardaCfg = () => { cfg = { som: $('#oSom').checked, musica: $('#oMusica').checked, tudo: $('#oTudo').checked }; gravarEm('gm_cfg', cfg); };
for (const id of ['#oSom', '#oMusica', '#oTudo']) $(id).onchange = guardaCfg;
$('#bTrocar').onclick = () => mostrar('quem');
$('#bZerar').onclick = () => {
  if (!confirm('Zerar todo o progresso de ' + JOG[jog].nome + '?')) return;
  localStorage.removeItem('gm_save_' + jog); carregar(jog); mostrar('menu');
};

/* Botão "voltar" do Android: volta para o menu; no menu, sai do jogo */
window.appVoltar = () => { if (['menu', 'quem', 'logo', 'abertura'].includes(tela)) return false; mostrar('menu'); return true; };

/* ---------- Abertura ---------- */
$$('.gmlogo').forEach(d => d.innerHTML = LOGO);
$$('.rosto').forEach(b => b.innerHTML = rostoSvg(b.dataset.jog));
carregar('gabriel');
function irQuem() { if (tela === 'logo') mostrar('quem'); }
setTimeout(() => { mostrar('logo'); som.rugido(); setTimeout(som.buzina, 900); setTimeout(irQuem, 3500); }, 3000);
$('#logo').onclick = () => { som.rugido(); som.buzina(); irQuem(); };
requestAnimationFrame(quadro);
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
