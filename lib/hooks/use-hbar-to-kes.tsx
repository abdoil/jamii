import { useQuery } from "@tanstack/react-query";

const fetchHbarToKesRate = async (): Promise<number> => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=kes",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-cg-demo-api-key": process.env.COINGECKO_API_KEY!, // Your API key
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch exchange rate");
  }
  const data = await response.json();
  return data["hedera-hashgraph"].kes; // Extracts KES value
};

export const useHbarToKes = (hbarAmount: number) => {
  return useQuery({
    queryKey: ["hbarToKes"],
    queryFn: fetchHbarToKesRate,
    staleTime: 120000, // Refreshes every 2 min
    select: (rate) => ({
      rate,
      converted: hbarAmount * rate, // Convert HBAR to KES
    }),
  });
};
