// =============================================================
// storage.js — Único punto que toca localStorage.
//
// Aislarlo aquí tiene una ventaja: si algún día los datos pasan a
// guardarse en otro sitio (un servidor, otra base del navegador),
// solo cambia este archivo.
//
// localStorage solo guarda texto, así que todo pasa por JSON.
// =============================================================

import { STORAGE_KEY } from "../config/constants.js";

/** Lee lo guardado. Devuelve null si no hay nada o está corrupto. */
export function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;   // dato ilegible: mejor arrancar limpio que no arrancar
  }
}

/** Guarda. Devuelve false si el navegador no deja (sin espacio o bloqueado). */
export function writeStored(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}
