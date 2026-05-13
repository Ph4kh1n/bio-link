import { useState, useEffect } from 'react'
import Starfield from './components/Starfield'
import MainCard from './components/MainCard'
import PopupCard from './components/PopupCard'
import useInstagramAvatar from './hooks/useInstagramAvatar'
import './App.css'

const IG_USERNAME = '_phxknn.m'

export default function App() {
  const [popupOpen, setPopupOpen] = useState(false)
  const { avatarUrl, loading } = useInstagramAvatar(IG_USERNAME)

  useEffect(() => {
    document.body.style.overflow = popupOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [popupOpen])

  return (
    <>
      <Starfield />

      <div className="ambient ambient--orange" />
      <div className="ambient ambient--blue" />
      <div className="ambient ambient--purple" />
      <div className="cloud cloud--1" />
      <div className="cloud cloud--2" />

      <div className="container">
        <MainCard avatarUrl={avatarUrl} loading={loading} onMoreClick={() => setPopupOpen(true)} />
      </div>

      <PopupCard isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </>
  )
}
