import { useState, useEffect } from 'react'

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = reject
    img.src = url
  })
}

export default function useInstagramAvatar(username) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) {
      setLoading(false)
      return
    }

    const cacheKey = `ig_avatar_${username}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      setAvatarUrl(cached)
      setLoading(false)
      return
    }

    let cancelled = false

    fetch(`/api/ig?username=${encodeURIComponent(username)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (!data.profile_pic_url) throw new Error('no url')
        return preloadImage(data.profile_pic_url)
      })
      .then((url) => {
        if (cancelled) return
        localStorage.setItem(cacheKey, url)
        setAvatarUrl(url)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [username])

  return { avatarUrl, loading }
}
