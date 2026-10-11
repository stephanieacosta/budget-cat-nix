// =============================================================
// format.js — Convertir datos en texto legible.
// Dinero, números, fechas y escapado de HTML.
// =============================================================

import { S } from "./state.js";
import { SYM, NO_DECIMALS } from "../config/constants.js";
import { isEN, THOUSANDS, DECIMAL } from "./i18n.js";

/** Símbolo de la moneda activa. */
export const sym = () => SYM[S.cur] || "$";

/** ¿La moneda activa se muestra sin decimales? */
const whole = () => NO_DECIMALS.includes(S.cur);

/** Número con separadores de miles, siempre en positivo. */
export const num = n =>
  Math.abs(n).toLocaleString(isEN() ? "en-US" : "de-DE", {
    maximumFractionDigits: whole() ? 0 : 2,
  });

/** "−$12.500" */
export const money = n => (n < 0 ? "-" : "") + sym() + num(n);

/** Igual que money, con el símbolo pequeño y elevado (para el balance gigante). */
export const bigMoney = n => (n < 0 ? "-" : "") + "<sup>" + sym() + "</sup>" + num(n);

/** Versión compacta para ejes de gráficas: $1,2M / $450K / $900 */
export const compact = n => {
  if (Math.abs(n) < 1000) return money(n);
  const [v, u] = Math.abs(n) >= 1e6 ? [n / 1e6, "M"] : [n / 1e3, "K"];
  return sym() + v.toFixed(1).replace(/\.0$/, "").replace(".", DECIMAL()) + u;
};

/** Texto escrito por el usuario → número. "12.500,50" → 12500.5 */
export const parseAmount = v =>
  parseFloat(String(v).split(THOUSANDS()).join("").replace(DECIMAL(), ".")) || 0;

/** Da formato al monto mientras se escribe: mete los puntos de miles en vivo. */
export const formatAmount = v => {
  const th = THOUSANDS(), dc = DECIMAL();
  v = String(v).replace(dc === "." ? /[^\d.]/g : /[^\d,]/g, "");
  let [ent, ...dec] = v.split(dc);
  ent = ent.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, th);
  return whole() || !dec.length ? ent : ent + dc + dec.join("").slice(0, 2);
};

/** Tamaño de archivo legible. */
export const formatSize = n =>
  n < 1024 ? n + " B" : (n / 1024).toFixed(1).replace(".", DECIMAL()) + " KB";

// ---------- Fechas ----------
// Todas las fechas de la app son textos "AAAA-MM-DD".
// Se comparan con < y > directamente, porque ese formato ordena bien como texto.

/** Date → "AAAA-MM-DD" (en hora local, no UTC). */
export const iso = d => {
  const z = new Date(d);
  return z.getFullYear() + "-" + pad(z.getMonth() + 1) + "-" + pad(z.getDate());
};

/** 3 → "03" */
export const pad = n => String(n).padStart(2, "0");

/** Suma (o resta) días a una fecha. El mediodía evita líos de horario de verano. */
export const addDays = (d, n) => {
  const x = new Date(d + "T12:00");
  x.setDate(x.getDate() + n);
  return iso(x);
};

/** Días entre dos fechas. */
export const dayDiff = (a, b) =>
  Math.round((new Date(b + "T12:00") - new Date(a + "T12:00")) / 864e5);

/** Recorta un día imposible al último real del mes: "2026-02-31" → "2026-02-28". */
export const clampDay = d => {
  const [y, m, dd] = d.split("-").map(Number);
  return y + "-" + pad(m) + "-" + pad(Math.min(dd, new Date(y, m, 0).getDate()));
};

/** Escapa texto del usuario antes de meterlo en HTML. Evita que una nota rompa la página. */
export const esc = s =>
  String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
