const dictionaries = {
  pt: () => import('../dictionaries/pt.json').then((module) => module.default),
  en: () => import('../dictionaries/en.json').then((module) => module.default),
}

export const getDictionary = async (locale: 'pt' | 'en') =>
  dictionaries[locale]()
