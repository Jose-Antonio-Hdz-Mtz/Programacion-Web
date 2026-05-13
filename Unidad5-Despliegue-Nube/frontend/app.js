// ============================================================
// app.js — Lógica del frontend
// Consumo del backend con fetch(), historial, dark mode
// ============================================================

'use strict';

// ── Configuración ────────────────────────────────────────────
const CONFIG = {
    // URL del backend. Cambiar en producción al dominio de Render/Vercel
    API_URL : 'http://localhost:3000/procesar',
    MAX_CHARS: 5000
};

// ── Referencias al DOM ────────────────────────────────────────
const form              = document.getElementById('form-gemini');
const textoInput        = document.getElementById('texto-input');
const charCount         = document.getElementById('char-count');
const modoSelect        = document.getElementById('modo-select');
const btnProcesar       = document.getElementById('btn-procesar');
const btnLoader         = document.getElementById('btn-loader');
const responsesContainer= document.getElementById('responses-container');
const emptyState        = document.getElementById('empty-state');
const responseMeta      = document.getElementById('response-meta');
const metaModelo        = document.getElementById('meta-modelo');
const metaTokens        = document.getElementById('meta-tokens');
const metaTiempo        = document.getElementById('meta-tiempo');
const btnTheme          = document.getElementById('btn-theme');
const themeIcon         = document.getElementById('theme-icon');
const statusDot         = document.getElementById('status-dot');
const statusText        = document.getElementById('status-text');
const btnClearHistory   = document.getElementById('btn-clear-history');
const btnCopyLast       = document.getElementById('btn-copy-last');
const chips             = document.querySelectorAll('.chip');

// ── Estado de la aplicación ──────────────────────────────────
let historial = [];     // Array de objetos { pregunta, respuesta, modelo, tokens, tiempo }
let ultimaRespuesta = '';

// ── Tema (Dark/Light mode) ────────────────────────────────────

/**
 * Aplica el tema guardado en localStorage al iniciar la app.
 * Persiste la preferencia del usuario entre sesiones.
 */
function initTheme() {
    const temaGuardado = localStorage.getItem('tema') || 'dark';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    themeIcon.textContent = temaGuardado === 'dark' ? '☀️' : '🌙';
}

/**
 * Alterna entre modo oscuro y claro.
 * Guarda la preferencia en localStorage.
 */
btnTheme.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    const nuevo  = actual === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nuevo);
    localStorage.setItem('tema', nuevo);
    themeIcon.textContent = nuevo === 'dark' ? '☀️' : '🌙';
});

// ── Health check del backend ──────────────────────────────────

/**
 * Verifica que el backend esté activo haciendo GET / al servidor.
 * Actualiza el badge de estado en el navbar.
 */
async function verificarBackend() {
    const baseUrl = CONFIG.API_URL.replace('/procesar', '');
    try {
        const res = await fetch(baseUrl, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
            statusDot.className  = 'status-dot online';
            statusText.textContent = 'Backend activo';
        } else {
            throw new Error('No OK');
        }
    } catch {
        statusDot.className  = 'status-dot offline';
        statusText.textContent = 'Backend desconectado';
    }
}

// ── Contador de caracteres ────────────────────────────────────

textoInput.addEventListener('input', () => {
    const len = textoInput.value.length;
    charCount.textContent = `${len} / ${CONFIG.MAX_CHARS}`;
    charCount.className = 'char-count';
    if (len > CONFIG.MAX_CHARS * 0.85) charCount.classList.add('near-limit');
    if (len >= CONFIG.MAX_CHARS)        charCount.classList.add('at-limit');
    // Limpiar error al escribir
    document.getElementById('texto-error').textContent = '';
    document.getElementById('field-group-texto').classList.remove('has-error');
});

// ── Quick prompts / Chips ─────────────────────────────────────

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        textoInput.value = chip.dataset.prompt;
        textoInput.dispatchEvent(new Event('input'));
        textoInput.focus();
    });
});

// ── Validación del formulario ─────────────────────────────────

/**
 * Valida los campos antes de enviar.
 * @returns {boolean} true si el formulario es válido
 */
function validar() {
    const texto = textoInput.value.trim();
    const errorEl = document.getElementById('texto-error');
    const groupEl = document.getElementById('field-group-texto');

    if (!texto) {
        errorEl.textContent = '⚠️ Por favor escribe un mensaje antes de procesar.';
        groupEl.classList.add('has-error');
        textoInput.focus();
        return false;
    }
    if (texto.length < 3) {
        errorEl.textContent = '⚠️ El mensaje debe tener al menos 3 caracteres.';
        groupEl.classList.add('has-error');
        textoInput.focus();
        return false;
    }
    return true;
}

// ── Estado de carga del botón ─────────────────────────────────

function setLoading(loading) {
    btnProcesar.disabled = loading;
    btnProcesar.classList.toggle('loading', loading);
}

// ── Renderizar respuesta en el historial ──────────────────────

