import './LoadingOverlay.css'

const LoadingOverlay = ({ isLoading, children }) => {
  return (
    <div className="loading-wrapper">
      {children}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  )
}

export default LoadingOverlay

