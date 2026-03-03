import Script from "next/script";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <main className="mx-auto w-full max-w-4xl rounded-lg bg-white p-8 shadow-sm">
        <header className="mb-10 border-b pb-6">
          <h1 className="text-4xl font-bold text-gray-900">The Daily Build</h1>
          <p className="mt-2 text-gray-600">
            Thoughts on software, product engineering, and practical AI.
          </p>
        </header>

        <section className="space-y-8">
          <article className="rounded-md border p-6">
            <p className="mb-2 text-sm text-gray-500">March 3, 2026</p>
            <h2 className="text-2xl font-semibold text-gray-900">
              Building Reliable AI Features for the Web
            </h2>
            <p className="mt-3 text-gray-700">
              AI-powered experiences are now a standard part of modern apps, but reliability
              still depends on simple fundamentals: clear user intent, good observability, and
              graceful fallbacks.
            </p>
            <p className="mt-3 text-gray-700">
              Teams that ship quickly and safely are usually the ones that treat AI integrations
              as product systems, not just model calls.
            </p>
          </article>

          <article className="rounded-md border p-6">
            <p className="mb-2 text-sm text-gray-500">February 24, 2026</p>
            <h2 className="text-2xl font-semibold text-gray-900">
              Why Performance Budgets Still Matter
            </h2>
            <p className="mt-3 text-gray-700">
              Performance budgets help teams make trade-offs early. They keep pages readable,
              responsive, and resilient across different devices and network conditions.
            </p>
            <p className="mt-3 text-gray-700">
              Even with strong tooling, a clear budget remains one of the best ways to prevent
              regression over time.
            </p>
          </article>
        </section>

        <footer className="mt-10 border-t pt-6 text-sm text-gray-500">
          © 2026 The Daily Build
        </footer>
      </main>

      <Script
        src="/ai-tracker.js"
        strategy="afterInteractive"
        data-auto-init="true"
        data-endpoint="/api/track-ai"
        data-debug="true"
      />
    </div>
  );
}
