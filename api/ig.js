export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const username = url.searchParams.get('username')

  if (!username) {
    return res.status(400).json({ error: 'username required' })
  }

  try {
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
    const user = data?.data?.user
    const picUrl = user?.profile_pic_url_hd || user?.profile_pic_url

    if (!picUrl) {
      return res.status(404).json({ error: 'no profile pic found' })
    }

    res.setHeader('Cache-Control', 'public, max-age=3600')
    return res.json({ profile_pic_url: picUrl })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
