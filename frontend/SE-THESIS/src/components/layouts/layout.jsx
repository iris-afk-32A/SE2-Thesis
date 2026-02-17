import { useState, useEffect, useRef} from 'react'
import SearchBar from './searchbar'
import Navbar from './navbar'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  const pageRef = useRef(null);
  return (
    <div className='relative w-screen h-screen font-montserrat bg-[#E4E3E1] grid grid-rows-[auto_1fr_auto] overflow-hidden'>
      <section className="w-full h-fit"><SearchBar /></section>

      <section className='grid grid-cols-[5%_1fr] gap-4 p-4'>
        <Navbar />
        <div className='w-full h-full p-6'>
          <Outlet/>
        </div>
      </section>
    </div>
  )
}
