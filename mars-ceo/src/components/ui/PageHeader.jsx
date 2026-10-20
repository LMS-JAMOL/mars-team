import { isComponentType } from '../../lib/isComponentType'

/**
 * Page title block used by every screen.
 * `icon` may be an emoji string or a lucide-react component.
 */
export default function PageHeader({ icon, title, subtitle, action }) {
  const Icon = isComponentType(icon) ? icon : null

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="grid place-items-center w-12 h-12 rounded-2xl bg-base-100 border border-base-300 text-2xl">
            {Icon ? <Icon size={24} /> : icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-base-content/60 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
