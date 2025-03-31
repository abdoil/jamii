import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { OrderStatus } from "../zustand-store";

interface OrderData {
  customerId: string;
  storeId: string;
  products: {
    productId: string;
    quantity: number;
  }[];
  status: "pending" | "processing" | "completed" | "cancelled";
  totalAmount: number;
  deliveryAddress: string;
  transactionId: string;
  hashscanUrl: string;
  blockchainStatus: string;
}

const createOrder = async (orderData: OrderData) => {
  console.log("Creating order with data:", orderData);

  const response = await fetch("/api/order/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("API error response:", data);
    throw new Error(data.error || "Failed to create order");
  }

  return data;
};

export function useOrder() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      console.log("Order creation successful:", data);
      toast({
        title: "Order created successfully",
        description: `Order #${data.id} has been placed`,
      });
    },
    onError: (error: any) => {
      console.error("Order creation error:", error);
      toast({
        title: "Error creating order",
        description:
          error.message ||
          "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Update order status mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update order status");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch orders query
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

export type Order = {
  id: string;
  customerId: string;
  storeId: string;
  storeName: string;
  storeLocation: string;
  products: Array<{
    productId: string;
    quantity: number;
    product?: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  status: "pending" | "confirmed" | "in-transit" | "delivered" | "cancelled";
  totalAmount: number;
  deliveryAddress: string;
  deliveryAgentId?: string;
  createdAt: string;
  updatedAt: string;
};

export function useGetOrder(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      return response.json() as Promise<Order>;
    },
    enabled: !!orderId,
  });
}

// Get products query
export function useGetProducts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
    enabled: !!user && user.role === "admin",
  });
}
