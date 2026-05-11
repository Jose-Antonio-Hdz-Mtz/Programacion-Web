<?php
/**
 * ============================================================
 * procesar.php — Backend principal
 * Unidades 4.1, 4.2, 4.4 — Recepción POST, Estructuras de
 * Control y Respuesta del Servidor con Objetos
 *
 * Flujo de ejecución:
 *   1. Recibir datos del formulario mediante $_POST
 *   2. Verificar que el formulario fue enviado
 *   3. Validar campos vacíos y longitud de descripción
 *   4. Si todo es válido → crear objeto AIRequestHandler,
 *      sanitizar y mostrar respuesta estructurada
 *   5. Si hay errores → mostrar lista de errores al usuario
 * ============================================================
 */

// ── Paso 1: Incluir la clase AIRequestHandler ─────────────
// require_once garantiza que el archivo se incluya una sola vez
require_once 'AIRequestHandler.php';

// ── Paso 2: Inicializar variables de estado ───────────────
$errores    = [];       // Arreglo que acumula mensajes de error
$exito      = false;   // Bandera de éxito del procesamiento
$handler    = null;    // Objeto AIRequestHandler (se crea si hay éxito)
$geminiData = null;    // Arreglo preparado para Gemini API
$numPalabras = 0;      // Contador de palabras de la descripción

// ── Paso 3: Verificar que el formulario fue enviado ───────
// isset() comprueba que la clave exista en $_POST y no sea null.
// El campo oculto "enviado" actúa como "token" de envío.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['enviado'])) {

    // ── Paso 4: Recuperar datos de $_POST ─────────────────
    // trim() elimina espacios en blanco al inicio y al final
    // para evitar que un campo con solo espacios pase la validación.
    $nombre      = trim($_POST['nombre']      ?? '');
    $correo      = trim($_POST['correo']      ?? '');
    $titulo      = trim($_POST['titulo']      ?? '');
    $descripcion = trim($_POST['descripcion'] ?? '');

    // ── Paso 5: Validaciones con estructuras de control ───
    // Unidad 4.2 — if / else / elseif para verificar condiciones

    // 5.a Validar que el nombre no esté vacío
    if (empty($nombre)) {
        $errores[] = 'El nombre del participante es obligatorio.';
    }

    // 5.b Validar que el correo no esté vacío y tenga formato válido
    if (empty($correo)) {
        $errores[] = 'El correo electrónico es obligatorio.';
    } elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        // filter_var con FILTER_VALIDATE_EMAIL verifica el formato RFC 5322
        $errores[] = 'El correo electrónico no tiene un formato válido.';
    }

    // 5.c Validar que el título no esté vacío
    if (empty($titulo)) {
        $errores[] = 'El título del proyecto de IA es obligatorio.';
    }

    // 5.d Validar descripción: no vacía y mínimo 10 palabras
    if (empty($descripcion)) {
        $errores[] = 'La descripción del proyecto es obligatoria.';
    } else {
        // Contar palabras usando preg_split para soporte de UTF-8 (español)
        // PREG_SPLIT_NO_EMPTY elimina fragmentos vacíos del resultado
        $palabras    = preg_split('/\s+/', $descripcion, -1, PREG_SPLIT_NO_EMPTY);
        $numPalabras = count($palabras);

        // Verificar el mínimo requerido de palabras
        if ($numPalabras < 10) {
            $errores[] = "La descripción debe tener al menos 10 palabras. "
                       . "Actualmente tiene <strong>{$numPalabras}</strong> "
                       . ($numPalabras === 1 ? 'palabra' : 'palabras') . ".";
        }
    }

    // ── Paso 6: Procesamiento si no hay errores ────────────
    // Solo se crea el objeto si el arreglo $errores está vacío
    if (empty($errores)) {

        // ── Unidad 4.4: Crear objeto de la clase AIRequestHandler ──
        $handler = new AIRequestHandler($nombre, $correo, $titulo, $descripcion);

        // Sanitizar todos los campos del objeto
        // Este método modifica las propiedades internas del objeto
        $handler->sanitizeText();

        // Obtener el conteo final de palabras desde el objeto
        $numPalabras = $handler->contarPalabras();

        // Preparar el arreglo con el payload listo para Gemini API
        $geminiData = $handler->prepareForGemini();

        // Marcar el procesamiento como exitoso
        $exito = true;
    }

} else {
    // El usuario accedió directamente a procesar.php sin enviar el formulario
    // Redirigir al formulario principal
    header('Location: index.html');
    exit;
}

