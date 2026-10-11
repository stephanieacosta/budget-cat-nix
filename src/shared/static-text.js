// =============================================================
// static-text.js — Traduce los elementos fijos del index.html.
//
// Casi toda la interfaz se genera con render() y ya sale traducida.
// Estos pocos elementos existen en el HTML desde el principio, así
// que hay que ponerles el texto al arrancar y al cambiar de idioma.
// =============================================================

import { S, t } from "../services/index.js";
import { $ } from "./dom.js";

export function applyStaticText() {
  document.documentElement.lang = S.lang;
  $("nt").placeholder = t("notePh");
  $("tp").children[0].textContent = t("expense");
  $("tp").children[1].textContent = t("income1");
  $("svb").textContent = t("saveChanges");
  ["navHome", "navList", "navStats"].forEach((key, i) =>
    $("np").children[i].setAttribute("aria-label", t(key))
  );
  $("plus").setAttribute("aria-label", t("add"));
}
