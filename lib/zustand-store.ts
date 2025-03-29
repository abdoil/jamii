import { create } from "zustand";
import { persist } from "zustand/middleware";

// Product types
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  storeId: string;
};

// Order types
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in-transit"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  customerId: string;
  storeId: string;
  deliveryAgentId?: string;
  products: { productId: string; quantity: number }[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  deliveryAddress: string;
  trackingInfo?: {
    location: string;
    timestamp: string;
    status: string;
    estimatedDelivery?: string;
  };
};

export type DeliveryBid = {
  id: string;
  orderId: string;
  deliveryAgentId: string;
  amount: number;
  estimatedDeliveryTime: string;
  status: "pending" | "accepted" | "rejected";
};

// Cart store
type CartState = {
  items: { product: Product; quantity: number }[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity }],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

// Products store
type ProductsState = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
};

export const useProductsStore = create<ProductsState>()((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      set({ products: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  getProduct: (id) => {
    return get().products.find((product) => product.id === id);
  },
}));

// Orders store
type OrdersState = {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: (userId: string, role: string) => Promise<void>;
  getOrder: (id: string) => Order | undefined;
  createOrder: (
    order: Omit<Order, "id" | "createdAt" | "updatedAt">
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async (userId: string, role: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/orders?userId=${userId}&role=${role}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch orders");
      }
      const orders = await response.json();
      set({ orders, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getOrder: (id) => {
    return get().orders.find((order) => order.id === id);
  },

  createOrder: async (order) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const newOrder = await response.json();
      set((state) => ({
        orders: [...state.orders, newOrder],
        isLoading: false,
      }));

      return newOrder;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/order/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));

// Delivery bids store
type DeliveryBidsState = {
  bids: DeliveryBid[];
  isLoading: boolean;
  error: string | null;
  fetchBids: (orderId?: string, deliveryAgentId?: string) => Promise<void>;
  createBid: (bid: Omit<DeliveryBid, "id">) => Promise<DeliveryBid>;
  updateBidStatus: (
    bidId: string,
    status: "accepted" | "rejected"
  ) => Promise<void>;
};

export const useDeliveryBidsStore = create<DeliveryBidsState>()((set, get) => ({
  bids: [],
  isLoading: false,
  error: null,
  fetchBids: async (orderId, deliveryAgentId) => {
    set({ isLoading: true, error: null });
    try {
      let endpoint = "/api/order/bids";

      if (orderId) {
        endpoint += `?orderId=${orderId}`;
      } else if (deliveryAgentId) {
        endpoint += `?deliveryAgentId=${deliveryAgentId}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }
      const data = await response.json();
      set({ bids: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  createBid: async (bid) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/order/bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bid),
      });

      if (!response.ok) {
        throw new Error("Failed to create bid");
      }

      const newBid = await response.json();
      set((state) => ({
        bids: [...state.bids, newBid],
        isLoading: false,
      }));

      return newBid;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  updateBidStatus: async (bidId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/order/bid/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bidId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bid status");
      }

      set((state) => ({
        bids: state.bids.map((bid) =>
          bid.id === bidId ? { ...bid, status } : bid
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
