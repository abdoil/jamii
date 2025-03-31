import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useContract } from "./use-contract";
import { useToast } from "@/components/ui/use-toast";

export type Bid = {
  id: string;
  orderId: string;
  deliveryAgentId: string;
  deliveryAgentName: string;
  amount: number;
  estimatedDeliveryTime: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export function useGetBids(orderIds: string) {
  return useQuery({
    queryKey: ["bids", orderIds],
    queryFn: async () => {
      if (!orderIds) return [];

      const response = await fetch(`/api/orders/bids?orderIds=${orderIds}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }
      return response.json() as Promise<Bid[]>;
    },
    enabled: !!orderIds,
  });
}

export function useCreateBid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orderId,
      amount,
      estimatedDeliveryTime,
    }: {
      orderId: string;
      amount: number;
      estimatedDeliveryTime: string;
    }) => {
      const response = await fetch(`/api/orders/${orderId}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          estimatedDeliveryTime,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create bid");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bids"] });
      toast({
        title: "Bid placed successfully",
        description: `Your bid of ${variables.amount} HBAR has been placed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
