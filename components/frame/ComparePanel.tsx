"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CollapseHeader } from "./LiveTweaks";
import type { CompareState } from "./useCompare";

/**
 * Floating control panel for the compare overlay. Mounted next to the
 * State/Tweaks panels. Lets the designer drop or paste an iOS screenshot,
 * pick between Overlay and Split modes, and tune opacity / split position.
 */
export function ComparePanel({ compare }: { compare: CompareState }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Allow paste-anywhere when the panel is mounted.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) compare.setImage(file);
          return;
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [compare]);

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) compare.setImage(file);
  }

  return (
    <div className="flex w-full flex-col">
      <CollapseHeader
        title="Compare"
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        trailingWhenCollapsed={
          compare.imageUrl && (
            <span className="truncate text-body-label text-foreground">
              {compare.mode === "overlay"
                ? `Overlay · ${Math.round(compare.opacity * 100)}%`
                : `Split · ${Math.round(compare.split * 100)}%`}
            </span>
          )
        }
      />

      {!collapsed && (
        <div className="flex flex-col gap-s p-s">
          {!compare.imageUrl ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-xxs rounded-sm border border-dashed px-s py-m text-center text-body-label",
                dragOver
                  ? "border-brand-mediumBlue bg-brand-lightBlue/30 text-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              <span>Drop, paste, or pick a screenshot</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-sm bg-brand-mediumBlue px-s py-xxs text-body-label font-medium text-brand-offWhite"
              >
                Pick file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) compare.setImage(f);
                  e.target.value = "";
                }}
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-xxs">
                <ModeChip
                  active={compare.mode === "overlay"}
                  onClick={() => compare.setMode("overlay")}
                  label="Overlay"
                />
                <ModeChip
                  active={compare.mode === "split"}
                  onClick={() => compare.setMode("split")}
                  label="Split"
                />
                <button
                  type="button"
                  onClick={() => compare.clear()}
                  className="ml-auto rounded-sm border border-border bg-card px-s py-xxs text-body-label text-foreground"
                  aria-label="Clear screenshot"
                >
                  Clear
                </button>
              </div>

              {compare.mode === "overlay" ? (
                <Slider
                  label="Opacity"
                  value={compare.opacity}
                  onChange={compare.setOpacity}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
              ) : (
                <>
                  <Slider
                    label="Split"
                    value={compare.split}
                    onChange={compare.setSplit}
                    format={(v) => `${Math.round(v * 100)}%`}
                  />
                  <button
                    type="button"
                    onClick={() => compare.setInverted(!compare.inverted)}
                    className="rounded-sm border border-border bg-card px-s py-xxs text-body-label text-foreground"
                  >
                    {compare.inverted
                      ? "Canvas / Image  ⇄  Image / Canvas"
                      : "Image / Canvas  ⇄  Canvas / Image"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ModeChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm px-s py-xxs text-body-label font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-card text-foreground hover:bg-foreground/5",
      )}
    >
      {label}
    </button>
  );
}

function Slider({
  label,
  value,
  onChange,
  format,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  format: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-xxs">
      <span className="flex items-center justify-between text-body-label text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{format(value)}</span>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-mediumBlue"
      />
    </label>
  );
}
