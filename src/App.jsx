import { Route, Routes } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import CollectionPage from './Pages/CollectionPage'
import Navbar from './Components/Navbar'
import { ToastContainer, Zoom } from 'react-toastify';
import { useTheme } from './context/ThemeContext.jsx'



const App = () => {
  const { theme } = useTheme()

  return (
    <> <div className='min-h-screen bg-(--bg-app) text-(--text-main) w-full overflow-x-hidden theme-transition'>
      <Navbar />

      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/collection' element={<CollectionPage />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={1800}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme={theme === 'light' ? 'light' : 'dark'}
        transition={Zoom}
      />
    </div>
    </>
  )
}

export default App