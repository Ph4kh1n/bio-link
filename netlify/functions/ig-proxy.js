exports.handler = async (event) => {
  const username = event.queryStringParameters?.username

  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'username required' }),
    }
  }

  try {
    const res = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
    })

    const html = await res.text()
    const match = html.match(
      /<meta\s[^>]*property="og:image"[^>]*content="([^"]+)"/i
    )

    if (!match) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'og:image not found' }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify({
        profile_pic_url: match[1].replace(/&amp;/g, '&'),
      }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
