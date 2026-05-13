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

    const endpoints = [
      `/api/ig/${username}/`,
      `/api/ig?username=${username}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://www.instagram.com/${username}/`)}`,
    ]

    let cancelled = false
    let index = 0

    function attempt() {
      if (cancelled || index >= endpoints.length) {
        if (!cancelled) setLoading(false)
        return
      }

      const url = endpoints[index]

      const isApi =
        url.startsWith('/api/ig') || url.startsWith(window.location.origin + '/api/ig')

      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)

          if (isApi) {
            return r.json().then((data) => {
              if (data.profile_pic_url) return data.profile_pic_url
              throw new Error('no profile_pic_url')
            })
          }

          return r.text().then((html) => {
            const m = html.match(
              /<meta\s[^>]*property="og:image"[^>]*content="([^"]+)"/i
            )
            if (m) return m[1].replace(/&amp;/g, '&')
            throw new Error('og:image not found')
          })
        })
        .then((imgUrl) => preloadImage(imgUrl))
        .then((imgUrl) => {
          if (cancelled) return
          localStorage.setItem(cacheKey, imgUrl)
          setAvatarUrl(imgUrl)
          setLoading(false)
        })
        .catch(() => {
          index++
          attempt()
        })
    }

    attempt()

    return () => {
      cancelled = true
    }
  }, [username])

  return { avatarUrl, loading }
}
