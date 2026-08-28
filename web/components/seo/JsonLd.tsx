/**
 * Renders one or more schema.org objects (see lib/schema.ts) as
 * <script type="application/ld+json"> tags. Server component — no
 * client JS needed for a static script tag.
 */
export function JsonLd({ data }: { data: object | (object | null | undefined | false)[] }) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean) as object[];
  if (items.length === 0) return null;
  return (
    <>
      {items.map((item, i) => (
        // eslint-disable-next-line react/no-danger
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
    </>
  );
}
