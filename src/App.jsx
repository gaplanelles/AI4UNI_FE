import { useState, useEffect, useRef } from 'react'
import './App.css'
import Header from './components/Header'
import Blackboard from './components/Blackboard'
import TextInput from './components/TextInput'
import HeyGenAvatar from './components/HeyGenAvatar'

function App() {
  const [messages, setMessages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [textToSpeak, setTextToSpeak] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const targetContentRef = useRef('')
  const displayIndexRef = useRef(0)
  const streamingCompleteRef = useRef(false)
  const intervalRef = useRef(null)
  const initCalledRef = useRef(false)
  const assistantContentRef = useRef('')
  const assistantDisplayIndexRef = useRef(0)
  const assistantIntervalRef = useRef(null)
  const assistantMessageIndexRef = useRef(-1)
  const pendingVoiceTextRef = useRef('')

  // Efecto para mostrar el contenido carácter por carácter
  useEffect(() => {
    // Limpiar intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      const target = targetContentRef.current
      const currentIndex = displayIndexRef.current

      if (currentIndex < target.length) {
        displayIndexRef.current = currentIndex + 1
        setMessages([{
          role: 'system',
          content: target.substring(0, currentIndex + 1)
        }])
      } else if (currentIndex > 0 && currentIndex === target.length) {
        // Ya mostramos todo, detener el intervalo
        clearInterval(intervalRef.current)
      }
    }, 30) // 30ms por carácter

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Efecto para mostrar el contenido del asistente carácter por carácter
  useEffect(() => {
    // Limpiar intervalo existente
    if (assistantIntervalRef.current) {
      clearInterval(assistantIntervalRef.current)
    }

    assistantIntervalRef.current = setInterval(() => {
      const target = assistantContentRef.current
      const currentIndex = assistantDisplayIndexRef.current
      const messageIndex = assistantMessageIndexRef.current

      if (messageIndex >= 0 && currentIndex < target.length) {
        // Avanzar más caracteres a la vez si el target está muy adelante
        const diff = target.length - currentIndex
        const step = diff > 100 ? 3 : 1 // Si hay mucha diferencia, avanzar de a 3 caracteres
        
        assistantDisplayIndexRef.current = Math.min(currentIndex + step, target.length)
        
        setMessages(prev => {
          const newMessages = [...prev]
          if (newMessages[messageIndex]) {
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              content: target.substring(0, assistantDisplayIndexRef.current)
            }
          }
          return newMessages
        })
        
        // Si terminó de escribir y hay texto pendiente para el avatar
        if (assistantDisplayIndexRef.current === target.length && pendingVoiceTextRef.current) {
          console.log('App - Typing completado, enviando al avatar')
          setTextToSpeak(pendingVoiceTextRef.current)
          pendingVoiceTextRef.current = ''
        }
      }
    }, 40) // 25ms por iteración

    return () => {
      if (assistantIntervalRef.current) {
        clearInterval(assistantIntervalRef.current)
      }
    }
  }, [])

  // Llamar al endpoint /init cuando se carga la página
  useEffect(() => {
    // Prevenir doble ejecución en StrictMode
    if (initCalledRef.current) {
      console.log('App - Init ya fue llamado, omitiendo...')
      return
    }
    
    initCalledRef.current = true
    
    const initializeConversation = async () => {
      console.log('App - Iniciando conversación...')
      setIsProcessing(true)
      streamingCompleteRef.current = false
      targetContentRef.current = ''
      displayIndexRef.current = 0
      setMessages([{
        role: 'system',
        content: ''
      }])
      
      try {
        const response = await fetch('https://81.208.173.145:9001/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ genModel: 'gpt-4' })
        })

        if (!response.ok) {
          throw new Error('Error al inicializar la conversación')
        }

        // Leer el streaming de datos
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = '' // Buffer para líneas incompletas
        let fullContent = '' // Contenido completo recibido
        let voiceText = '' // Texto para el avatar

        const processLine = (line) => {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.substring(6))
              
              if (jsonData.type === 'voice_text' && jsonData.content) {
                // Capturar el texto para el avatar
                voiceText = jsonData.content
                console.log('Voice text recibido para avatar:', voiceText.substring(0, 100) + '...')
                
                return false // Continuar
              } else if (jsonData.type === 'content' && jsonData.content) {
                // Acumular el contenido en el ref
                fullContent += jsonData.content
                targetContentRef.current = fullContent
                
                return false // Continuar
              } else if (jsonData.type === 'done') {
                // Streaming completado
                console.log('Streaming completado:', fullContent)
                streamingCompleteRef.current = true
                
                // Sources disponibles pero no se usan
                if (jsonData.sources && jsonData.sources.length > 0) {
                  console.log('Sources encontrados (no mostrados):', jsonData.sources)
                }
                
                // Enviar el voice_text al avatar (si existe), sino el contenido completo
                const textForAvatar = cleanTextForAvatar(voiceText || fullContent)
                if (textForAvatar) {
                  console.log('Enviando al avatar (limpiado):', textForAvatar.substring(0, 100) + '...')
                  setTextToSpeak(textForAvatar)
                }
                
                return true // Terminar
              }
            } catch (e) {
              console.error('Error parseando JSON:', e, line)
            }
          }
          return false
        }

        // Timeout de seguridad (3 minutos)
        const timeout = setTimeout(() => {
          console.warn('Init - Timeout del streaming, finalizando...')
          isDone = true
          reader.cancel()
        }, 180000)

        let isDone = false
        
        try {
          while (!isDone) {
            const { done, value } = await reader.read()
            
            if (done) {
              console.log('Init - Stream terminado por el servidor')
              break
            }

            // Decodificar el chunk
            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk
            
            // Procesar líneas completas
            const lines = buffer.split('\n')
            
            // La última línea puede estar incompleta, la guardamos en el buffer
            buffer = lines.pop() || ''
            
            for (const line of lines) {
              const trimmedLine = line.trim()
              if (trimmedLine) {
                console.log('Init - Línea recibida:', trimmedLine.substring(0, 100))
                if (processLine(trimmedLine)) {
                  isDone = true
                  break
                }
              }
            }
          }
          
          // Procesar cualquier línea restante en el buffer
          if (buffer.trim()) {
            console.log('Init - Procesando buffer final:', buffer.trim().substring(0, 100))
            processLine(buffer.trim())
          }
        } finally {
          clearTimeout(timeout)
        }

        setIsInitialized(true)
      } catch (error) {
        console.error('Error al inicializar:', error)
        // Mensaje de error por si falla la conexión
        const errorMessage = 'Error al conectar con el servidor. Por favor, verifica que el backend esté funcionando en https://81.208.173.145:9001'
        targetContentRef.current = errorMessage
        displayIndexRef.current = 0
        streamingCompleteRef.current = true
        setTextToSpeak(errorMessage)
        setIsInitialized(true)
      } finally {
        setIsProcessing(false)
      }
    }

    initializeConversation()
  }, [])

  // Función para limpiar el contenido de formato visual (gráficos, etc.)
  const cleanContentForAPI = (content) => {
    if (!content) return ''
    
    let cleaned = content
    
    // Eliminar gráficos ###GRAPH{...}###END
    cleaned = cleaned.replace(/###GRAPH(?:\{.+?\}|(?:\s*```json\s*\n[\s\S]+?\n\s*```\s*))###END/gs, '')
    
    // Eliminar fórmulas LaTeX de bloque \[ ... \] y $$ ... $$
    cleaned = cleaned.replace(/\\\[[\s\S]*?\\\]/g, '[fórmula]')
    cleaned = cleaned.replace(/\$\$[\s\S]*?\$\$/g, '[fórmula]')
    
    // Limpiar líneas vacías múltiples
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
    
    return cleaned.trim()
  }

  // Función para limpiar texto antes de enviarlo al avatar (reemplaza visualizaciones con texto hablado)
  const cleanTextForAvatar = (content) => {
    if (!content) return ''
    
    let cleaned = content
    
    // Expandir unidades físicas abreviadas a su forma completa
    // Distancia/Longitud
    cleaned = cleaned.replace(/\bkm\b/g, 'kilómetros')
    cleaned = cleaned.replace(/\bm\b(?=\s|\/|²|³|$)/g, 'metros')
    cleaned = cleaned.replace(/\bcm\b/g, 'centímetros')
    cleaned = cleaned.replace(/\bmm\b/g, 'milímetros')
    
    // Masa/Peso
    cleaned = cleaned.replace(/\bkg\b/g, 'kilogramos')
    cleaned = cleaned.replace(/\bg\b(?=\s|$)/g, 'gramos')
    cleaned = cleaned.replace(/\bmg\b/g, 'miligramos')
    cleaned = cleaned.replace(/\bt\b(?=\s|$)/g, 'toneladas')
    
    // Tiempo
    cleaned = cleaned.replace(/\bh\b(?=\s|$)/g, 'horas')
    cleaned = cleaned.replace(/\bmin\b/g, 'minutos')
    cleaned = cleaned.replace(/\bs\b(?=\s|$)/g, 'segundos')
    cleaned = cleaned.replace(/\bms\b/g, 'milisegundos')
    
    // Velocidad (antes de reemplazar las unidades individuales)
    cleaned = cleaned.replace(/km\/h/g, 'kilómetros por hora')
    cleaned = cleaned.replace(/m\/s/g, 'metros por segundo')
    cleaned = cleaned.replace(/cm\/s/g, 'centímetros por segundo')
    
    // Área
    cleaned = cleaned.replace(/km²/g, 'kilómetros cuadrados')
    cleaned = cleaned.replace(/m²/g, 'metros cuadrados')
    cleaned = cleaned.replace(/cm²/g, 'centímetros cuadrados')
    
    // Volumen
    cleaned = cleaned.replace(/km³/g, 'kilómetros cúbicos')
    cleaned = cleaned.replace(/m³/g, 'metros cúbicos')
    cleaned = cleaned.replace(/cm³/g, 'centímetros cúbicos')
    cleaned = cleaned.replace(/\bL\b/g, 'litros')
    cleaned = cleaned.replace(/\bmL\b/g, 'mililitros')
    
    // Aceleración
    cleaned = cleaned.replace(/m\/s²/g, 'metros por segundo al cuadrado')
    
    // Fuerza/Energía
    cleaned = cleaned.replace(/\bN\b(?=\s|$)/g, 'newtons')
    cleaned = cleaned.replace(/\bJ\b(?=\s|$)/g, 'joules')
    cleaned = cleaned.replace(/\bW\b(?=\s|$)/g, 'watts')
    
    // Temperatura
    cleaned = cleaned.replace(/°C/g, 'grados Celsius')
    cleaned = cleaned.replace(/°F/g, 'grados Fahrenheit')
    cleaned = cleaned.replace(/\bK\b(?=\s|$)/g, 'kelvin')
    
    // Eléctrica
    cleaned = cleaned.replace(/\bV\b(?=\s|$)/g, 'voltios')
    cleaned = cleaned.replace(/\bA\b(?=\s|$)/g, 'amperios')
    cleaned = cleaned.replace(/\bΩ\b/g, 'ohmios')
    
    // Presión
    cleaned = cleaned.replace(/\bPa\b/g, 'pascales')
    cleaned = cleaned.replace(/\batm\b/g, 'atmósferas')
    
    // Reemplazar gráficos con texto hablado
    // Primero intentamos identificar el tipo de gráfico para dar un mensaje más específico
    cleaned = cleaned.replace(/###GRAPH[\s\S]*?END/gs, (match) => {
      // Intentar detectar el tipo de visualización
      if (match.includes('"type":"function"') || match.includes('"type": "function"')) {
        return ' Observa el gráfico de la función. '
      } else if (match.includes('"type":"chart"') || match.includes('"type": "chart"')) {
        return ' Observa el gráfico de datos. '
      } else if (match.includes('"type":"drawing"') || match.includes('"type": "drawing"')) {
        // Detectar si es una animación
        if (match.includes('"animation"')) {
          return ' Observa la siguiente animación. '
        }
        return ' Observa el siguiente diagrama. '
      }
      // Fallback genérico
      return ' Observa la siguiente visualización. '
    })
    
    // Reemplazar fórmulas LaTeX de bloque con texto hablado
    cleaned = cleaned.replace(/\\\[[\s\S]*?\\\]/g, ' Observa la fórmula en pantalla. ')
    cleaned = cleaned.replace(/\$\$[\s\S]*?\$\$/gs, ' Observa la fórmula en pantalla. ')
    
    // Reemplazar fórmulas LaTeX inline con una pausa breve
    cleaned = cleaned.replace(/\\\([\s\S]*?\\\)/g, ', ')
    cleaned = cleaned.replace(/\$[^$\n]+?\$/g, ', ')
    
    // Eliminar bloques de código que podrían tener caracteres especiales
    cleaned = cleaned.replace(/```[\s\S]*?```/g, ' Observa el código en pantalla. ')
    cleaned = cleaned.replace(/`[^`]+?`/g, '')
    
    // Eliminar caracteres especiales matemáticos y símbolos problemáticos (incluyendo letras griegas)
    cleaned = cleaned.replace(/[∑∫∏√∞≈≠≤≥±×÷∂∇°αβγδεζηθλμπρστφψωΔΣΠΩ]/g, '')
    
    // Eliminar corchetes y llaves que pueden ser problemáticos
    cleaned = cleaned.replace(/[\[\]{}]/g, '')
    
    // Reemplazar guiones largos y otros caracteres especiales
    cleaned = cleaned.replace(/[—–]/g, '-')
    cleaned = cleaned.replace(/[""]/g, '"')
    cleaned = cleaned.replace(/['']/g, "'")
    
    // Eliminar asteriscos de markdown (negritas, cursivas)
    cleaned = cleaned.replace(/\*\*/g, '')
    cleaned = cleaned.replace(/\*/g, '')
    cleaned = cleaned.replace(/__|_/g, '')
    
    // Eliminar saltos de línea - convertir todo a un flujo continuo
    cleaned = cleaned.replace(/\n+/g, '. ')
    
    // Limpiar puntos múltiples
    cleaned = cleaned.replace(/\.{2,}/g, '.')
    
    // Limpiar espacios múltiples
    cleaned = cleaned.replace(/\s{2,}/g, ' ')
    
    // Eliminar caracteres de control y no imprimibles
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    
    // Mantener solo caracteres ASCII básicos, letras españolas y puntuación básica
    cleaned = cleaned.replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    
    // Truncar a 1200 caracteres de manera más inteligente (cortar en punto o coma)
    if (cleaned.length > 1200) {
      cleaned = cleaned.substring(0, 1200)
      // Intentar cortar en el último punto o coma
      const lastPeriod = cleaned.lastIndexOf('.')
      const lastComma = cleaned.lastIndexOf(',')
      const cutPoint = Math.max(lastPeriod, lastComma)
      if (cutPoint > 800) { // Solo cortar si hay un punto/coma razonable
        cleaned = cleaned.substring(0, cutPoint + 1)
      }
      console.log('App - Texto truncado para el avatar a', cleaned.length, 'caracteres')
    }
    
    return cleaned.trim()
  }

  const handleSubmit = async (text) => {
    setIsProcessing(true)
    
    // Agregar la pregunta del usuario a los mensajes
    const userMessage = {
      role: 'user',
      content: text
    }
    
    setMessages(prev => [...prev, userMessage])
    
    try {
      // Construir el historial de conversación para la API
      // Convertir roles y limpiar contenido de formato visual
      const conversation = messages.map(msg => ({
        role: msg.role === 'user' ? 'User' : 'Assistant',
        content: cleanContentForAPI(msg.content)
      }))

      console.log('App - Enviando pregunta a /ask:', text)
      console.log('App - Historial de conversación:', conversation)

      const response = await fetch('https://81.208.173.145:9001/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          genModel: 'OCI_CommandRplus',
          conversation: conversation
        })
      })

      if (!response.ok) {
        throw new Error('Error al procesar la pregunta')
      }

      // Leer el streaming de datos
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      let voiceText = '' // Texto para el avatar

      // Agregar mensaje del asistente vacío para ir llenándolo
      const assistantMessage = {
        role: 'assistant',
        content: ''
      }
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage]
        assistantMessageIndexRef.current = newMessages.length - 1
        return newMessages
      })
      
      // Reiniciar refs para el nuevo mensaje
      assistantContentRef.current = ''
      assistantDisplayIndexRef.current = 0
      pendingVoiceTextRef.current = ''

      const processLine = (line) => {
        if (line.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(line.substring(6))
            
            if (jsonData.type === 'voice_text' && jsonData.content) {
              // Capturar el texto para el avatar
              voiceText = jsonData.content
              console.log('App - Voice text recibido para avatar:', voiceText.substring(0, 100) + '...')
              
              return false // Continuar
            } else if (jsonData.type === 'content' && jsonData.content) {
              // Acumular el contenido en el ref para efecto de typing
              fullContent += jsonData.content
              assistantContentRef.current = fullContent
              
              return false
            } else if (jsonData.type === 'done') {
              console.log('App - Respuesta completada:', fullContent.substring(0, 100) + '...')
              
              // Solo actualizar el ref con el contenido final, el efecto lo mostrará
              assistantContentRef.current = fullContent
              // NO forzar el displayIndex, dejar que el efecto termine naturalmente
              
              // Sources disponibles pero no se usan
              if (jsonData.sources && jsonData.sources.length > 0) {
                console.log('App - Sources encontrados (no mostrados):', jsonData.sources)
              }
              
              // Guardar el texto para el avatar, se enviará cuando termine el typing
              if (voiceText) {
                console.log('App - Guardando voice_text para enviar después del typing')
                pendingVoiceTextRef.current = cleanTextForAvatar(voiceText)
              } else {
                console.log('App - Guardando contenido limpio para enviar después del typing')
                // El avatar hablará el texto de la respuesta (sin gráficos ni fórmulas)
                pendingVoiceTextRef.current = cleanTextForAvatar(fullContent)
              }
              
              return true
            }
          } catch (e) {
            console.error('Error parseando JSON:', e, line)
          }
        }
        return false
      }

      // Timeout de seguridad (3 minutos)
      const timeout = setTimeout(() => {
        console.warn('App - Timeout del streaming, finalizando...')
        isDone = true
        reader.cancel()
      }, 180000)

      let isDone = false
      let lastChunkTime = Date.now()
      
      try {
        while (!isDone) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('App - Stream terminado por el servidor')
            break
          }

          lastChunkTime = Date.now()
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine) {
              console.log('App - Línea recibida:', trimmedLine.substring(0, 100))
              if (processLine(trimmedLine)) {
                isDone = true
                break
              }
            }
          }
        }
        
        // Procesar buffer restante
        if (buffer.trim()) {
          console.log('App - Procesando buffer final:', buffer.trim().substring(0, 100))
          processLine(buffer.trim())
        }
      } finally {
        clearTimeout(timeout)
      }
      
      // Si nunca recibió "done", marcar como completado de todas formas
      if (!isDone && fullContent) {
        console.warn('App - Stream terminó sin mensaje "done", finalizando manualmente')
        setIsProcessing(false)
      }

    } catch (error) {
      console.error('Error al procesar la pregunta:', error)
      
      const errorMessage = {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.'
      }
      
      setMessages(prev => [...prev, errorMessage])
      setTextToSpeak('Lo siento, hubo un error al procesar tu pregunta.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="app-container">
      <Header />
      <div className="classroom">
        <div className="left-section">
          <Blackboard messages={messages} isProcessing={isProcessing} />
          <TextInput onSubmit={handleSubmit} disabled={isProcessing || !isInitialized} />
        </div>
        
      <div className="right-section">
        <HeyGenAvatar 
          textToSpeak={textToSpeak} 
          onSpeakComplete={() => setTextToSpeak('')}
        />
      </div>
      </div>
    </div>
  )
}

export default App
