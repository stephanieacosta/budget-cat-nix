// =============================================================
// period-dialog.js — La ventana que se abre al tocar el periodo.
//
// Cuatro modos: día (calendario), mes, año y rango libre
// (se tocan dos días). Las cifras de cada casilla ayudan a
// encontrar dónde hubo movimiento.
// =============================================================

import {
  U, t, LOC, isEN, compact, iso, pad, addDays, dayDiff,
  TODAY, txOfCurrency, sumOf, rerender,
} from "../../services/index.js";
import { $ } from "../../shared/index.js";

// Estado propio del diálogo mientras está abierto.
let mode = "m";        // d | m | y | r
let calMonth;          // mes que muestra el calendario
let year;              // año que muestran las casillas de meses
let decadeStart;       // primer año de la cuadrícula de años
let rangeAnchor = null; // primer día tocado al elegir un rango

export function openPeriod() {
  mode = U.lm;
  rangeAnchor = null;
  calMonth = U.M;
  year = +U.M.slice(0, 4);
  decadeStart = year - 5;
  renderPeriod();
  if (!$("per").open) $("per").showModal();
}

function renderPeriod() {
  const tx = txOfCurrency();
  const sum = (kind, pred) => sumOf(tx, kind, pred);

  /** Cuadrícula de casillas (meses o años) con sus totales. */
  const tiles = (items, selected, attr) => `
    <div class="yg">${items.map(([key, name, prefix]) => {
      const inc = sum("i", x => x.date.startsWith(prefix));
      const exp = sum("g", x => x.date.startsWith(prefix));
      return `<button class="yt ${key === selected ? "on" : ""}" ${attr}="${key}">${name}
                <small class="inc">${inc ? "+" + compact(inc) : "–"}</small>
                <small>${exp ? "−" + compact(exp) : "–"}</small>
              </button>`;
    }).join("")}</div>`;

  let label, body;

  if (mode === "d" || mode === "r") {
    const y = +calMonth.slice(0, 4), mo = +calMonth.slice(5, 7);
    label = new Date(y, mo - 1, 1).toLocaleDateString(LOC(), { month: "long", year: "numeric" });

    const daysInMonth = new Date(y, mo, 0).getDate();
    // En español la semana empieza en lunes; en inglés, en domingo.
    const offset = (new Date(y, mo - 1, 1).getDay() + (isEN() ? 0 : 6)) % 7;
    const firstWeekday = isEN() ? 7 : 1;

    // Qué días tienen movimiento, para los puntitos de color.
    const activity = {};
    tx.filter(x => x.date.startsWith(calMonth)).forEach(x => {
      (activity[x.date] = activity[x.date] || {})[x.t] = 1;
    });

    const weekdays = Array.from({ length: 7 }, (_, i) =>
      `<span>${new Date(2024, 0, firstWeekday + i)
        .toLocaleDateString(LOC(), { weekday: "short" })
        .slice(0, isEN() ? 3 : 2)
        .replace(/^./, c => c.toUpperCase())}</span>`).join("");

    const blanks = Array.from({ length: offset }, () => `<button class="cd e" tabindex="-1"></button>`).join("");

    const cells = Array.from({ length: daysInMonth }, (_, i) => {
      const d = calMonth + "-" + pad(i + 1);
      const a = activity[d] || {};
      return `<button class="cd ${dayClass(d)} ${d === TODAY ? "td" : ""}" data-pday="${d}">
                <span>${i + 1}</span>
                <i class="dots">${a.i ? '<b class="d-inc"></b>' : ""}${a.g ? '<b class="d-exp"></b>' : ""}</i>
              </button>`;
    }).join("");

    body = `<div class="cal"><div class="wk">${weekdays}</div><div class="gd">${blanks}${cells}</div></div>` +
      (mode === "r" ? `<div class="empty empty-note">${t(rangeAnchor ? "rangeEnd" : "rangeStart")}</div>` : "");
  }
  else if (mode === "m") {
    label = String(year);
    body = tiles(
      Array.from({ length: 12 }, (_, i) => {
        const ym = year + "-" + pad(i + 1);
        return [ym, new Date(year, i, 1).toLocaleDateString(LOC(), { month: "short" }), ym];
      }),
      U.lm === "m" ? U.M : "",
      "data-pym"
    );
  }
  else {
    label = decadeStart + " – " + (decadeStart + 11);
    body = tiles(
      Array.from({ length: 12 }, (_, i) => {
        const yy = String(decadeStart + i);
        return [yy, yy, yy];
      }),
      U.lm === "y" ? U.M.slice(0, 4) : "",
      "data-py"
    );
  }

  $("per").innerHTML = `
    <div class="chips2 sm">
      ${[["d", "mDay"], ["m", "mMonth"], ["y", "mYear"], ["r", "mRange"]]
        .map(([k, l]) => `<button data-pm="${k}" class="${mode === k ? "on" : ""}">${t(l)}</button>`).join("")}
    </div>
    <div class="nv nv-mid">
      <button class="ar" data-pnav="-1">‹</button><b>${label}</b><button class="ar" data-pnav="1">›</button>
    </div>
    ${body}
    <div class="per-foot">
      <button class="lnk" data-ptoday="1">${t("today")}</button>
      <button class="lnk muted" data-pclose="1">${t("close")}</button>
    </div>`;
}

