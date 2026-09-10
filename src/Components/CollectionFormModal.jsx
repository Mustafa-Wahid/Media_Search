import { useState } from 'react'
import { X } from 'lucide-react'

/**
 * Shared modal for both "Create Collection" and "Rename Collection".
 * mode: 'create' | 'rename'
 * existingNames: names of the user's OTHER collections, for duplicate checks
 *   (already lowercased + trimmed by the caller, current name excluded when renaming).
 */
const CollectionFormModal = ({
  mode = 'create',
  initialName = '',
  initialDescription = '',
  existingNames = [],
  onSubmit,
  onClose,
}) => {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [error, setError] = useState('')

  const isRename = mode === 'rename'

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      setError('Collection name cannot be empty.')
      return
    }
    if (existingNames.includes(trimmed.toLowerCase())) {
      setError('A collection with this name already exists.')
      return
    }

    onSubmit({ name: trimmed, description: description.trim() })
  }

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-[mm-fade_0.2s_ease-out]'
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className='w-full max-w-md bg-(--c1) border border-white/10 rounded-2xl shadow-2xl p-6 animate-[mm-scale_0.2s_ease-out]'
      >
        <div className='flex items-center justify-between mb-5'>
          <h3 className='text-lg font-semibold text-white'>
            {isRename ? 'Rename collection' : 'New collection'}
          </h3>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close'
            className='p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer'
          >
            <X size={18} />
          </button>
        </div>

        <label className='block text-sm font-medium text-gray-300 mb-1.5' htmlFor='collection-name'>
          Collection name
        </label>
        <input
          id='collection-name'
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (error) setError('')
          }}
          placeholder='e.g. Nature'
          className='w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 mb-1'
        />
        {error && <p className='text-sm text-red-400 mb-3'>{error}</p>}

        {!isRename && (
          <>
            <label className='block text-sm font-medium text-gray-300 mb-1.5 mt-4' htmlFor='collection-description'>
              Description <span className='text-gray-500 font-normal'>(optional)</span>
            </label>
            <textarea
              id='collection-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='What is this collection for?'
              rows={2}
              className='w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </>
        )}

        <div className='flex justify-end gap-3 mt-6'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 rounded-lg text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 transition cursor-pointer active:scale-95'
          >
            Cancel
          </button>
          <button
            type='submit'
            className='px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer active:scale-95'
          >
            {isRename ? 'Save changes' : 'Create Collection'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CollectionFormModal
