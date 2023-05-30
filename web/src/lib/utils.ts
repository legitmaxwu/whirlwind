import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import numeral from "numeral";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1e6) {
    // Format as millions if n is 1 million or more
    return numeral(n).format("0.0a");
  } else if (n >= 1e4) {
    // Format as thousands if n is 10,000 or more
    return numeral(n).format("0.0a");
  } else if (n >= 1) {
    // Format with commas if n is 1 or more
    return numeral(n).format("0,0");
  } else if (n >= 0.01) {
    // Format with 2 decimal places if n is between 0 and 1
    return numeral(n).format("0,0.00");
  } else {
    return numeral(n).format("0,0.00");
  }
}

export function formatDelta(delta: number) {
  if (delta > 0) {
    return "+" + formatNumber(delta);
  } else {
    return formatNumber(delta);
  }
}
