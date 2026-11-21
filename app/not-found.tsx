import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center bg-charcoal pt-32">
      <div className="container-luxe">
        <p className="eyebrow">404</p>
        <h1 className="mt-5 text-6xl md:text-8xl">This floor doesn&apos;t exist.</h1>
        <p className="mt-6 max-w-md text-ivory/60">The page you were looking for may have moved. Let us take you somewhere more beautiful.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/" className="btn-gold">
            Return home
          </Link>
          <Link href="/virtual-tour" className="btn-ghost">
            Start virtual tour
          </Link>
        </div>
      </div>
    </section>
  );
}
