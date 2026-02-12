'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaBars, FaTimes, FaGlobe, FaSearch, FaUser } from 'react-icons/fa'
import Image from 'next/image'

interface HeaderProps {
  dict: any
  locale: string
}

export default function Header({ dict, locale }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Scroll detection for header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const otherLocale = locale === 'pt' ? 'en' : 'pt'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg'
          : 'bg-transparent backdrop-blur-md'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="relative transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="NomadWay Logo"
                width={160}
                height={45}
                className="h-12 w-auto"
                priority
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white/50 hover:bg-white transition-colors">
              <FaSearch className="text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-gray-700 w-32 focus:w-40 transition-all duration-300"
              />
            </div>

            <Link
              href={`/${locale}`}
              className="relative text-gray-700 hover:text-primary-600 font-semibold transition-colors group"
            >
              {dict.nav.home}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href={`/${locale}/services`}
              className="relative text-gray-700 hover:text-primary-600 font-semibold transition-colors group"
            >
              {dict.nav.services}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="relative text-gray-700 hover:text-primary-600 font-semibold transition-colors group"
            >
              {dict.nav.pricing}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              {dict.nav.contact}
            </Link>

            {/* Language Switcher */}
            <Link
              href={`/${otherLocale}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-600 transition-all"
              title={otherLocale === 'pt' ? 'Português' : 'English'}
            >
              <FaGlobe className="text-base" />
              <span className="text-sm font-bold uppercase">{otherLocale}</span>
            </Link>

            {/* User Account */}
            <Link
              href={`/${locale}/pricing`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary-600 text-primary-600 font-semibold hover:bg-primary-600 hover:text-white transition-all"
            >
              <FaUser size={16} />
              <span className="text-sm">{locale === 'pt' ? 'Entrar' : 'Login'}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors bg-white/50 backdrop-blur-md rounded-lg"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className={`lg:hidden py-6 border-t border-gray-200 transition-all duration-300 ${
              scrolled ? 'bg-white/95 backdrop-blur-lg' : 'bg-white/90 backdrop-blur-md'
            }`}
          >
            <div className="flex flex-col gap-3">
              <Link
                href={`/${locale}`}
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-semibold transition-all rounded-lg"
                onClick={toggleMenu}
              >
                {dict.nav.home}
              </Link>
              <Link
                href={`/${locale}/services`}
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-semibold transition-all rounded-lg"
                onClick={toggleMenu}
              >
                {dict.nav.services}
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-semibold transition-all rounded-lg"
                onClick={toggleMenu}
              >
                {dict.nav.pricing}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="px-4 py-3 text-primary-600 hover:bg-primary-50 font-semibold transition-all rounded-lg"
                onClick={toggleMenu}
              >
                {dict.nav.contact}
              </Link>

              <div className="w-full h-px bg-gray-200 my-2" />

              <Link
                href={`/${otherLocale}`}
                className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 font-semibold transition-all rounded-lg"
                onClick={toggleMenu}
              >
                <FaGlobe />
                <span>{otherLocale === 'pt' ? 'Português' : 'English'}</span>
              </Link>

              <div className="flex gap-3 pt-2">
                <Link
                  href={`/${locale}/pricing`}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all text-center"
                  onClick={toggleMenu}
                >
                  {locale === 'pt' ? 'Entrar' : 'Login'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}