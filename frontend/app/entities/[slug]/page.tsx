export default async function EntityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <main className="p-6">Entity detail: {slug}</main>;
}