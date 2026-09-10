import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Image as ImageIcon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()

  const linkClass = (path) =>
    `text-sm sm:text-base font-medium active:scale-95 transition rounded-full px-3.5 sm:px-4 py-2 cursor-pointer ${
      pathname === path
        ? 'bg-(--c4) text-(--c1)'
        : 'bg-(--bg-input) text-(--text-main) hover:bg-(--c4) hover:text-(--c1)'
    }`

  return (
    <div className='sticky top-0 z-40 flex flex-wrap gap-3 justify-between items-center py-3 sm:py-4 px-4 sm:px-6 md:px-10 bg-(--c2) border-b border-(--border-subtle) theme-transition'>
      <Link to='/' className='flex items-center gap-2 font-semibold text-lg sm:text-xl text-(--text-main)'>
        <ImageIcon size={22} className='text-(--accent) shrink-0' />
        <span>MediaSearch</span>
      </Link>

      <div className='flex gap-2 sm:gap-3 items-center'>
        <Link className={linkClass('/')} to='/'>Search</Link>
        <Link className={linkClass('/collection')} to='/collection'>Collection</Link>

        <button
          type='button'
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className='flex items-center justify-center w-11 h-11 shrink-0 rounded-full bg-(--bg-input) text-(--text-main) hover:bg-(--c4) hover:text-(--c1) active:scale-90 transition cursor-pointer'
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  )
}

export default Navbar