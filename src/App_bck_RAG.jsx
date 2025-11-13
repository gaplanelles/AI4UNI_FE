import { useState, useEffect, useRef } from 'react'
import './App.css'
import Header from './components/Header'
import Blackboard from './components/Blackboard'
import TextInput from './components/TextInput'
import HeyGenAvatar from './components/HeyGenAvatar'
import Sources from './components/Sources'

function App() {
  const [messages, setMessages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [textToSpeak, setTextToSpeak] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [sources, setSources] = useState([])
  const targetContentRef = useRef('')
  const displayIndexRef = useRef(0)
  const streamingCompleteRef = useRef(false)
  const intervalRef = useRef(null)
  const initCalledRef = useRef(false)

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
                
                // Capturar sources si existen
                if (jsonData.sources && jsonData.sources.length > 0) {
                  console.log('Sources encontrados:', jsonData.sources)
                  setSources(jsonData.sources)
                }
                
                // Enviar el voice_text al avatar (si existe), sino el contenido completo
                const textForAvatar = voiceText || fullContent
                if (textForAvatar) {
                  console.log('Enviando al avatar:', textForAvatar.substring(0, 100) + '...')
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

        let isDone = false
        while (!isDone) {
          const { done, value } = await reader.read()
          if (done) break

          // Decodificar el chunk
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          
          // Procesar líneas completas
          const lines = buffer.split('\n')
          
          // La última línea puede estar incompleta, la guardamos en el buffer
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            if (processLine(line.trim())) {
              isDone = true
              break
            }
          }
        }
        
        // Procesar cualquier línea restante en el buffer
        if (buffer.trim()) {
          processLine(buffer.trim())
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
      setMessages(prev => [...prev, assistantMessage])

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
              // Acumular el contenido
              fullContent += jsonData.content
              
              // Actualizar el último mensaje (el del asistente)
              setMessages(prev => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: fullContent
                }
                return newMessages
              })
              
              return false
            } else if (jsonData.type === 'done') {
              console.log('App - Respuesta completada:', fullContent.substring(0, 100) + '...')
              
              // Capturar sources si existen
              if (jsonData.sources && jsonData.sources.length > 0) {
                console.log('App - Sources encontrados:', jsonData.sources)
                setSources(jsonData.sources)
              }
              
              // Enviar el voice_text al avatar (si existe), sino fallback a limpiar contenido
              if (voiceText) {
                console.log('App - Enviando voice_text al avatar')
                setTextToSpeak(voiceText)
              } else {
                console.log('App - No hay voice_text, usando contenido limpio')
                // El avatar hablará el texto de la respuesta (sin gráficos ni fórmulas)
                const textOnly = fullContent
                  .replace(/###GRAPH\{.+?\}###END/gs, '')
                  .replace(/\$\$.*?\$\$/gs, '')
                
                setTextToSpeak(textOnly)
              }
              
              return true
            }
          } catch (e) {
            console.error('Error parseando JSON:', e, line)
          }
        }
        return false
      }

      let isDone = false
      while (!isDone) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (processLine(line.trim())) {
            isDone = true
            break
          }
        }
      }
      
      if (buffer.trim()) {
        processLine(buffer.trim())
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
          <div className="right-section-content">
            <HeyGenAvatar 
              textToSpeak={textToSpeak} 
              onSpeakComplete={() => setTextToSpeak('')}
            />
            <Sources sources={sources} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
