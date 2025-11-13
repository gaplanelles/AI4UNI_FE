import { useEffect, useRef } from 'react'
import functionPlot from 'function-plot'
import './MathGraph.css'

const MathGraph = ({ config }) => {
  const graphRef = useRef(null)

  useEffect(() => {
    if (!graphRef.current) return

    try {
      // Limpiar gráfico anterior
      graphRef.current.innerHTML = ''

      // Configuración por defecto
      const defaultConfig = {
        target: graphRef.current,
        width: 500,
        height: 400,
        grid: true,
        disableZoom: false,
        xAxis: { domain: [-10, 10] },
        yAxis: { domain: [-10, 10] },
        ...config
      }

      functionPlot(defaultConfig)
    } catch (error) {
      console.error('Error al renderizar gráfico:', error)
      graphRef.current.innerHTML = '<p>Error al renderizar el gráfico</p>'
    }
  }, [config])

  return <div ref={graphRef} className="math-graph"></div>
}

export default MathGraph

