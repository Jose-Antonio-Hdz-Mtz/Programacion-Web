// ============================================================
// controllers/gemini.controller.js — Lógica de negocio
//
// Responsabilidades:
//   1. Validar el body de la petición
//   2. Llamar al servicio de Gemini
//   3. Formatear y retornar la respuesta al frontend
//
// NO contiene lógica de Express ni de la API directamente;
// eso lo hace el servicio (gemini.service.js).
// ============================================================

const geminiService = require('../services/gemini.service');

/**
 * procesarTexto — Controlador principal del endpoint POST /procesar
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
const procesarTexto = async (req, res) => {
    try {
        // ── 1. Extraer y validar el texto del body ────────────
        const { texto } = req.body;

        // Validación de presencia
        if (!texto) {
            return res.status(400).json({
                error: 'El campo "texto" es obligatorio en el body de la petición.'
            });
        }

        // Validación de tipo
        if (typeof texto !== 'string') {
            return res.status(400).json({
                error: 'El campo "texto" debe ser una cadena de texto (string).'
            });
        }

        // Validación de longitud mínima
        const textoLimpio = texto.trim();
        if (textoLimpio.length < 3) {
            return res.status(400).json({
                error: 'El texto debe tener al menos 3 caracteres.'
            });
        }

        // Validación de longitud máxima (protección contra abusos)
        if (textoLimpio.length > 5000) {
            return res.status(400).json({
                error: 'El texto no puede superar los 5000 caracteres.'
            });
        }

        // ── 2. Llamar al servicio de Gemini ──────────────────
        console.log(`📨 [${new Date().toISOString()}] Petición recibida — ${textoLimpio.length} caracteres`);

        const { respuesta, modelo, tokens } = await geminiService.generarRespuesta(textoLimpio);

        // ── 3. Retornar respuesta exitosa ─────────────────────
        console.log(`✅ [${new Date().toISOString()}] Respuesta generada correctamente`);

        return res.status(200).json({
            exito   : true,
            respuesta,
            modelo,
            tokens,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // ── 4. Manejo centralizado de errores ─────────────────
        console.error('❌ Error en procesarTexto:', error.message);

        // Detectar errores específicos de la API de Gemini
        if (error.message.includes('API_KEY_INVALID') ||
            error.message.includes('API key not valid')) {
            return res.status(401).json({
                error: 'API Key de Gemini inválida. Verifica tu archivo .env'
            });
        }

        if (error.message.includes('SAFETY')) {
            return res.status(422).json({
                error: 'El contenido fue bloqueado por los filtros de seguridad de Gemini.'
            });
        }

        if (error.message.includes('quota') || error.message.includes('QUOTA')) {
            return res.status(429).json({
                error: 'Límite de cuota de Gemini alcanzado. Intenta más tarde.'
            });
        }

        // Error genérico del servidor
        return res.status(500).json({
            error: 'Error al procesar la solicitud con Gemini.',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { procesarTexto };
