"use client";

import { useEffect, useRef, useState } from "react";

export type CompareMode = "overlay" | "split";

export interface CompareState {
  /** Current image object-URL, or null. Lives only in memory. */
  imageUrl: string | null;
  /** Set the image from a File (revokes the previous URL). */
  setImage: (file: File | null) => void;
  /** Clear and revoke the current image. */
  clear: () => void;
  mode: CompareMode;
  setMode: (m: CompareMode) => void;
  /** 0..1 — opacity of the overlay image in "overlay" mode. */
  opacity: number;
  setOpacity: (n: number) => void;
  /** 0..1 — x position of the split divider in "split" mode. */
  split: number;
  setSplit: (n: number) => void;
  /** When true, the screenshot is shown on the right of the divider instead of the left. */
  inverted: boolean;
  setInverted: (b: boolean) => void;
  /** When true, overlay positions absolute and ignores pointer events. */
  enabled: boolean;
}

/**
 * State for the compare overlay. The image is held as a blob URL and
 * never persisted — closing the panel or picking a new image revokes the
 * previous URL immediately.
 */
export function useCompare(): CompareState {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<CompareMode>("overlay");
  const [opacity, setOpacity] = useState(0.5);
  const [split, setSplit] = useState(0.5);
  const [inverted, setInverted] = useState(false);
  const urlRef = useRef<string | null>(null);

  function setImage(file: File | null) {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setImageUrl(url);
    } else {
      setImageUrl(null);
    }
  }

  function clear() {
    setImage(null);
  }

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  return {
    imageUrl,
    setImage,
    clear,
    mode,
    setMode,
    opacity,
    setOpacity,
    split,
    setSplit,
    inverted,
    setInverted,
    enabled: imageUrl !== null,
  };
}

/**
 * Per-screen compare state, keyed by screen key. Same semantics as
 * `useCompare` (in-memory blob URLs, revoked on swap/unmount) but lifted
 * into a record so `PageShell` can render N phones each with their own
 * overlay while letting the inspector bind to whichever one is selected.
 */
export function useCompareMap(keys: string[]): Record<string, CompareState> {
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
  const [modes, setModes] = useState<Record<string, CompareMode>>({});
  const [opacities, setOpacities] = useState<Record<string, number>>({});
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [inverteds, setInverteds] = useState<Record<string, boolean>>({});
  const urlRefs = useRef<Record<string, string | null>>({});

  useEffect(() => {
    const refs = urlRefs.current;
    return () => {
      for (const url of Object.values(refs)) {
        if (url) URL.revokeObjectURL(url);
      }
    };
  }, []);

  const map: Record<string, CompareState> = {};
  for (const k of keys) {
    const imageUrl = imageUrls[k] ?? null;
    const setImage = (file: File | null) => {
      const prev = urlRefs.current[k];
      if (prev) URL.revokeObjectURL(prev);
      if (file) {
        const url = URL.createObjectURL(file);
        urlRefs.current[k] = url;
        setImageUrls((s) => ({ ...s, [k]: url }));
      } else {
        urlRefs.current[k] = null;
        setImageUrls((s) => ({ ...s, [k]: null }));
      }
    };
    map[k] = {
      imageUrl,
      setImage,
      clear: () => setImage(null),
      mode: modes[k] ?? "overlay",
      setMode: (m) => setModes((s) => ({ ...s, [k]: m })),
      opacity: opacities[k] ?? 0.5,
      setOpacity: (n) => setOpacities((s) => ({ ...s, [k]: n })),
      split: splits[k] ?? 0.5,
      setSplit: (n) => setSplits((s) => ({ ...s, [k]: n })),
      inverted: inverteds[k] ?? false,
      setInverted: (b) => setInverteds((s) => ({ ...s, [k]: b })),
      enabled: imageUrl !== null,
    };
  }
  return map;
}
