// Coriandoli: due "cannoni" agli angoli inferiori dello schermo sparano pezzetti colorati
// che poi ricadono ondeggiando. Si disegna su un canvas a tutto schermo creato al volo e
// rimosso a fine animazione. Nessuna libreria esterna, quindi funziona anche offline.
//
// lanciaCoriandoli(livello): da 1 (Ambo) a 5 (Tombola). Più alto = più coriandoli e più
// raffiche. Rispetta l'interruttore "Animazioni" del menu.

import { opzioni } from './state.js';

const COLORI = ['#ffd700', '#e63946', '#2a9d8f', '#4361ee', '#f72585', '#ff9f1c', '#ffffff', '#8ecae6'];
const GRAVITA = 900;   // px/s²
const ATTRITO = 3;     // più alto = i coriandoli rallentano prima e cadono più lenti
const MAX_PEZZI = 900; // tetto di sicurezza per i dispositivi meno potenti

// Quanti pezzi per cannone e quante raffiche (ritardo in ms) per ogni livello.
const LIVELLI = {
  1: { pezzi: 35, raffiche: [0] },
  2: { pezzi: 50, raffiche: [0] },
  3: { pezzi: 55, raffiche: [0, 300] },
  4: { pezzi: 65, raffiche: [0, 300, 650] },
  5: { pezzi: 80, raffiche: [0, 300, 650, 1100, 1600] }
};

let canvas = null;
let ctx = null;
let larghezza = 0;
let altezza = 0;
let pezzi = [];
let idFrame = null;
let ultimoTempo = 0;
let timerRaffiche = [];

const casuale = (min, max) => min + Math.random() * (max - min);

function ridimensiona() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  larghezza = window.innerWidth;
  altezza = window.innerHeight;
  canvas.width = Math.round(larghezza * dpr);
  canvas.height = Math.round(altezza * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function assicuraCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'coriandoli-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  ridimensiona();
  window.addEventListener('resize', ridimensiona);
}

function rimuoviCanvas() {
  if (!canvas) return;
  window.removeEventListener('resize', ridimensiona);
  canvas.remove();
  canvas = null;
  ctx = null;
}

// Un cannone: spara `quanti` pezzi da (x, y) attorno all'angolo dato (radianti, 0 = destra,
// -PI/2 = su). La potenza si adatta all'altezza dello schermo, così i coriandoli salgono
// sempre fin verso i tre quarti della finestra, su un telefono come su un monitor.
function sparaDa(x, y, angoloCentrale, quanti) {
  const potenza = altezza * 3.6;
  for (let i = 0; i < quanti; i++) {
    const angolo = angoloCentrale + casuale(-0.3, 0.3);
    const velocita = potenza * casuale(0.45, 1);
    pezzi.push({
      x,
      y,
      vx: Math.cos(angolo) * velocita,
      vy: Math.sin(angolo) * velocita,
      attrito: ATTRITO * casuale(0.8, 1.4),
      larghezza: casuale(6, 11),
      altezza: casuale(9, 16),
      rotazione: casuale(0, Math.PI * 2),
      velRotazione: casuale(-8, 8),
      fase: casuale(0, Math.PI * 2),      // fase dell'ondeggiamento laterale
      velFase: casuale(3, 7),
      ribalta: casuale(0, Math.PI * 2),   // simula il pezzo che si gira nell'aria
      velRibalta: casuale(6, 14),
      colore: COLORI[Math.floor(Math.random() * COLORI.length)],
      rotondo: Math.random() < 0.25,
      eta: 0,
      durata: casuale(3200, 4800)
    });
  }
  if (pezzi.length > MAX_PEZZI) pezzi.splice(0, pezzi.length - MAX_PEZZI);
}

function raffica(livello) {
  if (!canvas) return;
  const { pezzi: quanti } = LIVELLI[livello];
  const sx = Math.PI * (-65 / 180); // verso l'alto e a destra
  sparaDa(0, altezza, sx, quanti);
  sparaDa(larghezza, altezza, -Math.PI - sx, quanti);
  if (livello >= 3) sparaDa(larghezza / 2, altezza, -Math.PI / 2, Math.round(quanti * 0.7));
}

function aggiorna(dt) {
  for (const p of pezzi) {
    p.eta += dt * 1000;
    const freno = Math.exp(-p.attrito * dt);
    p.vx *= freno;
    p.vy = p.vy * freno + GRAVITA * dt;
    p.fase += p.velFase * dt;
    p.ribalta += p.velRibalta * dt;
    p.rotazione += p.velRotazione * dt;
    p.x += (p.vx + Math.sin(p.fase) * 40) * dt;
    p.y += p.vy * dt;
  }
  pezzi = pezzi.filter((p) => p.eta < p.durata && p.y < altezza + 40);
}

function disegna() {
  ctx.clearRect(0, 0, larghezza, altezza);
  for (const p of pezzi) {
    // Dissolvenza negli ultimi 600 ms di vita.
    const resta = p.durata - p.eta;
    ctx.globalAlpha = resta < 600 ? Math.max(0, resta / 600) : 1;
    ctx.fillStyle = p.colore;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotazione);
    ctx.scale(1, Math.cos(p.ribalta)); // il pezzo "si gira": appare più o meno sottile
    if (p.rotondo) {
      ctx.beginPath();
      ctx.arc(0, 0, p.larghezza / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.larghezza / 2, -p.altezza / 2, p.larghezza, p.altezza);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function ciclo(tempo) {
  const dt = Math.min((tempo - ultimoTempo) / 1000, 0.05); // evita salti se la scheda è in background
  ultimoTempo = tempo;
  aggiorna(dt);
  disegna();

  if (pezzi.length === 0 && timerRaffiche.length === 0) {
    idFrame = null;
    rimuoviCanvas();
    return;
  }
  idFrame = requestAnimationFrame(ciclo);
}

export function lanciaCoriandoli(livello = 1) {
  if (!opzioni.animazioni) return;
  const l = Math.min(5, Math.max(1, Math.round(livello)));

  assicuraCanvas();
  LIVELLI[l].raffiche.forEach((ritardo) => {
    if (ritardo === 0) {
      raffica(l);
      return;
    }
    const timer = setTimeout(() => {
      timerRaffiche = timerRaffiche.filter((t) => t !== timer);
      raffica(l);
    }, ritardo);
    timerRaffiche.push(timer);
  });

  if (idFrame === null) {
    ultimoTempo = performance.now();
    idFrame = requestAnimationFrame(ciclo);
  }
}

// Ferma tutto subito (es. quando si disattivano le animazioni dal menu).
export function fermaCoriandoli() {
  timerRaffiche.forEach(clearTimeout);
  timerRaffiche = [];
  pezzi = [];
  if (idFrame !== null) {
    cancelAnimationFrame(idFrame);
    idFrame = null;
  }
  rimuoviCanvas();
}
