import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast, Zoom } from 'react-toastify'
import {
  X, Heart, Download, Share2, ChevronLeft, ChevronRight, ImageOff, ExternalLink
} from 'lucide-react'
import {
  addCollection, removeCollection, addedToast, removeToast,
  addMediaToUserCollection, removeMediaFromUserCollection,
  createUserCollection, collectionToast, getMediaKey,
} from '../Redux/Featuers/CollectionSlice'
import SaveToCollectionMenu from './SaveToCollectionMenu'
import CollectionFormModal from './CollectionFormModal'

// which API each media type actually comes from, used only to label the source honestly
const SOURCE_LABEL = {
  photo: 'Unsplash',
  Video: 'Pexels',
  GIF: 'GIPHY',
}

/**
 * Renders the actual image/gif/video for the modal, with its own skeleton
 * and error fallback. Kept as a separate component (mounted with key={item.id}
 * from the parent) so switching items via Prev/Next/related-media remounts it
 * and its loaded/error state resets naturally, with no effect needed.
 */
const MediaFrame = ({ item }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center text-gray-400 py-16'>
        <ImageOff size={40} className='mb-3 opacity-70' />
        <p className='text-sm'>This media couldn&apos;t be loaded.</p>
      </div>
    )
  }

  return (
    <>
      {!loaded && <div className='absolute inset-0 bg-gray-800 animate-pulse' />}
      {(item.type === 'photo' || item.type === 'GIF') && (
        <img
          src={item.src}
          alt={item.title || item.type}
          className={`max-h-[70vh] w-auto max-w-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
      {item.type === 'Video' && (
        <video
          src={item.src}
          controls
          autoPlay
          className={`max-h-[70vh] w-auto max-w-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoadedData={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </>
  )
}

/**
 * Full preview modal for a single media item.
 * Receives the already-loaded `results` array + the index of the item to show,
 * so Prev/Next and "Related media" reuse data that's already in memory
 * (no extra API calls, no new Redux state).
 */
const MediaModal = ({ results, index, onNavigate, onClose }) => {
  const item = results[index]
  const dispatch = useDispatch()
  const collectionItems = useSelector((state) => state.collection.items)
  const collections = useSelector((state) => state.collection.collections)
  const [menuOpen, setMenuOpen] = useState(false)
  const [creatingCollection, setCreatingCollection] = useState(false)

  const isSaved = !!item && collectionItems.some((c) => c.id === item.id)
  const isInCollection = (col) => !!item && col.mediaIds.includes(getMediaKey(item))
  const hasPrev = index > 0
  const hasNext = index < results.length - 1

  // prevent the page behind the modal from scrolling while it's open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  // Escape closes, Left/Right navigate
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1)
      if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [index, hasPrev, hasNext, onClose, onNavigate])

  if (!item) return null

  const toggleSave = () => {
    if (isSaved) {
      dispatch(removeCollection(item.id))
      dispatch(removeToast())
    } else {
      dispatch(addCollection(item))
      dispatch(addedToast())
    }
  }

  // Same single-click behavior as before when there are no named
  // collections yet; otherwise opens the "Save to..." picker.
  const handleSaveClick = () => {
    if (collections.length === 0) {
      toggleSave()
      return
    }
    setMenuOpen((open) => !open)
  }

  const toggleCollection = (col) => {
    if (isInCollection(col)) {
      dispatch(removeMediaFromUserCollection({ collectionId: col.id, mediaKey: getMediaKey(item) }))
      dispatch(collectionToast({ message: `Removed from ${col.name}`, variant: 'error' }))
    } else {
      dispatch(addMediaToUserCollection({ collectionId: col.id, item }))
      dispatch(collectionToast({ message: `Saved to ${col.name}` }))
    }
  }

  const handleCreateCollection = ({ name, description }) => {
    const action = dispatch(createUserCollection({ name, description }))
    dispatch(addMediaToUserCollection({ collectionId: action.payload.id, item }))
    dispatch(collectionToast({ message: `Created "${name}" and saved` }))
    setCreatingCollection(false)
  }

  // uses the native Web Share API where available, otherwise falls back to
  // copying the link \u2014 both are real browser behaviors, no backend involved
  const handleShare = async () => {
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
      // share sheet dismissed or clipboard unavailable \u2014 nothing to do
    }
  }

  const related = results
    .map((r, i) => ({ ...r, _i: i }))
    .filter((r) => r._i !== index)
    .slice(0, 6)

  const sourceLabel = SOURCE_LABEL[item.type]

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm sm:p-6 animate-[mm-fade_0.2s_ease-out]'
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl bg-white sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-[mm-scale_0.2s_ease-out]'
      >
        {/* header */}
        <div className='flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-gray-200'>
          <div className='flex items-center gap-2 min-w-0'>
            <span className='shrink-0 text-xs font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 px-2 py-1 rounded'>
              {item.type}
            </span>
            {item.title ? (
              <h2 className='text-sm sm:text-base font-medium text-gray-800 truncate capitalize'>{item.title}</h2>
            ) : null}
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close preview'
            className='shrink-0 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
          >
            <X size={20} />
          </button>
        </div>

        {/* body */}
        <div className='flex-1 overflow-y-auto flex flex-col lg:flex-row'>
          {/* media area */}
          <div className='relative flex-1 flex items-center justify-center bg-gray-950 min-h-[40vh] lg:min-h-[60vh]'>
            {hasPrev && (
              <button
                type='button'
                onClick={() => onNavigate(index - 1)}
                aria-label='Previous media'
                className='absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {hasNext && (
              <button
                type='button'
                onClick={() => onNavigate(index + 1)}
                aria-label='Next media'
                className='absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* keyed on item.id so navigating to a new item remounts this and naturally
                resets its own loaded/error state, instead of syncing it via an effect */}
            <MediaFrame key={item.id} item={item} />
          </div>

          {/* info + actions panel */}
          <div className='w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 sm:p-6 flex flex-col gap-5'>
            {/* action bar */}
            <div className='flex items-center gap-2'>
              <div className='relative flex-1'>
                <button
                  type='button'
                  onClick={handleSaveClick}
                  aria-label={isSaved ? 'Remove from collection' : 'Save to collection'}
                  className={`w-full flex items-center justify-center gap-2 rounded px-3 py-2 font-medium cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isSaved ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                {menuOpen && (
                  <SaveToCollectionMenu
                    collections={collections}
                    isFavorited={isSaved}
                    isInCollection={isInCollection}
                    onToggleFavorite={toggleSave}
                    onToggleCollection={toggleCollection}
                    onCreateNew={() => { setMenuOpen(false); setCreatingCollection(true) }}
                    onClose={() => setMenuOpen(false)}
                    align='left'
                  />
                )}
              </div>
              <a
                href={item.src}
                download
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Download media'
                title='Download'
                className='flex items-center justify-center rounded px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
              >
                <Download size={16} />
              </a>
              <button
                type='button'
                onClick={handleShare}
                aria-label='Share media'
                title='Share'
                className='flex items-center justify-center rounded px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* media info \u2014 only fields that actually came back from the API are rendered */}
            <div className='text-sm text-gray-600 flex flex-col gap-2'>
              {item.title && (
                <div><span className='font-semibold text-gray-800'>Title: </span>{item.title}</div>
              )}
              <div><span className='font-semibold text-gray-800'>Type: </span>{item.type}</div>
              {item.author && (
                <div><span className='font-semibold text-gray-800'>Author: </span>{item.author}</div>
              )}
              {sourceLabel && (
                <div><span className='font-semibold text-gray-800'>Source: </span>{sourceLabel}</div>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 w-fit'
                >
                  View original <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* related media, pulled from the results already loaded in this search \u2014 no extra requests */}
            {related.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-gray-800 mb-2'>Related media</h3>
                <div className='grid grid-cols-3 gap-2'>
                  {related.map((r) => (
                    <button
                      type='button'
                      key={`${r.type}-${r.id}`}
                      onClick={() => onNavigate(r._i)}
                      aria-label={`Preview ${r.title || r.type}`}
                      className='aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
                    >
                      <img
                        src={r.thumbnail || r.src}
                        alt={r.title || r.type}
                        className='w-full h-full object-cover'
                        loading='lazy'
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {creatingCollection && (
        <CollectionFormModal
          mode='create'
          existingNames={collections.map((c) => c.name.toLowerCase())}
          onSubmit={handleCreateCollection}
          onClose={() => setCreatingCollection(false)}
        />
      )}
    </div>
  )
}

export default MediaModal
