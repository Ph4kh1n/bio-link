exports.handler = async (event) => {
  const username = event.queryStringParameters?.username

  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'username required' }),
    }
  }

  async function tryApi() {
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
    return (
      data?.data?.user?.profile_pic_url_hd ||
      data?.data?.user?.profile_pic_url
    )
  }

  async function tryScrape() {
    const page = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent':
          'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
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
    picUrl = await tryApi()
    if (picUrl) source = 'api'
  } catch {}

  if (!picUrl) {
    try {
      picUrl = await tryScrape()
      if (picUrl) source = 'scrape'
    } catch {}
  }

  if (!picUrl) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'no profile pic found' }),
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
    body: JSON.stringify({ profile_pic_url: picUrl, source }),
  }
}
