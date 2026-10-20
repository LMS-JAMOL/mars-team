import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

/**
 * Resolve daisyUI theme colors to concrete CSS color strings.
 *
 * daisyUI v5 exposes full color values (e.g. `--color-primary: oklch(...)`),
 * but `var()` inside SVG presentation attributes is unreliable across
 * browsers. Reading the computed values and passing plain strings to recharts
 * keeps every chart in sync with the active (night/winter) theme.
 */
const KEYS = ['primary', 'accent', 'success', 'error', 'info', 'warning']

function readColors() {
  if (typeof window === 'undefined') return {}
  const cs = getComputedStyle(document.documentElement)
  const out = {}
  for (const key of KEYS) {
    out[key] = cs.getPropertyValue(`--color-${key}`).trim() || '#8b5cf6'
  }
  return out
}

export function useChartColors() {
  const theme = useSelector((s) => s.ui.theme)
  const [colors, setColors] = useState(readColors)

  useEffect(() => {
    // Re-read after the data-theme attribute has been applied to <html>.
    setColors(readColors())
  }, [theme])

  return colors
}
