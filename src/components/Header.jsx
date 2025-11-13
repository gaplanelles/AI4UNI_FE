import './Header.css'

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <img 
            src="/images/Oracle_Consulting_rgb.png" 
            alt="Oracle Consulting" 
            className="header-logo"
          />
        </div>
        <div className="header-title">
          <h1>Profesor Virtual AI</h1>
          <p className="header-subtitle">Tu asistente educativo inteligente</p>
        </div>
      </div>
    </header>
  )
}

export default Header