// ============================================================
// A partir de aquí comienza la salida HTML
// ============================================================
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- ── SEO ── -->
    <title>Resultado – Build with AI ICTM</title>
    <meta name="description"
          content="Resultado del procesamiento de la propuesta de proyecto de IA para el evento Build with AI de Google en el instituto ICTM.">

    <!-- ── Hoja de estilos externa ── -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- ══════════════════════════════════════════════════════
         SECCIÓN HERO — Encabezado de la página de resultado
    ══════════════════════════════════════════════════════════ -->
    <header class="hero">
        <div class="hero-badge">
            <span class="dot"></span>
            Google Build with AI · ICTM
        </div>
        <h1>Resultado del Procesamiento</h1>
        <p>La información fue recibida por el servidor y procesada con PHP.</p>
    </header>

    <!-- ══════════════════════════════════════════════════════
         SECCIÓN RESULTADO
         Se muestra contenido diferente según el resultado
         de la validación (Unidad 4.4)
    ══════════════════════════════════════════════════════════ -->
    <main class="result-section">

        <?php if ($exito): ?>
        <!-- ── CASO ÉXITO: Validación correcta ─────────────── -->

            <!-- Alerta de éxito -->
            <div class="alert-success">
                <div class="alert-title">✅ Propuesta recibida correctamente</div>
                <p>
                    Los datos han sido sanitizados y estructurados.
                    El payload está listo para enviarse a la <strong>Gemini API</strong>.
                </p>
            </div>

            <!-- Tarjeta con los datos procesados -->
            <div class="data-card">

                <!-- Encabezado de la tarjeta -->
                <div class="data-card-header">
                    🤖 Datos listos para Gemini API
                </div>

                <!-- Cuerpo con filas de información -->
                <div class="data-card-body">

                    <!-- Nombre del participante -->
                    <div class="data-row">
                        <span class="data-label">Participante</span>
                        <span class="data-value">
                            <?php echo $handler->getNombre(); ?>
                        </span>
                    </div>

                    <!-- Correo electrónico -->
                    <div class="data-row">
                        <span class="data-label">Correo</span>
                        <span class="data-value">
                            <?php echo $handler->getCorreo(); ?>
                        </span>
                    </div>

                    <!-- Título del proyecto -->
                    <div class="data-row">
                        <span class="data-label">Título del proyecto</span>
                        <span class="data-value">
                            <?php echo $handler->getTitulo(); ?>
                        </span>
                    </div>

                    <!-- Palabras detectadas -->
                    <div class="data-row">
                        <span class="data-label">Palabras en descripción</span>
                        <span class="data-value">
                            <strong><?php echo $numPalabras; ?></strong> palabras detectadas
                        </span>
                    </div>

                    <!-- Modelo Gemini seleccionado -->
                    <div class="data-row">
                        <span class="data-label">Modelo Gemini</span>
                        <span class="data-value">
                            <?php echo $geminiData['gemini_payload']['model']; ?>
                        </span>
                    </div>

                    <!-- Timestamp del procesamiento -->
                    <div class="data-row">
                        <span class="data-label">Timestamp</span>
                        <span class="data-value">
                            <?php echo $geminiData['metadata']['timestamp']; ?>
                        </span>
                    </div>

                    <!-- Estado del procesamiento -->
                    <div class="data-row">
                        <span class="data-label">Estado</span>
                        <span class="data-value">
                            <span class="badge badge-ok">✓ LISTO PARA API</span>
                        </span>
                    </div>

                    <!-- Payload JSON que se enviaría a Gemini API -->
                    <div style="margin-top: 16px;">
                        <div class="data-label" style="margin-bottom: 8px;">
                            Vista previa del payload (JSON)
                        </div>
                        <div class="code-block"><?php
                            // json_encode con JSON_PRETTY_PRINT formatea el JSON
                            // JSON_UNESCAPED_UNICODE preserva caracteres en español
                            echo htmlspecialchars(
                                json_encode(
                                    $geminiData['gemini_payload'],
                                    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
                                )
                            );
                        ?></div>
                    </div>

                </div><!-- /.data-card-body -->
            </div><!-- /.data-card -->

        <?php else: ?>
        <!-- ── CASO ERROR: Validación fallida ──────────────── -->

            <div class="alert-error">
                <div class="alert-title">
                    ⚠️ Se encontraron errores en el formulario
                </div>

                <!-- Lista de errores acumulados durante la validación -->
                <ul>
                    <?php foreach ($errores as $error): ?>
                        <!-- Cada error se muestra en su propio elemento de lista -->
                        <li><?php echo $error; ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>

        <?php endif; ?>

        <!-- Enlace para regresar al formulario -->
        <a href="index.html" class="btn-back">
            ← Enviar otra propuesta
        </a>

    </main>

    <!-- ══════════════════════════════════════════════════════
         FOOTER
    ══════════════════════════════════════════════════════════ -->
    <footer>
        <span>Build with AI – ICTM</span> &nbsp;·&nbsp;
        Práctica Unidad 4 · Programación Web &nbsp;·&nbsp;
        PHP <?php echo phpversion(); ?>
    </footer>

</body>
</html>
