# budget — control de gastos e ingresos

App web estática (un solo `index.html`, sin build ni servidor). Se instala en el celular como app y funciona sin internet.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Toda la app (código, estilos y lógica) |
| `manifest.webmanifest` | Datos para instalarla como app (nombre, iconos, colores) |
| `sw.js` | Service worker: guarda la app para usarla sin internet |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | Iconos |
| `vercel.json` | Configuración de Vercel (cabeceras) |

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
cd budget-vercel        # la carpeta con estos archivos
vercel                  # primera vez: inicia sesión y acepta los valores por defecto
vercel --prod           # publica en producción
```

> Revisa en vercel.com/pricing las condiciones vigentes del plan gratuito (Hobby): los planes pueden cambiar.

## Instalarla en el celular
La instalación se hace desde el menú del navegador (la app no muestra ningún botón propio para eso):
- **Chrome / Brave (Android):** abre tu dirección de Vercel → menú ⋮ → **Instalar aplicación** (o *Añadir a pantalla de inicio*).
- **Safari (iPhone):** botón Compartir → **Añadir a pantalla de inicio**.

## Pasar tus datos desde la versión de Claude
Los datos viven en el navegador **de cada dirección web**, así que la app nueva empieza vacía. Para traer lo que ya tienes:
1. En la versión anterior: ⚙︎ → **Exportar** → **Copiar respaldo** (o **Descargar**).
2. En la nueva: ⚙︎ → **Importar** → pega el texto (o elige el archivo `.json`) → **Importar texto pegado** → **Reemplazar**.

El formato del respaldo es el mismo en las dos versiones.

## Cosas a tener en cuenta
- Los datos se guardan en `localStorage` del navegador: no se sincronizan entre dispositivos ni navegadores, y se pierden si borras los datos del sitio. **Haz respaldos de vez en cuando.**
- Si algún día cambias la dirección (dominio) de la app, tendrás que exportar e importar de nuevo.
- Para que todos los dispositivos descarguen una versión nueva tras una actualización, cambia `VERSION` en `sw.js` (por ejemplo a `budget-v2`).
- La tipografía del título viene de Google Fonts; sin internet por primera vez se usa una tipografía serif del sistema.

## Si Vercel muestra "404: NOT_FOUND"
Casi siempre significa que `index.html` **no está en la raíz** de lo que Vercel publicó (por ejemplo, quedó dentro de una carpeta `budget-vercel/`).
1. En Vercel abre el proyecto → **Deployments** → el último despliegue → pestaña **Source** y comprueba que `index.html` aparece **al principio de la lista**, no dentro de una carpeta.
2. Si está dentro de una carpeta: en **Settings → General → Root Directory** escribe el nombre de esa carpeta (por ejemplo `budget-vercel`) y vuelve a desplegar. O mueve los archivos a la raíz del repositorio.
3. En **Settings → Build and Deployment**: Framework Preset en **Other**, y **Build Command** y **Output Directory** vacíos.
4. Con la terminal, ejecuta `vercel --prod` **dentro** de la carpeta donde están `index.html` y `vercel.json`.
