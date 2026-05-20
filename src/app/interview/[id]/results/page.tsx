export const metadata = { title: "Analysis Results" };

export default function ResultsPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Results — Interview {params.id}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Full analysis dashboard — built in Phase 5.
      </p>
    </div>
  );
}
