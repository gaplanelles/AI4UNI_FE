import './TeacherAvatar.css'

const TeacherAvatar = ({ isThinking }) => {
  return (
    <div className="teacher-avatar-container">
      <div className={`avatar ${isThinking ? 'thinking' : ''}`}>
        <div className="avatar-head">
          <div className="glasses">
            <div className="glass"></div>
            <div className="glass"></div>
          </div>
          <div className="eyes">
            <div className="eye"></div>
            <div className="eye"></div>
          </div>
          <div className="mouth"></div>
        </div>
        <div className="avatar-body">
          <div className="tie"></div>
        </div>
      </div>
      
      {isThinking && (
        <div className="thinking-bubble">
          <div className="bubble-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      
      <div className="teacher-label">
        Profesor Virtual
      </div>
    </div>
  )
}

export default TeacherAvatar

