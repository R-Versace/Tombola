// Premi: due modalità scelte a inizio partita.
// - "budget": un importo totale diviso in percentuale tra le categorie; ogni categoria può
//   avere più premi (es. 2 Ambi): in quel caso l'importo di quella categoria viene DIVISO
//   tra le istanze, così il totale resta sempre dentro il budget.
// - "lista": una lista libera di premi (oggetti, buoni...) assegnati a mano a una categoria.
// In entrambi i casi stato.premi è una lista di premi singoli, mai un oggetto a 5 chiavi:
// questo è ciò che permette più premi sulla stessa categoria.

import { stato, CATEGORIE, NOME_CATEGORIA } from './state.js';
import { $, mostraModal, nascondiModal } from './ui.js';
import { suonoVincita, suonoTombola } from './audio.js';
import { salvaPartita } from './salvataggio.js';
import { aggiungiStorico } from './storico.js';

const cap = (categoria) => categoria.charAt(0).toUpperCase() + categoria.slice(1);
const PERCENTUALI_DEFAULT = { ambo: 5, terno: 10, quaterna: 15, cinquina: 20, tombola: 50 };
const RINTOCCHI = { ambo: 1, terno: 2, quaterna: 3, cinquina: 4 };

// Numero minimo di estrazioni necessarie perché quella categoria sia matematicamente
// possibile: un Ambo richiede almeno 2 numeri usciti, un Terno almeno 3, e così via.
// Una Tombola richiede che siano usciti tutti i 15 numeri di una cartella, quindi almeno 15.
const MINIMO_ESTRATTI = { ambo: 2, terno: 3, quaterna: 4, cinquina: 5, tombola: 15 };

const leggiPerc = (categoria) => parseFloat($('perc' + cap(categoria)).value) || 0;
const leggiQuantita = (categoria) => Math.max(1, parseInt($('quant' + cap(categoria)).value, 10) || 1);

// Importo di UNA singola istanza di premio in quella categoria: il totale della categoria
// (budget * percentuale) viene diviso per quante istanze se ne vogliono assegnare, così la
// somma di tutti i premi resta sempre pari al budget, indipendentemente dalla quantità.
function importoPerIstanza(budget, categoria) {
  const perc = leggiPerc(categoria);
  const quantita = leggiQuantita(categoria);
  return (budget * perc / 100) / quantita;
}

// ===================== Modalità Budget =====================

export function aggiornaAnteprima() {
  const budget = parseFloat($('budgetInput').value) || 0;
  let totalePerc = 0;

  CATEGORIE.forEach((categoria) => {
    totalePerc += leggiPerc(categoria);
    $('anteprima' + cap(categoria)).textContent = '€' + importoPerIstanza(budget, categoria).toFixed(2);
  });

  const totaleDiv = $('totalePerc');
  const btnIniziaPartita = $('btnIniziaPartita');

  if (totalePerc === 100) {
    totaleDiv.className = 'totale-percentuale totale-ok';
    totaleDiv.textContent = 'Totale percentuali: 100% ✓';
    btnIniziaPartita.disabled = false;
  } else {
    totaleDiv.className = 'totale-percentuale totale-errore';
    totaleDiv.textContent = `Totale percentuali: ${totalePerc}% (deve essere 100%)`;
    btnIniziaPartita.disabled = true;
  }
}

export function resetPercentuali() {
  CATEGORIE.forEach((categoria) => {
    $('perc' + cap(categoria)).value = PERCENTUALI_DEFAULT[categoria];
    $('quant' + cap(categoria)).value = 1;
  });
  aggiornaAnteprima();
}

export function impostaBudget() {
  const budget = parseFloat($('budgetInput').value);
  if (isNaN(budget) || budget < 5) {
    alert('Inserisci un budget valido (minimo €5)');
    return;
  }

  const nuoviPremi = [];
  CATEGORIE.forEach((categoria) => {
    const quantita = leggiQuantita(categoria);
    const importo = importoPerIstanza(budget, categoria).toFixed(2);
    for (let i = 1; i <= quantita; i++) {
      nuoviPremi.push({
        id: stato.prossimoPremioId++,
        categoria,
        tipo: 'denaro',
        nome: quantita > 1 ? `${NOME_CATEGORIA[categoria]} #${i}` : NOME_CATEGORIA[categoria],
        importo,
        vinto: false,
        vincitore: null
      });
    }
  });

  stato.premi = nuoviPremi;
  stato.modalitaPremi = 'budget';
  mostraPremi();
  salvaPartita();
  nascondiModal('budgetModal');
}

// ===================== Modalità Lista Premi =====================

let bozzaListaPremi = [];
let prossimoBozzaId = 1;

export function apriListaPremi() {
  bozzaListaPremi = [];
  prossimoBozzaId = 1;
  renderBozzaListaPremi();
  mostraModal('listaPremiModal');
}

export function aggiungiPremioLista() {
  const nomeInput = $('listaPremioNome');
  const nome = nomeInput.value.trim();
  if (!nome) {
    alert('Inserisci un nome per il premio');
    return;
  }
  const categoria = $('listaPremioCategoria').value;
  bozzaListaPremi.push({ idBozza: prossimoBozzaId++, categoria, nome });
  nomeInput.value = '';
  nomeInput.focus();
  renderBozzaListaPremi();
}

export function rimuoviPremioLista(idBozza) {
  bozzaListaPremi = bozzaListaPremi.filter((p) => p.idBozza !== idBozza);
  renderBozzaListaPremi();
}

