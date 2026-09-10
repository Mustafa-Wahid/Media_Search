import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearCollection,
  removeCollection,
  removeToast,
  createUserCollection,
  renameUserCollection,
  deleteUserCollection,
  removeMediaFromUserCollection,
  collectionToast,
  getMediaKey,
} from '../Redux/Featuers/CollectionSlice'
import CollectionPreviewCard from '../Components/CollectionPreviewCard'
import CollectionFormModal from '../Components/CollectionFormModal'
import ConfirmDialog from '../Components/ConfirmDialog'
import SavedMediaGrid from '../Components/SavedMediaGrid'
import {
  Plus, Search, ArrowLeft, Image as ImageIcon, FolderOpen, Sparkles, Trash2, ChevronDown,
} from 'lucide-react'

const FAVORITES_ID = '__favorites__'
const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000 // 7 days, for the "recently added" stat

const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'most', label: 'Most items' },
  { value: 'least', label: 'Least items' },
]

const CollectionPage = () => {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.collection.items)
  const collections = useSelector((state) => state.collection.collections)
  const savedAt = useSelector((state) => state.collection.savedAt)

  const [openedId, setOpenedId] = useState(null) // FAVORITES_ID | collection.id | null
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('updated')
  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState(null) // collection object being renamed
  const [deleting, setDeleting] = useState(null) // collection object being deleted
  const [clearingFavorites, setClearingFavorites] = useState(false)
  // captured once at mount rather than read directly during render, so the
  // "recently added" stat below stays a pure calculation of props/state
  const [now] = useState(() => Date.now())

  // ---- build the unified list of "collections" shown on the dashboard ----
  // Favorites is derived directly from `items` (never duplicated), exactly
  // as it already worked before this feature existed.
  const favoritesUpdatedAt = useMemo(() => {
    const times = items.map((i) => savedAt[getMediaKey(i)] || 0)
    return times.length ? Math.max(...times) : 0
  }, [items, savedAt])

  const allEntries = useMemo(() => {
    const favorites = {
      id: FAVORITES_ID,
      name: 'Favorites',
      isDefault: true,
      media: items,
      count: items.length,
      updatedAt: favoritesUpdatedAt,
    }
    const userEntries = collections.map((col) => ({
      id: col.id,
      name: col.name,
      isDefault: false,
      media: col.mediaIds
        .map((key) => items.find((i) => getMediaKey(i) === key))
        .filter(Boolean),
      count: col.mediaIds.length,
      updatedAt: col.updatedAt,
    }))
    return [favorites, ...userEntries]
  }, [items, collections, favoritesUpdatedAt])

  const visibleEntries = useMemo(() => {
    let list = allEntries
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q))

    const sorted = [...list]
    switch (sort) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'most':
        sorted.sort((a, b) => b.count - a.count)
        break
      case 'least':
        sorted.sort((a, b) => a.count - b.count)
        break
      default: // 'updated'
        sorted.sort((a, b) => b.updatedAt - a.updatedAt)
    }
    return sorted
  }, [allEntries, search, sort])

  const opened = allEntries.find((c) => c.id === openedId) || null

  // ---- stats ----
  const totalSavedMedia = items.length
  const totalCollections = collections.length + 1 // + Favorites
  const recentlyAdded = useMemo(() => {
    const cutoff = now - RECENT_WINDOW_MS
    return Object.values(savedAt).filter((t) => t >= cutoff).length
  }, [savedAt, now])

  const hasNothingAtAll = items.length === 0 && collections.length === 0

  // ---- handlers ----
  const handleCreate = ({ name, description }) => {
    dispatch(createUserCollection({ name, description }))
    dispatch(collectionToast({ message: `Collection "${name}" created` }))
    setCreating(false)
  }

  const handleRenameSubmit = ({ name }) => {
    dispatch(renameUserCollection({ id: renaming.id, name }))
    dispatch(collectionToast({ message: 'Collection renamed' }))
    setRenaming(null)
  }

  const confirmDelete = () => {
    dispatch(deleteUserCollection(deleting.id))
    dispatch(collectionToast({ message: `Deleted "${deleting.name}"`, variant: 'error' }))
    if (openedId === deleting.id) setOpenedId(null)
    setDeleting(null)
  }

  const handleRemoveMedia = (item) => {
    if (openedId === FAVORITES_ID) {
      dispatch(removeCollection(item.id))
      dispatch(removeToast())
    } else {
      dispatch(removeMediaFromUserCollection({ collectionId: openedId, mediaKey: getMediaKey(item) }))
      dispatch(collectionToast({ message: 'Removed from collection', variant: 'error' }))
    }
  }

  const confirmClearFavorites = () => {
    dispatch(clearCollection())
    setClearingFavorites(false)
  }

  // ================= DETAIL VIEW =================
  if (opened) {
    return (
      <div className='overflow-auto px-4 sm:px-10 py-6'>
        <button
          type='button'
          onClick={() => setOpenedId(null)}
          className='flex items-center gap-1.5 text-sm text-gray-300 hover:text-white mb-5 cursor-pointer transition'
        >
          <ArrowLeft size={16} /> Back to Collections
        </button>

        <div className='flex flex-wrap items-center justify-between gap-3 mb-6'>
          <div>
            <h2 className='text-2xl font-semibold text-white capitalize'>{opened.name}</h2>
            <p className='text-sm text-gray-400 mt-1'>{opened.count} {opened.count === 1 ? 'item' : 'items'}</p>
          </div>
          {opened.isDefault && opened.count > 0 && (
            <button
              onClick={() => setClearingFavorites(true)}
              className='flex items-center gap-1.5 transition bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-lg text-sm font-medium active:scale-95 cursor-pointer'
            >
              <Trash2 size={15} /> Clear Collection
            </button>
          )}
        </div>

        <SavedMediaGrid
          items={opened.media}
          onRemove={handleRemoveMedia}
          emptyTitle={opened.isDefault ? 'Your Favorites is empty' : 'This collection is empty'}
          emptySubtitle='Save media from your searches to see it here.'
        />

        {clearingFavorites && (
          <ConfirmDialog
            title='Clear Favorites?'
            message='This removes every saved item from Favorites. This cannot be undone.'
            confirmLabel='Clear'
            onConfirm={confirmClearFavorites}
            onCancel={() => setClearingFavorites(false)}
          />
        )}
      </div>
    )
  }

  // ================= DASHBOARD =================
  return (
    <div className='overflow-auto px-4 sm:px-10 py-6'>
      <div className='flex flex-wrap items-start justify-between gap-4 mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-semibold text-white'>Collections</h1>
          <p className='text-gray-400 mt-1'>Organize your saved images, GIFs and videos.</p>

          <div className='flex flex-wrap gap-6 mt-4'>
            <div className='flex items-center gap-2 text-sm text-gray-300'>
              <ImageIcon size={16} className='text-indigo-400' />
              <span className='font-semibold text-white'>{totalSavedMedia}</span> saved media
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-300'>
              <FolderOpen size={16} className='text-indigo-400' />
              <span className='font-semibold text-white'>{totalCollections}</span> collections
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-300'>
              <Sparkles size={16} className='text-indigo-400' />
              <span className='font-semibold text-white'>{recentlyAdded}</span> added recently
            </div>
          </div>
        </div>

        <button
          onClick={() => setCreating(true)}
          className='flex items-center gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700 transition px-5 py-2.5 rounded-lg text-sm font-medium active:scale-95 cursor-pointer'
        >
          <Plus size={16} /> New Collection
        </button>
      </div>

      {hasNothingAtAll ? (
        <div className='flex flex-col items-center justify-center text-center py-24 px-4'>
          <FolderOpen size={52} className='mb-4 text-indigo-400 opacity-70' />
          <h2 className='text-xl font-semibold text-white mb-1'>Build your collection</h2>
          <p className='text-sm text-gray-400 mb-6 max-w-sm'>Save media from your searches and organize it here.</p>
          <button
            onClick={() => setCreating(true)}
            className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition px-5 py-2.5 rounded-lg text-sm font-medium active:scale-95 cursor-pointer'
          >
            <Plus size={16} /> Create your first collection
          </button>
        </div>
      ) : (
        <>
          <div className='flex flex-wrap gap-3 mb-6'>
            <div className='relative flex-1 min-w-[220px] max-w-sm'>
              <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search collections...'
                className='w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>

            <div className='relative'>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className='appearance-none rounded-lg border border-white/15 bg-white/5 pl-3 pr-9 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className='bg-(--c1)'>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none' />
            </div>
          </div>

          {visibleEntries.length === 0 ? (
            <p className='text-center text-gray-400 py-16'>No collections found</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
              {visibleEntries.map((entry) => (
                <CollectionPreviewCard
                  key={entry.id}
                  name={entry.name}
                  count={entry.count}
                  thumbnails={entry.media.slice(-4).reverse()}
                  isDefault={entry.isDefault}
                  onOpen={() => setOpenedId(entry.id)}
                  onRename={() => setRenaming(collections.find((c) => c.id === entry.id))}
                  onDelete={() => setDeleting(collections.find((c) => c.id === entry.id))}
                />
              ))}
            </div>
          )}
        </>
      )}

      {creating && (
        <CollectionFormModal
          mode='create'
          existingNames={collections.map((c) => c.name.toLowerCase())}
          onSubmit={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}

      {renaming && (
        <CollectionFormModal
          mode='rename'
          initialName={renaming.name}
          existingNames={collections.filter((c) => c.id !== renaming.id).map((c) => c.name.toLowerCase())}
          onSubmit={handleRenameSubmit}
          onClose={() => setRenaming(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title='Delete this collection?'
          message={`"${deleting.name}" will be removed. The media inside stays safe in Favorites.`}
          confirmLabel='Delete'
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

export default CollectionPage
