import React, { useState, useCallback, useEffect } from "react";
import { Image, type ImageProps } from "expo-image";
import { coverUrl, sizedMedia } from "@/lib/content";

interface CoverImageProps extends Omit<ImageProps, "source" | "onError"> {
  uri: string | null | undefined;
  storyId?: string;
  /** Requested decode width. Defaults to a home-card size, not the 1024 original. */
  displayWidth?: number;
  /** Bump to remount after a failed or cancelled load. */
  retryKey?: string | number;
}

/**
 * Image wrapper that falls back to coverUrl(storyId) when the primary
 * URI (typically cover_image_url from the API) fails to load.
 * Prevents blank gray boxes when the CDN is slow or returns an error.
 */
export function CoverImage({ uri, storyId, displayWidth = 360, retryKey, ...props }: CoverImageProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
  }, [uri, storyId, retryKey, displayWidth]);

  const candidates: string[] = [];
  const add = (value?: string | null) => {
    const next = value?.trim();
    if (next && !candidates.includes(next)) candidates.push(next);
  };

  if (uri) {
    add(sizedMedia(uri, displayWidth));
    add(uri);
  }
  if (storyId) {
    add(coverUrl(storyId, displayWidth));
    add(coverUrl(storyId));
  }

  const current = candidates[Math.min(step, Math.max(candidates.length - 1, 0))];
  if (!current) return null;

  const handleError = useCallback(() => {
    setStep((n) => (n < candidates.length - 1 ? n + 1 : n));
  }, [candidates.length]);

  return (
    <Image
      {...props}
      key={`${current}:${retryKey ?? ""}`}
      source={{ uri: current }}
      onError={handleError}
      recyclingKey={`${storyId ?? current}:${step}:${retryKey ?? ""}`}
      cachePolicy="memory-disk"
    />
  );
}
