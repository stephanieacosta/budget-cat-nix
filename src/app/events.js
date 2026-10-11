// =============================================================
// events.js — Todos los toques sobre la pantalla principal.
//
// Hay un único manejador puesto en <main>, no uno por botón.
// Se llama "delegación": como render() vuelve a crear todos los
// botones cada vez, ponerles manejadores propios no serviría.
// Cada botón lleva un atributo data-* que dice qué hacer.
// =============================================================

import { S, U, save, t, TODAY } from "../services/index.js";
import { $, flash } from "../shared/index.js";
import { scrub, openSettings, openPeriod, stepPeriod, openAdd } from "../features/index.js";
import { render } from "./render.js";

// ---------- Barra de pestañas ----------

$("np").onclick = e => {
  const b = e.target.closest("button");
  if (!b) return;
  U.tab = b.dataset.t;
  U.delId = null;
  render();
  window.scrollTo(0, 0);
};

// ---------- Pantalla principal ----------

$("m").onclick = e => {
  const x = e.target;
  let b;

  if (x.id === "gear") return openSettings();
  if (x.closest("#pbtn")) return openPeriod();

  // Borrar un movimiento: ✕ pide confirmación, y luego sí o no.
  if ((b = x.closest("[data-dy]"))) {
    S.tx = S.tx.filter(y => y.id !== +b.dataset.dy);
    U.delId = null;
    save();
    render();
    flash(t("deleted"));
    return;
  }
  if (x.closest("[data-dn]")) { U.delId = null; return render(); }
  if ((b = x.closest("[data-d]"))) { U.delId = +b.dataset.d; return render(); }

  // Flechas ‹ › : mueven el periodo un paso.
  if ((b = x.closest("[data-nav]"))) {
    stepPeriod(+b.dataset.nav);
    U.delId = null;
    return render();
  }
  if (x.closest("[data-today]")) {
    U.M = TODAY.slice(0, 7);
    U.selDay = TODAY;
    U.delId = null;
    return render();
  }

  // Filtro de la lista y selectores de las gráficas.
  if ((b = x.closest("[data-f]"))) { U.lf = b.dataset.f; return render(); }
  if ((b = x.closest("[data-s]"))) { U.sk = b.dataset.s; U.selC = null; return render(); }
  if ((b = x.closest("[data-ct]"))) { U.ct = b.dataset.ct; U.selC = null; U.selMi = null; return render(); }

  // Tocar una porción o una categoría la resalta; tocarla otra vez la suelta.
  if ((b = x.closest("[data-cat]"))) {
    const id = +b.dataset.cat;
    U.selC = U.selC === id ? null : id;
    return render();
  }
  if ((b = x.closest("[data-mi]"))) {
    const i = +b.dataset.mi;
    U.selMi = U.selMi === i ? null : i;
    return render();
  }

  // Tocar un movimiento lo abre para editarlo.
  if ((b = x.closest("[data-e]"))) {
    const x2 = S.tx.find(z => z.id === +b.dataset.e);
    if (x2) openAdd(x2);
  }
};

// ---------- Deslizar el dedo sobre la gráfica de línea ----------

function lineCursor(e) {
  const svg = e.target.closest?.("[data-lc]");
  if (!svg || !U.LD) return;
  // Se pasa de píxeles de pantalla al sistema del SVG (300 de ancho,
  // con la línea entre x=12 y x=288).
  const rect = svg.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 300;
  const N = U.LD.vals.length;
  const i = N > 1
    ? Math.max(0, Math.min(N - 1, Math.round(((x - 12) / 276) * (N - 1))))
    : 0;
  scrub(i);
}

$("m").addEventListener("pointermove", lineCursor);
$("m").addEventListener("pointerdown", lineCursor);
