# 🤖 Integración con LLMs

Esta guía muestra cómo integrar diferentes LLMs con tu aplicación AI4UNI.

## 📋 System Prompt Recomendado

```javascript
const SYSTEM_PROMPT = `Eres un profesor universitario experto en múltiples disciplinas. Tu objetivo es educar a estudiantes de forma clara, pedagógica y visual.

FORMATO DE RESPUESTAS:

1. FÓRMULAS MATEMÁTICAS (sintaxis LaTeX):
   - Inline: $formula$ 
   - Bloque: $$formula$$
   Ejemplo: La energía es $E = mc^2$ y la fórmula cuadrática:
   $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

2. GRÁFICOS DE FUNCIONES MATEMÁTICAS:
   Sintaxis: ###GRAPH{"type":"function","config":{"data":[{"fn":"FUNCION","color":"COLOR"}]}}###END
   
   Funciones válidas: x^2, sin(x), cos(x), tan(x), sqrt(x), abs(x), log(x), exp(x)
   
   Ejemplos:
   - ###GRAPH{"type":"function","config":{"data":[{"fn":"x^2","color":"#667eea"}]}}###END
   - ###GRAPH{"type":"function","config":{"data":[{"fn":"sin(x)","color":"#e53e3e"}]}}###END
   - ###GRAPH{"type":"function","config":{"data":[{"fn":"x^2","color":"#667eea"},{"fn":"2*x","color":"#e53e3e"}]}}###END

3. GRÁFICOS DE DATOS:
   Sintaxis: ###GRAPH{"type":"chart","chartType":"TIPO","data":ARRAY,"config":{"xKey":"x","yKey":"y"}}###END
   
   Tipos: "bar" o "line"
   
   Ejemplos:
   - ###GRAPH{"type":"chart","chartType":"bar","data":[{"name":"A","value":30},{"name":"B","value":45}],"config":{"xKey":"name","yKey":"value"}}###END
   - ###GRAPH{"type":"chart","chartType":"line","data":[{"mes":"Ene","temp":15},{"mes":"Feb","temp":18}],"config":{"xKey":"mes","yKey":"temp"}}###END

4. DIBUJOS DE OBJETOS FÍSICOS:
   Sintaxis: ###GRAPH{"type":"drawing","objects":ARRAY,"config":CONFIG}###END
   
   Ejemplos:
   - ###GRAPH{"type":"drawing","objects":[{"label":"Pelota A","diameter":10,"weight":0.5,"color":"#667eea"},{"label":"Pelota B","diameter":20,"weight":2,"color":"#e53e3e"}],"config":{"title":"Comparación de Pelotas"}}###END
   - ###GRAPH{"type":"drawing","objects":[{"label":"Tierra","diameter":12742,"unit":"km"},{"label":"Luna","diameter":3474,"unit":"km"}],"config":{"title":"Tamaños Relativos"}}###END

REGLAS:
- Usa gráficos para visualizar conceptos matemáticos
- Combina fórmulas y gráficos para mejor comprensión
- El JSON debe estar en UNA SOLA LÍNEA sin saltos
- Explica siempre lo que muestras
- Sé pedagógico y claro`;
```

## 🔌 Ejemplos de Integración

### 1. OpenAI (ChatGPT)

```javascript
// src/App.jsx
import { useState } from 'react'
import './App.css'
import Blackboard from './components/Blackboard'
import TextInput from './components/TextInput'
import TeacherAvatar from './components/TeacherAvatar'

const OPENAI_API_KEY = 'tu-api-key-aqui' // ¡Mejor usar variables de entorno!
const SYSTEM_PROMPT = `...` // El prompt de arriba

function App() {
  const [blackboardContent, setBlackboardContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (text) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4', // o 'gpt-3.5-turbo'
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text }
          ],
          temperature: 0.7
        })
      })
      
      const data = await response.json()
      const answer = data.choices[0].message.content
      
      setBlackboardContent(answer)
    } catch (error) {
      console.error('Error:', error)
      setBlackboardContent('Error al procesar la pregunta. Intenta nuevamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="classroom">
      <div className="left-section">
        <Blackboard content={blackboardContent} isProcessing={isProcessing} />
        <TextInput onSubmit={handleSubmit} disabled={isProcessing} />
      </div>
      
      <div className="right-section">
        <TeacherAvatar isThinking={isProcessing} />
      </div>
    </div>
  )
}

export default App
```

### 2. Anthropic (Claude)

```javascript
const ANTHROPIC_API_KEY = 'tu-api-key-aqui'

const handleSubmit = async (text) => {
  setIsProcessing(true)
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: text }
        ]
      })
    })
    
    const data = await response.json()
    const answer = data.content[0].text
    
    setBlackboardContent(answer)
  } catch (error) {
    console.error('Error:', error)
    setBlackboardContent('Error al procesar la pregunta.')
  } finally {
    setIsProcessing(false)
  }
}
```

