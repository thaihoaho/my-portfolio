'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-10 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold tracking-wide">
          MyPortfolio
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-purple-800 text-3xl focus:outline-none"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            ☰
          </button>
        </div>

        {/* Navigation links */}
        <div
          className={`md:flex md:flex-row md:items-center gap-14 text-base font-medium transition-all duration-300 ease-in-out ${
            isOpen ? 'flex flex-col mt-6 gap-4' : 'hidden'
          }`}
        >
          <Link href="/" className="text-gray-100 hover:text-purple-800 transition duration-200">Home</Link>
          <Link href="/about" className="text-gray-100 hover:text-purple-800 transition duration-200">About</Link>
          <Link href="/projects" className="text-gray-100 hover:text-purple-800 transition duration-200">Projects</Link>
          <Link href="/contact" className="text-gray-100 hover:text-purple-800 transition duration-200">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
