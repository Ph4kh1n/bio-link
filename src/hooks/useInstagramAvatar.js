import { useState, useEffect } from 'react'

export default function useInstagramAvatar(username) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) {
      setLoading(false)
      return
    }

    const url = `/api/ig?username=${encodeURIComponent(username)}`
    const img = new Image()

    img.onload = () => {
      setAvatarUrl(url)
      setLoading(false)
    }

    img.onerror = () => {
      setAvatarUrl(null)
      setLoading(false)
    }

    img.src = url

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [username])

  return { avatarUrl, loading }
}
