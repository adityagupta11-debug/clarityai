export const metadata = { title: "Interview Detail" };

export default function InterviewDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Interview {params.id}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Status tracker and transcript viewer — built in Phase 3.
      </p>
    </div>
  );
}
