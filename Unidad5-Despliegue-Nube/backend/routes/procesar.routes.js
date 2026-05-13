// ============================================================
// routes/procesar.routes.js — Router de la ruta /procesar
//
// Separa la definición de rutas del controlador.
// Principio: cada archivo tiene UNA sola responsabilidad.
// ============================================================

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/gemini.controller');

/**
 * POST /procesar
 * ──────────────
 * Recibe texto del frontend → lo envía a Gemini → retorna respuesta.
 *
 * Body esperado (JSON):
 *   { "texto": "¿Cuántos planetas hay en el sistema solar?" }
 *
 * Respuesta exitosa (JSON):
 *   { "respuesta": "El sistema solar tiene 8 planetas...", "modelo": "gemini-1.5-flash" }
 */
router.post('/', controller.procesarTexto);

module.exports = router;
