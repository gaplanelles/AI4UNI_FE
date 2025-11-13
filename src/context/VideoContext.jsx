import { createContext, useContext, useState } from 'react'

const VideoContext = createContext(undefined)

export const VideoProvider = ({ children }) => {
  const [avatar, setAvatar] = useState(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isVideoActive, setIsVideoActive] = useState(false)

  const toggleVideo = () => {
    setIsVideoEnabled((prev) => !prev)
  }

  return (
    <VideoContext.Provider 
      value={{ 
        avatar, 
        setAvatar, 
        isVideoEnabled, 
        toggleVideo, 
        isVideoActive, 
        setIsVideoActive 
      }}
    >
      {children}
    </VideoContext.Provider>
  )
}

export const useVideo = () => {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider')
  }
  return context
}