/**
 * Crea y agrega una tarjeta de respuesta al historial visual.
 * @param {string} pregunta   - Texto enviado por el usuario
 * @param {string} respuesta  - Texto generado por Gemini
 * @param {boolean} isError   - true si es un mensaje de error
 */
function renderRespuesta(pregunta, respuesta, isError = false) {
    // Ocultar empty state
    emptyState.style.display = 'none';

    const card = document.createElement('div');
    card.className = isError ? 'response-card error-card' : 'response-card';

    // Prompt del usuario (truncado a 60 chars)
    const promptCorto = pregunta.length > 60 ? pregunta.slice(0, 60) + '…' : pregunta;

    card.innerHTML = `
        <div class="response-prompt">
            <strong>Tú:</strong> ${escapeHTML(promptCorto)}
        </div>
        <div class="response-text ${isError ? 'error-text' : ''}">
            ${isError ? '❌ ' + escapeHTML(respuesta) : formatearRespuesta(respuesta)}
        </div>
    `;

    responsesContainer.appendChild(card);
    // Scroll automático al final
    card.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

/**
 * Formatea el texto de Gemini: convierte bloques de código y negritas básicas.
 * @param {string} texto
 * @returns {string} HTML seguro
 */
function formatearRespuesta(texto) {
    let html = escapeHTML(texto);
    // Código inline `...`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Negritas **...**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return html;
}

/**
 * Escapa caracteres HTML para prevenir XSS.
 * IMPORTANTE: nunca insertar texto del usuario sin escapar.
 */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ── Envío del formulario → fetch al backend ───────────────────

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validar()) return;

    const texto = textoInput.value.trim();
    const modo  = modoSelect.value;

    // Construir prompt con contexto de modo
    const modos = {
        general   : texto,
        tecnico   : `Como experto en programación y tecnología, responde técnicamente: ${texto}`,
        academico : `Responde con rigor académico y referencias si aplica: ${texto}`,
        creativo  : `Responde de forma creativa, original y con ejemplos: ${texto}`
    };
    const promptFinal = modos[modo] || texto;

    setLoading(true);
    const tiempoInicio = Date.now();

    try {
        // ── Petición fetch al backend ─────────────────────────
        const response = await fetch(CONFIG.API_URL, {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify({ texto: promptFinal })
        });

        const data = await response.json();

        if (!response.ok) {
            // El backend retornó un error HTTP (4xx, 5xx)
            throw new Error(data.error || `Error HTTP ${response.status}`);
        }

        // ── Éxito: mostrar respuesta ──────────────────────────
        const tiempoTotal = ((Date.now() - tiempoInicio) / 1000).toFixed(1);

        ultimaRespuesta = data.respuesta;
        historial.push({ pregunta: texto, respuesta: data.respuesta, modelo: data.modelo, tokens: data.tokens });

        renderRespuesta(texto, data.respuesta);

        // Actualizar metadatos
        metaModelo.textContent  = data.modelo || '—';
        metaTokens.textContent  = data.tokens?.total ?? '—';
        metaTiempo.textContent  = `${tiempoTotal}s`;
        responseMeta.style.display = 'flex';

        // Limpiar textarea
        textoInput.value = '';
        textoInput.dispatchEvent(new Event('input'));

    } catch (error) {
        // ── Error de red o del servidor ───────────────────────
        console.error('Error al procesar:', error);

        let mensajeError = error.message;
        if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
            mensajeError = 'No se pudo conectar al backend. Verifica que el servidor está corriendo en localhost:3000.';
        }

        renderRespuesta(texto, mensajeError, true);
        mostrarToast('Error al procesar la solicitud', 'error');

    } finally {
        setLoading(false);
    }
});

// ── Limpiar historial ─────────────────────────────────────────

btnClearHistory.addEventListener('click', () => {
    if (historial.length === 0) return;
    responsesContainer.innerHTML = '';
    responsesContainer.appendChild(emptyState);
    emptyState.style.display = 'flex';
    responseMeta.style.display = 'none';
    historial = [];
    ultimaRespuesta = '';
    mostrarToast('Historial limpiado', 'success');
});

// ── Copiar última respuesta ───────────────────────────────────

btnCopyLast.addEventListener('click', async () => {
    if (!ultimaRespuesta) {
        mostrarToast('No hay respuesta para copiar', 'error');
        return;
    }
    try {
        await navigator.clipboard.writeText(ultimaRespuesta);
        mostrarToast('✅ Respuesta copiada al portapapeles', 'success');
    } catch {
        mostrarToast('No se pudo copiar', 'error');
    }
});

// ── Toast de notificación ─────────────────────────────────────

/**
 * Muestra un toast temporal en la esquina inferior derecha.
 * @param {string} mensaje
 * @param {'success'|'error'} tipo
 */
function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ── Inicialización ────────────────────────────────────────────

initTheme();
verificarBackend();

// Re-verificar estado del backend cada 30 segundos
setInterval(verificarBackend, 30_000);
