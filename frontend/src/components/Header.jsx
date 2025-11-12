import React, { useEffect, useState } from "react";
import { Link } from 'react-scroll';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

function Header() {


  

    const [toggleMenu,setToggleMenu]=useState(false);

    const navLinks=[
        {href:"about", name:"About"},
        {href:"experience", name:"Courses"},
        {href:"projects", name:"Lms"},
        {href:"contact", name:"Contact"}
    ]

  return (
    <section className="relative w-full flex flex-col md:flex-row justify-center md:justify-around bg-primary/5 dark:bg-primary/85 p-5 md:p-7 md:pb-0 z-50">
      
      {/* Desktop Header */}
      <div className="hidden lg:flex w-auto text-3xl font-poppins font-light text-textBase/75">
        <p>MEA</p>
      </div>

      <div className="hidden md:flex w-auto gap-1 font-light text-textBase/75">
        {navLinks.map((navLink, index) => (
          <Link
            key={index}
            to={navLink.href}
            smooth={true}
            duration={600}
            offset={-70}
            className="cursor-pointer px-4 py-1 font-poppins rounded-xl text-3xl font-light lg:hover:scale-110 transition-all duration-700"
          >
            {navLink.name}
          </Link>
        ))}
      </div>

      

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center w-full px-5 transition-all duration-700">
        <p className="text-3xl font-poppins font-light text-textBase/75">MEA</p>
        <div className="flex justify-center items-center">
          <button onClick={() => setToggleMenu(!toggleMenu)} className="text-white z-50 transition-transform duration-500 ease-in-out">
          {toggleMenu ? (
            <XMarkIcon className="h-6 w-6 stroke-textBase/85 transition-transform duration-700 rotate-180" />
          ) : (
            <Bars3Icon className="h-6 w-6 stroke-textBase/85 transition-transform duration-700" />
          )}
        </button>
        
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`absolute top-[70px] left-3 right-3 md:hidden bg-slate-50/85 dark:bg-neutral-800 index-50 rounded-xl px-5 flex flex-col gap-2 text-xl transition-opacity duration-700 ease-in-out
        ${toggleMenu ? "opacity-100 pointer-events-auto py-2" : "opacity-0 pointer-events-none py-0"}`}
      >
        {navLinks.map((navLink, index) => (
          <Link
            key={index}
            to={navLink.href}
            smooth={true}
            duration={600}
            offset={-70}
            onClick={() => setToggleMenu(false)}
            className="cursor-pointer px-2 py-1 font-poppins rounded-xl text-3xl text-textBase/75 font-light hover:scale-105 transition-all duration-700"
          >
            {navLink.name}
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Header;
