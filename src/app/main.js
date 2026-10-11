// =============================================================
// main.js — Arranque. El único archivo que carga el index.html.
//
// Importar ./events.js y ./render.js no es decorativo: al cargarse,
// esos módulos (y los features que arrastran) registran sus
// manejadores de eventos y el redibujador.
// =============================================================

import { load, applySkin } from "../services/index.js";
import { applyStaticText } from "../shared/index.js";
import { renderDelete } from "../features/index.js";
import { render } from "./render.js";
import "./events.js";

// 1. Datos guardados en el navegador.
load();

// 2. Aspecto y textos de los elementos que ya existen en el HTML.
applySkin();
applyStaticText();
renderDelete();

// 3. Primera pantalla. A partir de aquí todo ocurre por eventos.
render();

// 4. Service worker: permite abrir la app sin internet.
//    Solo funciona sobre https:// o localhost.
if ("serviceWorker" in navigator) {
  addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  );
}
