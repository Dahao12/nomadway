import Link from 'next/link'
import Image from 'next/image'
import { FaEnvelope, FaWhatsapp, FaLinkedin, FaInstagram } from 'react-icons/fa'

interface FooterProps {
  dict: any
  locale: string
}

export default function Footer({ dict, locale }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/nomadway/logo.png"
              alt="NomadWay"
              width={140}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="text-sm leading-relaxed">
              {dict.footer.tagline}
            </p>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="https://instagram.com/nomadwaydigital"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-sm hover:text-white transition-colors"
                >
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/services`}
                  className="text-sm hover:text-white transition-colors"
                >
                  {dict.nav.services}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-sm hover:text-white transition-colors"
                >
                  {dict.nav.pricing}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-sm hover:text-white transition-colors"
                >
                  {dict.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <FaEnvelope className="text-primary-500" />
                <a
                  href={`mailto:${dict.contact.info.email}`}
                  className="hover:text-white transition-colors"
                >
                  {dict.contact.info.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <FaWhatsapp className="text-primary-500" />
                <a
                  href={`https://wa.me/${dict.contact.info.whatsapp.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {dict.contact.info.whatsapp}
                </a>
              </li>
              <li className="text-sm">
                {dict.contact.info.hours}
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm hover:text-white transition-colors"
                >
                  {dict.footer.links.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-sm hover:text-white transition-colors"
                >
                  {dict.footer.links.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-800 pt-8 pb-4">
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {dict.footer.disclaimer}
          </p>
          <p className="text-xs text-gray-500 text-center">
            {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
