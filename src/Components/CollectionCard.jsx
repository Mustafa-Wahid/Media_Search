import { Download, Share2, Trash2 } from 'lucide-react'
import { toast, Zoom } from 'react-toastify'

/**
 * A single saved-media tile, used inside an opened collection (Favorites or
 * any user collection) — Feature #7: Preview / Remove / Download / Share.
 * Kept as its own component (not duplicated) and reused for every
 * collection's grid, per "reuse existing components instead of duplicating".
 */
const CollectionCard = ({ item, onRemove, onPreview }) => {

  const handleShare = async (e) => {
    e.stopPropagation()
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title || 'Media', url: item.url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(item.url)
        toast.success('Link copied to clipboard', {
          position: 'top-right',
          autoClose: 2000,
          theme: 'dark',
          transition: Zoom,
        })
      }
    } catch {
      // share sheet dismissed or clipboard unavailable, nothing to do
    }
  }

  return (
    <div className='group relative w-full mb-5 break-inside-avoid rounded-2xl overflow-hidden bg-gray-200 shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1'>
      <button
        type='button'
        onClick={onPreview}
        aria-label={`Open preview for ${item.title || item.type}`}
        className='block w-full text-left cursor-pointer'
      >
        {item.type === 'photo' && (
          <img className='w-full h-auto block rounded-2xl' src={item.src} alt={item.title || 'photo'} loading='lazy' />
        )}
        {item.type === 'Video' && (
          <video className='w-full h-auto block rounded-2xl' autoPlay loop muted playsInline src={item.src} />
        )}
        {item.type === 'GIF' && (
          <img className='w-full h-auto block rounded-2xl' src={item.src} alt={item.title || 'GIF'} loading='lazy' />
        )}
      </button>

      <div className='pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 rounded-2xl' />

      <div className='absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200'>
        <a
          href={item.src}
          download
          target='_blank'
          rel='noopener noreferrer'
          onClick={(e) => e.stopPropagation()}
          title='Download'
          aria-label='Download'
          className='bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow cursor-pointer'
        >
          <Download size={16} />
        </a>
        <button
          type='button'
          onClick={handleShare}
          title='Share'
          aria-label='Share'
          className='bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow cursor-pointer'
        >
          <Share2 size={16} />
        </button>
      </div>

      <div id='bottom' className='z-10 flex justify-between gap-3 items-center w-full px-4 py-5 text-white absolute bottom-0'>
        <h2 className='text-lg font-semibold capitalize h-13 overflow-hidden'>{item.title}</h2>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item) }}
          aria-label='Remove from collection'
          title='Remove'
          className='flex items-center gap-1 shrink-0 bg-indigo-600 text-white rounded px-3 py-1.5 font-medium scale-100 hover:scale-105 hover:bg-red-600 transition cursor-pointer'
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default CollectionCard
