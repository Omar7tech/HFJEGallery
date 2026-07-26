import { Head } from '@inertiajs/react'

export default function Contact() {
  return (
    <>
      <Head title="Contact" />

      <section className="@container w-full px-6 py-16 font-display md:px-12 md:py-24 lg:pl-0 lg:pr-16">
        <h1 className="font-display leading-[1.1] text-ink text-[clamp(2rem,9cqi,4rem)]">
          Let&rsquo;s talk.
        </h1>

        <p className="mt-6 max-w-xl font-bold leading-relaxed text-ink text-base @lg:text-lg">
          Tell us about the space you want to transform. This is placeholder
          content — a second page so the intro curtain can be tested on
          navigation.
        </p>

        <div className="mt-10 max-w-md space-y-4">
          <input
            type="text"
            placeholder="Your name"
            className="w-full border border-ink/15 bg-transparent px-5 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full border border-ink/15 bg-transparent px-5 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
          />
          <textarea
            rows={4}
            placeholder="Tell us about your project"
            className="w-full resize-none border border-ink/15 bg-transparent px-5 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
          />
          <button
            type="button"
            className="rounded-full border border-brand px-10 py-3 text-base font-medium text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
          >
            Send message
          </button>
        </div>
      </section>
    </>
  )
}
