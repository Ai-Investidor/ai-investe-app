import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-text-style": [
        "text-headline-1",
        "text-headline-1-strong",
        "text-paragraph-1",
        "text-paragraph-2",
        "text-paragraph-3",
        "text-paragraph-4",
        "text-paragraph-5",
        "text-paragraph-6",
        "text-paragraph-7",
        "text-paragraph-8",
      ],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
