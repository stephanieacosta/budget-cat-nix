// =============================================================
// i18n.js — Textos en español e inglés.
//
// Se usa siempre con t("clave"). Algunas entradas son funciones
// porque necesitan un número dentro: t("movs", 3).
// =============================================================

import { S } from "./state.js";

const DICT = {
  es: {
    balance: "Balance", totals: "Totales", income: "Ingresos", expenses: "Gastos",
    categories: "Categorías", noExp: "Sin gastos en este periodo", budget: "Presupuesto",
    left: "te quedan", over: "te pasaste por",
    all: "Todos", noTx: "No hay movimientos en este periodo.<br>Toca + para registrar uno.",
    hint: "Toca un movimiento para editarlo",
    totSpent: "Total gastado", totInc: "Total ingresado", byCat: "Por categoría",
    noInc: "Sin ingresos en este periodo",
    mDay: "Día", mMonth: "Mes", mYear: "Año", mRange: "Rango", today: "Hoy",
    capped: n => "Mostrando los " + n + " más recientes",
    chDonut: "Dona", chPie: "Pastel", chBars: "Barras", chLine: "Línea", chMonths: "Meses",
    lineHint: "Gasto por día", lineHintI: "Ingreso por día",
    lineHintM: "Gasto por mes", lineHintIM: "Ingreso por mes",
    last6: "Últimos 6 meses", monthsYear: "Meses del año",
    notePh: "¿En qué? (nota)", expense: "Gasto", income1: "Ingreso",
    saveChanges: "Guardar cambios", delTx: "Eliminar movimiento",
    delTxQ: "¿Eliminar este movimiento?", del: "Eliminar", deleted: "Eliminado", new: "Nueva",
    settings: "Ajustes", lang: "Idioma", currency: "Moneda", budgetM: "Presupuesto mensual",
    set: "Definir", carry: "Traer saldo del mes anterior",
    catsG: "Categorías de gasto", catsI: "Categorías de ingreso", newBtn: "+ Nueva",
    backup: "Respaldo", exp: "⬇ Exportar", imp: "⬆ Importar", close: "Cerrar",
    appearance: "Apariencia", theme: "Tema", themePlain: "Clásico", themeCats: "Gatitos 🐱",
    newCatG: "Nueva categoría de gasto", newCatI: "Nueva categoría de ingreso",
    editCat: "Editar categoría", name: "Nombre", save: "Guardar", cancel: "Cancelar",
    delCat: "Eliminar categoría",
    delCatQ: "¿Eliminar esta categoría? Sus movimientos quedarán sin categoría.",
    keepOne: "Debe quedar al menos una categoría de este tipo.", noCat: "Sin categoría",
    pickEmoji: "Elige un emoji o escribe el tuyo",
    bkTitle: "Respaldo",
    bkNoDl: "Este navegador no deja descargar el archivo. Copia este texto y guárdalo en una nota o en tu correo. Para recuperarlo, usa Importar y pégalo.",
    bkCopy: "Copiar respaldo", bkCopied: "¡Copiado! ✔", bkSel: "Selecciona el texto y cópialo",
    impTitle: "Importar respaldo", impHint: "Pega aquí el texto del respaldo o elige el archivo.",
    impPaste: "Pega el respaldo aquí", impBtn: "Importar texto pegado",
    impFile: "Elegir archivo…", replace: "Reemplazar",
    impConfirm: n => "Esto reemplaza tus datos actuales por el respaldo (" + n + " movimientos). ¿Continuar?",
    impOk: "Respaldo importado ✔", impBad: "Ese texto o archivo no es un respaldo válido.",
    dlTitle: "Descargar respaldo", dlFile: "Archivo", dlSize: "Tamaño",
    dlContent: (m, c) => m + " movimientos · " + c + " categorías",
    dlNote: "Si aceptas, se guardará en la carpeta de descargas de tu navegador.",
    dlGo: "Descargar", dlDeclined: "Descarga cancelada.",
    dlTried: "Descarga iniciada. Revisa tu carpeta de descargas; si no aparece, usa «Copiar respaldo» y guárdalo en una nota.",
    navHome: "Inicio", navList: "Movimientos", navStats: "Gráficas", add: "Añadir",
    scrub: "Desliza o toca la gráfica", rangeStart: "Toca el primer día del rango",
    rangeEnd: "Ahora toca el último día",
    avgMonth: "Promedio mensual", peakMonth: "Mes más alto",
    avgDay: "Promedio diario", peakDay: "Día más alto", total: "Total",
    tapSlice: "Toca una porción o una categoría para ver el detalle",
    movs: n => n + (n === 1 ? " movimiento" : " movimientos"),
    colorAria: "Cambiar color",
  },
  en: {
    balance: "Balance", totals: "Totals", income: "Income", expenses: "Expenses",
    categories: "Categories", noExp: "No expenses in this period", budget: "Budget",
    left: "left", over: "over by",
    all: "All", noTx: "No transactions in this period.<br>Tap + to add one.",
    hint: "Tap a transaction to edit it",
    totSpent: "Total spent", totInc: "Total income", byCat: "By category",
    noInc: "No income in this period",
    mDay: "Day", mMonth: "Month", mYear: "Year", mRange: "Range", today: "Today",
    capped: n => "Showing the latest " + n,
    chDonut: "Donut", chPie: "Pie", chBars: "Bars", chLine: "Line", chMonths: "Months",
    lineHint: "Spending by day", lineHintI: "Income by day",
    lineHintM: "Spending by month", lineHintIM: "Income by month",
    last6: "Last 6 months", monthsYear: "Months of the year",
    notePh: "What for? (note)", expense: "Expense", income1: "Income",
    saveChanges: "Save changes", delTx: "Delete transaction",
    delTxQ: "Delete this transaction?", del: "Delete", deleted: "Deleted", new: "New",
    settings: "Settings", lang: "Language", currency: "Currency", budgetM: "Monthly budget",
    set: "Set", carry: "Carry over previous balance",
    catsG: "Expense categories", catsI: "Income categories", newBtn: "+ New",
    backup: "Backup", exp: "⬇ Export", imp: "⬆ Import", close: "Close",
    appearance: "Appearance", theme: "Theme", themePlain: "Classic", themeCats: "Kitties 🐱",
    newCatG: "New expense category", newCatI: "New income category",
    editCat: "Edit category", name: "Name", save: "Save", cancel: "Cancel",
    delCat: "Delete category",
    delCatQ: "Delete this category? Its transactions will have no category.",
    keepOne: "At least one category of this type must remain.", noCat: "No category",
    pickEmoji: "Pick an emoji or type your own",
    bkTitle: "Backup",
    bkNoDl: "This browser can't download the file. Copy this text and save it in a note or an email. To restore it, use Import and paste it.",
    bkCopy: "Copy backup", bkCopied: "Copied! ✔", bkSel: "Select the text and copy it",
    impTitle: "Import backup", impHint: "Paste the backup text here or choose the file.",
    impPaste: "Paste the backup here", impBtn: "Import pasted text",
    impFile: "Choose file…", replace: "Replace",
    impConfirm: n => "This replaces your current data with the backup (" + n + " transactions). Continue?",
    impOk: "Backup imported ✔", impBad: "That text or file is not a valid backup.",
    dlTitle: "Download backup", dlFile: "File", dlSize: "Size",
    dlContent: (m, c) => m + " transactions · " + c + " categories",
    dlNote: "If you accept, it will be saved to your browser's downloads folder.",
    dlGo: "Download", dlDeclined: "Download cancelled.",
    dlTried: "Download started. Check your downloads folder; if it doesn't show up, use “Copy backup” and save it in a note.",
    navHome: "Home", navList: "Transactions", navStats: "Charts", add: "Add",
    scrub: "Slide or tap the chart", rangeStart: "Tap the first day of the range",
    rangeEnd: "Now tap the last day",
    avgMonth: "Monthly average", peakMonth: "Peak month",
    avgDay: "Daily average", peakDay: "Peak day", total: "Total",
    tapSlice: "Tap a slice or a category for details",
    movs: n => n + (n === 1 ? " transaction" : " transactions"),
    colorAria: "Change color",
  },
};

/** Texto traducido. Si la entrada es una función, se la llama con los argumentos dados. */
export function t(key, ...args) {
  const v = (DICT[S.lang] || DICT.es)[key];
  return typeof v === "function" ? v(...args) : v;
}

export const isEN = () => S.lang === "en";

/** Separador de miles y de decimales según el idioma. */
export const THOUSANDS = () => (isEN() ? "," : ".");
export const DECIMAL = () => (isEN() ? "." : ",");

/** Idioma para las fechas y los números del navegador. */
export const LOC = () => (isEN() ? "en-US" : "es");
