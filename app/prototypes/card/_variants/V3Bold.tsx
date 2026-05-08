"use client";

import { SFSymbol } from "@/components/icons/SFSymbol";
import { sampleCard as data } from "./shared";

export function V3Bold() {
  return (
    <div className="flex flex-col gap-l bg-background pb-xl">
      <header className="px-m pt-l">
        <h1 className="font-display text-h1 text-foreground">Card · Bold</h1>
        <p className="text-body-regular text-muted-foreground">
          Inverted prominent surface — for hero placements.
        </p>
      </header>

      <div className="px-m">
        <article className="glass-prominent flex flex-col gap-s rounded-lg p-m">
          <div className="flex items-center gap-xs">
            <SFSymbol name={data.icon} size="s" />
            <p className="text-body-label-caps uppercase opacity-70">
              {data.eyebrow}
            </p>
          </div>
          <h2 className="font-display text-h2">{data.title}</h2>
          <p className="text-body-regular opacity-80">{data.body}</p>
          <div className="flex items-center justify-between pt-xs">
            <span className="text-body-label opacity-70">{data.meta}</span>
            <button className="glass-pressable inline-flex items-center gap-xxs rounded-full bg-white/15 px-s py-xxs text-body-label">
              {data.cta}
              <SFSymbol name="arrow.right" size="xs" />
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
