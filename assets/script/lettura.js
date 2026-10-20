// Lettura "alla banditore": dopo il numero, le cifre lette una per una
// (es. "47" -> "quattro, sette"), utile a chi non ha sentito bene il primo annuncio.

const PAROLA_CIFRA = ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove'];

export function cifrePerCifra(numero) {
  return String(numero).split('').map((c) => PAROLA_CIFRA[Number(c)]).join(', ');
}
