// =============================================================
// views/list.js — Pantalla de movimientos.
// Resumen del periodo, filtro y la lista agrupada por día.
// =============================================================

import { MAX_LIST } from "../../config/index.js";
import { U, t, LOC, money, esc, cat, catName, viv, periodLabel } from "../../services/index.js";

export function listView({ tx, sum, P }) {
  const inP = x => x.date >= P.from && x.date <= P.to;
  const inc = sum("i", inP), exp = sum("g", inP);

  let h = `
    <div class="nv nv-top">
      <button class="ar" data-nav="-1">‹</button>
      <button class="pill pill-flat" id="pbtn">${periodLabel()}</button>
      <button class="ar" data-nav="1">›</button>
    </div>

    <div class="sum">
      <div class="sum-inc"><small>${t("income")}</small><b>+${money(inc)}</b></div>
      <div class="sum-exp"><small>${t("expenses")}</small><b>${money(exp)}</b></div>
      <div class="sum-bal"><small>${t("balance")}</small><b>${money(inc - exp)}</b></div>
    </div>

    <div class="chips2 chips2-gap">
      ${[["all", "all"], ["g", "expenses"], ["i", "income"]]
        .map(([k, label]) => `<button data-f="${k}" class="${U.lf === k ? "on" : ""}">${t(label)}</button>`)
        .join("")}
    </div>`;

  let list = tx
    .filter(x => inP(x) && (U.lf === "all" || x.t === U.lf))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  const total = list.length;
  list = list.slice(0, MAX_LIST);

  h += total
    ? `<div class="empty empty-hint">${t("hint")}</div>`
    : `<div class="empty empty-big">${t("noTx")}</div>`;

  // Cabecera de día cada vez que cambia la fecha.
  // Mirando un solo día no hace falta, porque ya está en el botón de arriba.
  let lastDate = "";
  list.forEach(x => {
    if (U.lm !== "d" && x.date !== lastDate) {
      lastDate = x.date;
      const label = new Date(x.date + "T12:00")
        .toLocaleDateString(LOC(), { weekday: "long", day: "numeric", month: "short" });
      h += `<div class="lab lab-day">${label}</div>`;
    }
    h += U.delId === x.id ? confirmRow(x) : txRow(x);
  });

  if (total > MAX_LIST) h += `<div class="empty empty-note">${t("capped", MAX_LIST)}</div>`;
  return h;
}

/** Una fila normal: emoji, nota, categoría, monto y la ✕ para borrar. */
function txRow(x) {
  const c = cat(x.cat);
  const name = esc(catName(c));
  const isInc = x.t === "i";
  // Los gastos se tiñen con el color de su categoría; los ingresos llevan
  // su propio verde y no entran en ese sistema. La clase mvl-cat es la que
  // activa el velo de base.css, para que el verde no se vea aclarado.
  return `
    <div class="mvl ${isInc ? "mvl-inc" : "mvl-cat"}" data-e="${x.id}"
         ${isInc ? "" : `style="--c:${viv(x.cat)}"`}>
      <span class="e">${c.e}</span>
      <div class="g">${esc(x.note || name)}${x.note ? `<small>${name}</small>` : ""}</div>
      <b>${isInc ? "+" : ""}${money(x.amt)}</b>
      <button class="x" data-d="${x.id}">✕</button>
    </div>`;
}

/** La misma fila, convertida en «¿seguro?» tras pulsar la ✕. */
function confirmRow(x) {
  return `
    <div class="mvl cfm">
      <span class="g">${t("delTxQ")}</span>
      <span class="cfm-btns">
        <button class="cb" data-dn="1">${t("cancel")}</button>
        <button class="cb red" data-dy="${x.id}">${t("del")}</button>
      </span>
    </div>`;
}