/** Clase de una casilla del calendario: seleccionada, dentro del rango, o nada. */
function dayClass(d) {
  if (mode === "r") {
    if (rangeAnchor) return d === rangeAnchor ? "on" : "";
    if (U.lm !== "r") return "";
    if (d === U.rFrom || d === U.rTo) return "on";
    return d > U.rFrom && d < U.rTo ? "rg" : "";
  }
  return U.lm === "d" && d === U.selDay ? "on" : "";
}

$("per").onclick = e => {
  const x = e.target;
  let b;

  if (x === $("per") || x.closest("[data-pclose]")) return $("per").close();

  if ((b = x.closest("[data-pm]"))) {
    mode = b.dataset.pm;
    rangeAnchor = null;
    return renderPeriod();
  }

  if ((b = x.closest("[data-pnav]"))) {
    const dir = +b.dataset.pnav;
    if (mode === "d" || mode === "r") {
      const y = +calMonth.slice(0, 4), mo = +calMonth.slice(5, 7);
      calMonth = iso(new Date(y, mo - 1 + dir, 1)).slice(0, 7);
    }
    else if (mode === "m") year += dir;
    else decadeStart += dir * 12;
    return renderPeriod();
  }

  if ((b = x.closest("[data-pday]"))) {
    const day = b.dataset.pday;
    if (mode === "r") {
      // Primer toque: se guarda. Segundo: se cierra el rango.
      if (!rangeAnchor) {
        rangeAnchor = day;
        return renderPeriod();
      }
      const lo = rangeAnchor < day ? rangeAnchor : day;
      const hi = rangeAnchor < day ? day : rangeAnchor;
      U.rFrom = lo;
      U.rTo = hi;
      rangeAnchor = null;
      U.lm = "r";
      U.M = hi.slice(0, 7);
    } else {
      U.selDay = day;
      U.M = day.slice(0, 7);
      U.lm = "d";
    }
  }
  else if ((b = x.closest("[data-pym]"))) { U.M = b.dataset.pym; U.lm = "m"; }
  else if ((b = x.closest("[data-py]"))) { U.M = b.dataset.py + "-" + U.M.slice(5); U.lm = "y"; }
  else if (x.closest("[data-ptoday]")) {
    U.M = TODAY.slice(0, 7);
    if (mode === "d") { U.selDay = TODAY; U.lm = "d"; }
    else if (mode === "r") { U.rFrom = U.rTo = TODAY; U.lm = "r"; }
    else U.lm = mode;
  }
  else return;

  U.delId = null;
  $("per").close();
  rerender();
};

/** Mueve el periodo activo un paso adelante o atrás (flechas ‹ › de la lista). */
export function stepPeriod(dir) {
  if (U.lm === "r" && U.rFrom) {
    const len = dayDiff(U.rFrom, U.rTo) + 1;
    U.rFrom = addDays(U.rFrom, dir * len);
    U.rTo = addDays(U.rTo, dir * len);
    U.M = U.rTo.slice(0, 7);
  }
  else if (U.lm === "d") {
    U.selDay = addDays(U.selDay, dir);
    U.M = U.selDay.slice(0, 7);
  }
  else if (U.lm === "y") {
    U.M = +U.M.slice(0, 4) + dir + "-" + U.M.slice(5);
  }
  else {
    const y = +U.M.slice(0, 4), mo = +U.M.slice(5, 7);
    U.M = iso(new Date(y, mo - 1 + dir, 1)).slice(0, 7);
  }
}
