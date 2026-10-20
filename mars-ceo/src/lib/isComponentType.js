/**
 * True when `value` can be used as a JSX element type (i.e. `<value />`).
 *
 * lucide-react icons are `forwardRef` components — plain objects with a
 * `$$typeof` symbol — not functions. A naive `typeof x === 'function'` check
 * therefore misses them and trying to render the object throws React error #31.
 */
const FORWARD_REF = Symbol.for('react.forward_ref')
const MEMO = Symbol.for('react.memo')

export function isComponentType(value) {
  if (typeof value === 'function') return true
  if (value && typeof value === 'object') {
    return value.$$typeof === FORWARD_REF || value.$$typeof === MEMO
  }
  return false
}
