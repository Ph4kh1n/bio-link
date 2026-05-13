export default async function handler(req, res) {
  const username = req.query?.username

  if (!username) {
    return res.status(400).json({ error: 'username required' })
  }

  async function getPicUrl() {
    const ig = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'X-IG-App-ID': '936619743392459',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: 'https://www.instagram.com/',
        },
      }
    )
    const data = await ig.json()
    return data?.data?.user?.profile_pic_url_hd || data?.data?.user?.profile_pic_url
  }

  async function getScrapeUrl() {
    const page = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
    })
    const html = await page.text()
    const m = html.match(
      /<meta\s[^>]*property="og:image"[^>]*content="([^"]+)"/i
    )
    return m ? m[1].replace(/&amp;/g, '&') : null
  }

  let picUrl
  let source

  try {
    picUrl = await getPicUrl()
    if (picUrl) source = 'api'
  } catch {}

  if (!picUrl) {
    try {
      picUrl = await getScrapeUrl()
      if (picUrl) source = 'scrape'
    } catch {}
  }

  if (!picUrl) {
    return res.status(404).json({ error: 'no profile pic found' })
  }

  try {
    const imgRes = await fetch(picUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    })

    if (!imgRes.ok) {
      return res.status(502).json({ error: 'failed to fetch image' })
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await imgRes.arrayBuffer())

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    res.setHeader('X-IG-Source', source)
    return res.send(buffer)
  } catch (err) {
    return res.status(502).json({ error: err.message })
  }
}
