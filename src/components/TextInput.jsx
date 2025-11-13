import { useState, useRef, useEffect } from 'react'
import './TextInput.css'

const TextInput = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Inicializar el reconocimiento de voz si está disponible
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'es-ES' // Español

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // Actualizar el texto con el resultado final o intermedio
        if (finalTranscript) {
          setText(prev => prev + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz. Por favor, usa Chrome o Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim() && !disabled) {
      onSubmit(text)
      setText('')
      if (isListening) {
        recognitionRef.current.stop()
        setIsListening(false)
      }
    }
  }

  return (
    <div className="text-input-container">
      <form onSubmit={handleSubmit}>
        <div className="textarea-wrapper">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu pregunta aquí..."
            disabled={disabled}
            rows={4}
          />
          <button
            type="button"
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            disabled={disabled}
            title={isListening ? 'Detener grabación' : 'Comenzar grabación'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
              height="24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
        </div>
        <button type="submit" disabled={disabled || !text.trim()}>
          Enviar
        </button>
      </form>
    </div>
  )
}

export default TextInput

