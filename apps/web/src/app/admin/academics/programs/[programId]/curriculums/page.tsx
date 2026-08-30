import { redirect } from 'next/navigation';

export default async function CurriculumsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  redirect(`/admin/academics/programs/${programId}`);
}
