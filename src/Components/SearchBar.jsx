import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setQuery } from '../Redux/Featuers/SearchSlice'

const SearchBar = () => {
    const [text, setText] = useState("")
    const dispatch = useDispatch()

    const submitHandler = (e) => {
        e.preventDefault()
        console.log('form submitted')
        dispatch(setQuery(text))
        setText('')
    }
    return (
        <div>
            <form className='flex p-10 bg-gray-900 gap-4 px-14' onSubmit={submitHandler} >
                <input
                    className='w-full border-2 px-6 py-3 text-xl'
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                    }}
                    required
                    type="text"
                    placeholder="Search Anything..." />
                <button className='active:scale-95 cursor-pointer border-2 px-6 py-3 text-xl rounded' >Search</button>
            </form>
        </div>
    )
}

export default SearchBar