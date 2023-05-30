import { fmtComma } from "../pages/deposits";

export function TraderItem({
  name,
  usdcValue,
}: {
  name: string;
  usdcValue: number;
}) {
  return (
    <div className="flex justify-between border-b border-b-highlight px-4 py-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-black" />
        <p className="font-medium">{name}</p>
      </div>
      <div className="font-medium">{`$${fmtComma(usdcValue, 2)}`}</div>
    </div>
  );
}
