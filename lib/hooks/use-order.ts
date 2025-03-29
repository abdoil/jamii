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
}

const createOrder = async (orderData: OrderData) => {
  const orderWithTimestamp = {
    ...orderData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const response = await fetch("/api/order/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("API error response:", data); // Debug log
    throw new Error(data.error || "Failed to create order");
  }

  return data;
};

export function useOrder() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      console.log("Order creation successful:", data); // Debug log
      toast({
        title: "Order created successfully",
        description: `Order #${data.id} has been placed`,
      });
    },
    onError: (error: any) => {
      console.error("Order creation error:", error); // Debug log
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

// Get single order query
export function useGetOrder(orderId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      return response.json();
    },
    enabled: !!user && user.role === "admin",
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
