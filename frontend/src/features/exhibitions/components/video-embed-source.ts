export type VideoEmbedSource = {
  provider: 'youtube' | 'vimeo'
  providerName: string
  id: string
  /** The address of the player, on the privacy-friendly host of each provider. */
  embedUrl: string
}

const YOUTUBE_ID = /^[\w-]{11}$/
const VIMEO_ID = /^\d{5,12}$/

// A video address that is a YouTube or Vimeo page (not a file) is shown through the provider's player.
export function parseEmbedSource(src: string): VideoEmbedSource | null {
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.replace(/^(www|m)\./, '')
  const parts = url.pathname.split('/').filter(Boolean)

  let youtubeId: string | undefined
  if (host === 'youtu.be') youtubeId = parts[0]
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parts[0] === 'watch') youtubeId = url.searchParams.get('v') ?? undefined
    else if (['embed', 'shorts', 'live'].includes(parts[0] ?? '')) youtubeId = parts[1]
  }
  if (youtubeId && YOUTUBE_ID.test(youtubeId)) {
    return {
      provider: 'youtube',
      providerName: 'YouTube',
      id: youtubeId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`,
    }
  }

  const vimeoId =
    host === 'vimeo.com'
      ? parts[0]
      : host === 'player.vimeo.com' && parts[0] === 'video'
        ? parts[1]
        : undefined
  if (vimeoId && VIMEO_ID.test(vimeoId)) {
    return {
      provider: 'vimeo',
      providerName: 'Vimeo',
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&dnt=1`,
    }
  }
  return null
}
