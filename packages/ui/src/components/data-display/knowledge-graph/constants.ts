export const DOMAIN_COLORS: Record<string, string> = {
  philosophy:  '#f4a261',  // warm gold
  literature:  '#6b9ee8',  // cornflower blue
  buddhism:    '#74c69d',  // jade green
  taoism:      '#52b788',  // deep jade
  indigenous:  '#e07b54',  // earth red
  cross:       '#c77dff',  // violet — bridges between traditions
  ecology:     '#74c69d',  // forest green
  vedic:       '#ffd166',  // saffron
  opencosmos:  '#e9c46a',  // cosmos gold
  stoicism:    '#a8c5da',  // cool blue-grey
  sufism:      '#d4a5c9',  // dusty rose
  science:     '#7ec8e3',  // sky blue
  psychology:  '#b8b4e0',  // lavender
  art:         '#f9c74f',  // bright gold
  ai:          '#90e0ef',  // cyan
  default:     '#8b949e',  // muted silver for unmapped domains
}

/** Node opacity per confidence level */
export const CONFIDENCE_OPACITY: Record<string, number> = {
  high:        1.0,
  medium:      0.8,
  speculative: 0.55,
  pending:     0.65,
}

export const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'are', 'was',
  'have', 'has', 'had', 'not', 'but', 'its', 'can', 'all', 'one', 'into',
])

export const MIN_TITLE_LENGTH = 4
export const MAX_TENTATIVE_EDGES = 8
