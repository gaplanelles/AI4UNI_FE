import { useRef, useState } from 'react'
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar'
import LoadingOverlay from './LoadingOverlay'
import './HeyGenAvatar.css'

const hygenApiKey = import.meta.env.VITE_HEYGEN_API_KEY
const hygenApiUrl = import.meta.env.VITE_HEYGEN_API_URL || 'https://api.heygen.com/v1'
const avatarName = import.meta.env.VITE_HEYGEN_AVATAR_NAME || 'default'

// Texto predefinido de 1000 caracteres
const PREDEFINED_TEXT = `Bienvenidos estudiantes a esta clase sobre inteligencia artificial en la educacion. La inteligencia artificial esta transformando radicalmente como aprendemos y ensenamos. Los sistemas de tutoria personalizados pueden analizar el progreso de cada estudiante y adaptar el contenido en tiempo real para satisfacer necesidades especificas. Los asistentes virtuales proporcionan soporte las veinticuatro horas del dia, respondiendo preguntas y guiando a traves de conceptos complejos. La tecnologia de procesamiento de lenguaje natural permite crear sistemas de retroalimentacion automatica que evaluan ensayos y proporcionan comentarios constructivos de manera instantanea. La realidad virtual crea entornos inmersivos donde los estudiantes pueden explorar conceptos abstractos de forma tangible. Sin embargo, es crucial reconocer que la tecnologia no reemplaza al factor humano. Los profesores aportan empatia, intuicion y creatividad que ninguna maquina puede replicar. La inteligencia artificial debe ser una herramienta que amplifica capacidades humanas, no un sustituto. Gracias por su atencion.`

