// Piccole utilità per l'interfaccia condivise dai vari moduli.

export const $ = (id) => document.getElementById(id);

export function mostraModal(id) {
  window.bootstrap.Modal.getOrCreateInstance($(id)).show();
}

export function nascondiModal(id) {
  const istanza = window.bootstrap.Modal.getInstance($(id));
  if (istanza) istanza.hide();
}

export function modalAperto() {
  return !!document.querySelector('.modal.show');
}

export function escapeHtml(testo) {
  return String(testo).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Avviso temporaneo in alto (usato per le vincite e per i messaggi rapidi).
export function mostraToast(testo, icona = '🏆') {
  const div = document.createElement('div');
  div.className = 'toast-vincita';
  div.textContent = `${icona} ${testo}`;
  document.body.appendChild(div);
  requestAnimationFrame(() => div.classList.add('mostra'));
  setTimeout(() => {
    div.classList.remove('mostra');
    setTimeout(() => div.remove(), 500);
  }, 3500);
}

// Il menu ⚙️ si apre verso l'alto (i controlli stanno in fondo alla pagina):
// limito l'altezza allo spazio disponibile sopra il pulsante, così è sempre tutto raggiungibile.
export function impostaMenuDropdown() {
  const dropdown = document.querySelector('.controlli .dropdown');
  if (!dropdown) return;
  const toggle = dropdown.querySelector('[data-bs-toggle="dropdown"]');
  const menu = dropdown.querySelector('.dropdown-menu');

  dropdown.addEventListener('show.bs.dropdown', () => {
    const spazioSopra = toggle.getBoundingClientRect().top - 12;
    menu.style.maxHeight = Math.max(160, spazioSopra) + 'px';
  });
}
