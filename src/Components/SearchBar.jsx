import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Search as SearchIcon } from 'lucide-react'
import { setQuery } from '../Redux/Featuers/SearchSlice'

const SearchBar = () => {
    const [text, setText] = useState("")
    const dispatch = useDispatch()

    const submitHandler = (e) => {
        e.preventDefault()
        const trimmed = text.trim()
        if (!trimmed) return
        dispatch(setQuery(trimmed))
        setText('')
    }
    return (
        <div className='bg-(--bg-panel) theme-transition'>
            <form
                className='flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 p-4 sm:p-8 md:p-10 max-w-5xl mx-auto'
                onSubmit={submitHandler}
            >
                <div className='relative flex-1'>
                    <SearchIcon
                        size={18}
                        className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-faint)'
                    />
                    <input
                        className='w-full rounded-full border border-(--border-subtle) bg-(--bg-input) pl-11 pr-4 py-3 text-base sm:text-lg text-(--text-main) placeholder:text-(--text-faint) outline-none focus:ring-2 focus:ring-indigo-500 transition'
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                        }}
                        required
                        type="text"
                        placeholder="Search Anything..." />
                </div>
                <button
                    type='submit'
                    className='w-full sm:w-auto shrink-0 active:scale-95 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-base sm:text-lg font-medium rounded-full shadow transition'
                >
                    Search
                </button>
            </form>
        </div>
    )
}

export default SearchBar