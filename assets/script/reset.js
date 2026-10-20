// Reset dell'estrazione e nuova partita.
// Raggruppa qui la logica perché tocca più moduli insieme (estrazione, premi,
// storico, cartelle, voce, auto-estrazione) e nessuno di loro dovrebbe dipendere
// dagli altri solo per questo.

import { stato } from './state.js';
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

  stato.premi.forEach((premio) => { premio.vinto = false; });
  mostraPremi();

  azzeraStorico();
  renderStorico();

  azzeraCartelle();
  renderCartelleGioco();

  salvaPartita();
}

// Azzera l'estrazione corrente, mantenendo la stessa configurazione di premi.
export function resetEstrazione() {
  if (!confirm("Vuoi davvero azzerare l'estrazione? I numeri estratti e le vincite segnate andranno persi (i premi configurati restano).")) return;
  eseguiReset();
}

// Come il reset, ma permette anche di ricominciare da capo la scelta di budget/premi.
export function nuovaPartita() {
  if (!confirm('Vuoi davvero iniziare una nuova partita? La partita attuale (estrazione, premi e vincite) andrà persa.')) return;
  eseguiReset();
  stato.premi = [];
  stato.modalitaPremi = null;
  salvaPartita();
  mostraModal('modalitaPremiModal');
}
