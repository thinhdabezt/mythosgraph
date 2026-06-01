export default async function TraditionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <main className="p-6">Tradition detail: {slug}</main>;
}