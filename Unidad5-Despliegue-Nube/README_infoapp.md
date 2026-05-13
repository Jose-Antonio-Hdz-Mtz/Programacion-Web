# 🤖 Gemini AI Studio — Práctica Full Stack

> Aplicación web Full Stack que integra **Node.js + Express** con la **API de Google Gemini** para procesar texto con inteligencia artificial en tiempo real.

---

## 📋 Descripción

Este proyecto es una práctica académica de la **Unidad 4 – Servidor e IA** de Programación Web. Implementa una arquitectura Full Stack completa:

- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla (dark mode, historial, animaciones)
- **Backend**: Node.js + Express con arquitectura MVC (Routes → Controller → Service)
- **IA**: Integración con la API oficial de Google Gemini (`gemini-1.5-flash`)
- **Seguridad**: Variables de entorno con `dotenv` para proteger credenciales

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3 Vanilla, JavaScript ES2022 |
| Backend | Node.js ≥18, Express 4.x |
| IA | Google Gemini API (`@google/generative-ai`) |
| Seguridad | dotenv, express-rate-limit, CORS |
| Deploy | Render (backend), GitHub Pages / Vercel (frontend) |

---

## 📁 Estructura del Proyecto

```
Unidad4-Servidor-IA/
│
├── backend/
│   ├── server.js                  # Punto de entrada Express
│   ├── routes/
│   │   └── procesar.routes.js     # Definición de rutas
│   ├── controllers/
│   │   └── gemini.controller.js   # Lógica de validación y respuesta
│   ├── services/
│   │   └── gemini.service.js      # Integración con API de Gemini
│   ├── .env                       # ⚠️ Credenciales (NO subir a Git)
│   ├── .env.example               # Plantilla segura para compartir
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── index.html                 # Interfaz de usuario
│   ├── style.css                  # Estilos (dark mode, glassmorphism)
│   └── app.js                     # Lógica: fetch, historial, validación
│
└── README.md
```

---

## ⚙️ Instalación Local

### 1. Clonar o descargar el proyecto

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd Unidad4-Servidor-IA
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

```bash
# Copia la plantilla
copy .env.example .env
```

Abre el archivo `.env` y coloca tu API Key:

```env
PORT=3000
GEMINI_API_KEY=tu_api_key_real_aqui
GEMINI_MODEL=gemini-1.5-flash
NODE_ENV=development
CORS_ORIGIN=*
```

### 4. Iniciar el servidor backend

```bash
# Modo desarrollo (recarga automática)
npm run dev

# Modo producción
npm start
```

Verifica que el servidor esté activo en: `http://localhost:3000`

### 5. Abrir el frontend

Abre `frontend/index.html` con **Live Server** de VS Code o directamente en el navegador. El frontend se conecta automáticamente al backend en `localhost:3000`.

---

## 🔑 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor Express | `3000` |
| `GEMINI_API_KEY` | API Key de Google Gemini | `AIzaSy...` |
| `GEMINI_MODEL` | Modelo de Gemini a usar | `gemini-1.5-flash` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` o URL del frontend |

### ¿Por qué usar variables de entorno?

- **Seguridad**: La API Key no queda en el código fuente (evita exposición en GitHub)
- **Flexibilidad**: Cada entorno (dev, staging, producción) tiene sus propias credenciales
- **Mantenimiento**: Se cambian sin modificar el código
- **Buenas prácticas**: Estándar de la industria (12-Factor App)

---

## 📡 API — Endpoint

### `POST /procesar`

Envía texto a Gemini y retorna la respuesta generada.

**Request:**
```http
POST http://localhost:3000/procesar
Content-Type: application/json

{
  "texto": "¿Qué es una API REST?"
}
```

**Response exitosa (200):**
```json
{
  "exito": true,
  "respuesta": "Una API REST es una interfaz...",
  "modelo": "gemini-1.5-flash",
  "tokens": { "entrada": 25, "salida": 180, "total": 205 },
  "timestamp": "2026-05-13T05:00:00.000Z"
}
```

**Response de error (400/500):**
```json
{
  "error": "El campo \"texto\" es obligatorio."
}
```

---

## 🔑 Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API Key"**
4. Copia la clave generada
5. Pégala en tu archivo `.env` como valor de `GEMINI_API_KEY`

> **Nota**: El plan gratuito permite **15 requests/minuto** y **1,500 requests/día** con `gemini-1.5-flash`. Suficiente para desarrollo y pruebas.

---

## 🚀 Despliegue en Producción (Vercel — Backend + Frontend juntos)

Este proyecto está configurado para desplegar **todo desde la raíz** en Vercel.  
El `vercel.json` enruta las peticiones al backend Express automáticamente.

### Paso 1 — Subir a GitHub (sin node_modules)

```bash
# Desde la raíz del proyecto
git init
git add .
git commit -m "feat: Full Stack Gemini AI - Unidad 4"
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

> ⚠️ El `.gitignore` ya excluye `node_modules/` y `.env` — Git los ignorará automáticamente.

### Paso 2 — Conectar en Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa tu repositorio de GitHub
3. Deja la **Root Directory** en `/` (raíz)
4. **Framework Preset**: `Other`
5. **Build Command**: `cd backend && npm install`
6. **Output Directory**: dejar vacío

### Paso 3 — Configurar la API Key en Vercel ⚠️

> Esta es la parte más importante. Sin esto, el backend no puede llamar a Gemini.

En Vercel → tu proyecto → **Settings → Environment Variables**, agrega:

| Variable | Valor |
|----------|-------|
| `GEMINI_API_KEY` | `AIzaSy_tu_key_de_Google_AI_Studio` |
| `GEMINI_MODEL` | `gemini-1.5-flash` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `*` (o tu URL de Vercel una vez desplegado) |

Haz clic en **Save** → luego **Redeploy**.

### Paso 4 — Actualizar la URL del backend en el frontend

Una vez que Vercel te dé la URL pública (ej: `https://mi-app.vercel.app`), edita `frontend/app.js`:

```js
// Antes (local):
API_URL : 'http://localhost:3000/procesar',

// Después (producción en Vercel):
API_URL : 'https://mi-app.vercel.app/procesar',
```

Commit y push → Vercel redespliega automáticamente.

### Cómo funciona Vercel con Express

```
Usuario → vercel.app/procesar
              ↓
         vercel.json           ← Enruta /procesar/* a backend/server.js
              ↓
         backend/server.js     ← Express app (serverless, sin app.listen)
              ↓
         gemini.service.js     ← Llama a Google Gemini API
              ↓
         Respuesta JSON al frontend
```

> **¿Por qué no usa `app.listen()`?**  
> Vercel ejecuta Express como función serverless: importa el `module.exports = app`  
> y maneja el ciclo request/response por sí mismo. El `app.listen()` solo corre  
> cuando ejecutas `node server.js` en local (protegido con `require.main === module`).

---

## 🛡️ Seguridad implementada

- ✅ API Key en variables de entorno (nunca en código)
- ✅ `.env` en `.gitignore`
- ✅ Rate limiting: 20 requests / 15 minutos por IP
- ✅ Validación de entrada (mínimo 3 chars, máximo 5000)
- ✅ CORS configurado por origen
- ✅ Escape HTML en el frontend (prevención XSS)
- ✅ Manejo de errores en todas las capas

---

## 👤 Autor

**José Antonio Hdz Mtz**  
Programación Web — Práctica Unidad 4: Servidor e IA  
Instituto ICTM
