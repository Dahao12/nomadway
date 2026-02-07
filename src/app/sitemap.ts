import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nomadway.com'
  const languages = ['pt', 'en']
  const pages = ['', '/services', '/pricing', '/contact']

  const routes: MetadataRoute.Sitemap = []

  languages.forEach((lang) => {
    pages.forEach((page) => {
      routes.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.8,
      } as MetadataRoute.Sitemap[number])
    })
  })

  return routes
}
