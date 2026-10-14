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
const FIGURINHAS = ['🦕', '🦖', '🐣', '🐊', '🏅', '🦎', '🎈', '🐢', '🦤', '🦣', '🐉', '🍓', '🎵', '🧼', '🌙', '🏆'];

/* ---------- Dados salvos (cada criança tem o seu) ---------- */
const ler = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
const gravarEm = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
let cfg = Object.assign({ som: true, musica: true, tudo: false }, ler('gm_cfg'));
let jog = 'gabriel', save = null;
function carregar(j) {
  jog = j;
  save = Object.assign({ estrelas: [], cor: JOG[j].cor, roupa: 0 }, ler('gm_save_' + j));
  if (save.estrelas.length === 12) { const festa = save.estrelas[11]; save.estrelas[11] = 0; while (save.estrelas.length < 16) save.estrelas.push(0); save.estrelas[15] = festa; }   // v0.2 → v0.3: a festa virou a fase 16
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
  fogo: S(() => { ruido(.5, .25, 1500); nota(1200, .4, 'sine', .1, 0, 300); }),
  nham: S(() => { nota(260, .07, 'square', .1); nota(200, .07, 'square', .1, .11); nota(160, .09, 'square', .08, .22); }),
  ninar: S(() => [784, 659, 523, 659, 587, 494, 523].forEach((f, i) => nota(f, .5, 'sine', .1, i * .35)))
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

/* Dinossauro desenhado e animado (olha para a direita). x, y = pés no chão; s = tamanho.
   o.boca 0..1 abre a boca · o.dorme 0..1 deita e fecha os olhos · o.anda mexe as pernas · o.vira olha para a esquerda */
const DCOR = ['#66bb6a', '#42a5f5', '#ffa726', '#ab47bc', '#ef5350', '#26c6da'];
function elip(x, y, rx, ry, cor, rot = 0) { c.fillStyle = cor; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fill(); }
function dino(x, y, s, o = {}) {
  const t = fs ? fs.t : performance.now() / 1000, cor = o.cor || '#66bb6a', bar = o.barriga || '#dcedc8', esp = o.esp || '#ff9800';
  const dorme = o.dorme || 0, boca = o.boca || 0, resp = 1 + Math.sin(t * (dorme > .5 ? 1.5 : 2.5)) * .03;
  c.save(); c.translate(x, y); if (o.vira) c.scale(-1, 1); c.scale(s, s);
  elip(0, 0, .5, .06, 'rgba(0,0,0,.15)');
  c.translate(0, dorme * .2);
  if (dorme < .5) {                                           // pernas
    const pa = o.anda ? Math.sin(t * 14) * .07 : 0;
    for (const px of [-.2 - pa, .17 + pa]) { rrp(px - .075, -.32, .15, .32, .06); c.fillStyle = cor; c.fill(); elip(px + .02, -.015, .09, .035, 'rgba(0,0,0,.15)'); }
  }
  c.save(); c.translate(-.3, -.42); c.rotate(Math.sin(t * (dorme > .5 ? 1 : 4)) * .15);   // cauda
  c.fillStyle = cor; c.beginPath(); c.moveTo(.05, -.15); c.quadraticCurveTo(-.35, -.14, -.58, .06); c.quadraticCurveTo(-.3, .1, .05, .15); c.fill();
  c.restore();
  c.fillStyle = esp;                                          // espinhos
  for (const [sx, sy] of [[-.36, -.6], [-.2, -.7], [-.03, -.74], [.13, -.71]]) { c.beginPath(); c.moveTo(sx - .07, sy + .06); c.lineTo(sx, sy - .09); c.lineTo(sx + .07, sy + .06); c.fill(); }
  c.save(); c.translate(0, -.42); c.scale(1, resp); elip(0, 0, .4, .3, cor); elip(.06, .08, .26, .18, bar); c.restore();   // corpo
  const hx = .4, hy = -.86 + dorme * .4;
  c.strokeStyle = cor; c.lineWidth = .2; c.lineCap = 'round'; c.beginPath(); c.moveTo(.18, -.52); c.lineTo(hx - .02, hy + .05); c.stroke();   // pescoço
  elip(hx, hy, .22, .19, cor); elip(hx + .17, hy + .04, .16, .12, cor);                                           // cabeça e focinho
  circ(hx + .29, hy - .01, .016, 'rgba(0,0,0,.35)');
  if (boca > .05) { elip(hx + .2, hy + .09, .1, .02 + .09 * boca, '#7b1f2b'); elip(hx + .2, hy + .1 + .05 * boca, .06, .03 * boca, '#f48fb1'); }
  else { c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = .018; c.beginPath(); c.arc(hx + .17, hy + .02, .08, .4, 1.35); c.stroke(); }
  elip(hx + .05, hy + .07, .045, .03, 'rgba(255,120,150,.5)');
  if (dorme > .5 || t % 3.3 < .13) {                          // olho fechado (piscando ou dormindo)
    c.strokeStyle = '#222'; c.lineWidth = .022; c.beginPath(); c.arc(hx + .03, hy - .07, .05, .3, Math.PI - .3); c.stroke();
  } else { circ(hx + .03, hy - .07, .07, '#fff'); circ(hx + .05, hy - .07, .04, '#222'); circ(hx + .06, hy - .085, .014, '#fff'); }
  elip(.3, -.38, .055, .1, cor, .5);                          // bracinho
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
  som.festa();
  if (F.calmo) setTimeout(som.ninar, 600);            // fases de dormir: canção de ninar em vez de rugido
  else { setTimeout(som.rugido, 500); setTimeout(som.buzina, 1300); }
  setTimeout(() => {
    if (tela !== 'jogo' || !fim) return;
    $('#premio').textContent = FIGURINHAS[idx];
    $('#estrelas').textContent = '⭐'.repeat(save.estrelas[idx]) + '☆'.repeat(3 - save.estrelas[idx]);
    $('#fim').hidden = false;
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

/* Arrastar (ou só tocar e soltar) um item: ele sempre voa para o lugar certo.
   Só um item fica na mão por vez: se outro dedo (ou a palma) tocar a tela, o primeiro é solto.
   Antes ele ficava preso na mão e a fase travava. */
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
function bolhaDes(x, y, r) {
  const g = c.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(.6, 'rgba(170,220,255,.15)'); g.addColorStop(1, 'rgba(255,170,255,.4)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = .4 * U; c.stroke();
}
const nota1 = (x, y) => parts.push({ x, y, vx: (Math.random() - .5) * 30 * U, vy: -40 * U, g: 10 * U, vida: 1.2, s: 3 * U, ch: Math.random() < .5 ? '🎵' : '🎶' });

const FASES = [
  /* 1 — Garagem: pintar o carrinho com as 8 latas */
  { ic: '🎨', base: 8, fixo: true,
    ini(s) { s.cor = save.cor; s.us = []; s.pulo = 0; },
    lata(i) { return [(.14 + .24 * (i % 4)) * W, (i < 4 ? .74 : .89) * H]; },
    upd(s, dt) { s.pulo = Math.max(0, s.pulo - dt * 2.5); },
    des(s) {
      c.fillStyle = '#ffe0b2'; c.fillRect(0, 0, W, H); em('🔧', W * .15, H * .2, 10 * U, -.4); em('🛞', W * .85, H * .22, 12 * U);
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

  /* 2 — Estrada dos ovos: o carro anda sozinho e segue o dedo */
  { ic: '🥚', base: 30,
    ini(s) { s.cx = .5; s.al = .5; s.ov = []; s.sp = 0; },
    upd(s, dt) {
      s.cx += (s.al - s.cx) * Math.min(1, dt * 10); s.sp -= dt;
      if (s.sp <= 0 && !fim) { s.sp = .8; const r = Math.random(); s.ov.push({ x: .22 + Math.random() * .56, y: -.1, ch: r < .7 ? '🥚' : r < .9 ? '⭐' : '🍎' }); }
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

  /* 3 — Ovos chocando: tocar várias vezes até nascer um dino colorido */
  { ic: '🐣', base: 6,
    ini(s) { s.tq = 0; s.nasc = 0; s.bal = 0; s.d = sorteio(DCOR.length); },
    upd(s, dt) { s.bal = Math.max(0, s.bal - dt * 3); if (s.nasc > 0) { s.nasc -= dt; if (s.nasc <= 0 && !fim) { s.tq = 0; s.d++; s.nasc = 0; } else if (s.nasc <= 0) s.nasc = .01; } },
    des(s) {
      fundo(); chao(H * .66); const x = W * .5, y = H * .55;
      c.fillStyle = '#8d6e63'; c.beginPath(); c.ellipse(x, y + 15 * U, 24 * U, 7 * U, 0, 0, 7); c.fill();
      if (s.nasc > 0) {
        ovo(x - 16 * U, y + 10 * U, 16 * U, 14 * U, -.6, 3); ovo(x + 16 * U, y + 10 * U, 16 * U, 14 * U, .6, 3);
        const cresce = Math.min(1, (1.8 - s.nasc) * 4);
        dino(x - 4 * U, y + 12 * U - Math.abs(Math.sin(s.t * 7)) * 5 * U, 26 * U * cresce + U, { cor: DCOR[s.d % DCOR.length], boca: Math.sin(s.t * 6) > .3 ? .7 : 0 });
      } else ovo(x, y, 26 * U, 34 * U, Math.sin(s.t * 40) * s.bal * .15, s.tq);
    },
    toque(s) {
      if (s.nasc > 0) return;
      s.tq++; s.bal = 1; som.crack(); respingo(W * .5, H * .55, '#fff8e1', 6);
      if (s.tq >= 6) { s.nasc = 1.8; som.rugidinho(); ponto(W * .5, H * .5); }
    },
    dica: s => s.nasc > 0 ? null : [W * .5, H * .55] },

  /* 4 — Lava-rápido: esfregar a lama do carro */
  faseEsfregar({ ic: '🧽', base: 26, ref: refCarro, x0: -.44, x1: .44, y0: -.5, y1: -.12,
    des() { c.fillStyle = '#b3e5fc'; c.fillRect(0, 0, W, H); em('🚿', W * .2, H * .16, 14 * U); em('💧', W * .8, H * .2, 10 * U); chao(H * .66, '#90a4ae'); const r = refCarro(); carro(r.x, r.y, r.L, save.cor); } }),

  /* 5 — Corrida com o T-Rex: tocar sem parar; todo mundo ganha medalha */
  { ic: '🏁', base: 60,
    ini(s) { s.v = 0; s.sc = 0; },
    upd(s, dt) { s.v = Math.max(0, s.v - dt * 1.5); s.sc += s.v * dt * 45 * U; },
    des(s) {
      fundo(); chao(H * .6); c.fillStyle = '#a1887f'; c.fillRect(0, H * .68, W, H * .2);
      const larg = W * 2.4;
      for (let k = 0; k < 6; k++) { const x = (((k * larg / 6 - s.sc) % larg) + larg) % larg - W * .2; em(k % 2 ? '🌴' : '🌋', x, H * .56, (k % 2 ? 16 : 20) * U); }
      const fx = W * .62 + (s.meta - s.feito) * 7 * U; if (fx < W * 1.3) em('🏁', fx + 14 * U, H * .66, 22 * U);
      const corre = s.v > .05 ? 1 : .25;
      dino(W * .2, H * .86 - Math.abs(Math.sin(s.t * 9)) * 3 * U * corre, 19 * U,
        { cor: '#ef6c00', barriga: '#ffe0b2', esp: '#5d4037', anda: corre > .5, boca: s.v > 1.6 ? .8 : 0 });
      carro(W * .62, H * .86 - Math.abs(Math.sin(s.t * 14)) * U * corre, 34 * U, save.cor, s.sc / (4 * U));
      if (fim) { em('🏅', W * .22, H * .6, 12 * U); em('🏅', W * .62, H * .62, 12 * U); }
    },
    toque(s) {
      s.v = Math.min(3, s.v + .8); s.feito++; som.motor();
      parts.push({ x: W * .46, y: H * .84, vx: -30 * U, vy: -8 * U, g: 0, vida: .5, cor: 'rgba(160,140,120,.7)', s: 2.5 * U, r: 1 });
      if (s.feito >= s.meta) vencer();
    },
    dica: () => [W * .5, H * .45] },

  /* 6 — Comidinha: o dino abre a boca, come, e no fim dorme */
  { ic: '🍎', base: 14, calmo: true,
    S: () => Math.min(W * .45, H * .26),
    boca() { const S = this.S(); return [W * .4 + .6 * S, H * .6 - .75 * S]; },
    ini(s) { s.b = 0; s.mast = 0; s.dorme = 0; s.pulo = 0; s.itens = [.2, .5, .8].map(x => ({ ch: COMIDAS[sorteio(COMIDAS.length)], x, y: .86, hx: x, hy: .86, tx: .6, ty: .5, est: 'casa' })); },
    upd(s, dt) {
      const [bx, by] = this.boca();
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
      fundo(); chao(H * .6); em('🌴', W * .1, H * .5, 20 * U); em('🌳', W * .9, H * .52, 18 * U);
      const S = this.S();
      dino(W * .4, H * .6 - Math.sin(s.pulo * Math.PI) * 3 * U, S, { boca: s.b, dorme: s.dorme });
      if (s.dorme > 0) { c.fillStyle = `rgba(10,15,60,${.45 * s.dorme})`; c.fillRect(0, 0, W, H); em('💤', W * .4 + .6 * S, H * .6 - S * (.95 + .08 * Math.sin(s.t * 2)), 10 * U, 0, s.dorme); }
      for (const it of s.itens) if (it.est !== 'fora' && it.est !== 'ok') em(it.ch, it.x * W, it.y * H, (it.est === 'mao' ? 20 : 16) * U);
    },
    toque: levar.toque, mover: levar.mover, solta: levar.solta,
    dica(s) { const it = s.itens.find(i => i.est === 'casa'); return it ? [it.x * W, it.y * H] : null; } },

  /* 7 — Balões: estourar muitos balões */
  { ic: '🎈', base: 40,
    novo(y) { return { x: .12 + Math.random() * .76, y: y == null ? 1.12 : y, cor: CORES[sorteio(7)], v: .07 + Math.random() * .06, f: Math.random() * 6, d: Math.random() < .2 }; },
    bx: (s, b) => (b.x + Math.sin(s.t * 1.5 + b.f) * .02) * W,
    ini(s) { s.b = []; for (let i = 0; i < 7; i++) s.b.push(this.novo(.3 + Math.random() * .7)); },
    upd(s, dt) { for (const b of s.b) { b.y -= b.v * dt; if (b.y < -.12) Object.assign(b, this.novo()); } },
    des(s) {
      fundo(); chao(H * .9);
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

  /* 8 — Ponte de pedras: cada toque é um pulo */
  { ic: '🪨', base: 24,
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
  { ic: '🌳', base: 16, passo: 4,
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
  faseEsfregar({ ic: '🛁', base: 26, ref: refDino, x0: -.35, x1: .45, y0: -.85, y1: -.25,
    des(s) {
      fundo(); chao(H * .66, '#81d4fa'); em('💧', W * .15, H * .3, 9 * U); em('💧', W * .88, H * .42, 7 * U);
      const r = refDino(); dino(r.x, r.y - (fim ? Math.abs(Math.sin(s.t * 8)) * 4 * U : 0), r.L, { boca: fim ? .8 : 0 });
    } }),

  /* 11 — Encaixe: cada dino na sua sombra */
  { ic: '🧩', base: 12, passo: 3,
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

  /* 12 — Cesta de frutas: o dino anda atrás do dedo e pega as frutas que caem */
  { ic: '🧺', base: 25,
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
      fundo(); chao(H * .9);
      for (let k = 0; k < 5; k++) circ(W * (k * .25), H * .05, 16 * U, k % 2 ? '#2e7d32' : '#388e3c');
      for (let k = 0; k < 6; k++) em(COMIDAS[k], W * (.1 + k * .16), H * (.08 + (k % 2) * .04), 6 * U);
      for (const f of s.fr) em(f.ch, f.x * W, f.y * H, 11 * U, Math.sin(f.r) * .3);
      dino(s.cx * W, H * .9 - Math.sin(s.pulo * Math.PI) * 4 * U, this.S(), { vira: s.vira, anda: s.anda, boca: s.b, cor: '#42a5f5', barriga: '#e3f2fd', esp: '#ffd600' });
    },
    toque(s, x) { s.al = cl(x / W, .12, .88); }, mover(s, x) { s.al = cl(x / W, .12, .88); },
    dica(s) { const f = s.fr.find(f => f.y < .7); return f ? [f.x * W, H * .82] : null; } },

  /* 13 — Dança do dino: cada toque é um passo de dança diferente */
  { ic: '🎶', base: 24,
    ini(s) { s.mv = -1; s.mt = 1; s.cor = sorteio(DCOR.length); },
    upd(s, dt) { s.mt = Math.min(1, s.mt + dt * 1.6); },
    des(s) {
      c.fillStyle = '#2a1b4a'; c.fillRect(0, 0, W, H);
      for (let k = 0; k < 3; k++) {
        c.fillStyle = `hsla(${(s.t * 60 + k * 120) % 360},90%,60%,.2)`;
        c.beginPath(); c.moveTo(W * (.15 + .35 * k), 0); c.lineTo(W * .5 - 32 * U, H * .82); c.lineTo(W * .5 + 32 * U, H * .82); c.fill();
      }
      c.fillStyle = '#6d4c41'; c.fillRect(0, H * .8, W, H * .2);
      for (let k = 0; k < 8; k++) circ(W * (k + .5) / 8, H * .03, 2 * U, `hsl(${(k * 45 + s.t * 120) % 360},90%,65%)`);
      const S = Math.min(W * .42, H * .25), x = W * .5, y = H * .8, p = s.mt < 1 ? Math.sin(s.mt * Math.PI) : 0;
      let dx = 0, dy = 0, rot = Math.sin(s.t * 3) * .05, boca = 0, sx = 1;
      if (s.mt < 1) {
        if (s.mv === 0) dy = -p * 24 * U;
        if (s.mv === 1) rot = Math.sin(s.mt * Math.PI * 2) * .3;
        if (s.mv === 2) boca = p;
        if (s.mv === 3) { const k = Math.cos(s.mt * Math.PI * 2); sx = Math.sign(k || 1) * Math.max(.06, Math.abs(k)); }
        if (s.mv === 4) dx = Math.sin(s.mt * Math.PI * 4) * 9 * U;
      }
      c.save(); c.translate(x + dx, y + dy); c.rotate(rot); c.scale(sx, 1);
      dino(0, 0, S, { boca, cor: DCOR[s.cor % DCOR.length], anda: s.mv === 4 && s.mt < 1 });
      c.restore();
    },
    toque(s) { s.mv = (s.mv + 1) % 5; s.mt = 0; s.cor++; if (s.mv === 2) som.rugidinho(); else som.pulo(); nota1(W * .3, H * .5); nota1(W * .7, H * .5); ponto(W * .5, H * .45); },
    dica: () => [W * .5, H * .62] },

  /* 14 — Bolhas de sabão: o dino sopra, a criança estoura */
  { ic: '🧼', base: 35,
    S: () => Math.min(W * .4, H * .24),
    ini(s) { s.bo = []; s.sp = 0; s.sopro = 0; },
    upd(s, dt) {
      s.sp -= dt; s.sopro = Math.max(0, s.sopro - dt * 2);
      const S = this.S(), mx = W * .28 + .62 * S, my = H * .85 - .8 * S;
      if (s.sp <= 0 && s.bo.length < 8 && !fim) { s.sp = .6; s.sopro = 1; s.bo.push({ x: mx, y: my, vx: (12 + Math.random() * 25) * U, vy: -(7 + Math.random() * 12) * U, r: (5.5 + Math.random() * 4) * U, f: Math.random() * 6 }); }
      for (const b of s.bo) {
        b.x += b.vx * dt; b.y += b.vy * dt + Math.sin(s.t * 3 + b.f) * .3 * U; b.vx *= 1 - dt * .5;
        if (b.x > W - b.r) b.vx = -Math.abs(b.vx);
      }
      s.bo = s.bo.filter(b => b.y > -b.r * 2 && !b.p);
    },
    des(s) {
      fundo(); chao(H * .85); em('🌻', W * .88, H * .82, 12 * U);
      dino(W * .28, H * .85, this.S(), { boca: .25 + .5 * s.sopro, cor: '#ab47bc', barriga: '#f3e5f5', esp: '#ffeb3b' });
      for (const b of s.bo) bolhaDes(b.x, b.y, b.r);
    },
    toque(s, x, y) {
      let m = null, md = 1e9;
      for (const b of s.bo) { const d = Math.hypot(b.x - x, b.y - y); if (d < b.r + 9 * U && d < md) { md = d; m = b; } }
      if (m) { m.p = 1; som.pop(); respingo(m.x, m.y, 'rgba(200,240,255,.9)', 10); ponto(m.x, m.y); }
    },
    dica(s) { const b = s.bo.find(b => b.y < H * .7); return b ? [b.x, b.y] : null; } },

  /* 15 — Boa noite, dino: mamadeira, ursinho, cobertor e apagar a luz */
  { ic: '🌙', base: 8, passo: 4, calmo: true,
    S: () => Math.min(W * .42, H * .25),
    obj: i => [[.16, .9], [.4, .91], [.64, .9], [.86, .3]][i],
    ini(s) { this.rod(s); },
    rod(s) { s.et = 0; s.luz = 1; s.dorme = 0; s.bebe = 0; s.esp = 0; s.cor = DCOR[sorteio(DCOR.length)]; },
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
      c.fillStyle = '#5c6bc0'; c.fillRect(0, 0, W, H);
      rr(W * .1, H * .1, W * .34, H * .17, 2 * U, '#1a237e'); em('🌙', W * .27, H * .185, 10 * U);
      for (let i = 0; i < 6; i++) circ(W * (.14 + i * .05), H * (.12 + (i % 3) * .04), .5 * U, '#fff');
      c.fillStyle = '#8d6e63'; c.fillRect(0, H * .8, W, H * .2);
      rr(W * .08, H * .5, W * .07, H * .3, 2 * U, '#a1887f');
      rr(W * .1, H * .66, W * .8, H * .13, 3 * U, '#ffcc80');
      const S = this.S(), dx = W * .52, dy = H * .7;
      dino(dx, dy, S, { cor: s.cor, dorme: s.dorme, boca: s.bebe > 0 ? .5 : 0 });
      if (s.bebe > 0) em('🍼', dx + .72 * S, dy - .78 * S, 9 * U, -.9);
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

  /* 16 — Festa dos dinos: soltar fogos tocando no céu */
  { ic: '🎆', base: 40,
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
