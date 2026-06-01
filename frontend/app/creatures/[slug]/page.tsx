export default async function CreatureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <main className="p-6">Creature detail: {slug}</main>;
}