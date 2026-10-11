# budget — control de gastos e ingresos

App web para registrar gastos e ingresos. Se instala en el celular como una app y funciona sin internet. **Sin build, sin dependencias, sin servidor:** el navegador ejecuta exactamente los archivos que ves aquí.

Los datos se guardan en el navegador (`localStorage`), nunca salen del dispositivo.

## Estructura

```
index.html                 solo el esqueleto HTML
sw.js                      service worker (funcionar sin internet)
manifest.webmanifest       datos para instalarla como app
vercel.json                cabeceras del hosting

src/
  config/                  constantes: monedas, paletas, emojis, categorías iniciales
    constants.js
    index.js               ← barril

  services/                la lógica, sin nada de interfaz
    storage.js             único punto que toca localStorage
    state.js               S (tus datos) y U (qué pantalla miras)
    i18n.js                textos en español e inglés
    format.js              dinero, números, fechas, escapado de HTML
    categories.js          consultar nombre, emoji y color de una categoría
    period.js              qué trozo de tiempo estás mirando
    query.js               las sumas y los totales
    theme.js               cambiar de tema visual
    rerender.js            pedir un redibujado sin crear dependencias circulares
    index.js               ← barril

  shared/                  utilidades de interfaz comunes
    dom.js                 $ (buscar un elemento) y flash (avisos)
    ui.js                  trozos de HTML que usan varias pantallas
    static-text.js         traduce los elementos fijos del index.html
    index.js               ← barril

  features/                una carpeta por funcionalidad
    home/                  pantalla de inicio: balance y totales
    transactions/          lista de movimientos + formulario de alta y edición
    stats/                 las cinco gráficas
    categories/            crear, editar y borrar categorías
    period/                selector de día / mes / año / rango
    backup/                exportar e importar
    settings/              ajustes
    index.js               ← barril de barriles

  styles/
    base.css               diseño clásico
    theme-cats.css         tema "Gatitos"

  assets/                  iconos
```

### Cómo encaja

**El flujo es siempre el mismo.** Se cambia un dato y se redibuja la pantalla entera:

```
   datos (S)  ──render()──►  pantalla
       ▲                        │
       └────── se modifican ◄───┘  el usuario toca algo
```

Nadie modifica la pantalla a mano. `src/app/render.js` borra `<main>` y lo construye de nuevo desde los datos, así que es imposible que la pantalla y los datos se desincronicen.

**Las capas van en una sola dirección**, nunca al revés:

```
config → services → shared → features → app
```

Cada carpeta tiene un `index.js` (un *barril*) que es su puerta de entrada:

```js
import { S, U, save, money, t } from "../../services/index.js";
import { $, flash } from "../../shared/index.js";
```

Dos reglas para que esto siga siendo cierto:

1. **Dentro de una carpeta, los archivos se importan entre sí por su nombre directo** (`./state.js`), nunca a través del propio barril. Pasar por el barril crearía un círculo.
2. **Un feature nunca importa de `app/`.** Cuando necesita refrescar la pantalla llama a `rerender()` de `services/rerender.js`; `app/render.js` se registra ahí al arrancar. Eso es lo que permite que `app/` conozca a los features sin que los features conozcan a `app/`.

## Probarla en tu computadora

El código usa módulos ES (`import` / `export`), y los navegadores los bloquean al abrir un archivo con doble clic. Hace falta un servidor local, que es una sola línea:

```bash
# con Python (ya lo tienes instalado)
python -m http.server 8000

# o con Node
npx serve .
```

Luego abre `http://localhost:8000`. Para ver el código por dentro: `F12` → pestaña **Console**, y escribe `S` para ver tus datos, o `S.tx.length` para contar los movimientos.

## Subirla a Vercel

Vercel no necesita configuración: no hay comando de build ni carpeta de salida.

### Opción A — Con Git (la más cómoda para actualizar después)
1. Crea un repositorio en GitHub y sube **todos** estos archivos a la raíz.
2. En [vercel.com](https://vercel.com) → **Add New… → Project** → importa el repositorio.
3. Deja **Framework Preset: Other**, sin Build Command ni Output Directory. Pulsa **Deploy**.
4. Cada vez que cambies algo y hagas `git push`, Vercel publica la nueva versión sola.

### Opción B — Sin Git, con la terminal
```bash
npm install -g vercel
cd budget
vercel                  # primera vez: inicia sesión y acepta los valores por defecto
vercel --prod           # publica en producción
```

> Revisa en vercel.com/pricing las condiciones vigentes del plan gratuito (Hobby): los planes pueden cambiar.

## Instalarla en el celular

La instalación se hace desde el menú del navegador (la app no muestra ningún botón propio para eso):
- **Chrome / Brave (Android):** abre tu dirección de Vercel → menú ⋮ → **Instalar aplicación** (o *Añadir a pantalla de inicio*).
- **Safari (iPhone):** botón Compartir → **Añadir a pantalla de inicio**.

## Temas

En ⚙︎ → **Tema** puedes elegir:

- **Clásico** — el diseño sobrio original.
- **Gatitos 🐱** — paleta pastel, tipografía redondeada y gatos dibujados: orejas en el logo y en el botón `+`, huellitas en la pestaña activa, un gato dormido en las pantallas vacías y orejas en la gráfica de dona.

El tema es **solo CSS**: `src/services/theme.js` escribe `data-skin="cats"` en `<html>` y `src/styles/theme-cats.css` hace todo lo demás. Para crear un tema nuevo basta con copiar ese archivo y añadir una opción en `i18n.js` y en el `<select>` de los ajustes; no hay que tocar nada de la lógica.

Los gatos son SVG escritos dentro del propio CSS, así que no hay imágenes externas y se ven igual sin internet.

## Cosas a tener en cuenta

- Los datos se guardan en `localStorage`: **no se sincronizan** entre dispositivos ni navegadores, y se pierden si borras los datos del sitio. **Haz respaldos de vez en cuando** (⚙︎ → Exportar).
- Si cambias la dirección (dominio) de la app, tendrás que exportar e importar de nuevo.
- Al añadir un módulo nuevo en `src/`, **ponlo también en la lista `CORE` de `sw.js`**, o no se guardará para usar sin internet.
- Para que todos los dispositivos descarguen una versión nueva tras una actualización, cambia `VERSION` en `sw.js` (por ejemplo a `budget-v4`).
- La app no mezcla monedas: al cambiar de moneda solo se ven los movimientos registrados en ella. Los demás siguen guardados.
- Las tipografías vienen de Google Fonts; la primera vez sin internet se usan las del sistema.

## Si Vercel muestra "404: NOT_FOUND"

Casi siempre significa que `index.html` **no está en la raíz** de lo que Vercel publicó.
1. En Vercel abre el proyecto → **Deployments** → el último despliegue → pestaña **Source** y comprueba que `index.html` aparece **al principio de la lista**, no dentro de una carpeta.
2. Si está dentro de una carpeta: en **Settings → General → Root Directory** escribe el nombre de esa carpeta, y vuelve a desplegar.
3. En **Settings → Build and Deployment**: Framework Preset en **Other**, y **Build Command** y **Output Directory** vacíos.
