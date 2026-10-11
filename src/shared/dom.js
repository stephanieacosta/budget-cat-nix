// =============================================================
// dom.js — Lo mínimo para hablar con la página.
// =============================================================

/** Atajo de document.getElementById. Se usa en toda la app. */
export const $ = id => document.getElementById(id);

let toastTimer;

/**
 * Aviso breve abajo de la pantalla. Usa el elemento #toast, que es
 * un "popover": el navegador lo pone por encima de todo, incluso de
 * los diálogos abiertos. Nunca usamos alert() del navegador.
 */
export function flash(msg) {
  const el = $("toast");
  el.textContent = msg;
  try {
    if (el.matches && el.matches(":popover-open")) el.hidePopover();
    el.showPopover();
  } catch (e) { /* navegador sin soporte de popover: el aviso se omite */ }
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    try { el.hidePopover(); } catch (e) {}
  }, 2400);
}

/** ¿Está abierto el panel de añadir movimiento? */
export const addPanelOpen = () => $("add").classList.contains("on");
