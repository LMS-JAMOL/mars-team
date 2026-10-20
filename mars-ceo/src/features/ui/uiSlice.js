import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'night',
    sidebarCollapsed: false,
  },
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload
    },
    toggleTheme(state) {
      state.theme = state.theme === 'night' ? 'winter' : 'night'
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
  },
})

export const { setTheme, toggleTheme, toggleSidebar } = uiSlice.actions
export default uiSlice.reducer
