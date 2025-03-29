import {
  AccountCreateTransaction,
  Hbar,
  PrivateKey,
  Client,
} from "@hashgraph/sdk";

// Initialize Hedera client with error handling
let client: Client;

try {
  if (
    !process.env.HEDERA_OPERATOR_ACCOUNT_ID ||
    !process.env.HEDERA_OPERATOR_PRIVATE_KEY
  ) {
    throw new Error("Hedera credentials not found in environment variables");
  }

  client = Client.forTestnet();
  client.setOperator(
    process.env.HEDERA_OPERATOR_ACCOUNT_ID,
    process.env.HEDERA_OPERATOR_PRIVATE_KEY
  );
} catch (error) {
  console.error("Failed to initialize Hedera client:", error);
  // Initialize a placeholder client to prevent undefined errors
  client = Client.forTestnet();
}

export interface HederaAccount {
  accountId: string;
  publicKey: string;
  privateKey: string;
}

export async function createHederaAccount(): Promise<HederaAccount> {
  // Check if client is properly initialized
  if (
    !process.env.HEDERA_OPERATOR_ACCOUNT_ID ||
    !process.env.HEDERA_OPERATOR_PRIVATE_KEY
  ) {
    throw new Error(
      "Hedera credentials not configured. Please set HEDERA_OPERATOR_ACCOUNT_ID and HEDERA_OPERATOR_PRIVATE_KEY in your environment variables."
    );
  }

  try {
    // Generate new key pair
    const newPrivateKey = PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    // Create account transaction
    const transaction = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(1));

    // Sign and execute the transaction
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const newAccountId = receipt.accountId;

    if (!newAccountId) {
      throw new Error("Failed to create Hedera account");
    }

    return {
      accountId: newAccountId.toString(),
      publicKey: newPublicKey.toString(),
      privateKey: newPrivateKey.toString(),
    };
  } catch (error) {
    console.error("Error creating Hedera account:", error);
    throw error;
  }
}

export function encryptPrivateKey(privateKey: string): string {
  // TODO: Implement encryption for private key storage
  // This is a placeholder - in production, use proper encryption
  return privateKey;
}

export function decryptPrivateKey(encryptedKey: string): string {
  // TODO: Implement decryption for private key retrieval
  // This is a placeholder - in production, use proper decryption
  return encryptedKey;
}
