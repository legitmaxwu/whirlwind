export const fmtAvailable = (s: number) =>
  s > 0 && s < 0.01 ? "<0.01" : fmtComma(s);

export const fmtComma = (s: number, maximumFractionDigits?: number) =>
  s.toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maximumFractionDigits ?? 2,
  });