### 3. Backend Personalizado

Si tienes tu propio backend:

```javascript
const handleSubmit = async (text) => {
  setIsProcessing(true)
  
  try {
    const response = await fetch('http://tu-backend.com/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: text,
        systemPrompt: SYSTEM_PROMPT
      })
    })
    
    const data = await response.json()
    setBlackboardContent(data.answer)
  } catch (error) {
    console.error('Error:', error)
    setBlackboardContent('Error al procesar la pregunta.')
  } finally {
    setIsProcessing(false)
  }
}
```

## 🔐 Mejores Prácticas

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_OPENAI_API_KEY=tu-api-key-aqui
VITE_ANTHROPIC_API_KEY=tu-api-key-aqui
```

Usa en tu código:

```javascript
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
```

**¡No olvides agregar `.env` a tu `.gitignore`!**

### 2. Manejo de Errores

```javascript
const handleSubmit = async (text) => {
  setIsProcessing(true)
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text }
        ]
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const answer = data.choices[0].message.content
    
    setBlackboardContent(answer)
  } catch (error) {
    console.error('Error detallado:', error)
    
    let errorMessage = 'Error al procesar la pregunta.'
    
    if (error.message.includes('401')) {
      errorMessage = 'Error de autenticación. Verifica tu API key.'
    } else if (error.message.includes('429')) {
      errorMessage = 'Límite de uso excedido. Intenta más tarde.'
    } else if (error.message.includes('500')) {
      errorMessage = 'Error del servidor. Intenta nuevamente.'
    }
    
    setBlackboardContent(errorMessage)
  } finally {
    setIsProcessing(false)
  }
}
```

### 3. Historial de Conversación

Para mantener contexto entre preguntas:

```javascript
function App() {
  const [blackboardContent, setBlackboardContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])

  const handleSubmit = async (text) => {
    setIsProcessing(true)
    
    // Agregar pregunta al historial
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: text }
    ]
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newHistory  // Incluir todo el historial
          ]
        })
      })
      
      const data = await response.json()
      const answer = data.choices[0].message.content
      
      // Actualizar historial con la respuesta
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: answer }
      ])
      
      setBlackboardContent(answer)
    } catch (error) {
      console.error('Error:', error)
      setBlackboardContent('Error al procesar la pregunta.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // ... resto del código
}
```

### 4. Botón para Limpiar la Pizarra

```javascript
// Agregar estado para limpiar
const clearBlackboard = () => {
  setBlackboardContent('')
  setConversationHistory([])
}

// En el JSX, agregar botón
<button onClick={clearBlackboard}>Limpiar Pizarra</button>
```

## 🎯 Ejemplos de Preguntas y Respuestas

### Pregunta: "Explica las funciones cuadráticas"

**Respuesta esperada del LLM:**
```
Una función cuadrática tiene la forma $f(x) = ax^2 + bx + c$ donde $a \neq 0$.

Su gráfica es una parábola. Veamos un ejemplo:

###GRAPH{"type":"function","config":{"data":[{"fn":"x^2 - 4*x + 3","color":"#667eea"}]}}###END

Esta función tiene raíces en $x = 1$ y $x = 3$, calculadas con:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
```

### Pregunta: "Compara seno y coseno"

**Respuesta esperada:**
```
Las funciones seno y coseno son funciones trigonométricas fundamentales:

###GRAPH{"type":"function","config":{"data":[{"fn":"sin(x)","color":"#667eea"},{"fn":"cos(x)","color":"#e53e3e"}]}}###END

Observa que $\cos(x) = \sin(x + \frac{\pi}{2})$. Es decir, el coseno es el seno desplazado $\frac{\pi}{2}$ radianes.
```

## 🚀 Deployment

### Vercel

1. Sube tu proyecto a GitHub
2. Conecta con Vercel
3. Agrega variables de entorno en Vercel Dashboard
4. Deploy

### Netlify

Similar a Vercel, con variables de entorno en Settings.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## ⚠️ Consideraciones de Seguridad

1. **Nunca expongas API keys en el frontend**: Usa un backend proxy
2. **Rate limiting**: Implementa límites de uso
3. **Validación**: Valida y sanitiza las entradas del usuario
4. **CORS**: Configura correctamente las políticas CORS
5. **HTTPS**: Usa siempre conexiones seguras en producción

## 📚 Recursos Adicionales

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [KaTeX Supported Functions](https://katex.org/docs/supported.html)
- [function-plot Docs](https://mauriciopoppe.github.io/function-plot/)
- [Recharts Docs](https://recharts.org/)

---

¡Buena suerte con tu integración! 🚀

