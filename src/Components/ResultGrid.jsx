import { useDispatch, useSelector } from 'react-redux'
import { FetchGIF, FetchVideos, FetchPhotos } from '../Api/MediaApi'
import { setError, setLoading, setQuery, setResults } from '../Redux/Featuers/SearchSlice'
import { useEffect } from 'react'
import ResultCard from './ResultCard'
import { ImageOff } from 'lucide-react'

// masonry column classes shared by the skeleton and the real grid, kept in one place
const MASONRY_CLASSES = 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 sm:gap-5 w-full px-4 sm:px-10 py-6'

// varied heights so the loading skeleton mimics a real masonry layout instead of uniform boxes
const SKELETON_HEIGHTS = [260, 340, 200, 300, 220, 360, 240, 280, 200, 320]

const ResultGrid = () => {
  const { results, loading, error, query, activeTab } = useSelector((store) => store.Search)
  const dispatch = useDispatch();

  useEffect(() => {
    if (!query) return;

    const getData = async () => {
      try {
        dispatch(setLoading());
        let data = [];

        if (activeTab === 'Photos') {
          let response = await FetchPhotos(query);
          data = response.results.map((item) => ({
            id: item.id,
            type: 'photo',
            title: item.alt_description,
            thumbnail: item.urls.small,
            src: item.urls.full,
            url: item.links.html
          }))
        }

        if (activeTab === 'Videos') {
          let response = await FetchVideos(query);
          data = response.videos.map((item) => ({
            id: item.id,
            type: 'Video',
            title: item.user.name || 'video',
            thumbnail: item.image,
            src: item.video_files?.[0]?.link,
            url: item.url
          }));
        }


        if (activeTab === 'GIF') {
          let response = await FetchGIF(query);

          data = response.data.map((item) => ({
            id: item.id,
            type: 'GIF',
            title: item.title || 'GIF',
            thumbnail: item.images.fixed_width_small.url,
            src: item.images.original.url,
            url: item.url
          }));
        }

        dispatch(setResults(data));

      } catch (err) {
        dispatch(setError(err.message));
      }
      // console.log(data);
    };

    getData();
  }, [query, activeTab, dispatch]);

  if (error) return <h1>Error</h1>

  if (loading) {
    return (
      <div className={MASONRY_CLASSES}>
        {SKELETON_HEIGHTS.map((h, idx) => (
          <div
            key={idx}
            className='mb-5 break-inside-avoid rounded-2xl bg-gray-200 animate-pulse'
            style={{ height: h }}
          />
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center text-center py-20 px-4 text-gray-500'>
        <ImageOff size={48} className='mb-4 opacity-60' />
        <h2 className='text-xl font-semibold mb-1'>No results found</h2>
        <p className='text-sm'>Try a different search term or switch tabs.</p>
      </div>
    )
  }

  return (
    <div className={MASONRY_CLASSES}>
      {results.map((item) => (
        <ResultCard key={`${item.type}-${item.id}`} item={item} />
      ))}
    </div>
  )
}

export default ResultGrid