import { useDispatch, useSelector } from 'react-redux'
import { FetchGIF, FetchVideos, FetchPhotos } from '../Api/MediaApi'
import {
  setError,
  setLoading,
  setQuery,
  setResults,
  appendResults,
  setPage,
  setHasMore,
  setLoadingMore,
  setLoadMoreError,
} from '../Redux/Featuers/SearchSlice'
import { useCallback, useEffect, useRef, useState } from 'react'
import ResultCard from './ResultCard'
import MediaModal from './MediaModal'
import { ImageOff, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

const MASONRY_CLASSES = 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 sm:gap-5 w-full px-4 sm:px-10 py-6'

const SKELETON_HEIGHTS = [260, 340, 200, 300, 220, 360, 240, 280, 200, 320]
const PAGE_SIZE = {
  Photos: 30,
  Videos: 80,
  GIF: 100,
}

const ALL_SUB_PAGE_SIZE = 10

async function fetchPage(activeTab, query, page, perPageOverride) {
  if (activeTab === 'All') {
    return fetchAllPage(query, page)
  }

  if (activeTab === 'Photos') {
    const perPage = perPageOverride || PAGE_SIZE.Photos
    const response = await FetchPhotos(query, page, perPage)
    const items = response.results.map((item) => ({
      id: item.id,
      type: 'photo',
      title: item.alt_description,
      thumbnail: item.urls.small,
      src: item.urls.full,
      url: item.links.html,
      author: item.user?.name || null,
    }))
    const hasMore = page < response.total_pages
    return { items, hasMore }
  }

  if (activeTab === 'Videos') {
    const perPage = perPageOverride || PAGE_SIZE.Videos
    const response = await FetchVideos(query, page, perPage)
    const items = response.videos.map((item) => ({
      id: item.id,
      type: 'Video',
      title: item.user.name || 'video',
      thumbnail: item.image,
      src: item.video_files?.[0]?.link,
      url: item.url,
      author: item.user?.name || null,
    }))

    const hasMore = Boolean(response.next_page)
    return { items, hasMore }
  }

  if (activeTab === 'GIF') {
    const perPage = perPageOverride || PAGE_SIZE.GIF
    const offset = (page - 1) * perPage
    const response = await FetchGIF(query, offset, perPage)
    const items = response.data.map((item) => ({
      id: item.id,
      type: 'GIF',
      title: item.title || 'GIF',
      thumbnail: item.images.fixed_width_small.url,
      src: item.images.original.url,
      url: item.url,
      author: item.username || item.user?.display_name || null,
    }))
    const { total_count = 0, count = 0, offset: resOffset = offset } = response.pagination || {}
    const hasMore = resOffset + count < total_count
    return { items, hasMore }
  }

  return { items: [], hasMore: false }
}

async function fetchAllPage(query, page) {
  const settled = await Promise.allSettled([
    fetchPage('Photos', query, page, ALL_SUB_PAGE_SIZE),
    fetchPage('Videos', query, page, ALL_SUB_PAGE_SIZE),
    fetchPage('GIF', query, page, ALL_SUB_PAGE_SIZE),
  ])

  if (settled.every((r) => r.status === 'rejected')) {
    throw settled[0].reason
  }

  const [photos, videos, gifs] = settled.map((r) =>
    r.status === 'fulfilled' ? r.value : { items: [], hasMore: false }
  )

  const merged = []
  const max = Math.max(photos.items.length, videos.items.length, gifs.items.length)
  for (let i = 0; i < max; i++) {
    if (photos.items[i]) merged.push(photos.items[i])
    if (videos.items[i]) merged.push(videos.items[i])
    if (gifs.items[i]) merged.push(gifs.items[i])
  }

  const hasMore = photos.hasMore || videos.hasMore || gifs.hasMore
  return { items: merged, hasMore }
}

const ResultGrid = () => {
  const { results, loading, error, query, activeTab, page, hasMore, loadingMore, loadMoreError } =
    useSelector((store) => store.Search)
  const dispatch = useDispatch();

  const [selectedIndex, setSelectedIndex] = useState(null)

  const fetchingMoreRef = useRef(false)

  const seenIdsRef = useRef(new Set())
  useEffect(() => {
    setSelectedIndex(null)
  }, [query, activeTab])

  const runInitialSearch = useCallback(async () => {
    if (!query) return;
    fetchingMoreRef.current = false

    try {
      dispatch(setLoading());
      const { items, hasMore: more } = await fetchPage(activeTab, query, 1)

      seenIdsRef.current = new Set(items.map((it) => `${it.type}-${it.id}`))
      dispatch(setResults(items));
      dispatch(setPage(1))
      dispatch(setHasMore(more))
    } catch (err) {
      dispatch(setError(err.message || 'Something went wrong while searching.'));
    }
  }, [query, activeTab, dispatch])

  useEffect(() => {
    runInitialSearch();
  }, [runInitialSearch]);

  const loadMore = useCallback(async () => {
    if (fetchingMoreRef.current || !hasMore || loading) return
    fetchingMoreRef.current = true
    dispatch(setLoadingMore(true))

    const nextPage = page + 1
    try {
      const { items, hasMore: more } = await fetchPage(activeTab, query, nextPage)

      const fresh = items.filter((it) => {
        const key = `${it.type}-${it.id}`
        if (seenIdsRef.current.has(key)) return false
        seenIdsRef.current.add(key)
        return true
      })

      dispatch(appendResults(fresh))
      dispatch(setPage(nextPage))
      dispatch(setHasMore(more))
    } catch (err) {
      dispatch(setLoadMoreError(err.message || 'Could not load more results.'))
    } finally {
      fetchingMoreRef.current = false
    }
  }, [activeTab, query, page, hasMore, loading, dispatch])

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center text-center py-20 px-4'>
        <AlertTriangle size={48} className='mb-4 text-red-400 opacity-80' />
        <h2 className='text-xl font-semibold mb-1 text-gray-800 dark:text-white'>Something went wrong</h2>
        <p className='text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6'>{error}</p>
        <button
          type='button'
          onClick={runInitialSearch}
          className='flex items-center gap-2 cursor-pointer active:scale-95 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-full shadow transition'
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={MASONRY_CLASSES}>
        {SKELETON_HEIGHTS.map((h, idx) => (
          <div
            key={idx}
            className='mb-5 break-inside-avoid rounded-2xl bg-gray-200 dark:bg-gray-800 skeleton-shimmer overflow-hidden'
            style={{ height: h }}
          />
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center text-center py-20 px-4 text-gray-500 dark:text-gray-400'>
        <ImageOff size={48} className='mb-4 opacity-60' />
        <h2 className='text-xl font-semibold mb-1 text-gray-800 dark:text-white'>No results found</h2>
        <p className='text-sm'>Try a different search term or switch tabs.</p>
      </div>
    )
  }

  return (
    <>
      <div className={MASONRY_CLASSES}>
        {results.map((item, idx) => (
          <ResultCard
            key={`${item.type}-${item.id}`}
            item={item}
            onPreview={() => setSelectedIndex(idx)}
          />
        ))}

 
        {loadingMore && SKELETON_HEIGHTS.slice(0, 5).map((h, idx) => (
          <div
            key={`more-${idx}`}
            className='mb-5 break-inside-avoid rounded-2xl bg-gray-200 dark:bg-gray-800 skeleton-shimmer overflow-hidden'
            style={{ height: h }}
          />
        ))}
      </div>
      <div className='w-full flex flex-col items-center justify-center py-8 px-4'>
        {hasMore && (
          <button
            type='button'
            onClick={loadMore}
            disabled={loadingMore}
            className='flex items-center gap-2 cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-full shadow transition min-h-[44px]'
          >
            {loadingMore && <Loader2 size={16} className='animate-spin' />}
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        )}

        {loadMoreError && (
          <div className='mt-3 flex flex-col items-center gap-2'>
            <p className='text-sm text-red-500 text-center'>
              Couldn't load more results.
            </p>
            <button
              type='button'
              onClick={loadMore}
              className='flex items-center gap-1.5 text-sm cursor-pointer active:scale-95 bg-white/10 hover:bg-white/20 text-gray-800 dark:text-white px-4 py-1.5 rounded-full transition'
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {!hasMore && (
          <p className='text-sm text-gray-400'>No more results</p>
        )}
      </div>

      {selectedIndex !== null && results[selectedIndex] && (
        <MediaModal
          results={results}
          index={selectedIndex}
          onNavigate={setSelectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  )
}

export default ResultGrid