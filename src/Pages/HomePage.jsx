import { useSelector } from 'react-redux'
import ResultGrid from '../Components/ResultGrid'
import SearchBar from '../Components/SearchBar'
import Tabes from '../Components/Tabes'
import { Search as SearchIcon } from 'lucide-react'

const HomePage = () => {
  const { query } = useSelector((store) => store.Search)
  return (
    <div>
      <SearchBar />
      {query != '' ?
        <div>
          <Tabes /> <ResultGrid />
        </div> :
        <div className='flex flex-col items-center justify-center text-center py-16 sm:py-24 px-4 text-(--text-muted)'>
          <SearchIcon size={44} className='mb-4 opacity-60 text-(--accent)' />
          <h2 className='text-lg sm:text-xl font-semibold mb-1 text-(--text-main)'>Start exploring</h2>
          <p className='text-sm max-w-xs'>Search for photos, videos and GIFs above to get started.</p>
        </div>}

    </div>
  )
}

export default HomePage