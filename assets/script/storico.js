// Storico della partita: estrazioni e vincite, con esportazione in TXT e PDF.

import { stato } from './state.js';
import { $, escapeHtml, mostraModal } from './ui.js';

export function aggiungiStorico(testo, evento) {
  stato.storicoEventi.push({ testo, evento: !!evento, orario: new Date().toLocaleTimeString('it-IT') });
  renderStorico();
}

export function azzeraStorico() {
  stato.storicoEventi = [];
}

export function renderStorico() {
  const body = $('storicoBody');
  if (!body) return;
  const eventi = stato.storicoEventi;
  body.innerHTML = eventi.slice().reverse().map((e, i) => {
    const num = eventi.length - i;
    const classe = e.evento ? 'storico-riga-evento' : '';
    return `<tr class="${classe}"><td>${num}</td><td>${escapeHtml(e.orario)}</td><td>${escapeHtml(e.testo)}</td></tr>`;
  }).join('');
}

export function apriStorico() {
  renderStorico();
  mostraModal('storicoModal');
}

export function esportaStoricoTxt() {
  const righe = stato.storicoEventi.map((e, i) => `${i + 1}. [${e.orario}] ${e.testo}`);
  const blob = new Blob([righe.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'storico_tombola.txt';
  a.click();
  URL.revokeObjectURL(url);
}

export function esportaStoricoPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Storico Estrazioni - Tombola', 105, 15, { align: 'center' });
  doc.setFontSize(11);
  let y = 28;
  stato.storicoEventi.forEach((e, i) => {
    if (y > 280) { doc.addPage(); y = 15; }
    doc.text(`${i + 1}. [${e.orario}] ${e.testo}`, 15, y);
    y += 7;
  });
  doc.save('storico_tombola.pdf');
}
