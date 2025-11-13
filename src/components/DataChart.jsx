import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './DataChart.css'

const DataChart = ({ type, data, config = {} }) => {
  // Transformar datos si vienen en formato Chart.js (labels + datasets)
  const transformData = (rawData) => {
    // Si ya está en formato Recharts (array de objetos)
    if (Array.isArray(rawData)) {
      return rawData
    }
    
    // Si está en formato Chart.js (labels + datasets)
    if (rawData.labels && rawData.datasets) {
      const { labels, datasets } = rawData
      return labels.map((label, index) => {
        const dataPoint = { name: label }
        datasets.forEach((dataset) => {
          const key = dataset.label || 'value'
          dataPoint[key] = dataset.data[index]
        })
        return dataPoint
      })
    }
    
    return rawData
  }

  const chartData = transformData(data)
  
  // Obtener las keys de los datasets para renderizar múltiples líneas/barras
  const getDataKeys = () => {
    if (!chartData || chartData.length === 0) return ['value']
    
    const keys = Object.keys(chartData[0]).filter(key => key !== 'name')
    return keys.length > 0 ? keys : ['value']
  }

  const dataKeys = getDataKeys()
  const colors = ['#667eea', '#e53e3e', '#38b2ac', '#ed8936', '#9f7aea']

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={colors[index % colors.length]} 
              />
            ))}
          </BarChart>
        )
      
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={colors[index % colors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        )
    }
  }

  return (
    <div className="data-chart">
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

export default DataChart

