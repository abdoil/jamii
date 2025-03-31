import { NextResponse } from "next/server";
import {
  AccountId,
  PrivateKey,
  Client,
  ContractExecuteTransaction,
  Hbar,
  ContractFunctionParameters,
  ContractId,
  Status,
} from "@hashgraph/sdk";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

// Contract configuration
const CONTRACT_ID = process.env.CONTRACT_ID;
const MY_ACCOUNT_ID = process.env.HEDERA_OPERATOR_ACCOUNT_ID;
const MY_PRIVATE_KEY = process.env.HEDERA_OPERATOR_PRIVATE_KEY;

if (!CONTRACT_ID || !MY_ACCOUNT_ID || !MY_PRIVATE_KEY) {
  throw new Error("Missing required environment variables");
}

// Initialize Hedera client
const client = Client.forTestnet();
client.setOperator(
  AccountId.fromString(MY_ACCOUNT_ID),
  PrivateKey.fromStringECDSA(MY_PRIVATE_KEY)
);

interface ContractRequest {
  action: "placeOrder" | "placeBid" | "confirmDelivery";
  orderId?: string;
  amount?: number;
}

export async function POST(request: Request) {
  try {
    const body: ContractRequest = await request.json();
    const { action, orderId, amount } = body;

    let response;
    switch (action) {
      case "placeOrder":
        if (amount === undefined) {
          return NextResponse.json(
            { error: "Amount is required for placing an order" },
            { status: 400 }
          );
        }
        response = await placeOrder(amount);
        break;
      case "placeBid":
        if (orderId === undefined || amount === undefined) {
          return NextResponse.json(
            { error: "Order ID and amount are required for placing a bid" },
            { status: 400 }
          );
        }
        response = await placeBid(orderId, amount);
        // Update order with bid transaction ID
        if (response.success && orderId) {
          await updateDoc(doc(db, "orders", orderId), {
            bidTransactionId: response.transactionId,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      case "confirmDelivery":
        if (orderId === undefined) {
          return NextResponse.json(
            { error: "Order ID is required for confirming delivery" },
            { status: 400 }
          );
        }
        response = await confirmDelivery(client);
        // Update order with delivery transaction ID and status
        if (response.success && orderId) {
          await updateDoc(doc(db, "orders", orderId), {
            status: "delivered",
            deliveryTransactionId: response.transactionId,
            hashscanUrl: response.hashscanUrl,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Contract interaction error:", error);
    return NextResponse.json(
      {
        error: error.message || "An error occurred",
        details: error.status ? `Hedera Status: ${error.status}` : undefined,
      },
      { status: 500 }
    );
  }
}

async function placeOrder(amount: number) {
  if (!CONTRACT_ID) throw new Error("Contract ID not configured");

  try {
    // Convert the HBAR amount to tinybars (1 HBAR = 100,000,000 tinybars)
    const tinybars = Math.round(amount * 100000000);
    const orderAmount = new Hbar(tinybars / 100000000);

    const tx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(CONTRACT_ID))
      .setGas(500000)
      .setFunction("placeOrder")
      .setPayableAmount(orderAmount)
      .setFunctionParameters(new ContractFunctionParameters()._build());

    console.log("Sending order creation transaction...");
    const response = await tx.execute(client);
    console.log("Transaction sent, waiting for receipt...");
    const receipt = await response.getReceipt(client);

    if (receipt.status !== Status.Success) {
      throw new Error("Transaction failed");
    }

    console.log("Order created successfully!");

    return {
      success: true,
      transactionId: response.transactionId.toString(),
      hashscanUrl: `https://hashscan.io/testnet/tx/${response.transactionId.toString()}`,
      details: {
        status: receipt.status,
        contractId: CONTRACT_ID,
      },
    };
  } catch (error) {
    console.error("Error in placeOrder:", error);
    throw error;
  }
}

async function placeBid(orderId: string, amount: number) {
  if (!CONTRACT_ID) throw new Error("Contract ID not configured");

  try {
    // Convert the HBAR amount to tinybars
    const tinybars = Math.round(amount * 100000000);
    const bidAmount = new Hbar(tinybars / 100000000);

    const tx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(CONTRACT_ID))
      .setGas(500000)
      .setFunction("placeBid")
      .setPayableAmount(bidAmount)
      .setFunctionParameters(
        new ContractFunctionParameters().addUint256(Number(3))
      );

    console.log("Sending bid placement transaction...");
    const response = await tx.execute(client);
    console.log("Transaction sent, waiting for receipt...");
    const receipt = await response.getReceipt(client);

    if (receipt.status !== Status.Success) {
      throw new Error("Transaction failed");
    }

    console.log("Bid placed successfully!");

    return {
      success: true,
      transactionId: response.transactionId.toString(),
      hashscanUrl: `https://hashscan.io/testnet/tx/${response.transactionId.toString()}`,
      details: {
        status: receipt.status,
        contractId: CONTRACT_ID,
        amount: amount,
      },
    };
  } catch (error) {
    console.error("Error in placeBid:", error);
    throw error;
  }
}

async function confirmDelivery(client: Client) {
  const contractId = process.env.CONTRACT_ID;
  if (!contractId) {
    throw new Error("Contract ID not configured");
  }

  const tx = new ContractExecuteTransaction()
    .setContractId(ContractId.fromString(contractId))
    .setGas(500000) // Increased gas limit to be safe
    .setFunction("confirmDelivery")
    .setFunctionParameters(new ContractFunctionParameters().addUint256(1));

  const response = await tx.execute(client);
  console.log("Transaction sent, waiting for receipt...");
  const receipt = await response.getReceipt(client);
  console.log("Delivery confirmed successfully!");

  return {
    success: true,
    transactionId: response.transactionId.toString(),
    hashscanUrl: `https://hashscan.io/testnet/tx/${response.transactionId.toString()}`,
    details: {
      status: receipt.status,
      contractId: contractId,
    },
  };
}
