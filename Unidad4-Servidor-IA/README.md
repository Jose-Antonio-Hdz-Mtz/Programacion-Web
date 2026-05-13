# Investigación y Preparación

## Diferencia técnica entre una API de Base de Datos y una API de IA

### API de Base de Datos
Una API de base de datos trabaja con operaciones estructuradas como:

- Consultar datos
- Insertar registros
- Actualizar información
- Eliminar datos

El servidor normalmente realiza operaciones CRUD utilizando consultas estructuradas.

### API de IA como Gemini
Una API de IA generativa no solo recupera datos, sino que genera contenido dinámicamente.

El servidor debe:
- Construir prompts
- Procesar lenguaje natural
- Manejar contexto
- Validar respuestas generadas

### Comparación

| API Base de Datos | API IA |
|---|---|
| Datos estructurados | Contenido generado |
| Respuestas exactas | Respuestas dinámicas |
| CRUD | Generación de texto |

---

## Seguridad: API Keys

Exponer una API Key en el frontend es peligroso porque cualquier usuario puede verla usando las herramientas del navegador.

### Riesgos
- Robo de la API Key
- Consumo no autorizado
- Cobros económicos
- Ataques automatizados

### Solución usando Backend
El backend protege la API Key porque:

1. La clave permanece en el servidor.
2. El cliente nunca tiene acceso directo.
3. Se pueden aplicar medidas de seguridad.

---

## Google AI Studio

Google AI Studio es una plataforma para probar y desarrollar aplicaciones con modelos de IA como Gemini.

### Funciones principales
- Probar prompts
- Generar API Keys
- Experimentar con Gemini
- Obtener ejemplos de código

### Uso en desarrollo
1. Diseñar prompts
2. Probar respuestas
3. Integrar la API en el backend
4. Optimizar resultados

---

## Conclusión

Las APIs de IA funcionan de manera diferente a las APIs tradicionales porque generan contenido dinámicamente. Además, es importante proteger las API Keys usando un backend seguro.

Google AI Studio facilita el desarrollo y pruebas de aplicaciones con inteligencia artificial.
## Despliegue
Proyecto desplegado en InfinityFree.