// Sposta un premio della bozza su (-1) o giù (+1) nell'ordine della lista.
export function spostaPremioLista(idBozza, direzione) {
  const indice = bozzaListaPremi.findIndex((p) => p.idBozza === idBozza);
  const nuovoIndice = indice + direzione;
  if (indice === -1 || nuovoIndice < 0 || nuovoIndice >= bozzaListaPremi.length) return;
  [bozzaListaPremi[indice], bozzaListaPremi[nuovoIndice]] = [bozzaListaPremi[nuovoIndice], bozzaListaPremi[indice]];
  renderBozzaListaPremi();
}

function renderBozzaListaPremi() {
  const cont = $('listaPremiBozzaContainer');
  if (!cont) return;
  if (bozzaListaPremi.length === 0) {
    cont.innerHTML = '<p class="text-muted text-center small">Nessun premio ancora aggiunto.</p>';
  } else {
    cont.innerHTML = bozzaListaPremi.map((p, i) => `
      <div class="premi-lista-riga">
        <div class="premi-lista-ordina">
          <button type="button" class="btn btn-sm btn-outline-secondary" data-azione="sposta-premio-lista" data-id="${p.idBozza}" data-direzione="-1" ${i === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" data-azione="sposta-premio-lista" data-id="${p.idBozza}" data-direzione="1" ${i === bozzaListaPremi.length - 1 ? 'disabled' : ''}>▼</button>
        </div>
        <span class="premi-lista-categoria">${NOME_CATEGORIA[p.categoria]}</span>
        <span class="premi-lista-nome">${p.nome}</span>
        <button type="button" class="btn btn-sm btn-outline-danger" data-azione="rimuovi-premio-lista" data-id="${p.idBozza}">🗑️</button>
      </div>
    `).join('');
  }
  $('btnConfermaListaPremi').disabled = bozzaListaPremi.length === 0;
}

export function confermaListaPremi() {
  if (bozzaListaPremi.length === 0) {
    alert('Aggiungi almeno un premio prima di iniziare');
    return;
  }
  if (!bozzaListaPremi.some((p) => p.categoria === 'tombola')) {
    alert('Deve esserci almeno un premio per la categoria Tombola: senza di essa la partita non avrebbe un modo per concludersi ufficialmente.');
    return;
  }

  stato.premi = bozzaListaPremi.map((p) => ({
    id: stato.prossimoPremioId++,
    categoria: p.categoria,
    tipo: 'oggetto',
    nome: p.nome,
    importo: null,
    vinto: false,
    vincitore: null
  }));
  stato.modalitaPremi = 'lista';
  mostraPremi();
  salvaPartita();
  nascondiModal('listaPremiModal');
}

// ===================== Visualizzazione durante il gioco =====================

export function mostraPremi() {
  const container = $('premiContainer');
  container.innerHTML = '';
  if (stato.premi.length === 0) return;

  CATEGORIE.forEach((categoria) => {
    const premiCategoria = stato.premi.filter((p) => p.categoria === categoria);
    if (premiCategoria.length === 0) return;

    const gruppo = document.createElement('div');
    gruppo.className = 'categoria-premi';

    const titolo = document.createElement('div');
    titolo.className = 'categoria-premi-titolo';
    titolo.textContent = NOME_CATEGORIA[categoria];
    gruppo.appendChild(titolo);

    const righe = document.createElement('div');
    righe.className = 'categoria-premi-righe';

    premiCategoria.forEach((premio) => {
      const div = document.createElement('div');
      div.className = 'premio' + (premio.vinto ? ' vinto' : '');
      div.addEventListener('click', () => {
        if (!premio.vinto) {
          const minimo = MINIMO_ESTRATTI[categoria];
          const estratti = stato.numeriEstratti.length;
          if (estratti < minimo) {
            alert(
              `Non puoi ancora segnare "${NOME_CATEGORIA[categoria]}" come vinto: servono almeno `
              + `${minimo} numeri estratti (finora ne ${estratti === 1 ? 'è uscito' : 'sono usciti'} ${estratti}).`
            );
            return;
          }
        }

        premio.vinto = !premio.vinto;

        if (premio.vinto) {
          // Campo facoltativo: chi ha vinto questo premio (nome o numero cartella).
          const risposta = prompt('Chi ha vinto questo premio? (facoltativo, lascia vuoto se non lo sai)', '');
          premio.vincitore = (risposta && risposta.trim()) ? risposta.trim() : null;

          const descrizionePremio = premio.nome !== NOME_CATEGORIA[categoria]
            ? `${NOME_CATEGORIA[categoria]} - ${premio.nome}`
            : premio.nome;
          aggiungiStorico(
            `🏆 ${descrizionePremio} vinto${premio.vincitore ? ' da ' + premio.vincitore : ''}!`,
            true
          );

          if (categoria === 'tombola') {
            suonoTombola();
            mostraModal('finePartitaModal');
          } else {
            suonoVincita(RINTOCCHI[categoria] || 1);
          }
        } else {
          premio.vincitore = null;
        }

        mostraPremi();
        salvaPartita();
      });
      div.innerHTML = `
        <div class="premio-nome">${premio.nome}</div>
        ${premio.tipo === 'denaro' ? `<div class="premio-importo">€${premio.importo}</div>` : ''}
        ${premio.vincitore ? `<div class="premio-vincitore">👤 ${premio.vincitore}</div>` : ''}
      `;
      righe.appendChild(div);
    });

    gruppo.appendChild(righe);
    container.appendChild(gruppo);
  });
}
