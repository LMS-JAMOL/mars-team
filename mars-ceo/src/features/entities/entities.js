import { createEntitySlice } from './createEntitySlice'

/**
 * Central registry of every backend resource the CEO dashboard reads.
 *
 * List-response keys are taken from the real routers:
 *   GET /branches -> { branches }
 *   GET /mentors  -> { mentors }
 *   GET /groups   -> { groups }
 *   GET /students -> { students }
 *   GET /payments -> { payments }
 *   GET /audit    -> { logs }
 *
 * `implemented: false` marks resources whose listing is not yet wired on the
 * backend — the page still renders and fails gracefully with a toast.
 */
export const ENTITY_DEFS = {
  branches: { name: 'branches', basePath: '/branches', listKey: 'branches', implemented: true },
  mentors: { name: 'mentors', basePath: '/mentors', listKey: 'mentors', implemented: true },
  groups: { name: 'groups', basePath: '/groups', listKey: 'groups', implemented: true },
  students: { name: 'students', basePath: '/students', listKey: 'students', implemented: true },
  payments: { name: 'payments', basePath: '/payments', listKey: 'payments', implemented: true },
  auditlogs: { name: 'auditlogs', basePath: '/audit', listKey: 'logs', implemented: true },
}

// Build one slice per entity from the registry.
export const entitySlices = Object.fromEntries(
  Object.values(ENTITY_DEFS).map((def) => [def.name, createEntitySlice(def)])
)

// { branches: reducer, mentors: reducer, ... } — spread into configureStore.
export const entityReducers = Object.fromEntries(
  Object.entries(entitySlices).map(([key, slice]) => [key, slice.reducer])
)

// Convenience accessors used by pages: entityThunks('branches').fetchAll
export const entityThunks = (name) => entitySlices[name].thunks
export const entityActions = (name) => entitySlices[name].actions
