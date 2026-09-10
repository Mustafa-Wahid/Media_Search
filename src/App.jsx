import { Route, Routes } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import CollectionPage from './Pages/CollectionPage'
import Navbar from './Components/Navbar'
import { ToastContainer, Zoom } from 'react-toastify';



const App = () => {
  return (
    <> <div className='min-h-screen bg-gray-950 text-white  w-full'>
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
        theme="dark"
        transition={Zoom}
      />
    </div>
    </>
  )
}

export default App