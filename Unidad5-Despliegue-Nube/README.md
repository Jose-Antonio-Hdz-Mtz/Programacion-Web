# Unidad 5: Despliegue y Consumo de Servicios en la Nube

## Análisis Cloud

### 1. Tipos de Servicio (5.2)

| Componente | Tipo de Servicio | Justificación Técnica |
|---|---|---|
| Vercel | PaaS (Platform as a Service) | Abstrae completamente la infraestructura subyacente. No configuramos servidores, redes ni sistemas operativos; únicamente proveemos el código fuente. Vercel se encarga del despliegue automático (CI/CD), la asignación de recursos, el balanceo de carga y la distribución global mediante su Edge Network. |
| InfinityFree | PaaS / Hosting | Funciona como un entorno gestionado donde el proveedor administra el hardware, el sistema operativo y el software del servidor (Apache/PHP). Nuestra única responsabilidad es subir los archivos de la aplicación. |
| Gemini API (Google) | SaaS / AIaaS | Servicio de Inteligencia Artificial listo para usarse. Google administra los servidores físicos, el entrenamiento del modelo y la escalabilidad. Nosotros simplemente consumimos el software final a través de peticiones web. |
| Servidor local XAMPP | On-Premise (Simula IaaS) | Actúa bajo un modelo similar al IaaS. Nosotros somos responsables de instalar, configurar y administrar todo el entorno (Apache, MySQL, PHP), simulando la carga operativa de rentar una máquina virtual desnuda como una instancia EC2 en AWS. |

---

### 2. Estándares e Interoperabilidad (5.4)

La comunicación entre nuestro servidor web y la nube de Google se realiza en formato **JSON (JavaScript Object Notation)** a través del protocolo HTTP/HTTPS.

**¿Por qué JSON es el estándar de la industria?**

- **Sintaxis Ligera:** A diferencia de XML, JSON no requiere etiquetas de cierre engorrosas, reduciendo el peso del payload y logrando respuestas más rápidas.
- **Interoperabilidad Universal:** Es agnóstico al lenguaje. Nuestro servidor PHP empaqueta los datos en JSON, los envía por internet, y los servidores de Google (en Python, Go o C++) los deserializan sin problemas de compatibilidad.
- **Estructura Clave-Valor:** Permite estructurar datos complejos como el prompt de entrada, configuraciones de temperatura de la IA e historial de chat.
- **Cabeceras HTTP:** Las peticiones declaran el estándar con la cabecera `Content-Type: application/json`.

---

### 3. Seguridad en la Nube (5.6)

Las **Variables de Entorno** son valores dinámicos que residen en el sistema operativo o en el entorno de ejecución de la plataforma, completamente separados del código fuente.

**¿Por qué las API Keys nunca deben subirse a GitHub?**

- **Exposición Pública:** Si el repositorio es público, cualquier persona tiene acceso inmediato a las credenciales.
- **Escaneo Automatizado:** Existen bots que monitorean GitHub 24/7 buscando API Keys. Una vez detectada, la roban en segundos.
- **Impacto Financiero:** Una clave comprometida puede generar millones de peticiones a nuestra cuenta, agotando la cuota gratuita y generando cargos económicos masivos.

**Manejo Seguro (estándar de la industria):**

- **A nivel local:** Se crea un archivo `.env` con la `GEMINI_API_KEY`. Se agrega `.env` al `.gitignore` para que Git lo ignore completamente.
- **En producción (Vercel):**
  1. Ingresar al panel de Vercel
  2. Navegar a **Settings → Environment Variables**
  3. Agregar la clave encriptada: `Key: GEMINI_API_KEY` / `Value: AIzaSyB...`
  4. En PHP se lee con `$_ENV['GEMINI_API_KEY']` o `getenv('GEMINI_API_KEY')`