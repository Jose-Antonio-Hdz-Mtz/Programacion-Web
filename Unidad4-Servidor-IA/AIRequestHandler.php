<?php
/**
 * ============================================================
 * AIRequestHandler.php — Clase principal OOP
 * Unidad 4.5 — Programación Orientada a Objetos en PHP
 *
 * Esta clase encapsula todos los datos de la propuesta de
 * proyecto enviada por el usuario y los prepara en el formato
 * necesario para consumir la Gemini API de Google.
 *
 * Conceptos aplicados:
 *   - Encapsulamiento (propiedades privadas + métodos públicos)
 *   - Constructor
 *   - Métodos de instancia
 *   - Sanitización de datos de entrada
 * ============================================================
 */

class AIRequestHandler
{
    // ── Propiedades privadas ──────────────────────────────────
    // El acceso privado garantiza el encapsulamiento: solo los
    // métodos de la misma clase pueden leer o modificar estos
    // valores directamente.

    /** @var string Nombre del participante */
    private string $nombre;

    /** @var string Correo electrónico del participante */
    private string $correo;

    /** @var string Título del proyecto de IA */
    private string $titulo;

    /** @var string Descripción completa del proyecto */
    private string $descripcion;

    // ── Constructor ───────────────────────────────────────────
    /**
     * Inicializa el objeto con los datos crudos recibidos del
     * formulario. Los valores se asignan sin sanitizar aún;
     * la sanitización se ejecuta explícitamente con sanitizeText().
     *
     * @param string $nombre      Nombre del participante
     * @param string $correo      Correo electrónico
     * @param string $titulo      Título del proyecto
     * @param string $descripcion Descripción del proyecto
     */
    public function __construct(
        string $nombre,
        string $correo,
        string $titulo,
        string $descripcion
    ) {
        $this->nombre      = $nombre;
        $this->correo      = $correo;
        $this->titulo      = $titulo;
        $this->descripcion = $descripcion;
    }

    // ── Getters públicos ──────────────────────────────────────
    // Permiten leer las propiedades privadas desde fuera de la
    // clase sin romper el encapsulamiento.

    public function getNombre():      string { return $this->nombre;      }
    public function getCorreo():      string { return $this->correo;      }
    public function getTitulo():      string { return $this->titulo;      }
    public function getDescripcion(): string { return $this->descripcion; }

    // ── Métodos principales ───────────────────────────────────

    /**
     * sanitizeText()
     * ─────────────
     * Elimina caracteres peligrosos de todas las propiedades
     * de texto mediante las siguientes funciones de PHP:
     *
     *   1. trim()           — elimina espacios al inicio y al final
     *   2. stripslashes()   — elimina barras invertidas escapadas
     *   3. htmlspecialchars() — convierte caracteres HTML especiales
     *                          en entidades para prevenir XSS
     *                          (<, >, ", ', &)
     *
     * Tras llamar a este método, los datos quedan seguros para
     * mostrarse en HTML o enviarse a una API externa.
     *
     * @return void
     */
    public function sanitizeText(): void
    {
        // Aplicar sanitización encadenada a cada campo de texto
        $this->nombre      = htmlspecialchars(stripslashes(trim($this->nombre)),      ENT_QUOTES, 'UTF-8');
        $this->titulo      = htmlspecialchars(stripslashes(trim($this->titulo)),      ENT_QUOTES, 'UTF-8');
        $this->descripcion = htmlspecialchars(stripslashes(trim($this->descripcion)), ENT_QUOTES, 'UTF-8');

        // El correo usa filter_sanitize_email para limpiar
        // caracteres no válidos en direcciones de correo
        $this->correo = filter_var(trim($this->correo), FILTER_SANITIZE_EMAIL);
    }

    /**
     * prepareForGemini()
     * ──────────────────
     * Estructura toda la información en un arreglo asociativo
     * compatible con el formato de prompt de la Gemini API.
     *
     * El campo "contents" sigue el esquema estándar de la
     * API de Google Generative AI:
     *   contents[].parts[].text  → texto del prompt
     *
     * @return array Arreglo listo para codificarse en JSON
     *               y enviarse a la Gemini API
     */
    public function prepareForGemini(): array
    {
        // Construir el texto del prompt que se enviará a Gemini
        $promptText = sprintf(
            "Eres un evaluador de proyectos de Inteligencia Artificial para el evento " .
            "'Build with AI' organizado por Google en el instituto ICTM.\n\n" .
            "Evalúa la siguiente propuesta de proyecto:\n\n" .
            "Participante: %s\n" .
            "Correo: %s\n" .
            "Título del proyecto: %s\n\n" .
            "Descripción:\n%s\n\n" .
            "Por favor, proporciona retroalimentación constructiva sobre la viabilidad, " .
            "originalidad e impacto potencial del proyecto.",
            $this->nombre,
            $this->correo,
            $this->titulo,
            $this->descripcion
        );

        // Retornar el arreglo con la estructura esperada por Gemini API
        return [
            // Metadatos de la solicitud
            'metadata' => [
                'participante' => $this->nombre,
                'correo'       => $this->correo,
                'titulo'       => $this->titulo,
                'timestamp'    => date('Y-m-d H:i:s'),
                'evento'       => 'Build with AI – ICTM',
            ],

            // Cuerpo del request para la Gemini API
            // Documentación: https://ai.google.dev/api/generate-content
            'gemini_payload' => [
                'model'    => 'gemini-1.5-flash',      // Modelo a utilizar
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $promptText]     // Texto del prompt
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature'     => 0.7,           // Creatividad moderada
                    'maxOutputTokens' => 1024,          // Límite de respuesta
                    'topP'            => 0.9,
                ]
            ]
        ];
    }

    /**
     * contarPalabras()
     * ────────────────
     * Cuenta las palabras de la descripción usando str_word_count()
     * con soporte para caracteres UTF-8 (español).
     *
     * @return int Número de palabras en la descripción
     */
    public function contarPalabras(): int
    {
        // str_word_count con modo 0 devuelve el conteo de palabras
        // Usamos preg_match_all para mejor soporte de acentos en español
        return count(
            preg_split('/\s+/', trim($this->descripcion), -1, PREG_SPLIT_NO_EMPTY)
        );
    }
}
// Fin de la clase AIRequestHandler
