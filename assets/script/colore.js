// Utilità di colore per disegnare le cartelle PDF nei colori del tema grafico attivo.

// "#c41e3a" -> [196, 30, 58]
export function hexRgb(hex) {
  const pulito = hex.replace('#', '');
  const intero = parseInt(pulito, 16);
  return [(intero >> 16) & 255, (intero >> 8) & 255, intero & 255];
}

// Mescola un colore con il bianco: quota 0 = colore pieno, quota 1 = bianco pieno.
// Usato per ottenere tinte pastello leggere (poco inchiostro da stampare) invece
// del grigio piatto delle caselle vuote.
export function tintaPastello(hex, quota = 0.85) {
  const [r, g, b] = hexRgb(hex);
  const mescola = (c) => Math.round(c + (255 - c) * quota);
  return [mescola(r), mescola(g), mescola(b)];
}
