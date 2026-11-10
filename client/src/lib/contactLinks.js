import { FiGlobe, FiLink } from 'react-icons/fi'
import { FaLinkedinIn, FaCodepen } from 'react-icons/fa'
import {
  SiGithub, SiGitlab, SiFacebook, SiInstagram, SiX, SiYoutube,
  SiTiktok, SiDiscord, SiTelegram, SiWhatsapp, SiBehance, SiDribbble,
  SiMedium, SiDevdotto, SiStackoverflow, SiFigma, SiTwitch, SiPinterest,
  SiReddit, SiSpotify,
} from 'react-icons/si'
import { profileLinkHref } from './profileLinks'

// Match the destination, rather than a user-entered label. Unknown sites remain usable.
const services = [
  ['LinkedIn', FaLinkedinIn, ['linkedin.com']],
  ['GitHub', SiGithub, ['github.com']],
  ['GitLab', SiGitlab, ['gitlab.com']],
  ['Facebook', SiFacebook, ['facebook.com', 'fb.com', 'fb.me']],
  ['Instagram', SiInstagram, ['instagram.com']],
  ['X', SiX, ['x.com', 'twitter.com']],
  ['YouTube', SiYoutube, ['youtube.com', 'youtu.be']],
  ['TikTok', SiTiktok, ['tiktok.com']],
  ['Discord', SiDiscord, ['discord.com', 'discord.gg']],
  ['Telegram', SiTelegram, ['t.me', 'telegram.me']],
  ['WhatsApp', SiWhatsapp, ['wa.me', 'whatsapp.com']],
  ['Behance', SiBehance, ['behance.net']],
  ['Dribbble', SiDribbble, ['dribbble.com']],
  ['Medium', SiMedium, ['medium.com']],
  ['DEV', SiDevdotto, ['dev.to']],
  ['Stack Overflow', SiStackoverflow, ['stackoverflow.com']],
  ['CodePen', FaCodepen, ['codepen.io']],
  ['Figma', SiFigma, ['figma.com']],
  ['Twitch', SiTwitch, ['twitch.tv']],
  ['Pinterest', SiPinterest, ['pinterest.com', 'pin.it']],
  ['Reddit', SiReddit, ['reddit.com']],
  ['Spotify', SiSpotify, ['spotify.com']],
]

export function contactLink(link) {
  const href = profileLinkHref(link.url)
  if (!href) return null
  const hostname = new URL(href).hostname.toLowerCase()
  const service = services.find(([, , domains]) => domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)))
  const customName = link.label?.trim() || link.name?.trim()
  const [name, Glyph] = service || [customName || hostname, ['Website', 'Portfolio'].includes(link.type) ? FiGlobe : FiLink]
  return { id: link.id, href, Glyph, service:service?.[0], label: service ? `${name}: ${customName || hostname}` : name }
}

