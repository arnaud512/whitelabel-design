"use client";

import { SFSymbol } from "@/components/icons/SFSymbol";
import { Nav } from "./_components/Nav";
import { Footer } from "./_components/Footer";

const features = [
  {
    icon: "square.stack.3d.up",
    title: "Scenarios",
    body: "Swap a screen's whole-world state with one click.",
  },
  {
    icon: "slider.horizontal.3",
    title: "Tweaks",
    body: "Compose orthogonal knobs on top of any scenario.",
  },
  {
    icon: "rectangle.split.2x1",
    title: "Two tracks",
    body: "iOS phone canvas and a separate web canvas, side by side.",
  },
];

export function Landing() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Nav />

      <section className="px-m pb-xl pt-l @md:px-l @md:pt-xxl">
        <div className="flex flex-col items-start gap-l @lg:flex-row @lg:items-center">
          <div className="flex flex-1 flex-col gap-s">
            <p className="text-body-label-caps uppercase text-muted-foreground">
              Your product
            </p>
            <h1 className="font-display text-h1 leading-tight text-foreground @md:text-[48px] @lg:text-[64px]">
              The tagline that earns the space it takes.
            </h1>
            <p className="max-w-prose text-body-large text-muted-foreground">
              A whitelabel landing page with hero copy, three feature cards,
              and a footer. Replace the words; keep the rhythm.
            </p>
            <div className="flex items-center gap-s pt-s">
              <a
                href="#"
                className="rounded-full bg-primary px-l py-s text-body-large font-medium text-primary-foreground"
              >
                Get started
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-xxs text-body-large text-foreground"
              >
                Learn more
                <SFSymbol name="arrow.right" size="xs" />
              </a>
            </div>
          </div>

          <div className="hidden flex-1 @lg:block">
            <div className="glass aspect-[4/3] rounded-xl" />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-t border-border px-m py-xl @md:px-l"
      >
        <h2 className="font-display text-h2 text-foreground">
          Built around three ideas
        </h2>
        <div className="mt-l grid grid-cols-1 gap-s @md:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="glass flex flex-col gap-s rounded-lg p-l"
            >
              <span className="flex h-icon-l w-icon-l items-center justify-center rounded-sm bg-accent">
                <SFSymbol
                  name={f.icon}
                  size="s"
                  className="text-accent-foreground"
                />
              </span>
              <h3 className="font-display text-h3 text-foreground">
                {f.title}
              </h3>
              <p className="text-body-regular text-muted-foreground">
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
