/**
 * MARS wordmark — the rounded geometric "mars°" lockup.
 *
 * The wordmark is set in the brand's geometric sans (Poppins) instead of being
 * drawn by hand, so the letterforms match the identity exactly: single-storey
 * "a", round shoulders on the "m", a quarter-circle hook on the "r".
 *
 * The orange ring is a superscript "°" after the wordmark — the Mars-planet
 * ring the identity is built on.
 *
 * Variants: 'navy' | 'white' | 'orange' | 'monochrome-white' | 'monochrome-navy'.
 * The `withStrapline` prop is kept for API compatibility but draws nothing.
 */
export default function MarsLogo({
  variant = 'navy', // 'navy' | 'white' | 'orange' | 'monochrome-white' | 'monochrome-navy'
  withStrapline = true,
  className = 'text-2xl',
  ...props
}) {
  const INK = '#232936' // dark charcoal-navy of the wordmark
  const RING = '#F44516' // brand orange

  let textColor = INK
  let ringColor = RING

  if (variant === 'white') {
    textColor = '#FFFFFF'
    ringColor = RING
  } else if (variant === 'orange') {
    textColor = RING
    ringColor = RING
  } else if (variant === 'monochrome-white') {
    textColor = '#FFFFFF'
    ringColor = '#FFFFFF'
  } else if (variant === 'monochrome-navy') {
    textColor = INK
    ringColor = INK
  }

  return (
    <span
      className={`mars-wordmark ${className}`}
      role="img"
      aria-label="MARS"
      {...props}
    >
      <span className="mars-wordmark__text" style={{ color: textColor }}>
        mars
      </span>
      <span className="mars-wordmark__ring" style={{ borderColor: ringColor }} />
    </span>
  )
}
