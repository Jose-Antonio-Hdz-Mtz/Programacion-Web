// ============================================================
// server.js — Punto de entrada del servidor Express
//
// Responsabilidades:
//   1. Cargar variables de entorno (.env)
//   2. Configurar middlewares globales (CORS, JSON, Rate Limit)
//   3. Registrar rutas
//   4. Levantar el servidor en el puerto configurado
// ============================================================

// ── Cargar variables de entorno PRIMERO ─────────────────────
// CRÍTICO: debe ejecutarse ANTES de cualquier require() que
// acceda a process.env (como gemini.service.js).
const dotenv = require('dotenv');
dotenv.config();

// ── Importaciones ────────────────────────────────────────────
const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

// Importar el router DESPUÉS de dotenv.config()
const procesarRouter = require('./routes/procesar.routes');

// ── Crear aplicación Express ──────────────────────────────────
const app = express();

// ── Middlewares globales ──────────────────────────────────────

/**
 * CORS — Permite peticiones cross-origin desde el frontend.
 * En producción, reemplaza "*" por la URL real de tu frontend
 * para mayor seguridad.
 */
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

/**
 * JSON Parser — Permite leer req.body como objeto JavaScript
 * cuando el frontend envía "Content-Type: application/json"
 */
app.use(express.json());

/**
 * URL-encoded Parser — Permite leer datos de formularios HTML
 * cuando el Content-Type es "application/x-www-form-urlencoded"
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Rate Limiting — Protege la API de abuso.
 * Limita a 20 peticiones por ventana de 15 minutos por IP.
 * Esto también ayuda a controlar el uso de la API de Gemini.
 */
const limiter = rateLimit({
    windowMs : 15 * 60 * 1000, // 15 minutos
    max      : 20,              // máximo 20 requests por ventana
    message  : {
        error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,  // Envía cabeceras RateLimit-*
    legacyHeaders  : false
});

// Aplicar rate limit solo a la ruta de la API
app.use('/procesar', limiter);

// ── Registrar rutas ───────────────────────────────────────────
app.use('/procesar', procesarRouter);

/**
 * Ruta raíz — Health check simple para verificar que el servidor funciona.
 * Útil para Render/Vercel/Heroku y para depuración.
 */
app.get('/', (req, res) => {
    res.status(200).json({
        status  : 'OK',
        mensaje  : 'API Gemini Backend funcionando correctamente 🚀',
        version : '1.0.0',
        endpoints: {
            procesar: 'POST /procesar'
        }
    });
});

/**
 * Middleware de manejo de errores 404
 * Se ejecuta cuando ninguna ruta coincide.
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        ruta : req.originalUrl
    });
});

/**
 * Middleware global de manejo de errores
 * Express lo detecta porque tiene 4 parámetros (err, req, res, next).
 */
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err.message);
    res.status(500).json({
        error: 'Error interno del servidor',
        detalle: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ── Iniciar servidor (solo en local, NO en Vercel) ───────────
// Vercel importa este archivo como módulo serverless y llama
// directamente al `app` exportado — nunca necesita app.listen().
// "require.main === module" es true solo cuando se ejecuta con:
//   node server.js   →  local
// y false cuando Vercel lo importa como función serverless.
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📡 Endpoint: POST http://localhost:${PORT}/procesar`);
        console.log(`🤖 Modelo Gemini: ${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}`);
        console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
    });
}

// Exportar app para Vercel (serverless) y para tests
module.exports = app;
