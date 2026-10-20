import { useState } from 'react'

// Builds initial form values from the field config.
function initialValues(fields) {
  const out = {}
  for (const f of fields) {
    if (f.type === 'toggle') out[f.name] = f.default ?? false
    else if (f.type === 'select') out[f.name] = f.default ?? f.options?.[0] ?? ''
    else out[f.name] = f.default ?? ''
  }
  return out
}

// Coerce string inputs to the shape the backend expects.
function serialize(fields, values) {
  const out = {}
  for (const f of fields) {
    const v = values[f.name]
    if (v === '' || v == null) continue
    out[f.name] = f.type === 'number' ? Number(v) : v
  }
  return out
}

export default function EntityForm({ fields, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => initialValues(fields))

  const setField = (name, value) => setValues((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(serialize(fields, values))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.name} className={f.type === 'toggle' ? 'sm:col-span-2' : ''}>
            {f.type === 'toggle' ? (
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={!!values[f.name]}
                  onChange={(e) => setField(f.name, e.target.checked)}
                />
                <span>{f.label}</span>
              </label>
            ) : (
              <>
                <label className="label">
                  <span className="label-text">
                    {f.label}
                    {f.required && <span className="text-error"> *</span>}
                  </span>
                </label>
                {f.type === 'select' ? (
                  <select
                    className="select select-bordered w-full"
                    value={values[f.name]}
                    onChange={(e) => setField(f.name, e.target.value)}
                    required={f.required}
                  >
                    {f.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    placeholder={f.placeholder || ''}
                    className="input input-bordered w-full"
                    value={values[f.name]}
                    onChange={(e) => setField(f.name, e.target.value)}
                    required={f.required}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <span className="loading loading-spinner loading-sm" />}
          Create
        </button>
      </div>
    </form>
  )
}
