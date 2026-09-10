import { useDispatch, useSelector } from "react-redux"
import { setActiveTab } from "../Redux/Featuers/SearchSlice"

const Tabes = () => {
    const Tabs = ['All', 'Photos', 'Videos', 'GIF']
    const dispatch = useDispatch()
    const activetab = useSelector((state) => state.Search.activeTab)

    return (
        <div className='flex gap-3 sm:gap-10 px-4 sm:px-10 py-4 sm:py-10 overflow-x-auto'>
            {
                Tabs.map(function (elem, idx) {
                    return <button
                        onClick={() => {
                            dispatch(setActiveTab(elem))
                        }}
                        className={`shrink-0 ${activetab == elem ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'} cursor-pointer active:scale-95 hover:opacity-90 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded uppercase transition min-h-[40px]`}
                        key={idx}>
                        {elem}
                    </button>
                })
            }
        </div>
    )
}

export default Tabes