import { motion } from 'motion/react'

/**
 * Compact KPI tile used across the CEO dashboard.
 *
 * The identity keeps the orange for actions and accents, while the icons stay
 * plain ink — one voice, no rainbow of tones.
 *
 * @param {object}   props
 * @param {Function} props.icon    lucide-react icon component
 * @param {string}   props.label   caption
 * @param {string|number} props.value  headline number
 * @param {string}   [props.hint]  secondary line
 * @param {boolean}  [props.loading]
 */
export default function StatCard({ icon: Icon, label, value, hint, loading }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="card-body p-4 gap-2">
        <div className="flex items-center justify-between">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-base-200 text-base-content">
            {Icon ? <Icon size={20} strokeWidth={1.75} /> : null}
          </span>
          {loading ? (
            <span className="loading loading-spinner loading-sm text-primary" />
          ) : (
            <span className="text-2xl font-black tabular-nums">{value ?? '—'}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          {hint && <p className="text-xs text-base-content/50 mt-0.5">{hint}</p>}
        </div>
      </div>
    </motion.div>
  )
}
