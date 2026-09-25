// Budget, ripartizione percentuale e premi assegnati.

import { stato, TIPI_PREMIO } from './state.js';
import { $, nascondiModal } from './ui.js';
import { suonoVincita, suonoTombola } from './audio.js';
import { salvaPartita } from './salvataggio.js';

const cap = (tipo) => tipo.charAt(0).toUpperCase() + tipo.slice(1);
const PERCENTUALI_DEFAULT = { ambo: 5, terno: 10, quaterna: 15, cinquina: 20, tombola: 50 };
const RINTOCCHI = { ambo: 1, terno: 2, quaterna: 3, cinquina: 4 };

const leggiPerc = (tipo) => parseFloat($('perc' + cap(tipo)).value) || 0;

export function aggiornaAnteprima() {
  const budget = parseFloat($('budgetInput').value) || 0;
  let totale = 0;

  TIPI_PREMIO.forEach((tipo) => {
    const perc = leggiPerc(tipo);
    totale += perc;
    $('anteprima' + cap(tipo)).textContent = '€' + (budget * perc / 100).toFixed(2);
  });

  const totaleDiv = $('totalePerc');
  const btnIniziaPartita = $('btnIniziaPartita');

  if (totale === 100) {
    totaleDiv.className = 'totale-percentuale totale-ok';
    totaleDiv.textContent = 'Totale: 100% ✓';
    btnIniziaPartita.disabled = false;
  } else {
    totaleDiv.className = 'totale-percentuale totale-errore';
    totaleDiv.textContent = `Totale: ${totale}% (deve essere 100%)`;
    btnIniziaPartita.disabled = true;
  }
}

export function resetPercentuali() {
  TIPI_PREMIO.forEach((tipo) => { $('perc' + cap(tipo)).value = PERCENTUALI_DEFAULT[tipo]; });
  aggiornaAnteprima();
}

export function impostaBudget() {
  const budget = parseFloat($('budgetInput').value);
  if (isNaN(budget) || budget < 5) {
    alert('Inserisci un budget valido (minimo €5)');
    return;
  }

  TIPI_PREMIO.forEach((tipo) => {
    stato.premi[tipo].importo = (budget * leggiPerc(tipo) / 100).toFixed(2);
  });

  mostraPremi();
  salvaPartita();
  nascondiModal('budgetModal');
}

export function mostraPremi() {
  const container = $('premiContainer');
  container.innerHTML = '';

  TIPI_PREMIO.forEach((key) => {
    const premio = stato.premi[key];
    const div = document.createElement('div');
    div.className = 'premio' + (premio.vinto ? ' vinto' : '');
    div.addEventListener('click', () => {
      premio.vinto = !premio.vinto;
      if (premio.vinto) {
        if (key === 'tombola') suonoTombola();
        else suonoVincita(RINTOCCHI[key] || 1);
      }
      mostraPremi();
      salvaPartita();
    });
    div.innerHTML = `
      <div class="premio-nome">${premio.nome}</div>
      <div class="premio-importo">€${premio.importo}</div>
    `;
    container.appendChild(div);
  });
}
