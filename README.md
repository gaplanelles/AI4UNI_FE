## AI4UNI Frontend

### Requisitos
- Node.js 22.12+ (recomendado) o 20.19+
- npm 10+

Con nvm:
```bash
nvm install 22
nvm use 22
```

### Instalación
```bash
cd front_end/AI4UNI
npm install
```

### Variables de entorno
Crea un archivo `.env` en `front_end/AI4UNI`:
```bash
VITE_HEYGEN_API_KEY=tu_api_key
# Opcionales
VITE_HEYGEN_API_URL=https://api.heygen.com/v1
VITE_HEYGEN_AVATAR_NAME=default
```

### Ejecutar en desarrollo (puerto 9000)
```bash
npm run dev -- --host 0.0.0.0 --port 9000
```
Accede en:
- Local: `http://localhost:9000/`
- Red: `http://<IP_DEL_SERVIDOR>:9000/`

### (Opcional) Abrir el puerto 9000 en firewall
Ubuntu iptables:
```bash
sudo iptables -I INPUT -p tcp --dport 9000 -j ACCEPT
sudo netfilter-persistent save
```

OCI (Security List / NSG):
- Añade regla de Ingress: Protocolo TCP, Puerto destino 9000, Origen 0.0.0.0/0.

### Detener
- Detén con Ctrl+C en la terminal donde corre Vite.
# AI4UNI - Aula Virtual Interactiva

Una aplicación React que simula un entorno de clase universitaria con una pizarra interactiva, entrada de texto y un avatar de profesor.

## 🎯 Características

- **Pizarra Virtual**: Simula una pizarra de clase con efecto de escritura a mano
- **Renderizado de Fórmulas**: Soporte completo para fórmulas matemáticas usando KaTeX
- **Gráficos Interactivos**: Renderizado de funciones matemáticas y gráficos de datos
- **Avatar del Profesor con IA** 🎭: Avatar realista con HeyGen que habla las respuestas
- **Text-to-Speech**: Conversión automática de texto a voz sincronizada
- **Efecto de Escritura**: Las respuestas se muestran con un efecto de escritura animada
- **Diseño Responsivo**: Se adapta a diferentes tamaños de pantalla

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar HeyGen Avatar (IMPORTANTE)

Para que el avatar funcione, necesitas configurar tu API key de HeyGen:

```bash
# Copia el archivo de ejemplo
cp env.example .env

# Edita .env y agrega tu API key de HeyGen
# VITE_HEYGEN_API_KEY=tu-api-key-aqui
```

**📖 Ver guía completa:** [HEYGEN_SETUP.md](./HEYGEN_SETUP.md)

## 📦 Dependencias Principales

- React 18
- Vite (Build tool)
- **@heygen/streaming-avatar** 🎭 (Avatar con IA)
- KaTeX (Renderizado de fórmulas matemáticas)
- react-katex (Componentes React para KaTeX)
- function-plot (Gráficos de funciones matemáticas)
- recharts (Gráficos de datos estadísticos)

## 🎮 Uso

### Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:9000`

### Compilar para producción:

```bash
npm run build
```

### Vista previa de la compilación:

```bash
npm run preview
```

## 📝 Cómo Usar la Aplicación

1. **Escribir una pregunta**: En el área de texto en la parte inferior izquierda, escribe tu pregunta
2. **Enviar**: Haz clic en "Preguntar al Profesor"
3. **Ver la respuesta**: La respuesta aparecerá en la pizarra con efecto de escritura animada
4. **Fórmulas matemáticas**: 
   - Usa `$$formula$$` para fórmulas de bloque
   - Usa `$formula$` para fórmulas inline

### Ejemplos de Fórmulas:

```
Fórmula inline: La energía es $E = mc^2$

Fórmula de bloque:
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
```

### Ejemplos de Gráficos y Dibujos:

**Gráfico de función:**
```
###GRAPH{"type":"function","config":{"data":[{"fn":"x^2","color":"#667eea"}]}}###END
```

**Gráfico de datos:**
```
###GRAPH{"type":"chart","chartType":"bar","data":[{"name":"A","value":30},{"name":"B","value":45}],"config":{"xKey":"name","yKey":"value"}}###END
```

**Dibujo de objetos (NUEVO):**
```
###GRAPH{"type":"drawing","objects":[{"label":"Pelota A","diameter":10,"weight":0.5,"color":"#667eea"},{"label":"Pelota B","diameter":20,"weight":2,"color":"#e53e3e"}],"config":{"title":"Comparación de Pelotas"}}###END
```

