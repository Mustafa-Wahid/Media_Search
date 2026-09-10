import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addedToast,
  addCollection,
  removeCollection,
  removeToast,
  addMediaToUserCollection,
  removeMediaFromUserCollection,
  createUserCollection,
  collectionToast,
  getMediaKey,
} from '../Redux/Featuers/CollectionSlice';
import { ExternalLink, Download, Bookmark, BookmarkCheck } from 'lucide-react';
import SaveToCollectionMenu from './SaveToCollectionMenu';
import CollectionFormModal from './CollectionFormModal';

const ResultCard = ({ item, onPreview }) => {

  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);

  const collectionItems = useSelector((state) => state.collection.items);
  const collections = useSelector((state) => state.collection.collections);

  const isFavorited = collectionItems.some((c) => c.id === item.id);
  const isInCollection = (col) => col.mediaIds.includes(getMediaKey(item));

  // Original single-click Save behavior, kept 100% intact for anyone with
  // no named collections yet (i.e. everyone before this feature existed).
  const addToCollection = (item) => {
    dispatch(addCollection(item));
    dispatch(addedToast());
  }

  const handleSaveClick = () => {
    if (collections.length === 0) {
      addToCollection(item);
      return;
    }
    setMenuOpen((open) => !open);
  }

  const toggleFavorite = () => {
    if (isFavorited) {
      dispatch(removeCollection(item.id));
      dispatch(removeToast());
    } else {
      dispatch(addCollection(item));
      dispatch(addedToast());
    }
  }

  const toggleCollection = (col) => {
    if (isInCollection(col)) {
      dispatch(removeMediaFromUserCollection({ collectionId: col.id, mediaKey: getMediaKey(item) }));
      dispatch(collectionToast({ message: `Removed from ${col.name}`, variant: 'error' }));
    } else {
      dispatch(addMediaToUserCollection({ collectionId: col.id, item }));
      dispatch(collectionToast({ message: `Saved to ${col.name}` }));
    }
  }

  const handleCreateCollection = ({ name, description }) => {
    const action = dispatch(createUserCollection({ name, description }));
    dispatch(addMediaToUserCollection({ collectionId: action.payload.id, item }));
    dispatch(collectionToast({ message: `Created "${name}" and saved` }));
    setCreatingCollection(false);
  }

  return (
    <div className='group relative w-full mb-5 break-inside-avoid rounded-2xl overflow-hidden bg-gray-200 shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1'>
      {/* skeleton placeholder shown until the media finishes loading, prevents layout jump */}
      {!loaded && (
        <div className='absolute inset-0 animate-pulse bg-gray-300 rounded-2xl' />
      )}

      {/* clicking the media opens the in-app preview modal (Feature #2) */}
      <button
        type='button'
        onClick={onPreview}
        aria-label={`Open preview for ${item.title || item.type}`}
        className='block w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-2xl'
      >
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
      </button>

      {/* subtle hover overlay, purely visual, does not block clicks */}
      <div className='pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 rounded-2xl' />

      {/* view-original-on-source / download actions: always visible on touch devices, fade in on hover for desktop */}
      <div className='absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200'>
        <a
          href={item.url}
          target='_blank'
          rel='noopener noreferrer'
          title='View source'
          aria-label='View source'
          className='bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow cursor-pointer'
        >
          <ExternalLink size={16} />
        </a>
        <a
          href={item.src}
          download
          target='_blank'
          rel='noopener noreferrer'
          title='Download'
          aria-label='Download'
          className='bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow cursor-pointer'
        >
          <Download size={16} />
        </a>
      </div>

      <div id='bottom' className='z-10 flex justify-between gap-3 items-center w-full px-4 py-5 text-white absolute bottom-0'>
        <h2 className='text-lg font-semibold capitalize h-13 overflow-hidden '>{item.title}</h2>
        <div className='relative shrink-0'>
          <button
            onClick={handleSaveClick}
            aria-label='Save to collection'
            className={`flex items-center gap-1 shrink-0 rounded px-3 py-1 font-medium scale-100 hover:scale-105 cursor-pointer transition ${isFavorited ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600 text-white'}`}>
            {isFavorited ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} Save
          </button>

          {menuOpen && (
            <SaveToCollectionMenu
              collections={collections}
              isFavorited={isFavorited}
              isInCollection={isInCollection}
              onToggleFavorite={() => { toggleFavorite(); }}
              onToggleCollection={toggleCollection}
              onCreateNew={() => { setMenuOpen(false); setCreatingCollection(true); }}
              onClose={() => setMenuOpen(false)}
            />
          )}
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

export default ResultCard
