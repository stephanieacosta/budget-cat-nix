// =============================================================
// query.js — Preguntas sobre los movimientos.
// Aquí viven las sumas. Ninguna vista calcula totales por su cuenta.
// =============================================================

import { S } from "./state.js";
import { getPeriod } from "./period.js";

/** Solo los movimientos de la moneda activa: la app no mezcla monedas. */
export const txOfCurrency = () => S.tx.filter(x => x.cur === S.cur);

/** Suma los movimientos de un tipo ("g" o "i") que cumplan el filtro. */
export const sumOf = (list, kind, pred) =>
  list.filter(x => x.t === kind && pred(x)).reduce((a, x) => a + x.amt, 0);

/**
 * Todo lo que una vista necesita saber del periodo activo, calculado una vez.
 *   tx    movimientos de la moneda actual
 *   sum   suma por tipo y filtro
 *   P     {from, to}
 *   inP   ¿este movimiento cae en el periodo?
 *   inc   total de ingresos del periodo
 *   exp   total de gastos del periodo
 *   by    totales por categoría, ya ordenados de mayor a menor
 */
export function periodContext() {
  const tx = txOfCurrency();
  const sum = (kind, pred) => sumOf(tx, kind, pred);
  const P = getPeriod();
  const inP = x => x.date >= P.from && x.date <= P.to;

  const by = kind => {
    const acc = {};
    tx.filter(x => x.t === kind && inP(x)).forEach(x => {
      acc[x.cat] = (acc[x.cat] || 0) + x.amt;
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  };

  return { tx, sum, P, inP, inc: sum("i", inP), exp: sum("g", inP), by };
}