**Ver `GRAFICOS.md` para documentación completa y `EJEMPLOS_DIBUJOS.md` para más casos de uso.**

## 🎨 Personalización

### Cambiar la fuente de la pizarra:

Edita `src/components/Blackboard.css` y modifica la propiedad `font-family` en `.blackboard-content`

### Modificar el color de la pizarra:

Edita el `background` en `.blackboard` en `src/components/Blackboard.css`

### Personalizar el avatar:

Modifica los estilos en `src/components/TeacherAvatar.css`

## 🔧 Integración con Backend

Para conectar con tu API o backend, edita la función `handleSubmit` en `src/App.jsx`:

```javascript
const handleSubmit = async (text) => {
  setIsProcessing(true)
  
  try {
    // Reemplaza esto con tu llamada API
    const response = await fetch('tu-api-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text })
    })
    
    const data = await response.json()
    setBlackboardContent(data.answer)
  } catch (error) {
    setBlackboardContent('Error al procesar la pregunta')
  } finally {
    setIsProcessing(false)
  }
}
```

## 📁 Estructura del Proyecto

```
AI4UNI/
├── src/
│   ├── components/
│   │   ├── Blackboard.jsx       # Componente de pizarra
│   │   ├── Blackboard.css
│   │   ├── TextInput.jsx        # Área de entrada de texto
│   │   ├── TextInput.css
│   │   ├── TeacherAvatar.jsx    # Avatar del profesor
│   │   └── TeacherAvatar.css
│   ├── App.jsx                  # Componente principal
│   ├── App.css
│   ├── main.jsx                 # Punto de entrada
│   └── index.css                # Estilos globales
├── public/
├── index.html
├── package.json
└── vite.config.js
```

## 🌟 Características Técnicas

- **Animación de Escritura**: Efecto letra por letra en la pizarra
- **Parseo de LaTeX**: Reconocimiento automático de fórmulas inline y de bloque
- **Estado Reactivo**: Gestión de estado con React Hooks
- **CSS Moderno**: Gradientes, animaciones y efectos visuales

## 📝 Notas

- La fuente "Caveat" se carga desde Google Fonts para simular escritura a mano
- KaTeX renderiza las fórmulas matemáticas de forma eficiente
- El avatar usa HeyGen para generar video y voz en tiempo real
- **Importante:** HeyGen es un servicio de pago que requiere API key

## 📊 Soporte de Gráficos y Dibujos

La aplicación soporta tres tipos de visualizaciones:

### 1. Gráficos de Funciones Matemáticas
Renderiza funciones matemáticas como `x^2`, `sin(x)`, etc.

### 2. Gráficos de Datos
Gráficos de barras y líneas para datos estadísticos.

### 3. Dibujos de Objetos Físicos ⭐ NUEVO
Visualiza objetos físicos con sus propiedades (tamaño, peso, etc.). Perfecto para comparaciones de:
- Pelotas, balones y objetos deportivos
- Planetas y cuerpos celestes
- Células y estructuras biológicas
- Átomos y moléculas
- Cualquier objeto con propiedades físicas

**Consulta `GRAFICOS.md` para la guía completa y `EJEMPLOS_DIBUJOS.md` para casos de uso.**

## 🎭 Avatar con HeyGen

El proyecto incluye integración con **HeyGen Streaming Avatar**, un avatar realista que:
- ✅ Habla las respuestas en tiempo real
- ✅ Sincroniza labios con el audio
- ✅ Soporta múltiples idiomas y voces
- ✅ Diferentes emociones (amigable, serio, etc.)

**📖 Guía de configuración completa:** [HEYGEN_SETUP.md](./HEYGEN_SETUP.md)

## 🤝 Contribuciones

Este proyecto está diseñado para ser extensible. Algunas ideas para mejoras:

- Integración con IA (OpenAI, Anthropic, etc.)
- Historial de conversaciones
- Múltiples temas de pizarra
- Soporte para más tipos de gráficos (scatter, pie, etc.)
- Soporte para diagramas (Mermaid)
- Modo oscuro/claro
- Exportar conversaciones
- Personalización de avatares
- Reconocimiento de voz (Speech-to-Text)

---

¡Disfruta de tu aula virtual! 🎓
