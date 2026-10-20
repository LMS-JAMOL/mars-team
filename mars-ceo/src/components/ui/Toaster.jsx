import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

/**
 * Theme-aware react-toastify container.
 *
 * daisyUI ships a dark theme (`night`) and a light theme (`winter`); we mirror
 * that choice onto react-toastify so notifications never clash with the UI.
 */
export default function Toaster() {
  const theme = useSelector((s) => s.ui.theme)

  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      newestOnTop
      closeOnClick
      pauseOnHover
      pauseOnFocusLoss={false}
      draggable
      limit={3}
      theme={theme === 'winter' ? 'light' : 'dark'}
    />
  )
}
