// =============================================================
// ui.js — Trozos de HTML que usan varias pantallas.
//
// Todas estas funciones devuelven TEXTO. No tocan la página:
// de eso se encarga render(), que lo vuelca todo de una vez.
// =============================================================

import { t } from "../services/i18n.js";
import { money, esc } from "../services/format.js";
import { cat, catName, viv } from "../services/categories.js";
import { periodLabel } from "../services/period.js";

/** Cabecera: logo centrado y el engranaje de ajustes. */
export const header = () => `
  <div class="top">
    <span style="width:36px"></span>
    <div class="logo">budget</div>
    <button class="ico" id="gear" aria-label="${t("settings")}">⚙︎</button>
  </div>`;

/** Botón que abre el selector de periodo. */
export const periodPill = () => `<button class="pill" id="pbtn">${periodLabel()}</button>`;

/**
 * Fila de categoría del inicio. La barra de color de fondo se acorta
 * según el puesto en el ranking, así se lee de un vistazo quién gasta más.
 *
 * La barra lleva el color VIVO de la categoría, el mismo que la leyenda de
 * las gráficas, y es el CSS quien lo rebaja a tinte con opacity. Antes
 * usaba la paleta suave, que es casi blanca: sobre una tarjeta blanca se
 * quedaba en 1,13:1 y la fila parecía no tener color. Derivar el tinte del
 * color vivo mantiene una sola fuente de color por categoría y deja que
 * cada tema decida cuánta presencia quiere.
 */
export const catRow = (catId, value, rank, isIncome) => `
  <div class="crow">
    <i style="width:${Math.max(30, 100 - rank * 23.3)}%;background:${viv(+catId)}"></i>
    <div>
      <span>${cat(+catId).e} ${esc(catName(cat(+catId)))}</span>
      <b>${isIncome ? "+" : ""}${money(value)}</b>
    </div>
  </div>`;

/**
 * Un arco de la dona o del pastel.
 * El truco: es un círculo completo cuyo trazo se dibuja solo un tanto por
 * ciento (stroke-dasharray) y se desplaza (stroke-dashoffset). Con
 * pathLength="100" las cuentas van directamente en porcentajes.
 */
export const arc = (r, width, color, pct, offset, extra = "") => `
  <circle r="${r}" cx="21" cy="21" fill="none" stroke="${color}" stroke-width="${width}"
          pathLength="100" stroke-dasharray="${pct} ${100 - pct}"
          stroke-dashoffset="${-offset}" ${extra}/>`;
