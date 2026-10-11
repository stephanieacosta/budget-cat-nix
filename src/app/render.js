// =============================================================
// render.js — El corazón de la app.
//
// La regla: nadie modifica la pantalla a mano. Se cambia un dato
// y se llama a render(), que borra <main> y lo dibuja de nuevo
// desde cero. Así es imposible que la pantalla y los datos se
// desincronicen.
// =============================================================

import { U, periodContext, setRenderer } from "../services/index.js";
import { $, header } from "../shared/index.js";
import { homeView, listView, statsView, scrub } from "../features/index.js";

export function render() {
  const ctx = periodContext();

  let h = header();
  if (U.tab === "home") h += homeView(ctx);
  else if (U.tab === "list") h += listView(ctx);
  else h += statsView(ctx);

  $("m").innerHTML = h;

  // La gráfica de línea arranca con la guía puesta en el punto más alto.
  if (U.tab === "stats" && U.ct === "line" && U.LD) scrub(U.LD.peak);

  // Marca la pestaña activa en la barra de abajo.
  [...$("np").children].forEach(b => b.classList.toggle("on", b.dataset.t === U.tab));
}

// Las funcionalidades piden redibujar con rerender(), sin importar este
// archivo. Aquí se les dice a quién llamar. Ver services/rerender.js.
setRenderer(render);
