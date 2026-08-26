import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PagePlaceholder
      kicker="Live casino"
      title={`Live table: ${slug}`}
    />
  );
}
