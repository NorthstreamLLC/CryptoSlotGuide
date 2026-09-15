export function DisclosureStrip() {
  return (
    <div className="bg-section border-b border-border">
      <p className="mx-auto max-w-[1400px] px-4 md:px-10 py-1.5 text-[11px] font-mono tracking-[0.02em] text-text-dim">
        Advertiser disclosure — we may earn a commission from operators listed here. It never changes what a review says.{" "}
        <a href="/how-we-rate" className="text-text-dim-2 underline underline-offset-2 hover:text-accent">
          how we source information
        </a>
      </p>
    </div>
  );
}
