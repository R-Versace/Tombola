// Lettura dei numeri "alla banditore".
// Funzioni pure (niente DOM, niente stato): costruiscono il testo che la voce pronuncerà.
//
//   47  ->  "quarantasette. quattro, sette. <detto>"
//
// I numeri sono scritti a parole (invece di lasciare "47" al sintetizzatore) perché
// così la pronuncia è identica su qualunque voce e dispositivo.

const UNITA = [
  'zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove',
  'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici',
  'diciassette', 'diciotto', 'diciannove'
];
const DECINE = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];

// Numeri da 0 a 99 in lettere: 21 -> "ventuno", 28 -> "ventotto", 23 -> "ventitré".
export function numeroInParole(n) {
  if (n < 20) return UNITA[n];
  const decina = Math.floor(n / 10);
  const unita = n % 10;
  let parola = DECINE[decina];
  if (unita === 0) return parola;
  if (unita === 1 || unita === 8) parola = parola.slice(0, -1); // ventuno, ventotto
  return parola + (unita === 3 ? 'tré' : UNITA[unita]);
}

// Le singole cifre, separate da una virgola (pausa breve): 47 -> "quattro, sette".
export function cifreInParole(n) {
  return String(n).split('').map((c) => UNITA[Number(c)]).join(', ');
}

// Testo completo dell'annuncio. Le cifre si leggono solo dal 10 in su
// (per "7" sarebbe una ripetizione inutile).
export function testoAnnuncio(numero, { detto = '', leggiCifre = true } = {}) {
  const parti = [numeroInParole(numero)];
  if (leggiCifre && numero >= 10) parti.push(cifreInParole(numero));
  if (detto) parti.push(detto);
  return parti.join('. ');
}
