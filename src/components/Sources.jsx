import './Sources.css'

const Sources = ({ sources }) => {
  const hasSources = sources && sources.length > 0

  return (
    <div className="sources-container">
      <div className="sources-header">
        <span className="sources-icon">📚</span>
        <h3>Fuentes consultadas</h3>
      </div>
      
      {!hasSources ? (
        <div className="sources-empty">
          <div className="empty-icon">📖</div>
          <p>Esperando respuesta del profesor...</p>
        </div>
      ) : (
        <div className="sources-list">
          {sources.map((source, index) => (
            <div key={source.id || index} className="source-item">
              <div className="source-number">{index + 1}</div>
              <div className="source-content">
                <div className="source-title">
                  {source.metadata?.document_name || 'Documento'}
                </div>
                <div className="source-metadata">
                  <span className="source-distance">
                    Relevancia: {Math.round((1 - source.distance) * 100)}%
                  </span>
                  {source.metadata?.start && source.metadata?.end && (
                    <span className="source-location">
                      Posición: {source.metadata.start} - {source.metadata.end}
                    </span>
                  )}
                </div>
                {source.document && (
                  <div className="source-preview">
                    {source.document.substring(0, 150)}
                    {source.document.length > 150 ? '...' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Sources

