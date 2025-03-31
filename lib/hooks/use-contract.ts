import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ContractResponse {
  success: boolean;
  transactionId: string;
  hashscanUrl: string;
  details: {
    gasUsed: number;
    status: string;
    contractId: string;
  };
}

interface ContractError {
  error: string;
}

export function useContract() {
  const showTransactionDetails = (data: ContractResponse) => {
    const message = `
Transaction Details:
Transaction ID: ${data.transactionId}
Status: ${data.details.status}
View on Hashscan: ${data.hashscanUrl}
    `;
    toast(message, {
      duration: 5000,
      position: "top-center",
    });
  };

  const placeOrder = useMutation({
    mutationFn: async (amount: number) => {
      console.log("Placing order with amount:", amount);
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "placeOrder",
          amount,
        }),
      });

      const data = await response.json();
      console.log("Contract API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      if (!data.success) {
        throw new Error("Transaction failed");
      }

      return data as ContractResponse;
    },
    onSuccess: (data) => {
      console.log("Order placed successfully:", data);
      toast.success("Order placed successfully");
      showTransactionDetails(data);
    },
    onError: (error: Error) => {
      console.error("Error placing order:", error);
      toast.error(error.message);
    },
  });

  const placeBid = useMutation({
    mutationFn: async ({
      orderId,
      amount,
    }: {
      orderId: string;
      amount: number;
    }) => {
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "placeBid",
          orderId,
          amount,
        }),
      });

      if (!response.ok) {
        const error: ContractError = await response.json();
        throw new Error(error.error || "Failed to place bid");
      }

      return response.json() as Promise<ContractResponse>;
    },
    onSuccess: (data) => {
      toast.success("Bid placed successfully");
      showTransactionDetails(data);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const confirmDelivery = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "confirmDelivery",
          orderId,
        }),
      });

      if (!response.ok) {
        const error: ContractError = await response.json();
        throw new Error(error.error || "Failed to confirm delivery");
      }

      return response.json() as Promise<ContractResponse>;
    },
    onSuccess: (data) => {
      toast.success("Delivery confirmed successfully");
      showTransactionDetails(data);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    placeOrder,
    placeBid,
    confirmDelivery,
  };
}
