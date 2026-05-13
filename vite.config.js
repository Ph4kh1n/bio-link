import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ig-proxy',
      configureServer(server) {
        server.middlewares.use('/api/ig', async (req, res) => {
          const url = new URL(req.url, `http://${req.headers.host}`)
          const username = url.searchParams.get('username')

          if (!username) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'username required' }))
            return
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
            const picUrl =
              data?.data?.user?.profile_pic_url_hd ||
              data?.data?.user?.profile_pic_url

            if (!picUrl) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'no profile pic found' }))
              return
            }

            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            res.end(JSON.stringify({ profile_pic_url: picUrl }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      },
    },
  ],
})
