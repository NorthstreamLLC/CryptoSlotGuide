export function PagePlaceholder({
  kicker,
  title,
  standfirst,
}: {
  kicker?: string;
  title: string;
  standfirst?: string;
}) {
  return (
    <div className="mx-auto max-w-[1180px] px-10 py-16">
      {kicker && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.09em] text-accent">{kicker}</p>
      )}
      <h1 className="mt-3 max-w-3xl text-[44px] font-extrabold leading-[1.05] tracking-[-0.035em] text-text-primary">
        {title}
      </h1>
      {standfirst && (
        <p className="mt-4 max-w-2xl text-[16.5px] leading-[1.65] text-text-muted">{standfirst}</p>
      )}
      <div className="mt-10 rounded-card border border-dashed border-border-strong bg-surface p-8 text-[14px] text-text-dim">
        Routing skeleton only — this view is wired into the site's IA per{" "}
        <code className="font-mono text-text-dim-2">design/README.md</code>'s routing map, but the
        real page hasn't been built yet.
      </div>
    </div>
  );
}
