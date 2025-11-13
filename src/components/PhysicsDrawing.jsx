import './PhysicsDrawing.css'

const PhysicsDrawing = ({ objects, config = {} }) => {
  const width = config.width || 600
  const height = config.height || 400
  const title = config.title || ''
  
  // Calcular escala basada en el objeto más grande o en los puntos del triángulo
  const calculateScale = () => {
    // Para triángulos y líneas, buscar coordenadas máximas
    const hasGeometry = objects.some(obj => obj.shape === 'triangle' || obj.shape === 'line')
    
    if (hasGeometry) {
      let maxX = 0, maxY = 0
      objects.forEach(obj => {
        if (obj.props && obj.props.points) {
          obj.props.points.forEach(([x, y]) => {
            maxX = Math.max(maxX, Math.abs(x))
            maxY = Math.max(maxY, Math.abs(y))
          })
        }
        if (obj.props && obj.props.from) {
          const [x1, y1] = obj.props.from
          const [x2, y2] = obj.props.to || [0, 0]
          maxX = Math.max(maxX, Math.abs(x1), Math.abs(x2))
          maxY = Math.max(maxY, Math.abs(y1), Math.abs(y2))
        }
      })
      return Math.min(width, height) / (Math.max(maxX, maxY) * 2.5)
    }
    
    // Para círculos y cuadrados (código original)
    const maxDiameter = Math.max(...objects.map(obj => obj.diameter || obj.radius * 2 || 50))
    return Math.min(width, height) / (maxDiameter * 3)
  }
  
  const scale = calculateScale()
  
  return (
    <div className="physics-drawing">
      {title && <h3 className="drawing-title">{title}</h3>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid de fondo opcional */}
        {config.showGrid && (
          <g className="grid">
            <defs>
              <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
              </pattern>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="50" height="50" fill="url(#smallGrid)"/>
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#d0d0d0" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </g>
        )}
        
        {/* Dibujar objetos */}
        {objects.map((obj, index) => {
          // Convertir coordenadas del sistema cartesiano a SVG
          const toSVG = (x, y) => {
            return [
              width / 2 + x * scale,
              height / 2 - y * scale  // Invertir Y para sistema cartesiano
            ]
          }
          
          // Si es un triángulo
          if (obj.shape === 'triangle' && obj.props && obj.props.points) {
            const points = obj.props.points.map(([x, y]) => toSVG(x, y))
            const pointsStr = points.map(([x, y]) => `${x},${y}`).join(' ')
            const color = obj.color || '#667eea'
            
            return (
              <g key={index} className="physics-object triangle">
                {/* Triángulo */}
                <polygon
                  points={pointsStr}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                />
                
                {/* Marcador de ángulo recto si existe */}
                {obj.props.rightAngle && (() => {
                  const angleIdx = obj.props.labels.findIndex(l => l.startsWith(obj.props.rightAngle))
                  if (angleIdx !== -1) {
                    const [cx, cy] = points[angleIdx]
                    const size = 15
                    return (
                      <rect
                        x={cx}
                        y={cy - size}
                        width={size}
                        height={size}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                      />
                    )
                  }
                })()}
                
                {/* Etiquetas de vértices */}
                {obj.props.labels && obj.props.labels.map((label, i) => {
                  const [px, py] = points[i]
                  // Ajustar posición del label según el vértice
                  const offset = 20
                  let dx = 0, dy = 0
                  if (i === 0) { dx = -offset; dy = offset }  // Abajo izquierda
                  if (i === 1) { dx = offset; dy = offset }   // Abajo derecha
                  if (i === 2) { dx = -offset; dy = -offset } // Arriba izquierda
                  
                  return (
                    <text
                      key={`label-${i}`}
                      x={px + dx}
                      y={py + dy}
                      fill="#333"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {label}
                    </text>
                  )
                })}
                
                {/* Etiquetas de lados */}
                {obj.props.sideLabels && Object.entries(obj.props.sideLabels).map(([side, label], i) => {
                  // Calcular punto medio del lado
                  let p1, p2
                  if (side === 'AB') { p1 = points[0]; p2 = points[1] }
                  else if (side === 'AC') { p1 = points[0]; p2 = points[2] }
                  else if (side === 'BC') { p1 = points[1]; p2 = points[2] }
                  
                  if (p1 && p2) {
                    const mx = (p1[0] + p2[0]) / 2
                    const my = (p1[1] + p2[1]) / 2
                    const offset = side === 'AB' ? 20 : (side === 'AC' ? -30 : 25)
                    
                    return (
                      <text
                        key={`side-${i}`}
                        x={mx + (side === 'BC' ? 30 : 0)}
                        y={my + offset}
                        fill="#666"
                        fontSize="14"
                      >
                        {label}
                      </text>
                    )
                  }
                })}
              </g>
            )
          }
          
          // Si es una línea
          if (obj.shape === 'line' && obj.props) {
            const [x1, y1] = toSVG(...obj.props.from)
            const [x2, y2] = toSVG(...obj.props.to)
            const color = obj.color || '#333'
            const style = obj.props.style || 'solid'
            
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth="2"
                strokeDasharray={style === 'dashed' ? '5,5' : style === 'dotted' ? '2,2' : '0'}
              />
            )
          }
          
          // Si es un círculo con coordenadas cartesianas
          if (obj.shape === 'circle' && obj.props && obj.props.position) {
            const [cx, cy] = toSVG(...obj.props.position)
            const radius = (obj.props.radius || 0.3) * scale
            const color = obj.color || '#e53e3e'
            const label = obj.props.label || obj.label
            
            // Configuración de animación usando SVG animateMotion
            let animationElement = null
            
            if (obj.props.animation) {
              const anim = obj.props.animation
              
              if (anim.type === 'slide') {
                // Animación de deslizamiento de un punto a otro
                const [startX, startY] = toSVG(...anim.from)
                const [endX, endY] = toSVG(...anim.to)
                const duration = anim.duration || 3
                const repeat = anim.repeat === 'once' ? '1' : 'indefinite'
                
                // Crear path para el movimiento
                const pathData = `M ${startX - cx} ${startY - cy} L ${endX - cx} ${endY - cy}`
                
                animationElement = (
                  <animateMotion
                    path={pathData}
                    dur={`${duration}s`}
                    repeatCount={repeat}
                    fill="freeze"
                  />
                )
              }
            }
            
            return (
              <g key={index} className="physics-object circle-cartesian">
                <g>
                  {/* Círculo con animación */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="2"
                  >
                    {animationElement}
                  </circle>
                  {/* Brillo con animación */}
                  <circle
                    cx={cx - radius * 0.3}
                    cy={cy - radius * 0.3}
                    r={radius * 0.2}
                    fill="rgba(255,255,255,0.6)"
                  >
                    {animationElement && (
                      <animateMotion
                        path={animationElement.props.path}
                        dur={animationElement.props.dur}
                        repeatCount={animationElement.props.repeatCount}
                        fill="freeze"
                      />
                    )}
                  </circle>
                  {/* Etiqueta */}
                  {label && (
                    <text
                      x={cx}
                      y={cy - radius - 10}
                      textAnchor="middle"
                      fill="#333"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {label}
                    </text>
                  )}
                </g>
              </g>
            )
          }
          
          // Código original para círculos y cuadrados
          const x = obj.x || (width / (objects.length + 1)) * (index + 1)
          const y = obj.y || height / 2
          const radius = (obj.radius || obj.diameter / 2 || 25) * scale
          const color = obj.color || ['#667eea', '#e53e3e', '#38b2ac', '#ed8936', '#9f7aea'][index % 5]
          // Solo usar label si se proporciona explícitamente, o si es un círculo sin label
          const label = obj.label !== undefined 
            ? obj.label 
            : (obj.shape === 'square' || obj.shape === 'rectangle' ? '' : `Objeto ${index + 1}`)
          
          return (
            <g key={index} className="physics-object">
              {/* Sombra */}
              <ellipse
                cx={x}
                cy={height - 20}
                rx={radius * 0.8}
                ry={radius * 0.2}
                fill="rgba(0,0,0,0.2)"
              />
              
              {/* Objeto principal */}
              {obj.shape === 'square' || obj.shape === 'rectangle' ? (
                <rect
                  x={x - radius}
                  y={y - radius}
                  width={radius * 2}
                  height={obj.height ? obj.height * scale : radius * 2}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                />
              ) : (
                // Círculo por defecto
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  {/* Brillo */}
                  <circle
                    cx={x - radius * 0.3}
                    cy={y - radius * 0.3}
                    r={radius * 0.2}
                    fill="rgba(255,255,255,0.5)"
                  />
                </>
              )}
              
              {/* Etiqueta del objeto (solo si hay label) */}
              {label && (
                <text
                  x={x}
                  y={y - radius - 15}
                  textAnchor="middle"
                  fill="#333"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {label}
                </text>
              )}
              
              {/* Información adicional */}
              <g className="object-info">
                {obj.diameter && (
                  <text
                    x={x}
                    y={y + radius + 20}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="12"
                  >
                    ⌀ {obj.diameter} {obj.unit || 'cm'}
                  </text>
                )}
                {obj.weight && (
                  <text
                    x={x}
                    y={y + radius + 35}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="12"
                  >
                    ⚖ {obj.weight} {obj.weightUnit || 'kg'}
                  </text>
                )}
                {obj.mass && (
                  <text
                    x={x}
                    y={y + radius + 35}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="12"
                  >
                    m = {obj.mass} {obj.massUnit || 'kg'}
                  </text>
                )}
              </g>
              
              {/* Línea de comparación opcional */}
              {config.showComparison && index > 0 && (
                <line
                  x1={objects[index - 1].x || (width / (objects.length + 1)) * index}
                  y1={height - 50}
                  x2={x}
                  y2={height - 50}
                  stroke="#999"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default PhysicsDrawing

