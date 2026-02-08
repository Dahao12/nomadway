'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaBars, FaTimes, FaGlobe } from 'react-icons/fa'
import Image from 'next/image'

interface HeaderProps {
  dict: any
  locale: string
}

export default function Header({ dict, locale }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const otherLocale = locale === 'pt' ? 'en' : 'pt'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <Image
              src="/nomadway/logo.png"
              alt="NomadWay Logo"
              width={140}
              height={40}
              className="h-10 w-auto transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href={`/${locale}`}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {dict.nav.home}
            </Link>
            <Link
              href={`/${locale}/services`}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {dict.nav.services}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {dict.nav.pricing}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
            >
              {dict.nav.contact}
            </Link>
            
            {/* Language Switcher */}
            <Link
              href={`/${otherLocale}`}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              title={otherLocale === 'pt' ? 'Português' : 'English'}
            >
              <FaGlobe className="text-lg" />
              <span className="text-sm font-medium uppercase">{otherLocale}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <Link
                href={`/${locale}`}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                onClick={toggleMenu}
              >
                {dict.nav.home}
              </Link>
              <Link
                href={`/${locale}/services`}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                onClick={toggleMenu}
              >
                {dict.nav.services}
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                onClick={toggleMenu}
              >
                {dict.nav.pricing}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                onClick={toggleMenu}
              >
                {dict.nav.contact}
              </Link>
              <Link
                href={`/${otherLocale}`}
                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors py-2"
                onClick={toggleMenu}
              >
                <FaGlobe />
                <span className="font-medium">{otherLocale === 'pt' ? 'Português' : 'English'}</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
