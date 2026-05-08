"use client";

import { GlassButton } from "@/components/whitelabel/GlassButton";
import { SFSymbol } from "@/components/icons/SFSymbol";
import { sampleCard as data } from "./shared";

export function V1Flat() {
  return (
    <div className="flex flex-col gap-l bg-background pb-xl">
      <header className="px-m pt-l">
        <h1 className="font-display text-h1 text-foreground">Card · Flat</h1>
        <p className="text-body-regular text-muted-foreground">
          Minimal: bordered surface, no glass, no shadow.
        </p>
      </header>

      <div className="px-m">
        <article className="flex flex-col gap-s rounded-lg border border-border bg-card p-m">
          <p className="text-body-label-caps uppercase text-muted-foreground">
            {data.eyebrow}
          </p>
          <h2 className="font-display text-h2 text-foreground">{data.title}</h2>
          <p className="text-body-regular text-muted-foreground">{data.body}</p>
          <div className="flex items-center justify-between pt-xs">
            <span className="text-body-label text-muted-foreground">
              {data.meta}
            </span>
            <button className="inline-flex items-center gap-xxs text-body-regular text-foreground">
              {data.cta}
              <SFSymbol name="arrow.right" size="xs" />
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
