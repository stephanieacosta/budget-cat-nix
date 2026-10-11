// =============================================================
// rerender.js — Pedir un redibujado sin depender de quién lo hace.
//
// El problema que resuelve: las funcionalidades (guardar un gasto,
// borrar una categoría) necesitan refrescar la pantalla, pero la
// pantalla la dibuja app/render.js, que a su vez necesita a las
// funcionalidades para pintarlas. Importarse mutuamente sería un
// círculo.
//
// Aquí se rompe: app/render.js se registra una vez al arrancar, y
// todo el mundo llama a rerender() sin saber qué hay detrás.
// Así las capas van en una sola dirección:
//     config → services → shared → features → app
// =============================================================

let renderer = () => {};

/** Lo llama app/render.js al cargarse. */
export function setRenderer(fn) {
  renderer = fn;
}

/** Redibuja la pantalla principal. */
export function rerender() {
  renderer();
}
