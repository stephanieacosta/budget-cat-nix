// =============================================================
// categories.js — Crear, editar y eliminar categorías.
//
// El diálogo se usa desde dos sitios (la rejilla del panel de añadir
// y los ajustes), así que recibe un `onDone` con lo que debe pasar
// al cerrarse. Así este módulo no necesita saber quién lo llamó.
// =============================================================

import { PAL, EMOJIS } from "../../config/index.js";
import {
  S, U, save, nextColor, t, esc, catName, vividOf, catsOfType, rerender,
} from "../../services/index.js";
import { $, flash } from "../../shared/index.js";

/** No se permite quedarse sin ninguna categoría de un tipo. */
export function canDelete(id) {
  const c = S.cats.find(x => x.id === id);
  if (!c) return false;
  if (catsOfType(c.t).length < 2) {
    flash(t("keepOne"));
    return false;
  }
  return true;
}

/** Borra la categoría. Los movimientos que la usaban quedan «sin categoría». */
export function removeCat(id) {
  S.cats = S.cats.filter(x => x.id !== id);
}

/**
 * Abre el diálogo de categoría.
 *   type    "g" o "i" (solo al crear)
 *   id      categoría a editar, o null para crear una nueva
 *   onDone  se llama después de guardar o borrar
 */
export function openCat(type, id, onDone) {
  const edited = id ? S.cats.find(c => c.id === id) : null;
  if (edited) type = edited.t;

  let colorIx = edited ? edited.k : nextColor();
  let confirming = false;

  const deleteZone = () => confirming
    ? `<div class="cf">
         <div>${t("delCatQ")}</div>
         <div class="cfb">
           <button class="cb" id="ndn">${t("cancel")}</button>
           <button class="cb red" id="ndy">${t("del")}</button>
         </div>
       </div>`
    : `<button class="lnk danger wide" id="ndl">${t("delCat")}</button>`;

  $("ncd").innerHTML = `
    <h3>${edited ? t("editCat") : t(type === "g" ? "newCatG" : "newCatI")}</h3>
    <div class="catform">
      <input class="inp2 emoji-in" id="ne" maxlength="8" placeholder="😀" value="${edited ? esc(edited.e) : ""}">
      <input class="inp2 name-in" id="nn" placeholder="${t("name")}" maxlength="20" value="${edited ? esc(catName(edited)) : ""}">
    </div>
    <div class="hintline">${t("pickEmoji")}</div>
    <div class="emg">${EMOJIS.map(x => `<button data-e="${x}">${x}</button>`).join("")}</div>
    <div class="chips">${PAL.map((c, i) =>
      `<button class="sw ${i === colorIx ? "sel" : ""}" data-k="${i}" style="background:${c}"></button>`
    ).join("")}</div>
    <button class="btn" id="nsv">${t("save")}</button>
    <div id="ndw">${edited ? deleteZone() : ""}</div>
    <button class="lnk muted wide" id="nx">${t("cancel")}</button>`;

  $("ncd").onclick = e => {
    const x = e.target;
    if (x === $("ncd") || x.id === "nx") return $("ncd").close();

    const emoji = x.closest("[data-e]");
    if (emoji) { $("ne").value = emoji.dataset.e; return; }

    const swatch = x.closest("[data-k]");
    if (swatch) {
      colorIx = +swatch.dataset.k;
      $("ncd").querySelectorAll("[data-k]").forEach(b =>
        b.classList.toggle("sel", +b.dataset.k === colorIx));
      return;
    }

    if (x.id === "ndl") {
      if (canDelete(edited.id)) { confirming = true; $("ndw").innerHTML = deleteZone(); }
      return;
    }
    if (x.id === "ndn") { confirming = false; $("ndw").innerHTML = deleteZone(); return; }

    if (x.id === "ndy") {
      removeCat(edited.id);
      save();
      $("ncd").close();
      rerender();
      if (onDone) onDone();
      flash(t("deleted"));
      return;
    }

    if (x.id === "nsv") {
      const name = $("nn").value.trim();
      if (!name) return $("nn").focus();
      const emo = $("ne").value.trim() || "📦";

      if (edited) {
        edited.e = emo;
        edited.k = colorIx;
        // Si el nombre no se tocó, se conserva el original en español
        // para que la traducción automática siga funcionando.
        if (name !== catName(edited)) edited.n = name.slice(0, 20);
      } else {
        S.cats.push({ id: Date.now(), e: emo, n: name.slice(0, 20), t: type, k: colorIx });
      }

      save();
      $("ncd").close();
      rerender();
      if (onDone) onDone();
    }
  };

  $("ncd").showModal();
  if (!edited) setTimeout(() => $("nn").focus(), 50);
}

/** Lista de categorías de un tipo, tal como se ve dentro de Ajustes. */
export function catSection(type, title) {
  const rows = catsOfType(type).map(c => c.id === U.delCatId
    ? `<div class="cf cf-row">
         <div>${c.e} <b>${esc(catName(c))}</b><br>${t("delCatQ")}</div>
         <div class="cfb">
           <button class="cb" data-cx="1">${t("cancel")}</button>
           <button class="cb red" data-cy="${c.id}">${t("del")}</button>
         </div>
       </div>`
    : `<div class="set set-cat" data-ec="${c.id}">
         <span>${c.e} ${esc(catName(c))}</span>
         <span>
           <button class="x dot" data-kc="${c.id}" aria-label="${t("colorAria")}"
                   style="color:${vividOf(c)}">●</button>
           <button class="x" data-ec="${c.id}">✎</button>
           <button class="x" data-dc="${c.id}">✕</button>
         </span>
       </div>`).join("");

  return `<div class="set set-head"><b>${title}</b>
            <button class="lnk" id="sn-${type}">${t("newBtn")}</button>
          </div>${rows}`;
}
