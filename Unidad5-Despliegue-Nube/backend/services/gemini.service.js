// ============================================================
// services/gemini.service.js — Integración con Gemini vía REST
//
// Usa fetch nativo de Node 18+ para llamar directamente a la
// API REST de Google, evitando problemas de versión del SDK.
//
// Documentación: https://ai.google.dev/gemini-api/docs/quickstart
// ============================================================

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * generarRespuesta — Envía texto a Gemini y retorna la respuesta.
 *
 * @param {string} textoUsuario - Texto validado del frontend
 * @returns {Promise<{respuesta: string, modelo: string, tokens: object}>}
 */
const generarRespuesta = async (textoUsuario) => {

    const API_KEY = process.env.GEMINI_API_KEY;

    // URL de la API REST de Google Generative Language
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: `Eres un asistente académico experto en programación web y tecnología.
Responde de forma clara, precisa y en español.
Sé detallado pero conciso. Si el usuario hace una pregunta técnica, incluye ejemplos si es relevante.

Usuario: ${textoUsuario}`
                    }
                ]
            }
        ],
        generationConfig: {
            temperature    : 0.7,
            maxOutputTokens: 1024,
            topP           : 0.8,
            topK           : 40
        }
    };

    console.log(`🤖 Consultando modelo: ${MODEL_NAME}...`);

    const response = await fetch(url, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload)
    });

    const data = await response.json();

    // Manejar errores HTTP de Google
    if (!response.ok) {
        const mensaje = data?.error?.message || `HTTP ${response.status}`;
        const codigo  = data?.error?.code    || response.status;
        throw new Error(`[${codigo}] ${mensaje}`);
    }

    // Extraer texto de la respuesta
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!texto) {
        throw new Error('Gemini no retornó texto en la respuesta.');
    }

    const tokens = {
        entrada: data?.usageMetadata?.promptTokenCount     || 0,
        salida : data?.usageMetadata?.candidatesTokenCount || 0,
        total  : data?.usageMetadata?.totalTokenCount      || 0
    };

    console.log(`📊 Tokens: ${tokens.total} (entrada: ${tokens.entrada}, salida: ${tokens.salida})`);

    return { respuesta: texto, modelo: MODEL_NAME, tokens };
};

module.exports = { generarRespuesta };
