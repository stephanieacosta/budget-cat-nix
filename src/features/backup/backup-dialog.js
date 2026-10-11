// =============================================================
// backup.js — Exportar e importar los datos.
//
// Los datos viven solo en este navegador y en esta dirección web.
// Esto es la única forma de sacarlos de aquí, así que el formato
// se mantiene estable: {app:"budget", v:1, data:{...}}
// =============================================================

import {
  S, save, replaceState, normalize, t, iso, esc, formatSize, applySkin, rerender,
} from "../../services/index.js";
import { $, flash, applyStaticText } from "../../shared/index.js";

/** Respaldo a la espera de confirmación. */
let pending = null;

const backupName = () => "budget-backup-" + iso(new Date()) + ".json";

/** Sustituye todos los datos por los del respaldo. */
function applyImport(data) {
  // El idioma y el tema actuales se mantienen si el respaldo no los trae.
  replaceState(Object.assign(
    { cur: "COP", lang: S.lang, skin: S.skin, budget: 0, carry: true },
    data
  ));
  // Descarta movimientos corruptos antes de dar nada por bueno.
  S.tx = S.tx.filter(x => x && x.amt > 0 && typeof x.date === "string");
  normalize();

  save();
  applySkin();
  applyStaticText();
  rerender();
  if ($("bk").open) $("bk").close();
  if ($("set").open) $("set").close();
  flash(t("impOk"));
}

/** Valida el texto pegado y pide confirmación antes de reemplazar nada. */
function stageImport(text) {
  const w = $("bmsg");
  if (!w) return;
  try {
    const parsed = JSON.parse(text);
    const data = parsed.data || parsed;   // acepta el respaldo con o sin envoltorio
    if (!Array.isArray(data.cats) || !Array.isArray(data.tx)) throw new Error("formato");
    pending = data;
    w.innerHTML = `
      <div class="cf">
        <div>${t("impConfirm", data.tx.length)}</div>
        <div class="cfb">
          <button class="cb" id="bn">${t("cancel")}</button>
          <button class="cb red" id="by">${t("replace")}</button>
        </div>
      </div>`;
  } catch (err) {
    pending = null;
    w.innerHTML = `<div class="cf"><div>${t("impBad")}</div></div>`;
  }
}

/** Dispara la descarga del archivo. Devuelve false si el navegador no deja. */
function download(json, filename) {
  try {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch (e) {
    return false;
  }
}

/** Contenido del diálogo al exportar: ficha del archivo, el texto crudo y los botones. */
function exportBody(json) {
  const size = new Blob([json]).size;
  return `
    <h3>${t("dlTitle")}</h3>
    <div class="cf cf-info">
      <div><b>${t("dlFile")}:</b> ${esc(backupName())}</div>
      <div><b>${t("dlSize")}:</b> ${formatSize(size)}</div>
      <div>${t("dlContent", S.tx.length, S.cats.length)}</div>
    </div>
    <p class="hintline">${t("dlNote")}</p>
    <textarea class="inp2 bktext" id="bt" readonly>${esc(json)}</textarea>
    <div id="bmsg2" class="hintline"></div>
    <button class="btn" id="bdl">${t("dlGo")}</button>
    <button class="lnk wide" id="bc">${t("bkCopy")}</button>
    <button class="lnk muted wide" id="bz">${t("cancel")}</button>`;
}

/** Contenido del diálogo al importar. */
const importBody = () => `
  <h3>${t("impTitle")}</h3>
  <p class="hintline">${t("impHint")}</p>
  <textarea class="inp2 bktext tall" id="bt" placeholder="${t("impPaste")}"></textarea>
  <div id="bmsg"></div>
  <button class="btn" id="bg">${t("impBtn")}</button>
  <button class="lnk wide" id="bfile">${t("impFile")}</button>
  <button class="lnk wide" id="bz">${t("cancel")}</button>`;

/** Abre el diálogo de respaldo. mode: "x" exportar, "i" importar. */
export function openBackup(mode, json) {
  const exporting = mode === "x";
  $("bk").innerHTML = exporting ? exportBody(json) : importBody();

  $("bk").onclick = async e => {
    const y = e.target;
    if (y === $("bk") || y.id === "bz") return $("bk").close();
    if (y.id === "bfile") return $("bf").click();

    if (y.id === "bg") {
      const v = $("bt").value.trim();
      if (!v) return $("bt").focus();
      return stageImport(v);
    }
    if (y.id === "bn") { pending = null; $("bmsg").innerHTML = ""; return; }
    if (y.id === "by") { if (pending) applyImport(pending); return; }

    if (y.id === "bdl") {
      const ok = download($("bt").value, backupName());
      $("bmsg2").textContent = ok ? t("dlTried") : t("bkNoDl");
      return;
    }

    if (y.id === "bc") {
      const ta = $("bt");
      ta.focus();
      ta.select();
      let ok = false;
      try {
        await navigator.clipboard.writeText(ta.value);
        ok = true;
      } catch (err) {
        try { ok = document.execCommand("copy"); } catch (e2) { /* sin portapapeles */ }
      }
      y.textContent = ok ? t("bkCopied") : t("bkSel");
    }
  };

  if (!$("bk").open) $("bk").showModal();
}

export function exportData() {
  openBackup("x", JSON.stringify({ app: "budget", v: 1, data: S }, null, 1));
}

// Elegir un archivo .json desde el diálogo de importar.
$("bf").onchange = async e => {
  const file = e.target.files[0];
  e.target.value = "";          // permite volver a elegir el mismo archivo
  if (!file) return;
  const text = await file.text();
  openBackup("i");
  $("bt").value = text;
  stageImport(text);
};
