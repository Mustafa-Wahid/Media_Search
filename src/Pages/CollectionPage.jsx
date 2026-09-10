import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import CollectionCard from '../Components/CollectionCard';
import { clearCollection } from '../Redux/Featuers/CollectionSlice';

const CollectionPage = () => {
  const dispatch = useDispatch();
  const AllclearCollection = () => {
    dispatch(clearCollection());
  }

  const collection = useSelector((state) => state.collection.items);

  return (
    <>
      <div className='overflow-auto px-10 py-6'>
        {collection.length > 0 ?<div className='flex justify-between mb-6'>
          <h2 className='text-2xl font-medium '>
            Your Collection</h2>
          <button
            onClick={() => {
              AllclearCollection()
            }}
            className='transition bg-red-600 px-8 py-3 font-lg rounded text-base active:scale-95 cursor-pointer'>Clear Collection</button>
        </div> :  <h2 className='text-2xl text-center font-medium '>
            Your Collection is Empty</h2>}
        <div className='flex justify-start flex-wrap gap-5 w-full '>
          {collection.map((item, idx) => {
            return <div key={idx}>
              <CollectionCard item={item} />
            </div>
          })}
        </div>
      </div>
      {/* <div>
        <Link className='text-lg bg-amber-500  rounded px-4 py-1' to='/'>Search</Link>
      </div> */}
    </>
  )
}

export default CollectionPage