import { getDictionary } from '@/lib/getDictionary';

export default async function TermsPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as any);

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {dict.terms.title}
            </h1>
            <p className="text-xl text-gray-600">
              {params.lang === 'pt'
                ? 'Leia nossos termos de uso antes de começar'
                : 'Read our terms of use before getting started'}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              {dict.terms.sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <div className="space-y-3">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">{dict.terms.lastUpdated}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'pt' },
    { lang: 'en' }
  ];
}