// =============================================================
// cats.js — Consultar categorías: nombre, emoji y color.
// =============================================================

import { S } from "./state.js";
import { PAL, VIV, EN_NAMES } from "../config/constants.js";
import { t, isEN } from "./i18n.js";

/** Categoría por id. Si no existe (se borró y quedaron movimientos huérfanos) devuelve una de relleno. */
export const cat = id => S.cats.find(c => c.id === id) || { e: "📦", n: t("noCat"), t: "g" };

/** Nombre de una categoría, traducido si es una de las que vienen por defecto. */
export const catName = c => (isEN() && EN_NAMES[c.n] ? EN_NAMES[c.n] : c.n);

/** Color suave y color vivo de una categoría, a partir de su índice de paleta. */
export const colorOf = c => PAL[(c.k || 0) % PAL.length];
export const vividOf = c => VIV[(c.k || 0) % VIV.length];

/** Las mismas dos, pero buscando por id. */
export const col = id => colorOf(cat(id));
export const viv = id => vividOf(cat(id));

/** Nombre y emoji juntos, listo para pintar. El nombre va escapado por quien lo use. */
export const catsOfType = type => S.cats.filter(c => c.t === type);
