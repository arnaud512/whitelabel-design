import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// twMerge groups `text-*` classes by guessing color vs. size from the value.
// The custom font sizes (`text-body-large`, `text-h1`, …) and brand
// colors (`text-brand-offWhite`, …) don't match its default heuristics, so it
// would treat both as the same group and drop one. Teach it the actual tokens.
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "h1",
            "h2",
            "h3",
            "title-large",
            "title-medium",
            "title-regular",
            "body-large",
            "body-regular",
            "body-stat",
            "body-label",
            "body-label-caps",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
