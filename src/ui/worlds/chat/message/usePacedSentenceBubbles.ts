import { useEffect, useRef, useState } from 'react';

export const MIN_SENTENCE_BUBBLE_INTERVAL_MS = 1100;

export function sentenceBubbleRevealDelay(visibleCount: number, elapsedMs: number) {
  if (visibleCount === 0) return 0;
  return Math.max(0, MIN_SENTENCE_BUBBLE_INTERVAL_MS - Math.max(0, elapsedMs));
}

export function usePacedSentenceBubbleCount(args: {
  enabled: boolean;
  isStreaming: boolean;
  targetCount: number;
}) {
  const pacingEngagedRef = useRef(args.isStreaming);
  const lastRevealAtRef = useRef(Date.now());
  const [visibleCount, setVisibleCount] = useState(() => (
    args.isStreaming ? Math.min(1, args.targetCount) : args.targetCount
  ));

  useEffect(() => {
    if (!args.enabled) {
      setVisibleCount(0);
      return;
    }
    if (args.isStreaming) pacingEngagedRef.current = true;
    if (!pacingEngagedRef.current) {
      setVisibleCount(args.targetCount);
      return;
    }
    if (visibleCount > args.targetCount) {
      setVisibleCount(args.targetCount);
      return;
    }
    if (visibleCount >= args.targetCount) return;

    const delay = sentenceBubbleRevealDelay(visibleCount, Date.now() - lastRevealAtRef.current);
    const timer = window.setTimeout(() => {
      lastRevealAtRef.current = Date.now();
      setVisibleCount((current) => Math.min(current + 1, args.targetCount));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [args.enabled, args.isStreaming, args.targetCount, visibleCount]);

  return Math.min(visibleCount, args.targetCount);
}
