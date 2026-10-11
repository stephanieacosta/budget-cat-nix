// =============================================================
// period.js — Qué trozo de tiempo estás mirando.
//
// U.lm dice el modo: día, mes, año o rango libre.
// De ahí sale el par {from, to} con el que se filtra todo.
// =============================================================

import { U } from "./state.js";
import { iso } from "./format.js";
import { LOC } from "./i18n.js";

/** Hoy, fijado al arrancar la app. */
export const TODAY = iso(new Date());

// Arranque: mes actual y día de hoy.
U.M = TODAY.slice(0, 7);
U.selDay = TODAY;

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Rango de fechas del periodo activo.
 * El "-31" del mes es intencional: las fechas se comparan como texto,
 * así que "2026-02-28" < "2026-02-31" y el mes entero entra igual.
 */
export function getPeriod() {
  if (U.lm === "d") return { from: U.selDay, to: U.selDay };
  if (U.lm === "y") {
    const y = U.M.slice(0, 4);
    return { from: y + "-01-01", to: y + "-12-31" };
  }
  if (U.lm === "r" && U.rFrom) return { from: U.rFrom, to: U.rTo };
  return { from: U.M + "-01", to: U.M + "-31" };
}

/** Nombre del mes, con el año solo si no es el actual: "octubre" / "marzo 2025". */
export const monthLabel = m => {
  const [y, n] = m.split("-");
  return (
    new Date(+y, +n - 1, 1).toLocaleDateString(LOC(), { month: "long" }) +
    (+y !== CURRENT_YEAR ? " " + y : "")
  );
};

/** Texto del botón de periodo, distinto en cada modo. */
export function periodLabel() {
  const f = (d, o) => new Date(d + "T12:00").toLocaleDateString(LOC(), o);
  if (U.lm === "d") return f(U.selDay, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  if (U.lm === "y") return U.M.slice(0, 4);
  if (U.lm === "r" && U.rFrom) {
    const sameYear = U.rFrom.slice(0, 4) === U.rTo.slice(0, 4);
    const a = f(U.rFrom, sameYear
      ? { day: "numeric", month: "short" }
      : { day: "numeric", month: "short", year: "numeric" });
    const b = f(U.rTo, { day: "numeric", month: "short", year: "numeric" });
    return a + " – " + b;
  }
  return monthLabel(U.M);
}
