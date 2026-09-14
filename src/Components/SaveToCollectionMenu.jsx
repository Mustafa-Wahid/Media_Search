import { Check, Plus } from 'lucide-react'

const SaveToCollectionMenu = ({
  collections,
  isFavorited,
  isInCollection,
  onToggleFavorite,
  onToggleCollection,
  onCreateNew,
  onClose,
  align = 'right',
}) => {
  return (
    <>
      <button
        type='button'
        aria-label='Close menu'
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className='fixed inset-0 z-30 cursor-default'
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute z-40 bottom-full mb-2 ${align === 'right' ? 'right-0' : 'left-0'} w-56 rounded-xl border border-white/10 bg-(--c1) shadow-2xl p-2 animate-[mm-scale_0.15s_ease-out]`}
      >
        <p className='px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400'>
          Save to...
        </p>

        <label className='flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer'>
          <span
            className={`flex items-center justify-center w-4.5 h-4.5 rounded border ${isFavorited ? 'bg-indigo-600 border-indigo-600' : 'border-gray-500'}`}
          >
            {isFavorited && <Check size={12} className='text-white' />}
          </span>
          <input
            type='checkbox'
            checked={isFavorited}
            onChange={onToggleFavorite}
            className='sr-only'
          />
          <span className='text-sm text-white'>Favorites</span>
        </label>

        {collections.map((col) => {
          const checked = isInCollection(col)
          return (
            <label
              key={col.id}
              className='flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer'
            >
              <span
                className={`flex items-center justify-center w-4.5 h-4.5 rounded border ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-500'}`}
              >
                {checked && <Check size={12} className='text-white' />}
              </span>
              <input
                type='checkbox'
                checked={checked}
                onChange={() => onToggleCollection(col)}
                className='sr-only'
              />
              <span className='text-sm text-white truncate'>{col.name}</span>
            </label>
          )
        })}

        <button
          type='button'
          onClick={onCreateNew}
          className='flex items-center gap-2 w-full px-2 py-2 mt-1 rounded-lg text-sm text-indigo-300 hover:bg-white/5 cursor-pointer'
        >
          <Plus size={14} /> New Collection
        </button>
      </div>
    </>
  )
}

export default SaveToCollectionMenu
