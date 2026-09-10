import { useDispatch } from 'react-redux'
import { removeCollection, removeToast } from '../Redux/Featuers/CollectionSlice'

const CollectionCard = ({ item }) => {
  const dispatch = useDispatch()

  const removefromeCollection = (item) => {
    dispatch(removeCollection(item.id));
    dispatch(removeToast())
  }

  return (
    <div className='w-[17vw] relative h-70 bg-gray-200 rounded-2xl'>
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        {item.type === 'photo' ? <img className='w-full h-full object-cover object-center rounded-2xl' src={item.src} /> : ''}
        {item.type === 'Video' ? <video className='w-full h-full object-cover object-center rounded-2xl' autoPlay loop muted src={item.src} /> : ''}
        {item.type === 'GIF' ? <img className='w-full h-full object-cover object-center rounded-2xl' src={item.src} /> : ''}
      </a>

      <div id='bottom' className='flex justify-between gap-3 items-center w-full px-4 py-5 text-white absolute bottom-0'>
        <h2 className='text-lg font-semibold capitalize h-13 overflow-hidden '>{item.title}</h2>
        <button
          onClick={() => [
            removefromeCollection(item),
            console.log('remove collection'),
          ]}
          className='bg-indigo-600 text-white rounded px-3 py-1 font-medium scale-100 hover:scale-105 cursor-pointer'>remove</button>
      </div>
    </div>
  )
}

export default CollectionCard