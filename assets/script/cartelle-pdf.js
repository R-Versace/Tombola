// Generazione del PDF con le cartelle da stampare (minimo 10, quante se ne vogliono),
// 3 per pagina, colorate in base al tema grafico attualmente scelto.

import { generaCartellaValida } from './cartelle.js';
import { stato } from './state.js';
import { THEMES } from './temi.js';

export const MINIMO_CARTELLE = 10;

export function paginePerCartelle(quantita) {
  return Math.max(1, Math.ceil(quantita / 3));
}

// "#c41e3a" -> [196, 30, 58]
function hexInRgb(hex) {
  const pulito = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(pulito.slice(i, i + 2), 16));
}

// Schiarisce un colore verso il bianco: fattore 0 = colore pieno, 1 = bianco.
function schiarisci([r, g, b], fattore) {
  return [r, g, b].map((c) => Math.round(c + (255 - c) * fattore));
}

// Layout di una singola cartella: un rigo di intestazione colorato + la griglia 3x9,
// racchiusi in un bordo arrotondato. Le colonne alternano una leggera tinta del tema
// per ricordare le cartelle di carta a righe colorate.
const CELL_W = 19;
const CELL_H = 18;
const GRID_W = CELL_W * 9;
const GRID_H = CELL_H * 3;
const HEADER_H = 9;
const PAD = 3;
const CARD_W = GRID_W + PAD * 2;
const CARD_H = HEADER_H + GRID_H + PAD * 2;
const SLOT_H = CARD_H + 9;
const MARGINE_ALTO = 14;
const GRID_X = 20;
const CARD_X = GRID_X - PAD;

function disegnaCartella(doc, numero, griglia, tema, offsetY) {
  const [pr, pg, pb] = hexInRgb(tema.primary);
  const [sr, sg, sb] = hexInRgb(tema.secondary);
  const cardTop = MARGINE_ALTO + offsetY;
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

// Genera un PDF con `quantita` cartelle (minimo 10), 3 per pagina, usando i colori
// del tema grafico attualmente selezionato.
export function generaCartelle(quantita) {
  const n = Math.max(MINIMO_CARTELLE, Math.round(quantita) || 0);
  const tema = THEMES[stato.tema] || THEMES.classico;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  for (let i = 1; i <= n; i++) {
    const posizioneNellaPagina = (i - 1) % 3;
    if (i > 1 && posizioneNellaPagina === 0) doc.addPage();

    const offsetY = posizioneNellaPagina * SLOT_H;
    disegnaCartella(doc, i, generaCartellaValida(), tema, offsetY);
  }

  // Ripristina lo stato di default del documento prima di salvarlo.
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  doc.save(n + '_cartelle_tombola.pdf');
}
