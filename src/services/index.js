// =============================================================
// Barril de services: la lógica de la app, sin interfaz.
// Desde un feature se importa como ../../services/index.js y de ahí
// salen S, U, save, money, t y todo lo demás.
//
// Regla importante: los archivos DE ESTA carpeta se importan entre
// sí por su nombre directo (./state.js), nunca a través de este
// barril. Si lo hicieran, se crearía un círculo.
// =============================================================

export * from "./storage.js";
export * from "./state.js";
export * from "./i18n.js";
export * from "./format.js";
export * from "./categories.js";
export * from "./period.js";
export * from "./query.js";
export * from "./theme.js";
export * from "./rerender.js";
