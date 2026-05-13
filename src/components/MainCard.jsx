export default function MainCard({ avatarUrl, loading, onMoreClick }) {
  return (
    <div className="card">
      <div className="avatar-wrap">
        <div className="avatar-glow" />
        {loading ? (
          <div className="avatar-loader">
            <div className="avatar-loader-ring" />
          </div>
        ) : (
          <img src={avatarUrl || '/avatar.png'} alt="Phakhin Nongthong" className="avatar" />
        )}
      </div>

      <h1 className="name">Phakhin Nongthong</h1>

      <div className="badges">
        <span className="badge">Programmer</span>
        <span className="badge">Writter</span>
        <span className="badge">Visual Design</span>
      </div>

      <p className="quote">&ldquo;No one cares about us, except ourselves.&rdquo;</p>

      <div className="divider" />

      <div className="btn-group">
        <a
          href="https://instagram.com/_phxknn.m"
          target="_blank"
          rel="noopener"
          className="btn btn--primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          Follow on Instagram
        </a>

        <div className="btn--row">
          <a
            href="https://tiktok.com/@sleepingdog_13"
            target="_blank"
            rel="noopener"
            className="btn btn--icon"
            aria-label="TikTok"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          </a>
          <button className="btn btn--icon" id="moreBtn" onClick={onMoreClick} aria-label="More">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="5" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="19" r="2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
