# La Nueva Era — Guía de instalación (sin necesidad de saber programar)

Tienes 4 piezas:
- `index.html` → la landing pública
- `dashboard.html` → el panel donde suben fotos y cumpleaños
- `style.css` / `config.js` → diseño y configuración
- `Codigo.gs` → el "cerebro" que guarda los datos y manda el WhatsApp

Vas a conectar todo así: **Google Sheets guarda los datos → Google Apps Script los sirve al sitio y manda el WhatsApp → Firebase Hosting publica el sitio en internet, gratis.**

---

## PASO 1 — Crear la base de datos (Google Sheets)

1. Entra a https://sheets.google.com y crea una hoja nueva. Ponle de nombre **"La Nueva Era - Datos"**.
2. Ve a `Extensiones → Apps Script`.
3. Borra el código de ejemplo y pega **todo** el contenido del archivo `Codigo.gs` que te entregué.
4. Arriba, cambia el número `NUMERO_DIRECTIVA` si hace falta (ya está puesto tu 902242903 con el código de Perú `51`).
5. Guarda (ícono de disquete).

## PASO 2 — Publicar el backend

1. En el editor de Apps Script, clic en **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. "Ejecutar como": **Yo (tu correo)**.
4. "Quién tiene acceso": **Cualquier usuario**.
5. Clic en **Implementar**. Te va a pedir autorizar permisos (dale "Avanzado" → "Ir a... (no seguro)" si Google lo marca así — es tu propio script, es seguro).
6. Copia la **URL de la app web** que te da (termina en `/exec`).
7. Pega esa URL en el archivo `config.js`, reemplazando `PEGA_AQUI_TU_URL_DE_APPS_SCRIPT`.

## PASO 3 — Activar el WhatsApp automático (CallMeBot, gratis)

1. Desde el WhatsApp del número que va a **recibir** los avisos (902242903), agrega este contacto: **+34 644 59 71 67**.
2. Envíale por WhatsApp el mensaje: `I allow callmebot to send me messages`
3. El bot te responde con tu **API Key** (un número).
4. Vuelve al archivo `Codigo.gs` en Apps Script y pega esa key en `CALLMEBOT_APIKEY`. Guarda.
5. En el menú de funciones (arriba, donde dice "Seleccionar función"), elige `crearDisparadorDiario` y dale ▶ **Ejecutar** (una sola vez). Esto deja programado que **todos los días a las 9am** se revisen los cumpleaños automáticamente.

> Nota: cada integrante que quiera recibir también SU PROPIO mensaje de felicitación debe hacer este mismo paso 1-3 con su número (agregar al bot y mandar el mensaje de autorización), y tú cargas su número en el campo "WhatsApp" del dashboard.

## PASO 4 — Publicar la página en internet (Firebase Hosting, de Google, gratis)

1. Instala Node.js si no lo tienes: https://nodejs.org
2. Abre una terminal (en Windows: busca "cmd" o "PowerShell") y escribe:
   ```
   npm install -g firebase-tools
   firebase login
   ```
   Inicia sesión con tu cuenta de Google.
3. Crea una carpeta, mete adentro los archivos `index.html`, `dashboard.html`, `style.css`, `config.js`.
4. Dentro de esa carpeta, en la terminal:
   ```
   firebase init hosting
   ```
   - Elige "Create a new project" (o uno que ya tengas).
   - Carpeta pública: escribe `.` (punto, la carpeta actual).
   - ¿Configurar como single-page app?: **No**.
5. Publica:
   ```
   firebase deploy
   ```
6. Al terminar te da un link tipo `https://tu-proyecto.web.app` — esa es tu página pública, ya "subida en Google", para compartir con quien quieras.

### Alternativa más simple (si no quieres usar la terminal)
Sube las mismas 4 carpetas/archivos a **Netlify Drop**: https://app.netlify.com/drop (arrastras la carpeta y listo, también gratis, te da un link público al instante).

---

## Cómo lo van a usar tus 4 personas de directiva

1. Entran a `tu-link/dashboard.html`.
2. Clave por defecto: `nuevaera2026` (cámbiala en `config.js`, variable `DASH_PASSWORD`).
3. Suben la foto a Google Drive/Google Fotos, la ponen como "cualquiera con el enlace puede ver", copian el link y lo pegan en el campo "Link de la foto".
4. Completan nombre, cargo y fecha de cumpleaños → **Guardar integrante**.
5. Automáticamente aparece en la landing (`index.html`) y queda programado para avisar por WhatsApp el día de su cumpleaños.

---

## Resumen visual del flujo

```
Dashboard (subir foto+cumple) → Google Sheets (guarda datos)
        ↓                              ↓
  Landing pública  ←——— Apps Script (API) ———→  Disparador diario 9am
                                                        ↓
                                          CallMeBot → WhatsApp a 902242903
                                          + WhatsApp de felicitación al cumpleañero
```

Cualquier duda con algún paso, dime en cuál te quedaste y seguimos desde ahí.
