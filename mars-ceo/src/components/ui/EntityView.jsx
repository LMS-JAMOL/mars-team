import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'react-toastify'

import PageHeader from './PageHeader'
import EntityForm from './EntityForm'
import { entityThunks, ENTITY_DEFS } from '../../features/entities/entities'
import { ENTITY_VIEWS } from '../../config/entityViews'
import { isComponentType } from '../../lib/isComponentType'

/**
 * Generic list + (optional) create screen for any registered entity.
 * @param {string} name  entity key (branches | mentors | groups | students | payments | auditlogs)
 */
export default function EntityView({ name }) {
  const dispatch = useDispatch()
  const view = ENTITY_VIEWS[name]
  const def = ENTITY_DEFS[name]
  const { fetchAll, createOne } = entityThunks(name)
  const readOnly = view.readOnly === true
  const EmptyIcon = isComponentType(view.icon) ? view.icon : null

  const { items, status, creating, error } = useSelector((s) => s[name])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch, fetchAll])

  useEffect(() => {
    if (status === 'failed' && error) toast.error(error)
  }, [status, error])

  const handleCreate = async (payload) => {
    const result = await dispatch(createOne(payload))
    if (createOne.fulfilled.match(result)) {
      toast.success(`${view.title.slice(0, -1)} yaratildi`)
      setModalOpen(false)
      dispatch(fetchAll())
    } else {
      toast.error(result.payload || 'Yaratishda xatolik')
    }
  }

  return (
    <div>
      <PageHeader
        icon={view.icon}
        title={view.title}
        subtitle={view.subtitle}
        action={
          readOnly ? null : (
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              + New {view.title.slice(0, -1)}
            </button>
          )
        }
      />

      {!def.implemented && (
        <div className="alert alert-warning mb-4">
          <span>
            ⚠️ Bu resurs uchun backend endpoint hali yo‘q (<code>{def.basePath}</code>). Ro‘yxat
            bo‘sh ko‘rinadi, lekin UI tayyor.
          </span>
        </div>
      )}

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-0">
          {status === 'loading' ? (
            <div className="grid place-items-center py-20">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="grid place-items-center py-20 text-center">
              <div className="mb-3 opacity-40">
                {EmptyIcon ? <EmptyIcon size={48} /> : <span className="text-5xl">{view.icon}</span>}
              </div>
              <p className="text-base-content/60">Hozircha ma’lumot yo‘q</p>
              {!readOnly && (
                <button className="btn btn-sm btn-primary mt-4" onClick={() => setModalOpen(true)}>
                  Birinchisini yaratish
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>#</th>
                    {view.columns.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, i) => (
                    <tr key={row._id || i} className="hover">
                      <td className="text-base-content/40">{i + 1}</td>
                      {view.columns.map((c) => (
                        <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-base-300 flex items-center justify-between sticky top-0 bg-base-100 z-10">
                <h3 className="text-xl font-bold">
                  New {view.title.slice(0, -1)}
                </h3>
                <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setModalOpen(false)}>
                  ✕
                </button>
              </div>
              <div className="p-6">
                <EntityForm
                  fields={view.formFields}
                  submitting={creating}
                  onSubmit={handleCreate}
                  onCancel={() => setModalOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
