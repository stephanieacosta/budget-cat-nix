// =============================================================
// theme.js — Cambiar de tema visual.
//
// Todo el aspecto vive en CSS. Este módulo solo escribe un
// atributo en <html>; theme-cats.css hace el resto.
//   <html data-skin="plain">  → diseño clásico
//   <html data-skin="cats">   → tema gatitos
// =============================================================

import { S } from "./state.js";

/** Color de la barra del sistema en el móvil, uno por tema. */
const BAR_COLOR = { plain: "#ffffff", cats: "#fff7f2" };

export const SKINS = ["plain", "cats"];

export function applySkin() {
  const skin = SKINS.includes(S.skin) ? S.skin : "plain";
  document.documentElement.dataset.skin = skin;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", BAR_COLOR[skin]);
}