const SimpleHeyGenAvatar = () => {
  const videoRef = useRef(null)
  const avatarRef = useRef(null)
  const sessionStartTimeRef = useRef(null)
  const keepAliveIntervalRef = useRef(null)
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentChunk, setCurrentChunk] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [sessionDuration, setSessionDuration] = useState(0)

  const fetchAccessToken = async () => {
    try {
      const response = await fetch(`${hygenApiUrl}/streaming.create_token`, {
        method: 'POST',
        headers: {
          'x-api-key': hygenApiKey || '',
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      })
      const { data } = await response.json()
      return data.token
    } catch (e) {
      console.error('Error fetching access token:', e)
      setIsLoadingAvatar(false)
      return ''
    }
  }

  const handleStreamReady = (event) => {
    if (event.detail && videoRef.current) {
      console.log('Stream listo, configurando video...')
      videoRef.current.srcObject = event.detail
      videoRef.current.autoplay = true
      videoRef.current.playsInline = true
      
      videoRef.current.onloadedmetadata = async () => {
        try {
          videoRef.current.muted = false
          await videoRef.current?.play()
          setAudioEnabled(true)
          console.log('Audio activado automáticamente!')
        } catch (error) {
          console.warn('No se pudo activar audio automáticamente:', error)
          videoRef.current.muted = true
          try {
            await videoRef.current?.play()
          } catch (e) {
            console.error('Error al reproducir video:', e)
          }
        }
      }
    }
  }

  const handleStreamDisconnected = () => {
    const sessionDuration = sessionStartTimeRef.current 
      ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000) 
      : 0
    
    console.error('🔴 STREAM DISCONNECTED!')
    console.error(`⏱️ Duración de la sesión antes de desconectar: ${sessionDuration} segundos (${Math.round(sessionDuration / 60)} minutos)`)
    console.error('Stack trace:', new Error().stack)
    
    alert(`⚠️ Avatar desconectado después de ${sessionDuration} segundos (${Math.round(sessionDuration / 60)} minutos)`)
    
    // Limpiar keepAlive interval
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current)
      keepAliveIntervalRef.current = null
      console.log('💓 Sistema de keepAlive detenido')
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsSessionActive(false)
    setIsSpeaking(false)
    sessionStartTimeRef.current = null
  }

  const handleStartAvatar = async () => {
    if (isSessionActive) {
      console.log('Avatar ya está activo')
      return
    }

    try {
      setIsLoadingAvatar(true)
      
      // Detener avatar anterior si existe
      if (avatarRef.current) {
        try {
          await avatarRef.current.stopAvatar()
        } catch (e) {
          console.warn('Error stopping previous avatar:', e)
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
        avatarRef.current = null
      }
      
      // Limpiar keepAlive anterior si existe
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current)
        keepAliveIntervalRef.current = null
      }

      const token = await fetchAccessToken()
      if (!token) {
        console.error('HeyGen access token missing')
        setIsLoadingAvatar(false)
        alert('Error: No se pudo obtener el token de acceso. Verifica la configuración de la API.')
        return
      }

      const newAvatar = new StreamingAvatar({ token })
      avatarRef.current = newAvatar

      // Listeners con logging extensivo
      newAvatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log('📡 STREAM_READY event:', event)
        handleStreamReady(event)
      })
      
      newAvatar.on(StreamingEvents.STREAM_DISCONNECTED, (event) => {
        console.error('📡 STREAM_DISCONNECTED event recibido:', event)
        handleStreamDisconnected(event)
      })
      
      newAvatar.on(StreamingEvents.AVATAR_START_TALKING, (event) => {
        const elapsed = sessionStartTimeRef.current 
          ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
          : 0
        console.log(`🗣️ AVATAR_START_TALKING (${elapsed}s desde inicio)`, event)
        setIsSpeaking(true)
      })
      
      newAvatar.on(StreamingEvents.AVATAR_STOP_TALKING, (event) => {
        const elapsed = sessionStartTimeRef.current 
          ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
          : 0
        console.log(`🤐 AVATAR_STOP_TALKING (${elapsed}s desde inicio)`, event)
        setIsSpeaking(false)
      })
      
      newAvatar.on('error', (error) => {
        const elapsed = sessionStartTimeRef.current 
          ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
          : 0
        console.error(`❌ ERROR event (${elapsed}s desde inicio):`, error)
      })
      
      // Escuchar TODOS los eventos posibles
      const allEvents = Object.values(StreamingEvents)
      allEvents.forEach(eventName => {
        if (!['STREAM_READY', 'STREAM_DISCONNECTED', 'AVATAR_START_TALKING', 'AVATAR_STOP_TALKING'].includes(eventName)) {
          newAvatar.on(eventName, (event) => {
            const elapsed = sessionStartTimeRef.current 
              ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
              : 0
            console.log(`📡 Event "${eventName}" (${elapsed}s):`, event)
          })
        }
      })

      const data = await newAvatar.createStartAvatar({
        quality: AvatarQuality.High,
        voice: {
          rate: 0.9,
          emotion: VoiceEmotion.FRIENDLY,
        },
        avatarName: avatarName,
        // activityIdleTimeout: tiempo en segundos antes de que la sesión expire por inactividad
        // El valor por defecto es 120 (2 min), pero vamos a poner 600 (10 min)
        activityIdleTimeout: 600,
        // disableIdleTimeout está deprecado, usar activityIdleTimeout en su lugar
      })

      console.log('✅ Avatar creado exitosamente:', data)
      console.log('🔍 Datos de la sesión:', {
        sessionId: data?.session_id,
        duration: data?.duration_limit,
        ice_servers: data?.ice_servers2?.length || 0
      })
      
      sessionStartTimeRef.current = Date.now()
      console.log(`⏱️ Sesión iniciada a las ${new Date().toLocaleTimeString()}`)
      
      // Iniciar keepAlive automático cada 20 segundos para mantener la sesión activa
      keepAliveIntervalRef.current = setInterval(async () => {
        if (avatarRef.current && newAvatar) {
          try {
            await newAvatar.keepAlive()
            const elapsed = Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
            console.log(`💓 KeepAlive enviado (${elapsed}s desde inicio) - Sesión extendida por 600s más`)
          } catch (error) {
            console.error('❌ Error en keepAlive:', error)
          }
        }
      }, 20000) // Cada 20 segundos
      
      console.log('💓 Sistema de keepAlive iniciado (cada 20 segundos)')
      
      setIsSessionActive(true)
      setIsLoadingAvatar(false)
      alert('¡Avatar iniciado correctamente!')
    } catch (error) {
      console.error('Error initializing avatar session:', error)
      setIsLoadingAvatar(false)
      alert('Error al iniciar el avatar: ' + error.message)
    }
  }

  // Función para limpiar y sanitizar el texto
  const sanitizeText = (text) => {
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Eliminar caracteres de control
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim()
  }

  // Función para dividir texto en chunks MUY pequeños de tamaño seguro
  const splitTextIntoChunks = (text, maxChunkSize = 200) => {
    const sanitized = sanitizeText(text)
    console.log('📝 Texto original:', text.length, 'caracteres')
    console.log('📝 Texto sanitizado:', sanitized.length, 'caracteres')
    
    const sentences = sanitized.match(/[^.!?]+[.!?]+/g) || [sanitized]
    const chunks = []
    let currentChunk = ''

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence
      } else {
        if (currentChunk) {
          const cleaned = sanitizeText(currentChunk)
          console.log(`✂️ Chunk creado: ${cleaned.length} caracteres - "${cleaned.substring(0, 50)}..."`)
          chunks.push(cleaned)
        }
        currentChunk = sentence
      }
    }
    
    if (currentChunk) {
      const cleaned = sanitizeText(currentChunk)
      console.log(`✂️ Último chunk: ${cleaned.length} caracteres - "${cleaned.substring(0, 50)}..."`)
      chunks.push(cleaned)
    }
    
    return chunks
  }

  const handleSpeakPredefinedText = async () => {
    if (!avatarRef.current || !isSessionActive) {
      alert('Primero debes iniciar el avatar')
      return
    }

    if (isSpeaking) {
      alert('El avatar ya está hablando')
      return
    }

    try {
      console.log('Iniciando reproducción de texto predefinido...')
      console.log('Longitud del texto:', PREDEFINED_TEXT.length, 'caracteres')
      
      // Activar audio si no está activado
      if (!audioEnabled && videoRef.current) {
        try {
          videoRef.current.muted = false
          await videoRef.current.play()
          setAudioEnabled(true)
        } catch (err) {
          console.error('Error activando audio:', err)
        }
      }

      setIsSpeaking(true)
      
      // Dividir texto en chunks MUY pequeños (200 caracteres) para evitar límites
      const chunks = splitTextIntoChunks(PREDEFINED_TEXT, 200)
      console.log(`📦 Texto dividido en ${chunks.length} fragmentos de ~200 caracteres`)
      setTotalChunks(chunks.length)
      
      // Enviar cada chunk secuencialmente
      for (let i = 0; i < chunks.length; i++) {
        setCurrentChunk(i + 1)
        const chunkText = chunks[i]
        
        console.log(`\n${'='.repeat(60)}`)
        console.log(`📤 [${i + 1}/${chunks.length}] Preparando envío`)
        console.log(`📏 Longitud: ${chunkText.length} caracteres`)
        console.log(`📝 Texto completo: "${chunkText}"`)
        console.log(`🔤 Primeros 20 chars: "${chunkText.substring(0, 20)}"`)
        console.log(`🔤 Últimos 20 chars: "${chunkText.substring(chunkText.length - 20)}"`)
        console.log(`${'='.repeat(60)}\n`)
        
        try {
          const startTime = Date.now()
          const result = await avatarRef.current.speak({
            text: chunkText,
            task_type: TaskType.REPEAT,
            taskMode: TaskMode.ASYNC,
          })
          const duration = Date.now() - startTime
          console.log(`✅ [${i + 1}/${chunks.length}] Fragmento enviado exitosamente en ${duration}ms`)
          console.log(`📊 Resultado:`, result)
          
          // Esperar 2 segundos entre chunks para dar tiempo al avatar
          if (i < chunks.length - 1) {
            console.log(`⏳ [${i + 1}/${chunks.length}] Esperando 2 segundos antes del siguiente fragmento...`)
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        } catch (chunkError) {
          console.error(`\n${'!'.repeat(60)}`)
          console.error(`❌ [${i + 1}/${chunks.length}] ERROR AL ENVIAR FRAGMENTO`)
          console.error(`📝 Texto que causó el error: "${chunkText}"`)
          console.error(`📏 Longitud: ${chunkText.length} caracteres`)
          console.error(`🔍 Detalles del error:`, {
            name: chunkError?.name,
            message: chunkError?.message,
            stack: chunkError?.stack
          })
          console.error(`${'!'.repeat(60)}\n`)
          throw chunkError
        }
      }
      
      console.log('✅ Todos los fragmentos enviados exitosamente')
      alert(`El avatar hablará el texto completo dividido en ${chunks.length} fragmentos`)
      setCurrentChunk(0)
      setTotalChunks(0)
    } catch (error) {
      console.error('Error al hacer hablar al avatar:', error)
      setIsSpeaking(false)
      alert('Error al reproducir el texto: ' + error.message)
    }
  }

  return (
    <LoadingOverlay isLoading={isLoadingAvatar}>
      <div className="heygen-avatar-container">
        <video
          ref={videoRef}
          className="avatar-video"
          autoPlay
          playsInline
          muted={!audioEnabled}
        />
        
        {!isSessionActive && !isLoadingAvatar && (
          <div className="avatar-placeholder">
            <div className="avatar-icon">🎓</div>
            <p>Profesor Virtual</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              Haz clic en "Iniciar Avatar" para comenzar
            </p>
          </div>
        )}
        
        {isSpeaking && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 255, 0, 0.7)',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '0.9em',
            color: 'white',
            fontWeight: 'bold'
          }}>
            🎤 Hablando... {totalChunks > 0 && `(${currentChunk}/${totalChunks})`}
          </div>
        )}
        
        <div className="avatar-controls" style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'center',
          padding: '15px'
        }}>
          <button 
            className="avatar-btn" 
            onClick={handleStartAvatar}
            disabled={isSessionActive || isLoadingAvatar}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: isSessionActive ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isSessionActive ? 'not-allowed' : 'pointer',
              opacity: isSessionActive ? 0.6 : 1
            }}
          >
            {isSessionActive ? '✓ Avatar Iniciado' : '▶️ Iniciar Avatar'}
          </button>
          
          <button 
            className="avatar-btn" 
            onClick={handleSpeakPredefinedText}
            disabled={!isSessionActive || isSpeaking}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: !isSessionActive || isSpeaking ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: !isSessionActive || isSpeaking ? 'not-allowed' : 'pointer',
              opacity: !isSessionActive || isSpeaking ? 0.6 : 1
            }}
          >
            {isSpeaking ? '🎤 Hablando...' : '🗣️ Hablar Texto (1000 caracteres)'}
          </button>
          
          <button 
            className="avatar-btn" 
            onClick={async () => {
              if (!avatarRef.current || !isSessionActive) {
                alert('Primero debes iniciar el avatar')
                return
              }
              setIsSpeaking(true)
              try {
                const testText = "Hola estudiantes. Este es un test corto de solo cincuenta caracteres."
                console.log('🧪 TEST: Enviando texto corto:', testText)
                await avatarRef.current.speak({
                  text: testText,
                  task_type: TaskType.REPEAT,
                  taskMode: TaskMode.ASYNC,
                })
                console.log('✅ TEST: Texto corto enviado exitosamente')
              } catch (error) {
                console.error('❌ TEST: Error:', error)
                setIsSpeaking(false)
              }
            }}
            disabled={!isSessionActive || isSpeaking}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: !isSessionActive || isSpeaking ? '#6c757d' : '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: !isSessionActive || isSpeaking ? 'not-allowed' : 'pointer',
              opacity: !isSessionActive || isSpeaking ? 0.6 : 1
            }}
          >
            🧪 Test Corto
          </button>
          
          <button 
            className="avatar-btn" 
            onClick={async () => {
              if (!avatarRef.current || !isSessionActive) {
                alert('Primero debes iniciar el avatar')
                return
              }
              try {
                await avatarRef.current.keepAlive()
                const elapsed = sessionStartTimeRef.current 
                  ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
                  : 0
                console.log(`💓 KeepAlive MANUAL enviado (${elapsed}s desde inicio)`)
                alert(`💓 KeepAlive enviado! Sesión extendida 600s más. (${elapsed}s desde inicio)`)
              } catch (error) {
                console.error('❌ Error en keepAlive manual:', error)
                alert('Error al enviar keepAlive: ' + error.message)
              }
            }}
            disabled={!isSessionActive}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: !isSessionActive ? '#6c757d' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: !isSessionActive ? 'not-allowed' : 'pointer',
              opacity: !isSessionActive ? 0.6 : 1
            }}
          >
            💓 KeepAlive
          </button>
        </div>
      </div>
    </LoadingOverlay>
  )
}

export default SimpleHeyGenAvatar

