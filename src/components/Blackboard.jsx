import { useEffect, useRef, useState } from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import MathGraph from './MathGraph'
import DataChart from './DataChart'
import PhysicsDrawing from './PhysicsDrawing'
import './Blackboard.css'

const Blackboard = ({ messages = [], isProcessing }) => {
  const blackboardRef = useRef(null)
  const [imageStates, setImageStates] = useState({}) // { messageIndex: { status: 'idle'|'loading'|'success', imageData: null } }
  const [selectedImage, setSelectedImage] = useState(null) // Para el popup

  // Auto-scroll mientras se actualiza el contenido
  useEffect(() => {
    if (blackboardRef.current) {
      blackboardRef.current.scrollTop = blackboardRef.current.scrollHeight
    }
  }, [messages])

  // Debug: ver cuando cambia selectedImage
  useEffect(() => {
    console.log('selectedImage cambió:', selectedImage ? 'Hay imagen' : 'null')
    if (selectedImage) {
      console.log('Primeros 100 chars de selectedImage:', selectedImage.substring(0, 100))
    }
  }, [selectedImage])

  // Función para generar imagen a partir de la conversación
  const generateImage = async (messageIndex) => {
    // Actualizar estado a loading
    setImageStates(prev => ({
      ...prev,
      [messageIndex]: { status: 'loading', imageData: null }
    }))

    try {
      // Construir la conversación hasta este mensaje
      const conversation = messages.slice(0, messageIndex + 1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content || ''
      }))

      console.log('Generando imagen para conversación:', conversation)

      const response = await fetch('https://81.208.173.145:9001/images/generate?format=base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversation,
          size: '1024x1024',
          model: 'gpt-image-1'
        })
      })

      if (!response.ok) {
        throw new Error('Error al generar la imagen')
      }

      const data = await response.json()
      console.log('Respuesta completa del servidor:', data)
      console.log('Tipo de data:', typeof data)
      
      // Extraer la imagen de la respuesta (puede estar en diferentes formatos)
      let imageData = null
      
      if (typeof data === 'string') {
        // Si la respuesta es directamente el string base64
        console.log('Formato: string directo')
        imageData = data
      } else if (Array.isArray(data)) {
        // Si es un array (formato OpenAI: [{ b64_json: "..." }])
        console.log('Formato: array')
        if (data.length > 0 && data[0].b64_json) {
          imageData = data[0].b64_json
        } else if (data.length > 0 && data[0].url) {
          imageData = data[0].url
        }
      } else if (typeof data === 'object') {
        console.log('Formato: objeto')
        console.log('Keys de data:', Object.keys(data))
        
        // Probar diferentes propiedades comunes
        if (data.image_base64) {
          imageData = data.image_base64
        } else if (data.image) {
          imageData = data.image
        } else if (data.data) {
          // data.data puede ser un array o un string
          if (Array.isArray(data.data) && data.data.length > 0) {
            if (data.data[0].b64_json) {
              imageData = data.data[0].b64_json
            } else if (data.data[0].url) {
              imageData = data.data[0].url
            }
          } else if (typeof data.data === 'string') {
            imageData = data.data
          }
        } else if (data.b64_json) {
          imageData = data.b64_json
        } else if (data.url) {
          imageData = data.url
        }
      }
      
      console.log('ImageData extraída?:', imageData ? 'SÍ' : 'NO')
      if (imageData) {
        console.log('Longitud de imageData:', imageData.length)
        console.log('Primeros 100 chars:', imageData.substring(0, 100))
        console.log('Últimos 50 chars:', imageData.substring(imageData.length - 50))
        // Verificar si ya tiene el prefijo data:image
        console.log('Tiene prefijo data:image?', imageData.startsWith('data:image'))
      }

      if (!imageData) {
        console.error('No se pudo extraer imagen. Data completa:', JSON.stringify(data, null, 2))
        throw new Error('No se encontró imagen en la respuesta del servidor')
      }
      
      // Limpiar el imageData si ya tiene el prefijo data:image
      if (imageData.startsWith('data:image')) {
        console.log('Eliminando prefijo existente data:image')
        // Extraer solo la parte base64
        const base64Match = imageData.match(/base64,(.+)/)
        if (base64Match) {
          imageData = base64Match[1]
          console.log('Base64 limpio extraído, longitud:', imageData.length)
        }
      }

      // Actualizar estado a success con la imagen
      setImageStates(prev => ({
        ...prev,
        [messageIndex]: { status: 'success', imageData: imageData }
      }))
      
      console.log('Estado actualizado a success para mensaje', messageIndex)

    } catch (error) {
      console.error('Error al generar imagen:', error)
      // Volver al estado idle en caso de error
      setImageStates(prev => ({
        ...prev,
        [messageIndex]: { status: 'idle', imageData: null }
      }))
      alert('Error al generar la imagen. Por favor, intenta de nuevo.')
    }
  }

  // Función para mostrar la imagen en popup
  const showImagePopup = (messageIndex) => {
    console.log('showImagePopup llamado para mensaje:', messageIndex)
    console.log('imageStates actual:', imageStates)
    const state = imageStates[messageIndex]
    console.log('Estado del mensaje:', state)
    if (state && state.imageData) {
      console.log('Mostrando imagen en popup')
      setSelectedImage(state.imageData)
    } else {
      console.log('No hay imagen para mostrar')
    }
  }

  // Función para procesar formato manual (negritas y headings)
  const processManualFormatting = (text) => {
    const lines = text.split('\n')
    const processedLines = []
    let key = 0

    for (let line of lines) {
      // Procesar headings (### al inicio de línea, pero no ###GRAPH)
      if (line.trim().startsWith('###') && !line.trim().startsWith('###GRAPH')) {
        const headingText = line.trim().substring(3).trim()
        
        // Procesar negritas dentro del heading
        const headingParts = []
        let lastIndex = 0
        const boldRegex = /\*\*(.+?)\*\*/g
        let match

        while ((match = boldRegex.exec(headingText)) !== null) {
          // Texto antes de la negrita
          if (match.index > lastIndex) {
            headingParts.push(headingText.substring(lastIndex, match.index))
          }
          // Texto en negrita
          headingParts.push(
            <strong key={`h3-bold-${key++}`} style={{ fontWeight: 'bold' }}>
              {match[1]}
            </strong>
          )
          lastIndex = match.index + match[0].length
        }

        // Texto restante
        if (lastIndex < headingText.length) {
          headingParts.push(headingText.substring(lastIndex))
        }

        processedLines.push(
          <h3 key={`h3-${key++}`} style={{ 
            fontSize: '1.3em', 
            fontWeight: 'bold', 
            marginTop: '0.8em', 
            marginBottom: '0.5em',
            color: '#667eea',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}>
            {headingParts.length > 0 ? headingParts : headingText}
          </h3>
        )
      } else {
        // Procesar negritas (**texto**)
        const parts = []
        let lastIndex = 0
        const boldRegex = /\*\*(.+?)\*\*/g
        let match

        while ((match = boldRegex.exec(line)) !== null) {
          // Texto antes de la negrita
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index))
          }
          // Texto en negrita
          parts.push(
            <strong key={`bold-${key++}`} style={{ fontWeight: 'bold', color: '#1a1a1a' }}>
              {match[1]}
            </strong>
          )
          lastIndex = match.index + match[0].length
        }

        // Texto restante
        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex))
        }

        if (parts.length > 0) {
          processedLines.push(
            <span key={`line-${key++}`}>
              {parts}
              <br />
            </span>
          )
        } else if (line.length > 0) {
          processedLines.push(
            <span key={`line-${key++}`}>
              {line}
              <br />
            </span>
          )
        } else {
          processedLines.push(<br key={`br-${key++}`} />)
        }
      }
    }

    return processedLines
  }

  const renderContent = (text) => {
    if (!text) return null

    // Separar el contenido en partes: texto normal, fórmulas y gráficos
    const parts = []
    let currentText = text
    let key = 0

    // Regex para detectar gráficos en múltiples formatos:
    // Formato 1: ###GRAPH{...}###END (inline)
    // Formato 2: ###GRAPH\n```json\n{...}\n```\n###END (con ```json)
    // Formato 3: ###GRAPH\n{...}\nEND (sin ###END, solo END)
    // Formato 4: ###GRAPH\n{...}\n###END (con saltos de línea)
    const graphRegex = /###GRAPH(?:\{(.+?)\}|(?:\s*```json\s*\n([\s\S]+?)\n\s*```\s*)|(?:\s*\n([\s\S]+?)\n\s*))(?:###END|END)/gs
    // Regex para detectar fórmulas de bloque $$ ... $$ o \[ ... \]
    const blockMathRegex = /\$\$(.*?)\$\$|\\\[(.*?)\\\]/gs
    // Regex para detectar fórmulas inline $ ... $ o \( ... \)
    const inlineMathRegex = /\$(.*?)\$|\\\((.*?)\\\)/g

    // Primera pasada: extraer gráficos
    let lastIndex = 0
    let match

    while ((match = graphRegex.exec(currentText)) !== null) {
      // Añadir texto antes del gráfico
      if (match.index > lastIndex) {
        const textBefore = currentText.substring(lastIndex, match.index)
        parts.push({ type: 'text-with-math', content: textBefore, key: key++ })
      }

      // Añadir gráfico
      try {
        let jsonString
        if (match[1]) {
          // Formato 1: ###GRAPH{...}###END (inline)
          jsonString = `{${match[1]}}`
        } else if (match[2]) {
          // Formato 2: ###GRAPH\n```json\n{...}\n```\n###END (con ```json)
          jsonString = match[2].trim()
        } else if (match[3]) {
          // Formato 3 y 4: ###GRAPH\n{...}\nEND o ###GRAPH\n{...}\n###END
          jsonString = match[3].trim()
        }
        
        console.log('📊 Gráfico detectado:', jsonString)
        const graphData = JSON.parse(jsonString)
        console.log('✅ Gráfico parseado:', graphData)
        parts.push({ type: 'graph', content: graphData, key: key++ })
      } catch (e) {
        console.error('❌ Error parseando gráfico:', e)
        console.error('📝 Contenido del match:', match[0])
        parts.push({ type: 'text-with-math', content: `Error en gráfico: ${e.message}`, key: key++ })
      }
      lastIndex = match.index + match[0].length
    }

    // Añadir el texto restante
    if (lastIndex < currentText.length) {
      parts.push({ type: 'text-with-math', content: currentText.substring(lastIndex), key: key++ })
    }

    // Segunda pasada: extraer fórmulas de bloque del texto restante
    const partsWithMath = []
    parts.forEach(part => {
      if (part.type === 'text-with-math') {
        let text = part.content
        let lastIdx = 0
        let mathMatch
        const blockMathRegexLocal = new RegExp(blockMathRegex.source, 'gs')

        while ((mathMatch = blockMathRegexLocal.exec(text)) !== null) {
          if (mathMatch.index > lastIdx) {
            const textBefore = text.substring(lastIdx, mathMatch.index)
            partsWithMath.push({ type: 'text', content: textBefore, key: key++ })
          }
          // Usar el grupo que capturó el contenido (puede ser [1] para $$ o [2] para \[)
          const mathContent = mathMatch[1] !== undefined ? mathMatch[1] : mathMatch[2]
          partsWithMath.push({ type: 'block-math', content: mathContent, key: key++ })
          lastIdx = mathMatch.index + mathMatch[0].length
        }

        if (lastIdx < text.length) {
          partsWithMath.push({ type: 'text', content: text.substring(lastIdx), key: key++ })
        }
      } else {
        partsWithMath.push(part)
      }
    })

    // Tercera pasada: procesar fórmulas inline en las partes de texto
    const finalPartsWithInline = []
    partsWithMath.forEach(part => {
      if (part.type === 'text') {
        const inlineParts = []
        let text = part.content
        let lastIdx = 0
        let inlineMatch

        while ((inlineMatch = inlineMathRegex.exec(text)) !== null) {
          // Texto antes de la fórmula inline
          if (inlineMatch.index > lastIdx) {
            inlineParts.push({
              type: 'plain-text',
              content: text.substring(lastIdx, inlineMatch.index),
              key: key++
            })
          }

          // Fórmula inline (puede ser [1] para $ o [2] para \()
          const mathContent = inlineMatch[1] !== undefined ? inlineMatch[1] : inlineMatch[2]
          inlineParts.push({
            type: 'inline-math',
            content: mathContent,
            key: key++
          })
          lastIdx = inlineMatch.index + inlineMatch[0].length
        }

        // Texto restante
        if (lastIdx < text.length) {
          inlineParts.push({
            type: 'plain-text',
            content: text.substring(lastIdx),
            key: key++
          })
        }

        finalPartsWithInline.push(...inlineParts)
      } else {
        finalPartsWithInline.push(part)
      }
    })

    return finalPartsWithInline.map(part => {
      if (part.type === 'graph') {
        // Renderizar gráfico
        const graphData = part.content
        if (graphData.type === 'function') {
          return <MathGraph key={part.key} config={graphData.config} />
        } else if (graphData.type === 'chart') {
          return (
            <DataChart
              key={part.key}
              type={graphData.chartType || 'line'}
              data={graphData.data}
              config={graphData.config || {}}
            />
          )
        } else if (graphData.type === 'drawing') {
          return (
            <PhysicsDrawing
              key={part.key}
              objects={graphData.objects}
              config={graphData.config || {}}
            />
          )
        }
      } else if (part.type === 'block-math') {
        try {
          return (
            <div key={part.key} className="math-block">
              <BlockMath math={part.content} />
            </div>
          )
        } catch (e) {
          return <div key={part.key}>Error en fórmula: {part.content}</div>
        }
      } else if (part.type === 'inline-math') {
        try {
          return <InlineMath key={part.key} math={part.content} />
        } catch (e) {
          return <span key={part.key}>Error: {part.content}</span>
        }
      } else if (part.type === 'plain-text') {
        // Procesar formato manual (negritas y headings)
        return <span key={part.key}>{processManualFormatting(part.content)}</span>
      } else {
        // Fallback para cualquier otro tipo
        return <span key={part.key}>{part.content}</span>
      }
    })
  }

  return (
    <div className="blackboard" ref={blackboardRef}>
      <div className="blackboard-content">
        {messages.map((message, index) => (
          <div key={index} className={`message message-${message.role}`}>
            {message.content && (
              <>
                <div className="message-header">
                  <div className="message-label">
                    {message.role === 'system' && '🎓 Sistema'}
                    {message.role === 'user' && '👤 Estudiante'}
                    {message.role === 'assistant' && '👨‍🏫 Ana - Tutora Virtual'}
                  </div>
                  
                  {/* Botón de generar imagen solo para respuestas de Ana */}
                  {message.role === 'assistant' && (
                    <button
                      className={`generate-image-btn ${imageStates[index]?.status || 'idle'}`}
                      onClick={() => {
                        const state = imageStates[index]
                        if (state?.status === 'success') {
                          showImagePopup(index)
                        } else if (state?.status !== 'loading') {
                          generateImage(index)
                        }
                      }}
                      disabled={imageStates[index]?.status === 'loading'}
                      title={
                        imageStates[index]?.status === 'success' 
                          ? 'Ver imagen generada'
                          : imageStates[index]?.status === 'loading'
                          ? 'Generando imagen...'
                          : 'Generar imagen'
                      }
                    >
                      {imageStates[index]?.status === 'loading' && (
                        <span className="dots-animated"></span>
                      )}
                      {imageStates[index]?.status === 'success' && (
                        <span className="success-icon">✓</span>
                      )}
                      {(!imageStates[index] || imageStates[index]?.status === 'idle') && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <div className="message-content">
                  {renderContent(message.content)}
                </div>
              </>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="processing">
            Ana está pensando<span className="dots"></span>
          </div>
        )}
      </div>
      
      {/* Popup para mostrar la imagen */}
      {selectedImage && (
        <div className="image-popup-overlay" onClick={() => setSelectedImage(null)}>
          <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup-btn" onClick={() => setSelectedImage(null)}>
              ✕
            </button>
            <img 
              src={selectedImage.startsWith('data:') ? selectedImage : `data:image/png;base64,${selectedImage}`}
              alt="Imagen generada" 
              className="generated-image"
              onLoad={(e) => {
                console.log('✅ Imagen cargada exitosamente')
                console.log('Dimensiones:', e.target.naturalWidth, 'x', e.target.naturalHeight)
              }}
              onError={(e) => {
                console.error('❌ Error al cargar la imagen')
                console.log('Longitud del src:', e.target.src.length)
                console.log('Primeros 200 chars del src:', e.target.src.substring(0, 200))
                console.log('selectedImage type:', typeof selectedImage)
                console.log('selectedImage length:', selectedImage.length)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Blackboard

