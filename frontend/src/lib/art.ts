// Generates offline placeholder "archive plates" as SVG data URIs, so the demo needs no image hosting.
// Real digitized objects from dlib.me replace these once the backend serves image URLs.

export type ArtKind = 'book' | 'manuscript' | 'map' | 'photo' | 'periodical' | 'poster' | 'audio'

const PALETTES: Record<ArtKind, [string, string, string]> = {
  book: ['#3b2f22', '#c9a961', '#f3ead2'],
  manuscript: ['#4a3a24', '#dabc74', '#f5ecd6'],
  map: ['#2f4a4f', '#c9a961', '#e9efe6'],
  photo: ['#2b2b2b', '#b9b3a6', '#efece6'],
  periodical: ['#40302a', '#c9a961', '#f1e7d6'],
  poster: ['#5a2a24', '#dabc74', '#f6e9d3'],
  audio: ['#262a3a', '#c9a961', '#e7e5ef'],
}

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function escapeXml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

function wrap(text: string, max: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > max) {
      lines.push(line)
      line = word
    } else {
      line = (line + ' ' + word).trim()
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 4)
}

function decoration(kind: ArtKind, seed: number, accent: string, paper: string) {
  const r = (n: number, m: number) => ((seed >> n) % m) + 1
  switch (kind) {
    case 'map':
      return `<g fill="none" stroke="${accent}" stroke-width="2" opacity=".7">
        <path d="M40 360 C120 ${300 + r(1, 40)} 180 ${380 - r(2, 40)} 260 330 S400 ${300 + r(3, 30)} 460 340"/>
        <path d="M60 420 C140 ${380 + r(4, 30)} 220 ${450 - r(5, 20)} 300 410 S420 380 450 420"/>
        <circle cx="${120 + r(6, 200)}" cy="${300 + r(7, 80)}" r="7" fill="${accent}"/>
        <path d="M40 40h40M60 20v40" stroke="${paper}"/></g>`
    case 'photo':
      return `<rect x="60" y="60" width="380" height="300" fill="none" stroke="${paper}" stroke-width="3" opacity=".5"/>
        <path d="M60 360 L170 ${200 + r(1, 40)} L250 ${280 - r(2, 30)} L340 ${170 + r(3, 40)} L440 360Z" fill="${accent}" opacity=".35"/>
        <circle cx="${330 + r(4, 60)}" cy="110" r="26" fill="${paper}" opacity=".5"/>`
    case 'poster':
      return `<rect x="60" y="60" width="380" height="120" fill="${accent}" opacity=".85"/>
        <circle cx="${150 + r(1, 200)}" cy="330" r="${50 + r(2, 30)}" fill="${accent}" opacity=".6"/>
        <rect x="${80 + r(3, 120)}" y="240" width="140" height="14" fill="${paper}" opacity=".7"/>`
    case 'periodical':
      return `<g fill="${paper}" opacity=".55">
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="60" y="${210 + i * 20}" width="${160 + ((seed >> i) % 120)}" height="6"/>`).join('')}
        <rect x="290" y="210" width="150" height="150" opacity=".35"/></g>`
    case 'audio':
      return `<g stroke="${accent}" stroke-width="4" opacity=".8">
        ${Array.from({ length: 22 }, (_, i) => `<path d="M${70 + i * 17} ${300 - ((seed >> (i % 20)) % 70)} V${300 + ((seed >> (i % 17)) % 70)}"/>`).join('')}</g>`
    case 'manuscript':
      return `<g fill="${accent}" opacity=".5"><rect x="60" y="215" width="360" height="5"/><rect x="60" y="240" width="330" height="5"/><rect x="60" y="265" width="350" height="5"/><rect x="60" y="290" width="300" height="5"/></g>
        <text x="64" y="205" font-family="Georgia,serif" font-size="64" fill="${accent}">${String.fromCharCode(0x410 + (seed % 26))}</text>`
    default:
      return `<g fill="none" stroke="${accent}" stroke-width="3" opacity=".8">
        <rect x="150" y="190" width="200" height="170" rx="4"/><path d="M250 190v170"/><path d="M165 220h70M165 245h70M265 220h70M265 245h70"/></g>`
  }
}

export function makeArt(kind: ArtKind, title: string, subtitle = '', wide = false): string {
  const [bg, accent, paper] = PALETTES[kind]
  const seed = hash(`${kind}:${title}:${subtitle}`)
  const w = wide ? 800 : 500
  const h = 500
  const lines = wrap(title, wide ? 34 : 22)
  const textX = wide ? 150 : 85
  const body = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#151515"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect x="18" y="18" width="${w - 36}" height="${h - 36}" fill="none" stroke="${accent}" stroke-width="1.5" opacity=".7"/>
    ${wide ? `<g transform="translate(${(w - 500) / 2},0)">${decoration(kind, seed, accent, paper)}</g>` : decoration(kind, seed, accent, paper)}
    ${lines.map((line, i) => `<text x="${textX}" y="${(wide ? 130 : 110) + i * 30}" font-family="Georgia,serif" font-size="26" font-weight="600" fill="${paper}">${escapeXml(line)}</text>`).join('')}
    <text x="${textX}" y="${wide ? h - 36 : h - 85}" font-family="Arial,sans-serif" font-size="14" letter-spacing="3" fill="${accent}">${escapeXml(subtitle.toUpperCase())}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(body)}`
}
