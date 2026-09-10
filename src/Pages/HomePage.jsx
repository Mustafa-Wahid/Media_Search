import { useSelector } from 'react-redux'
import ResultGrid from '../Components/ResultGrid'
import SearchBar from '../Components/SearchBar'
import Tabes from '../Components/Tabes'
import { Link } from 'react-router-dom'

const HomePage = () => {
  const { query } = useSelector((store) => store.Search)
  return (
    <div>
      <SearchBar />
      {query != '' ?
        <div>
          <Tabes /> <ResultGrid />
        </div> : ''}

    </div>
  )
}

export default HomePage