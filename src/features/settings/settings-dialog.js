// =============================================================
// settings.js — Diálogo de ajustes.
//
// Idioma, moneda, tema, presupuesto, arrastre de saldo,
// categorías y respaldo. Se redibuja entero en cada cambio,
// igual que la pantalla principal.
// =============================================================

import { CURS, PAL } from "../../config/index.js";
import {
  S, U, save, t, DECIMAL, money, parseAmount, formatAmount, applySkin, rerender,
} from "../../services/index.js";
import { $, flash, addPanelOpen, applyStaticText } from "../../shared/index.js";
import { openCat, catSection, canDelete, removeCat } from "../categories/index.js";
import { exportData, openBackup } from "../backup/index.js";
import { catGrid, renderDelete } from "../transactions/index.js";

export function openSettings() {
  const budgetRow = U.budEdit
    ? `<div class="set"><span>${t("budgetM")}</span>
         <span class="inline">
           <input class="inp2 budget-in" id="bin" inputmode="decimal" autocomplete="off"
                  placeholder="0" value="${S.budget ? formatAmount(String(S.budget).replace(".", DECIMAL())) : ""}">
           <button class="lnk" id="bsv">${t("save")}</button>
           <button class="lnk muted" id="bcn">${t("cancel")}</button>
         </span>
       </div>`
    : `<div class="set"><span>${t("budgetM")}</span>
         <button class="lnk" id="sb">${S.budget ? money(S.budget) : t("set")}</button>
       </div>`;

  $("set").innerHTML = `
    <h3>${t("settings")}</h3>

    <div class="set"><span>${t("lang")}</span>
      <select class="sel" id="sl">
        <option value="es" ${S.lang === "es" ? "selected" : ""}>Español</option>
        <option value="en" ${S.lang === "en" ? "selected" : ""}>English</option>
      </select>
    </div>

    <div class="set"><span>${t("currency")}</span>
      <select class="sel" id="sc">
        ${CURS.map(c => `<option ${c === S.cur ? "selected" : ""}>${c}</option>`).join("")}
      </select>
    </div>

    <div class="set"><span>${t("theme")}</span>
      <select class="sel" id="st">
        <option value="plain" ${S.skin !== "cats" ? "selected" : ""}>${t("themePlain")}</option>
        <option value="cats" ${S.skin === "cats" ? "selected" : ""}>${t("themeCats")}</option>
      </select>
    </div>

    ${budgetRow}

    <div class="set"><span>${t("carry")}</span>
      <input type="checkbox" id="sy" ${S.carry ? "checked" : ""}>
    </div>

    ${catSection("g", t("catsG"))}
    ${catSection("i", t("catsI"))}

    <div class="set set-head"><b>${t("backup")}</b></div>
    <div class="set set-actions">
      <button class="lnk" id="bx">${t("exp")}</button>
      <button class="lnk" id="bi">${t("imp")}</button>
    </div>

    <button class="lnk wide close-btn" id="so">${t("close")}</button>`;

  if (!$("set").open) $("set").showModal();
}

/** Vuelve a abrir el diálogo, y refresca la rejilla del panel de añadir si estaba abierto. */
const reopen = () => {
  if (addPanelOpen()) catGrid();
  openSettings();
};

$("set").onclick = e => {
  const x = e.target;
  const attr = key => x.closest("[" + key + "]")?.getAttribute(key);
  let v;

  if (x === $("set") || x.id === "so") {
    U.budEdit = false;
    U.delCatId = null;
    return $("set").close();
  }

  if (x.id === "bx") return exportData();
  if (x.id === "bi") return openBackup("i");

  if (x.id === "sb") {
    U.budEdit = true;
    openSettings();
    setTimeout(() => $("bin")?.focus(), 50);
    return;
  }
  if (x.id === "bcn") { U.budEdit = false; return openSettings(); }

  if (x.id === "bsv") {
    const n = parseAmount($("bin").value);
    S.budget = n > 0 ? n : 0;
    U.budEdit = false;
  }
  else if (x.id === "sn-g" || x.id === "sn-i") {
    return openCat(x.id.slice(3), null, reopen);
  }
  // Toque en el punto de color: rota al siguiente de la paleta.
  else if ((v = attr("data-kc"))) {
    const c = S.cats.find(y => y.id === +v);
    c.k = ((c.k || 0) + 1) % PAL.length;
  }
  else if ((v = attr("data-dc"))) {
    if (!canDelete(+v)) return;
    U.delCatId = +v;
    return openSettings();
  }
  else if (x.closest("[data-cx]")) { U.delCatId = null; return openSettings(); }
  else if ((v = attr("data-cy"))) {
    removeCat(+v);
    U.delCatId = null;
    save();
    rerender();
    reopen();
    flash(t("deleted"));
    return;
  }
  else if ((v = attr("data-ec"))) return openCat(null, +v, reopen);
  else return;

  save();
  rerender();
  openSettings();
};

$("set").oninput = e => {
  if (e.target.id === "bin") e.target.value = formatAmount(e.target.value);
};

$("set").onchange = e => {
  const id = e.target.id;
  if (id === "sl") {
    S.lang = e.target.value;
    applyStaticText();
    renderDelete();
  }
  else if (id === "sc") S.cur = e.target.value;
  else if (id === "st") { S.skin = e.target.value; applySkin(); }
  else if (id === "sy") S.carry = e.target.checked;
  else return;

  save();
  rerender();
  openSettings();
};

$("set").addEventListener("close", () => {
  U.budEdit = false;
  U.delCatId = null;
});
