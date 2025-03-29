// import { useHbarToKes } from "@/lib/hooks/use-hbar-to-kes";

// export function HbarConverter({ amount }: { amount: number }) {
//   const { data, isLoading, error } = useHbarToKes(amount);

//   if (isLoading)
//     return (
//       <div className="flex items-center gap-2 text-gray-600">
//         <span className="animate-pulse text-green-500">●</span>
//         <p>Loading exchange rate...</p>
//       </div>
//     );

//   if (error)
//     return <p className="text-red-500 text-sm">Error fetching exchange rate</p>;

//   return (
//     <div className=" text-center ">
//       <p className="text-sm text-muted-foreground animate-pulse">
//         1 HBAR ≈ <span className="font-semibold">{data?.rate}</span> KES
//       </p>
//       <p className="text-lg font-medium">
//         {amount} HBAR ≈{" "}
//         <span className="text-green-600">{data?.converted.toFixed(2)} KES</span>
//       </p>
//     </div>
//   );
// }

import { useHbarToKes } from "@/lib/hooks/use-hbar-to-kes";

export function HbarConverter({
  amount,
  className = "",
  compact = true,
}: {
  amount: number;
  className?: string;
  compact?: boolean;
}) {
  const { data, isLoading, error } = useHbarToKes(amount);

  if (isLoading)
    return (
      <div
        className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500/70 animate-pulse"></span>
        <p>{compact ? "Loading..." : "Loading exchange rate..."}</p>
      </div>
    );

  if (error)
    return (
      <p className={`text-xs text-red-500 ${className}`}>
        {compact ? "Rate error" : "Error fetching exchange rate"}
      </p>
    );

  if (compact) {
    return (
      <div className={`flex flex-col ${className}`}>
        <p className="text-sm font-medium">
          {amount} HBAR
          <span className="text-green-600 ml-1">
            ≈ {data?.converted.toFixed(2)} KES
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <p className="text-xs text-muted-foreground">
        1 HBAR ≈ <span className="font-medium">{data?.rate}</span> KES
      </p>
      <p className="text-sm font-medium">
        {amount} HBAR
        <span className="text-green-600 ml-1">
          ≈ {data?.converted.toFixed(2)} KES
        </span>
      </p>
    </div>
  );
}
