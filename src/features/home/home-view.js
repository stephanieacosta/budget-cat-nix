// =============================================================
// views/home.js — Pantalla de inicio.
// Balance, totales del periodo, presupuesto y ranking de categorías.
// =============================================================

import { S, U, t, money, bigMoney } from "../../services/index.js";
import { periodPill, catRow } from "../../shared/index.js";

export function homeView({ sum, inc, exp, by, P }) {
  // Con "traer saldo" activado el balance es histórico: todo lo
  // ingresado menos todo lo gastado hasta el final del periodo.
  const balance = S.carry
    ? sum("i", x => x.date <= P.to) - sum("g", x => x.date <= P.to)
    : inc - exp;

  const ents = by("g");
  const pct = S.budget > 0 ? Math.min(100, (exp / S.budget) * 100) : 0;
  const barColor = pct >= 100 ? "#ff453a" : pct >= 80 ? "#ff9f0a" : "#30b350";
  const rest = S.budget - exp;

  // La barra de presupuesto solo tiene sentido mirando un mes completo.
  const budgetBar = S.budget && U.lm === "m" ? `
    <div class="bar"><i style="width:${pct}%;background:${barColor}"></i></div>
    <div class="barlab">
      ${t("budget")} ${money(S.budget)} ·
      ${rest >= 0 ? t("left") + " " + money(rest) : t("over") + " " + money(-rest)}
    </div>` : "";

  return `
    <div class="balw">
      <div class="bal">${bigMoney(balance)}</div>
      <small>${t("balance")}</small>
      ${periodPill()}
    </div>

    <div class="lab">${t("totals")}</div>
    <div class="tot tot-inc">
      <span>💵 <span class="totname">${t("income")}</span></span>
      <b>+${money(inc)}</b>
    </div>
    <div class="tot tot-exp">
      <span>💸 <span class="totname">${t("expenses")}</span></span>
      <b>${money(exp)}</b>
    </div>
    ${budgetBar}

    <div class="lab">${t("categories")}</div>
    ${ents.length
      ? ents.map(([c, v], i) => catRow(c, v, i, false)).join("")
      : `<div class="empty">${t("noExp")}</div>`}`;
}
