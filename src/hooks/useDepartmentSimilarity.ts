import { useEffect, useMemo, useRef, useState } from "react";
import { cosineSimilarity } from "../modules/math";

export type ClipDepartmentItem = {
  id: number;
  description: string;
};

export type SimilarityScore = {
  id: number;
  score: number;
};

export function useDepartmentSimilarity(
  items: ClipDepartmentItem[],
  currentId: number | null,
  topN = 6,
) {
  const [embeddingById, setEmbeddingById] = useState<Record<number, number[]> | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const itemsKey = useMemo(
    () => items.map((i) => `${i.id}:${i.description}`).join("|"),
    [items],
  );

  useEffect(() => {
    if (itemsRef.current.length === 0) {
      setEmbeddingById(null);
      setReady(false);
      return;
    }

    setEmbeddingById(null);
    setReady(false);
    setProgress(0);
    setError(null);

    workerRef.current = new Worker(new URL("../workers/search.worker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, data } = e.data as { type: string; data: unknown };

      switch (type) {
        case "progress": {
          const msg = data as { status?: string; progress?: number };
          if (msg?.status === "progress_total" && typeof msg.progress === "number") {
            setProgress(Math.min(100, Math.round(msg.progress)));
          } else if (msg?.status === "ready") {
            setReady(true);
          }
          break;
        }
        case "text_embeddings_ready":
          setEmbeddingById(data as Record<number, number[]>);
          setReady(true);
          setProgress(100);
          break;
        case "error":
          setError(typeof data === "string" ? data : "Worker error");
          setReady(true);
          break;
        default:
          break;
      }
    };

    workerRef.current.postMessage({ type: "init", data: itemsRef.current });

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [itemsKey]);

  const rankedSimilar = useMemo((): SimilarityScore[] => {
    if (!embeddingById || currentId == null) return [];
    const base = embeddingById[currentId];
    if (!base) return [];

    const scores: SimilarityScore[] = [];
    for (const item of items) {
      if (item.id === currentId) continue;
      const emb = embeddingById[item.id];
      if (!emb) continue;
      scores.push({ id: item.id, score: cosineSimilarity(base, emb) });
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topN);
  }, [embeddingById, currentId, items, topN]);

  return {
    ready,
    progress,
    error,
    rankedSimilar,
    hasEmbeddings: Boolean(embeddingById),
  };
}
