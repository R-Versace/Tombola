// Generazione del PDF con le cartelle da stampare (3 per pagina), con lo stile del tema scelto.

import { generaCartellaValida } from './cartelle.js';
import { stato } from './state.js';
import { THEMES } from './temi.js';

export const MINIMO_CARTELLE = 10;
const CARTELLE_PER_PAGINA = 3;

export function paginePerCartelle(quantita) {
  return Math.ceil(Math.max(MINIMO_CARTELLE, quantita) / CARTELLE_PER_PAGINA);
}

function hexInRgb(hex) {
  const pulito = hex.replace('#', '');
  const valore = parseInt(pulito.length === 3 ? pulito.split('').map((c) => c + c).join('') : pulito, 16);
  return [(valore >> 16) & 255, (valore >> 8) & 255, valore & 255];
}

// Mescola un colore con il bianco, per ottenere una tinta chiara adatta allo sfondo delle celle.
function schiarisci([r, g, b], quantita = 0.85) {
  return [r, g, b].map((c) => Math.round(c + (255 - c) * quantita));
}

const ALTEZZA_CARTELLA = 90;
const CARD_X = 14;
const CARD_W = 182;
const HEADER_H = 10;
const PAD = 2;
const GRID_X = 20;
const CELL_W = 19;
const CELL_H = 18;
const CARD_H = HEADER_H + PAD + CELL_H * 3 + 4;

function disegnaCartella(doc, numero, griglia, tema, offsetY) {
  const [pr, pg, pb] = hexInRgb(tema.primary);
  const [sr, sg, sb] = hexInRgb(tema.secondary);
  const cardTop = 8 + offsetY;
  const gridTop = cardTop + HEADER_H + PAD;

  // Sfondo della cartella: bordo arrotondato con una tinta molto leggera del colore primario.
  doc.setDrawColor(sr, sg, sb);
  doc.setLineWidth(0.4);
  doc.setFillColor(...schiarisci([pr, pg, pb], 0.94));
  doc.roundedRect(CARD_X, cardTop, CARD_W, CARD_H, 3, 3, 'F');

  // Intestazione: banda piena col colore primario del tema, testo bianco.
  doc.setFillColor(pr, pg, pb);
  doc.rect(CARD_X, cardTop, CARD_W, HEADER_H, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Cartella #${numero}`, CARD_X + CARD_W / 2, cardTop + 6.3, { align: 'center' });

  // Griglia: bordo sottile del colore secondario su OGNI cella (piena o vuota), così le
  // 9 colonne restano sempre ben leggibili. Le celle coi numeri sono bianche col numero
  // in grassetto nel colore primario; le celle vuote hanno una tinta chiara del secondario.
  const sfondoVuota = schiarisci([sr, sg, sb], 0.85);
  doc.setLineWidth(0.3);
  doc.setDrawColor(sr, sg, sb);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  for (let riga = 0; riga < 3; riga++) {
    for (let col = 0; col < 9; col++) {
      const x = GRID_X + col * CELL_W;
      const y = gridTop + riga * CELL_H;
      const numeroCella = griglia[riga][col];

      if (numeroCella === null) {
        doc.setFillColor(...sfondoVuota);
        doc.rect(x, y, CELL_W, CELL_H, 'FD');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, CELL_W, CELL_H, 'FD');
        doc.setTextColor(pr, pg, pb);
        doc.text(numeroCella.toString(), x + CELL_W / 2, y + CELL_H / 2 + 2, { align: 'center' });
      }
    }
  }

  // Bordo esterno arrotondato sopra a tutto, per una rifinitura pulita.
  doc.setDrawColor(sr, sg, sb);
  doc.setLineWidth(0.5);
  doc.roundedRect(CARD_X, cardTop, CARD_W, CARD_H, 3, 3, 'S');
}

export function generaCartelle(quantita) {
  const n = Math.max(MINIMO_CARTELLE, Math.round(quantita) || MINIMO_CARTELLE);
  const tema = THEMES[stato.tema] || THEMES.classico;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  for (let i = 1; i <= n; i++) {
    const posizione = (i - 1) % CARTELLE_PER_PAGINA;
    if (i > 1 && posizione === 0) doc.addPage();
    const offsetY = posizione * ALTEZZA_CARTELLA;
    disegnaCartella(doc, i, generaCartellaValida(), tema, offsetY);
  }

  doc.save(n + '_cartelle_tombola.pdf');
}
