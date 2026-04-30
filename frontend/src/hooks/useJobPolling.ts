import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getJob } from "@/api/jobs";
import type { Job } from "@/lib/types";

export function useJobPolling(jobId: number | null, onComplete?: (job: Job) => void) {
  const [completed, setCompleted] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const query = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJob(jobId!),
    enabled: jobId !== null && !completed,
    refetchInterval: (query) => {
      if (query.state.data?.status === "completed" || query.state.data?.status === "failed") {
        return false;
      }
      return 1500;
    },
  });

  useEffect(() => {
    if (query.data && (query.data.status === "completed" || query.data.status === "failed")) {
      setCompleted(true);
      onCompleteRef.current?.(query.data);
    }
  }, [query.data]);

  return query;
}
