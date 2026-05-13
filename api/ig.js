export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const username = url.searchParams.get('username')

  if (!username) {
    return res.status(400).json({ error: 'username required' })
  }

  try {
    const ig = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
    })

    const html = await ig.text()
    const match = html.match(
      /<meta\s[^>]*property="og:image"[^>]*content="([^"]+)"/i
    )

    if (!match) {
      return res.status(404).json({ error: 'og:image not found' })
    }

    res.setHeader('Cache-Control', 'public, max-age=3600')
    return res.json({ profile_pic_url: match[1].replace(/&amp;/g, '&') })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
