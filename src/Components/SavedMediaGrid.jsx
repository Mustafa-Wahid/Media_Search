import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import CollectionCard from './CollectionCard'
import MediaModal from './MediaModal'

const MASONRY_CLASSES = 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 sm:gap-5 w-full'

const SavedMediaGrid = ({ items, onRemove, emptyTitle = 'No media yet', emptySubtitle = 'Save something from a search to see it here.' }) => {
  const [selectedIndex, setSelectedIndex] = useState(null)

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center text-center py-20 px-4 text-gray-400'>
        <ImageOff size={48} className='mb-4 opacity-60' />
        <h2 className='text-xl font-semibold mb-1 text-white'>{emptyTitle}</h2>
        <p className='text-sm'>{emptySubtitle}</p>
      </div>
    )
  }

  return (
    <>
      <div className={MASONRY_CLASSES}>
        {items.map((item, idx) => (
          <CollectionCard
            key={`${item.type}-${item.id}`}
            item={item}
            onRemove={onRemove}
            onPreview={() => setSelectedIndex(idx)}
          />
        ))}
      </div>

      {selectedIndex !== null && items[selectedIndex] && (
        <MediaModal
          results={items}
          index={selectedIndex}
          onNavigate={setSelectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  )
}

export default SavedMediaGrid
