'use client'

import { useEffect, useState } from 'react'
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface Testimonial {
  text: string
  name: string
  role: string
  location: string
  rating: number
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        nextSlide()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [currentIndex, isPaused])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) nextSlide()
    if (isRightSwipe) prevSlide()
  }

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Loved by Digital Nomads
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our community says about NomadWay
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onTouchStart={(e) => {
            setTouchStart(e.targetTouches[0].clientX)
            setIsPaused(true)
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => {
            handleTouchEnd()
            setIsPaused(false)
          }}
          onTouchStartCapture={(e) => {
            setTouchStart(e.targetTouches[0].clientX)
          }}
        >
          {/* Main Testimonial Card */}
          <div className="relative">
            {/* Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-3xl blur-xl -z-10" />

            {/* Testimonial Card */}
            <div
              className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 relative overflow-hidden transition-all duration-500"
              style={{
                opacity: 1,
                transform: 'translateX(0)',
              }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 left-6 text-primary-100">
                <FaQuoteLeft size={48} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-xl" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-xl sm:text-2xl text-gray-800 mb-8 leading-relaxed font-medium">
                  "{testimonials[currentIndex].text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {testimonials[currentIndex].name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xl">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {testimonials[currentIndex].role}
                    </div>
                    <div className="text-sm text-primary-600 font-semibold mt-1">
                      {testimonials[currentIndex].location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 z-20"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 z-20"
              aria-label="Next testimonial"
            >
              <FaChevronRight size={20} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-primary-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>

          {/* Card Indicators (Small preview) */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((testimonial, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 hover:scale-110 ${
                  idx === currentIndex ? 'ring-2 ring-primary-600 scale-110' : 'opacity-50'
                }`}
              >
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  {testimonial.name.charAt(0)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}