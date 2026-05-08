import Link from "next/link";
import { NAV_GROUPS } from "@/lib/navigation";

export default function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-l py-xxl">
        <h1 className="font-display text-h1 text-foreground">
          Whitelabel Design
        </h1>
        <p className="mt-s text-body-large text-muted-foreground">
          iOS-style design workspace with canvas, inspector, scenarios, and
          tweaks. Two tracks: phone canvases under <code>/reference</code> and{" "}
          <code>/prototypes</code>; web canvases under <code>/web</code>.
        </p>

        {NAV_GROUPS.filter((g) => g.label !== "System").map((group) => (
          <section key={group.label} className="mt-xl">
            <h2 className="font-display text-h2 text-foreground">
              {group.label}
            </h2>
            <ul className="mt-m space-y-xs">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-body-large text-foreground underline-offset-4 hover:underline"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-xl">
          <h2 className="font-display text-h2 text-foreground">System</h2>
          <ul className="mt-m space-y-xs">
            <li>
              <Link
                className="text-body-regular text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                href="/components"
              >
                Components — primitive demos
              </Link>
            </li>
            <li>
              <Link
                className="text-body-regular text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                href="/design-system"
              >
                Design system — tokens, swatches, type ramp
              </Link>
            </li>
            <li>
              <Link
                className="text-body-regular text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                href="/sf-symbols"
              >
                SF Symbols — searchable browser
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
