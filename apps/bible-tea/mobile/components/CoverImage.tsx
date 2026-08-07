import React, { useState, useCallback, useEffect } from "react";
import { Image, type ImageProps } from "expo-image";
import { coverUrl } from "@/lib/content";

interface CoverImageProps extends Omit<ImageProps, "source" | "onError"> {
  uri: string | null | undefined;
  storyId?: string;
}

/**
 * Image wrapper that falls back to coverUrl(storyId) when the primary
 * URI (typically cover_image_url from the API) fails to load.
 * Prevents blank gray boxes when the CDN is slow or returns an error.
 */
export function CoverImage({ uri, storyId, ...props }: CoverImageProps) {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [uri]);

  const handleError = useCallback(() => {
    if (!useFallback && storyId) {
      setUseFallback(true);
    }
  }, [useFallback, storyId]);

  const fallbackUri = storyId ? coverUrl(storyId) : undefined;

  const source =
    useFallback && fallbackUri
      ? { uri: fallbackUri }
      : uri
        ? { uri }
        : fallbackUri
          ? { uri: fallbackUri }
          : undefined;

  if (!source) return null;

  return (
    <Image
      {...props}
      source={source}
      onError={handleError}
      recyclingKey={source.uri}
      cachePolicy="memory-disk"
    />
  );
}
