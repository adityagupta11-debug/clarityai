import { Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "New Interview" };

export default function NewInterviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-400" />
          New Interview
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload a recording or record directly in your browser.
        </p>
      </div>

      <Card className="glass border-white/8">
        <CardHeader>
          <CardTitle className="text-base">Upload or Record</CardTitle>
          <CardDescription>
            FileUploader and AudioRecorder components — built in Phase 2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-white/15 p-12 text-center text-muted-foreground text-sm">
            Coming in Phase 2
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
