// Stato condiviso dell'applicazione.
// Tutti i moduli leggono e modificano questi due oggetti (mai riassegnarli:
// si cambiano solo le loro proprietà), così restano un'unica fonte di verità.

export const TIPI_PREMIO = ['ambo', 'terno', 'quaterna', 'cinquina', 'tombola'];

export function creaPremiIniziali() {
  return {
    ambo:     { nome: 'Ambo',     importo: 0, vinto: false },
    terno:    { nome: 'Terno',    importo: 0, vinto: false },
    quaterna: { nome: 'Quaterna', importo: 0, vinto: false },
    cinquina: { nome: 'Cinquina', importo: 0, vinto: false },
    tombola:  { nome: 'Tombola',  importo: 0, vinto: false }
  };
}

// Dati della partita: sono quelli che vengono salvati in localStorage.
export const stato = {
  numeriEstratti: [],          // in ordine di estrazione
  premi: creaPremiIniziali(),
  storicoEventi: [],           // { testo, evento, orario }
  mieCartelle: [],             // { id, numeri, segnati:Set, vinte }
  prossimoCartellaId: 1,
  tema: 'natale'               // tema grafico attivo (preferenza, salvata a parte)
};

// Interruttori del menu ⚙️.
export const opzioni = {
  detti: true,
  animazioni: true,
  suoni: true,
  voce: true,
  leggiCifre: true             // "47, quattro, sette"
};
