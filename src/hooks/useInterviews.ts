"use client";

import { useEffect, useState } from "react";
import { subscribeToUserInterviews } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { type Interview } from "@/types/interview";

export function useInterviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setInterviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToUserInterviews(
      user.uid,
      (data) => {
        setInterviews(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const completedInterviews = interviews.filter((i) => i.status === "completed");

  const avgScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.overallScore ?? 0), 0) /
            completedInterviews.filter((i) => i.overallScore !== null).length
        )
      : null;

  const totalMinutes = Math.round(
    interviews.reduce((sum, i) => sum + i.recordingDuration, 0) / 60
  );

  return { interviews, loading, error, avgScore, totalMinutes };
}
