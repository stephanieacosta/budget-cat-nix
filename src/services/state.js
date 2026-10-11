// =============================================================
// state.js — La única fuente de verdad.
//
//   S = tus datos      (se guardan en localStorage)
//   U = la interfaz    (qué pantalla miras; NO se guarda)
//
// Nada más en la app guarda estado propio, salvo detalles
// internos de un diálogo mientras está abierto.
// =============================================================

import { PAL, DEFAULT_CATS, DEFAULT_INCOME_CATS } from "../config/constants.js";
import { readStored, writeStored } from "./storage.js";

/** Datos del usuario. `export let` permite que los demás módulos vean el reemplazo al importar un respaldo. */
export let S = {
  cur: "COP",       // moneda activa
  lang: "es",       // idioma
  skin: "plain",    // tema visual: "plain" | "cats"
  budget: 0,        // presupuesto mensual (0 = sin presupuesto)
  carry: true,      // arrastrar el saldo de meses anteriores al balance
  cats: DEFAULT_CATS.map(c => ({ ...c })),
  tx: [],           // movimientos
};

/** Estado de la interfaz. Se reinicia en cada arranque, a propósito. */
export const U = {
  tab: "home",      // pestaña: home | list | stats
  lm: "m",          // modo de periodo: d(ía) | m(es) | y(año) | r(ango)
  M: "",            // mes mirado, formato "AAAA-MM" (lo fija period.js)
  selDay: "",       // día mirado cuando lm === "d"
  rFrom: null,      // inicio del rango cuando lm === "r"
  rTo: null,        // fin del rango
  lf: "all",        // filtro de la lista: all | g | i
  delId: null,      // movimiento con la confirmación de borrado abierta
  sk: "g",          // gráficas: ¿gastos o ingresos?
  ct: "donut",      // tipo de gráfica: donut | pie | bars | line | months
  selC: null,       // categoría seleccionada en la gráfica
  selMi: null,      // mes seleccionado en la gráfica de meses
  LD: null,         // datos de la gráfica de línea, para el deslizamiento
  kind: "g",        // panel de añadir: ¿gasto o ingreso?
  editId: null,     // movimiento que se está editando (null = uno nuevo)
  selCat: null,     // categoría elegida al editar
  delConf: false,   // confirmación de borrado dentro del panel de añadir
  budEdit: false,   // ajustes: ¿editando el presupuesto?
  delCatId: null,   // ajustes: categoría con la confirmación de borrado abierta
};

/** Guarda S en el navegador. Si falla (almacenamiento lleno o bloqueado) no rompe la app. */
export function save() {
  writeStored(S);
}

/** Reemplaza S por completo. Lo usa la importación de respaldos. */
export function replaceState(next) {
  S = next;
}

/**
 * Asigna un índice de color a las categorías que no lo tengan,
 * intentando no repetir ninguno mientras queden libres.
 */
export function assignColors() {
  const used = new Set(S.cats.map(c => c.k).filter(k => k != null));
  S.cats.forEach((c, ix) => {
    if (c.k != null) return;
    let i = 0;
    while (used.has(i) && i < PAL.length) i++;
    c.k = i < PAL.length ? i : ix % PAL.length;
    used.add(c.k);
  });
}

/** Primer índice de color libre, para una categoría nueva. */
export function nextColor() {
  const used = new Set(S.cats.map(c => c.k));
  for (let i = 0; i < PAL.length; i++) if (!used.has(i)) return i;
  return S.cats.length % PAL.length;
}

/**
 * Pone al día datos venidos de versiones anteriores:
 * toda categoría tiene tipo, y existe al menos una de ingreso.
 */
export function normalize() {
  S.cats.forEach(c => { if (!c.t) c.t = "g"; });
  if (!S.cats.some(c => c.t === "i")) {
    S.cats.push(...DEFAULT_INCOME_CATS.map(c => ({ ...c })));
  }
  assignColors();
}

/**
 * Lee lo guardado y lo fusiona SOBRE los valores por defecto.
 * Ese orden importa: si una versión futura añade un campo nuevo a S,
 * los respaldos viejos no lo traen y el valor por defecto se mantiene.
 */
export function load() {
  const stored = readStored();
  if (stored) S = Object.assign(S, stored);
  normalize();
}
