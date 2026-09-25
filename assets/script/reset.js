// Reset dell'estrazione e nuova partita.
// Raggruppa qui la logica perché tocca più moduli insieme (estrazione, premi,
// storico, cartelle, voce, auto-estrazione) e nessuno di loro dovrebbe dipendere
// dagli altri solo per questo.

import { stato, TIPI_PREMIO } from './state.js';
import { mostraModal } from './ui.js';
import { fermaEstrazioneAutomatica } from './auto.js';
import { fermaVoce } from './voce.js';
import { ridisegnaEstrazione } from './estrazione.js';
import { mostraPremi } from './premi.js';
import { azzeraStorico, renderStorico } from './storico.js';
import { azzeraCartelle, renderCartelleGioco } from './cartelle.js';
import { salvaPartita } from './salvataggio.js';

function eseguiReset() {
  fermaEstrazioneAutomatica();
  fermaVoce();

  stato.numeriEstratti = [];
  ridisegnaEstrazione();

  TIPI_PREMIO.forEach((tipo) => { stato.premi[tipo].vinto = false; });
  mostraPremi();

  azzeraStorico();
  renderStorico();

  azzeraCartelle();
  renderCartelleGioco();

  salvaPartita();
}

// Azzera l'estrazione corrente, mantenendo budget, premi e cartelle impostati.
export function resetEstrazione() {
  eseguiReset();
}

// Come il reset, ma propone anche di impostare un nuovo budget.
export function nuovaPartita() {
  eseguiReset();
  mostraModal('budgetModal');
}
