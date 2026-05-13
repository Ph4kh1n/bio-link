export async function onRequest(context) {
  const url = new URL(context.request.url)
  const username = url.searchParams.get('username') || context.params?.username

  if (!username) {
    return new Response(JSON.stringify({ error: 'username required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
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
      return new Response(JSON.stringify({ error: 'og:image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ profile_pic_url: match[1].replace(/&amp;/g, '&') }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = { path: '/api/ig' }
