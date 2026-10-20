// Stato condiviso dell'applicazione.

export const opzioni = {
  detti: false,
  animazioni: true,
  suoni: true,
  voce: true,
  leggiCifre: true
};

export const CATEGORIE = ['ambo', 'terno', 'quaterna', 'cinquina', 'tombola'];
export const NOME_CATEGORIA = {
  ambo: 'Ambo', terno: 'Terno', quaterna: 'Quaterna', cinquina: 'Cinquina', tombola: 'Tombola'
};

// stato.premi è una LISTA di premi (non più un oggetto con una voce fissa per categoria):
// { id, categoria: 'ambo'|'terno'|'quaterna'|'cinquina'|'tombola',
//   tipo: 'denaro'|'oggetto', nome, importo (solo se tipo è 'denaro'), vinto }
// Questo permette più premi sulla stessa categoria (es. due Ambi) in entrambe le modalità.
export const stato = {
  numeriEstratti: [],
  tema: 'natale',
  modalitaPremi: null,   // 'budget' | 'lista', impostata quando si conferma la configurazione
  premi: [],
  prossimoPremioId: 1,
  mieCartelle: [],
  prossimoCartellaId: 1,
  storicoEventi: [],
  estrazioneAutomaticaAttiva: false
};
