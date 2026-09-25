// Generazione del PDF con 50 o 100 cartelle da stampare (3 per pagina).

import { generaCartellaValida } from './cartelle.js';

export function generaCartelle(quantita) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let cartellaCount = 0;
  
  for (let i = 1; i <= quantita; i++) {
    if (cartellaCount > 0 && cartellaCount % 3 === 0) {
      doc.addPage();
    }
    
    let posizioneNellaPagina = cartellaCount % 3;
    let offsetY = posizioneNellaPagina * 90;
    
    doc.setFontSize(14);
    doc.text(`Cartella #${i}`, 105, 15 + offsetY, { align: 'center' });
    
    let cartella = generaCartellaValida();
    
    let startX = 20;
    let startY = 25 + offsetY;
    let cellWidth = 19;
    let cellHeight = 20;
    
    doc.setFontSize(12);
    doc.setLineWidth(0.3);
    
    for (let riga = 0; riga < 3; riga++) {
      for (let col = 0; col < 9; col++) {
        let x = startX + col * cellWidth;
        let y = startY + riga * cellHeight;
        
        if (cartella[riga][col] === null) {
          doc.setFillColor(240, 240, 240);
          doc.rect(x, y, cellWidth, cellHeight, 'FD');
        } else {
          doc.rect(x, y, cellWidth, cellHeight);
          doc.text(cartella[riga][col].toString(), x + cellWidth/2, y + cellHeight/2 + 2, { align: 'center' });
        }
      }
    }
    
    cartellaCount++;
  }
  
  doc.save(quantita + '_cartelle_tombola.pdf');
}
