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
  const [useFallback, setUseFallback] = useState(false);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    setUseFallback(false);
    setRetries(0);
  }, [uri, storyId, retryKey, displayWidth]);

  const handleError = useCallback(() => {
    if (!useFallback && storyId) {
      setUseFallback(true);
      return;
    }
    if (retries < 2) {
      setRetries((n) => n + 1);
    }
  }, [useFallback, storyId, retries]);

  const sizedUri = uri ? sizedMedia(uri, displayWidth) : undefined;
  const fallbackUri = storyId ? coverUrl(storyId, displayWidth) : undefined;

  const source =
    useFallback && fallbackUri
      ? { uri: fallbackUri }
      : sizedUri
        ? { uri: sizedUri }
        : fallbackUri
          ? { uri: fallbackUri }
          : undefined;

  if (!source) return null;

  return (
    <Image
      {...props}
      key={`${source.uri}:${retries}:${retryKey ?? ""}`}
      source={source}
      onError={handleError}
      recyclingKey={`${storyId ?? source.uri}:${retries}:${retryKey ?? ""}`}
      cachePolicy="memory-disk"
    />
  );
}
