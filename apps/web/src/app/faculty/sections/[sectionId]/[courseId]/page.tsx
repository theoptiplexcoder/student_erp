import { redirect } from 'next/navigation';

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ sectionId: string; courseId: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/faculty/sections/${resolvedParams.sectionId}/${resolvedParams.courseId}/attendance`);
}
