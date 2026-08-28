import type { Metadata } from 'next';

export const revalidate = 900;

interface Deal {
  slug: string;
  name: string;
  price: number;
  original_price: number;
  discount_percent: number;
  retailer: string;
  url: string;
  image_url?: string;
  in_stock: boolean;
}

async function getDeals(): Promise<Deal[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/v1/deals`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Today\'s Best Deals — BuyWhere AI',
  description:
    'Find the best deals and discounts across retailers. Compare prices and save on top products.',
  alternates: { canonical: '/deals' },
};

export default async function DealsPage() {
  const deals = await getDeals();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: "Today's Best Deals",
    description:
      'Find the best deals and discounts across retailers.',
    url: '/deals',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-blue-800 mb-4">
              Today&apos;s Best Deals
            </h1>
            <p className="text-lg text-gray-600">
              Compare prices and find discounts across retailers.
            </p>
          </header>

          {deals.length > 0 ? (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                  <article
                    key={deal.slug}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {deal.image_url && (
                      <img
                        src={deal.image_url}
                        alt={deal.name}
                        className="h-48 w-full object-contain bg-gray-50 p-4"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {deal.retailer}
                        </span>
                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded">
                          -{deal.discount_percent}%
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">
                        {deal.name}
                      </h2>
                      <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-2xl font-bold text-green-600">
                          ${deal.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          ${deal.original_price.toFixed(2)}
                        </span>
                      </div>
                      <a
                        href={deal.url}
                        className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Deal
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="flex flex-col items-center justify-center py-16">
              {/* Illustration container */}
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                  />
                </svg>
              </div>

              {/* Heading and explanation */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                No deals available right now
              </h2>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                We're always hunting for the best discounts. Check back soon or browse popular categories while you wait.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="/categories/electronics"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Electronics
                </a>
                <a
                  href="/search"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors"
                >
                  Search Products
                </a>
              </div>

              {/* Deal alert signup (optional future feature) */}
              <p className="text-sm text-gray-400">
                Want to be notified when deals drop?{' '}
                <a href="/notifications" className="text-blue-600 hover:underline">
                  Sign up for alerts
                </a>
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
