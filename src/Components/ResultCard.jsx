import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addedToast, addCollection } from '../Redux/Featuers/CollectionSlice';
import { Eye, Download, Bookmark } from 'lucide-react';

const ResultCard = ({ item }) => {

  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);

  const addToCollection = (item) => {
    dispatch(addCollection(item));
    console.log('hui hui');

    dispatch(addedToast());
  }
  return (
    <div className='group relative w-full mb-5 break-inside-avoid rounded-2xl overflow-hidden bg-gray-200 shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1'>
      {/* skeleton placeholder shown until the media finishes loading, prevents layout jump */}
      {!loaded && (
        <div className='absolute inset-0 animate-pulse bg-gray-300 rounded-2xl' />
      )}

      <a href={item.url} target="_blank" rel="noopener noreferrer" className='block'>
        {item.type === 'photo' ? (
          <img
            className={`w-full h-auto block rounded-2xl transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            src={item.src}
            alt={item.title || 'photo'}
            loading='lazy'
            decoding='async'
            onLoad={() => setLoaded(true)}
          />
        ) : ''}
        {item.type === 'Video' ? (
          <video
            className={`w-full h-auto block rounded-2xl transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            autoPlay loop muted playsInline
            src={item.src}
            onLoadedData={() => setLoaded(true)}
          />
        ) : ''}
        {item.type === 'GIF' ? (
          <img
            className={`w-full h-auto block rounded-2xl transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            src={item.src}
            alt={item.title || 'GIF'}
            loading='lazy'
            decoding='async'
            onLoad={() => setLoaded(true)}
          />
        ) : ''}
      </a>

      {/* subtle hover overlay, purely visual, does not block clicks */}
      <div className='pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 rounded-2xl' />

      {/* preview / download actions: always visible on touch devices, fade in on hover for desktop */}
      <div className='absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200'>
        <a
          href={item.url}
          target='_blank'
          rel='noopener noreferrer'
          title='Preview'
          className='bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow cursor-pointer'
        >
          <Eye size={16} />
        </a>
        <a
          href={item.src}
          download
          target='_blank'
          rel='noopener noreferrer'
          title='Download'
          className='bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow cursor-pointer'
        >
          <Download size={16} />
        </a>
      </div>

      <div id='bottom' className='z-10 flex justify-between gap-3 items-center w-full px-4 py-5 text-white absolute bottom-0'>
        <h2 className='text-lg font-semibold capitalize h-13 overflow-hidden '>{item.title}</h2>
        <button
          onClick={() => addToCollection(item)}
          className='flex items-center gap-1 shrink-0 bg-indigo-600 text-white rounded px-3 py-1 font-medium scale-100 hover:scale-105 cursor-pointer'>
          <Bookmark size={14} /> Save
        </button>
      </div>
    </div>
  )
}

export default ResultCard