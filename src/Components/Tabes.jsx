import { useDispatch, useSelector } from "react-redux"
import { setActiveTab } from "../Redux/Featuers/SearchSlice"

const Tabes = () => {
    const Tabs = ['Photos', 'Videos', 'GIF']
    const dispatch = useDispatch()
    const activetab = useSelector((state) => state.Search.activeTab)

    return (
        <div className='flex gap-10 p-10'>
            {
                Tabs.map(function (elem, idx) {
                    return <button
                        onClick={() => {
                            dispatch(setActiveTab(elem))
                        }}
                        className={`${activetab == elem ? 'bg-green-500' : 'bg-amber-700'} bg-amber-700 cursor-pointer active:scale-95 px-4 py-2 rounded uppercase`}
                        key={idx}>
                        {elem}
                    </button>
                })
            }
        </div>
    )
}

export default Tabes