import { useState, useEffect } from 'react'

const PROXIES = [
  (username) => `/api/ig/${username}/`,
  (username) => `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.instagram.com/${username}/`)}`,
  (username) => `https://corsproxy.io/?url=${encodeURIComponent(`https://www.instagram.com/${username}/`)}`,
]

function parseOgImage(html) {
  const m = html.match(/<meta\s[^>]*property="og:image"[^>]*content="([^"]+)"/i)
  return m ? m[1].replace(/&amp;/g, '&') : null
}

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
    let proxyIndex = 0

    function attempt() {
      if (cancelled || proxyIndex >= PROXIES.length) {
        if (!cancelled) setLoading(false)
        return
      }

      const url = PROXIES[proxyIndex](username)

      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.text()
        })
        .then((html) => {
          if (cancelled) return
          const imgUrl = parseOgImage(html)
          if (imgUrl) {
            return preloadImage(imgUrl).then(() => {
              if (cancelled) return
              localStorage.setItem(cacheKey, imgUrl)
              setAvatarUrl(imgUrl)
              setLoading(false)
            })
          } else {
            proxyIndex++
            attempt()
          }
        })
        .catch(() => {
          proxyIndex++
          attempt()
        })
    }

    attempt()

    return () => { cancelled = true }
  }, [username])

  return { avatarUrl, loading }
}
