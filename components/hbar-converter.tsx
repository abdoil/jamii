import { useHbarToKes } from "@/lib/hooks/use-hbar-to-kes";

export function HbarConverter({ amount }: { amount: number }) {
  const { data, isLoading, error } = useHbarToKes(amount);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <span className="animate-pulse text-green-500">●</span>
        <p>Loading exchange rate...</p>
      </div>
    );

  if (error)
    return <p className="text-red-500 text-sm">Error fetching exchange rate</p>;

  return (
    <div className=" text-center ">
      <p className="text-sm text-muted-foreground animate-pulse">
        1 HBAR ≈ <span className="font-semibold">{data?.rate}</span> KES
      </p>
      <p className="text-lg font-medium">
        {amount} HBAR ≈{" "}
        <span className="text-green-600">{data?.converted.toFixed(2)} KES</span>
      </p>
    </div>
  );
}
