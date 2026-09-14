import { useState } from 'react'
import { MoreVertical, Pencil, Trash2, ImageOff, FolderHeart } from 'lucide-react'

const Thumb = ({ item }) => {
  if (!item) return <div className='w-full h-full bg-white/5' />
  if (item.type === 'Video') {
    return <video className='w-full h-full object-cover' src={item.src} muted />
  }
  return <img className='w-full h-full object-cover' src={item.thumbnail || item.src} alt='' loading='lazy' />
}

const CollectionPreviewCard = ({
  name,
  count,
  thumbnails = [],
  isDefault = false,
  onOpen,
  onRename,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className='group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1'>
      <button type='button' onClick={onOpen} className='block w-full text-left cursor-pointer'>
        {thumbnails.length > 0 ? (
          <div className='grid grid-cols-2 gap-0.5 h-40 bg-black/20'>
            {thumbnails.slice(0, 4).map((t, i) => (
              <div key={i} className={`overflow-hidden ${thumbnails.length === 1 ? 'col-span-2 row-span-2' : ''}`}>
                <Thumb item={t} />
              </div>
            ))}
          </div>
        ) : (
          <div className='h-40 flex flex-col items-center justify-center bg-black/20 text-gray-500'>
            {isDefault ? <FolderHeart size={28} className='mb-1 opacity-60' /> : <ImageOff size={28} className='mb-1 opacity-60' />}
            <span className='text-xs'>Empty collection</span>
          </div>
        )}

        <div className='p-4'>
          <h3 className='text-white font-semibold text-base truncate capitalize'>{name}</h3>
          <p className='text-sm text-gray-400 mt-0.5'>{count} {count === 1 ? 'item' : 'items'}</p>
        </div>
      </button>

      <div className='absolute top-3 right-3 flex items-center gap-2'>
        {!isDefault && (
          <div className='relative'>
            <button
              type='button'
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
              aria-label='More options'
              className='bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 shadow cursor-pointer transition opacity-0 group-hover:opacity-100 focus:opacity-100'
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <button
                  type='button'
                  aria-label='Close menu'
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}
                  className='fixed inset-0 z-30 cursor-default'
                />
                <div
                  onClick={(e) => e.stopPropagation()}
                  className='absolute z-40 right-0 mt-2 w-40 rounded-xl border border-white/10 bg-(--c1) shadow-2xl p-1.5 animate-[mm-scale_0.15s_ease-out]'
                >
                  <button
                    type='button'
                    onClick={() => { setMenuOpen(false); onRename() }}
                    className='flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/5 cursor-pointer'
                  >
                    <Pencil size={14} /> Rename
                  </button>
                  <button
                    type='button'
                    onClick={() => { setMenuOpen(false); onDelete() }}
                    className='flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 cursor-pointer'
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionPreviewCard
