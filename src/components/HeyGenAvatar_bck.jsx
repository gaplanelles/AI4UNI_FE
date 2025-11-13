import { useEffect, useRef, useState } from 'react'
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar'
import LoadingOverlay from './LoadingOverlay'
import { useVideo } from '../context/VideoContext'
import './HeyGenAvatar.css'

const hygenApiKey = import.meta.env.VITE_HEYGEN_API_KEY
const hygenApiUrl = import.meta.env.VITE_HEYGEN_API_URL || 'https://api.heygen.com/v1'
const avatarName = import.meta.env.VITE_HEYGEN_AVATAR_NAME || 'default'

const HeyGenAvatar = ({ textToSpeak, onSpeakComplete, onAvatarReady }) => {
  const videoRef = useRef(null)
  const lastSpokenTextRef = useRef('')
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [showStartOverlay, setShowStartOverlay] = useState(false)
  const { avatar, setAvatar, setIsVideoActive } = useVideo()

  useEffect(() => {
    // Inicializar avatar al montar el componente
    initializeAvatarSession()

    return () => {
      // Limpiar al desmontar
      if (avatar) {
        avatar.stopAvatar().catch(console.error)
        setAvatar(null)
        setIsSessionActive(false)
        setIsVideoActive(false)
      }
    }
  }, [])

  useEffect(() => {
    if (avatar) {
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('HeyGenAvatar - Avatar empezó a hablar')
        setIsVideoActive(true)
      })
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('HeyGenAvatar - Avatar dejó de hablar')
        setIsVideoActive(false)
        lastSpokenTextRef.current = '' // Limpiar el ref para permitir nuevo texto
        if (onSpeakComplete) onSpeakComplete()
      })
    }
  }, [avatar, onSpeakComplete])

  // Notificar cuando el estado de la sesión cambie
  useEffect(() => {
    console.log('HeyGenAvatar - isSessionActive cambió a:', isSessionActive)
    if (onAvatarReady) {
      console.log('HeyGenAvatar - Notificando a padre que avatar ready =', isSessionActive)
      onAvatarReady(isSessionActive)
    }
  }, [isSessionActive, onAvatarReady])

  // Activar audio automáticamente cuando la sesión esté activa
  useEffect(() => {
    const autoEnableAudio = async () => {
      if (isSessionActive && !audioEnabled && videoRef.current) {
        console.log('HeyGenAvatar - Intentando activar audio automáticamente...')
        try {
          videoRef.current.muted = false
          await videoRef.current.play()
          setAudioEnabled(true)
          console.log('HeyGenAvatar - Audio activado automáticamente!')
        } catch (e) {
          console.warn('HeyGenAvatar - No se pudo activar audio automáticamente:', e)
          console.log('HeyGenAvatar - El navegador bloqueó el audio. Se activará con el primer click.')
        }
      }
    }

    // Pequeño delay para asegurar que el video esté listo
    if (isSessionActive && !audioEnabled) {
      setTimeout(autoEnableAudio, 500)
    }
  }, [isSessionActive, audioEnabled])

  // Activar audio con cualquier click del usuario (fallback para políticas del navegador)
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (isSessionActive && !audioEnabled && videoRef.current) {
        console.log('HeyGenAvatar - Activando audio con interacción del usuario...')
        try {
          videoRef.current.muted = false
          await videoRef.current.play()
          setAudioEnabled(true)
          console.log('HeyGenAvatar - Audio activado exitosamente con click!')
          // Remover el listener después de activar
          document.removeEventListener('click', handleUserInteraction)
        } catch (e) {
          console.error('HeyGenAvatar - Error activando audio con click:', e)
        }
      }
    }

    if (isSessionActive && !audioEnabled) {
      document.addEventListener('click', handleUserInteraction)
      return () => {
        document.removeEventListener('click', handleUserInteraction)
      }
    }
  }, [isSessionActive, audioEnabled])

  // Cuando recibe texto nuevo, hacer que el avatar hable
  useEffect(() => {
    // Evitar procesar el mismo texto dos veces
    if (!textToSpeak || lastSpokenTextRef.current === textToSpeak) {
      return
    }

    console.log('HeyGenAvatar - textToSpeak changed:', {
      hasText: !!textToSpeak,
      textLength: textToSpeak?.length,
      hasAvatar: !!avatar,
      isSessionActive,
      audioEnabled
    })
    
    const handleSpeak = async () => {
      if (!avatar || !isSessionActive) {
        if (!isSessionActive) {
          console.warn('HeyGenAvatar - Texto recibido pero sesión no está activa')
        } else if (!avatar) {
          console.warn('HeyGenAvatar - Texto recibido pero avatar no está inicializado')
        }
        return
      }

      // Marcar como procesado
      lastSpokenTextRef.current = textToSpeak

      // Si el audio aún no está activado, intentar activarlo (fallback)
      if (!audioEnabled && videoRef.current) {
        console.log('HeyGenAvatar - Audio no activado, intentando activar como fallback...')
        try {
          videoRef.current.muted = false
          await videoRef.current.play()
          setAudioEnabled(true)
          console.log('HeyGenAvatar - Audio activado exitosamente')
        } catch (err) {
          console.error('HeyGenAvatar - Error activando audio:', err)
          console.log('HeyGenAvatar - Puede requerir que el usuario haga click en el botón 🔊')
        }
      }
      
      console.log('HeyGenAvatar - Llamando a speakText con:', textToSpeak.substring(0, 100))
      await speakText(textToSpeak)
    }
    
    handleSpeak()
  }, [textToSpeak, avatar, isSessionActive, audioEnabled])

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

  const initializeAvatarSession = async () => {
    try {
      setIsLoadingAvatar(true)
      
      // Detener avatar anterior si existe
      if (avatar) {
        try {
          await avatar.stopAvatar()
        } catch (e) {
          console.warn('Error stopping previous avatar:', e)
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
        setAvatar(null)
      }

      const token = await fetchAccessToken()
      if (!token) {
        console.error('HeyGen access token missing')
        setIsLoadingAvatar(false)
        return
      }

      const newAvatar = new StreamingAvatar({ token })
      setAvatar(newAvatar)

      // Listeners
      newAvatar.on(StreamingEvents.STREAM_READY, handleStreamReady)
      newAvatar.on(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected)
      
      // Listener para errores generales
      newAvatar.on('error', (error) => {
        console.error('HeyGenAvatar - Error event:', error)
      })

      const data = await newAvatar.createStartAvatar({
        quality: AvatarQuality.High,
        voice: {
          rate: 0.9,
          emotion: VoiceEmotion.FRIENDLY,
        },
        avatarName: avatarName,
        disableIdleTimeout: true,
      })

      console.log('HeyGenAvatar - Avatar creado exitosamente, data:', data)
      setIsSessionActive(true)
      console.log('HeyGenAvatar - setIsSessionActive(true) ejecutado')
      setIsLoadingAvatar(false)
    } catch (error) {
      console.error('Error initializing avatar session:', error)
      setIsLoadingAvatar(false)
    }
  }

  const handleStreamReady = (event) => {
    if (event.detail && videoRef.current) {
      console.log('HeyGenAvatar - Stream listo, configurando video...')
      videoRef.current.srcObject = event.detail
      videoRef.current.autoplay = true
      videoRef.current.playsInline = true
      
      // Intentar iniciar con audio activado
      videoRef.current.muted = false
      
      videoRef.current.onloadedmetadata = async () => {
        try {
          console.log('HeyGenAvatar - Intentando reproducir con audio...')
          await videoRef.current?.play()
          setAudioEnabled(true)
          console.log('HeyGenAvatar - Audio activado automáticamente al crear el avatar!')
        } catch (error) {
          console.warn('HeyGenAvatar - No se pudo activar audio automáticamente, requerirá interacción del usuario:', error)
          // Si falla, intentar con muted
          videoRef.current.muted = true
          try {
            await videoRef.current?.play()
          } catch (e) {
            console.error('HeyGenAvatar - Error al reproducir video:', e)
          }
        }
      }
    }
  }

  const handleStreamDisconnected = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsSessionActive(false)
  }

  const handleStartAvatar = async () => {
    if (isSessionActive) return
    await initializeAvatarSession()
  }

  const handleInterruptSpeaking = async () => {
    if (!avatar) return
    try {
      await avatar.interrupt()
    } catch (e) {
      console.error('Error interrupting speech:', e)
    }
  }

  const handleStopAvatar = async () => {
    if (!avatar) return
    try {
      await avatar.stopAvatar()
    } catch (e) {
      console.error('Error stopping avatar:', e)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsSessionActive(false)
    setAvatar(null)
    setIsVideoActive(false)
  }

  const speakText = async (text) => {
    console.log('HeyGenAvatar - speakText llamado con:', {
      hasAvatar: !!avatar,
      hasText: !!text,
      textLength: text?.length,
      textPreview: text?.substring(0, 100)
    })
    
    if (!avatar || !text) {
      console.warn('HeyGenAvatar - speakText abortado: avatar o text faltante')
      return
    }
    
    // Si el texto es muy corto o vacío después de limpiar, no intentar hablar
    const trimmedText = text.trim()
    if (trimmedText.length < 3) {
      console.warn('HeyGenAvatar - Texto demasiado corto, omitiendo:', trimmedText)
      return
    }
    
    try {
      console.log('HeyGenAvatar - Llamando a avatar.speak()...')
      console.log('HeyGenAvatar - Texto a enviar (longitud:', trimmedText.length, '):', trimmedText.substring(0, 200))
      
      // Usar ASYNC para mejor estabilidad con textos largos
      const result = await avatar.speak({
        text: trimmedText,
        task_type: TaskType.REPEAT,
        taskMode: TaskMode.ASYNC,
      })
      console.log('HeyGenAvatar - avatar.speak() iniciado exitosamente:', result)
    } catch (error) {
      console.error('HeyGenAvatar - Error en avatar.speak():', error)
      console.error('HeyGenAvatar - Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        type: error?.constructor?.name
      })
      
      // Si el error es por DataChannel, intentar reconectar
      if (error?.message?.includes('DataChannel') || error?.message?.includes('Operation') || error?.name === 'OperationError') {
        console.error('HeyGenAvatar - Error de conexión WebRTC detectado')
        console.error('HeyGenAvatar - Esto puede indicar que el texto contiene caracteres problemáticos')
        console.error('HeyGenAvatar - O que la sesión necesita reiniciarse')
      }
    }
  }

  const enableAudio = async () => {
    if (!videoRef.current) return
    try {
      videoRef.current.muted = false
      await videoRef.current.play()
      setAudioEnabled(true)
    } catch (e) {
      console.error('Error enabling audio:', e)
    }
  }

  const handleStartSession = async () => {
    console.log('HeyGenAvatar - Usuario hizo clic para iniciar sesión')
    setShowStartOverlay(false)
    
    // Activar audio con la interacción del usuario
    if (videoRef.current && !audioEnabled) {
      try {
        videoRef.current.muted = false
        await videoRef.current.play()
        setAudioEnabled(true)
        console.log('HeyGenAvatar - Audio activado con la interacción del usuario!')
      } catch (e) {
        console.error('HeyGenAvatar - Error activando audio:', e)
      }
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
        
        {/* Overlay inicial para activar audio con interacción del usuario */}
        {showStartOverlay && isSessionActive && (
          <div className="start-overlay" onClick={handleStartSession}>
            <div className="start-overlay-content">
              <div className="start-icon">🎓</div>
              <h2>Profesor Virtual Listo</h2>
              <p>Haz clic para activar el audio y comenzar</p>
              <button className="start-button">▶️ Comenzar</button>
            </div>
          </div>
        )}
        
        <div className="avatar-controls">
          <button className="avatar-btn" title="Iniciar" onClick={handleStartAvatar}>▶️</button>
          <button className="avatar-btn" title="Interrumpir habla" onClick={handleInterruptSpeaking}>⏸️</button>
          <button className="avatar-btn" title="Detener" onClick={handleStopAvatar}>⏹️</button>
        </div>
        {!isSessionActive && !isLoadingAvatar && (
          <div className="avatar-placeholder">
            <div className="avatar-icon">🎓</div>
            <p>Profesor Virtual</p>
          </div>
        )}
      </div>
    </LoadingOverlay>
  )
}

export default HeyGenAvatar

