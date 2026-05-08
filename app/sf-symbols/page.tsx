import { promises as fs } from "fs";
import path from "path";
import { SymbolBrowser } from "./SymbolBrowser";

export default async function SFSymbolsPage() {
  const dir = path.join(process.cwd(), "public", "sf-symbols");
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    files = [];
  }

  const symbols = files
    .filter((f) => f.endsWith(".svg") && !/\.(ar|hi)\.svg$/.test(f))
    .map((f) => f.replace(/\.svg$/, ""))
    .sort();

  return (
    <main className="min-h-screen bg-dots">
      <div className="mx-auto max-w-6xl px-l py-xxl">
        <header className="mb-l">
          <h1 className="font-display text-h1 text-foreground">SF Symbols</h1>
          <p className="mt-xs text-body-large text-muted-foreground">
            All <span className="tabular-nums">{symbols.length.toLocaleString()}</span>{" "}
            symbols installed under{" "}
            <code className="rounded-xs bg-card px-xs py-xxs text-body-regular">
              public/sf-symbols/
            </code>
            . Click any tile to copy its name.
          </p>
        </header>

        {symbols.length === 0 ? (
          <p className="text-body-regular text-muted-foreground">
            No symbols found. Drop the SF Symbols export into{" "}
            <code className="rounded-xs bg-card px-xs py-xxs">public/sf-symbols/</code>.
          </p>
        ) : (
          <SymbolBrowser symbols={symbols} />
        )}
      </div>
    </main>
  );
}
