import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import IDL from "./idl.json"
import type { PikaVault } from "./idl.ts";


export const NETWORK = "devnet";
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(NETWORK);

export const PROGRAM_ID = new PublicKey("EqJfvdGXFgMr5AfRzZdByrk3bkJVBixdcgAHiuFsPHHF");

export const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const MARKETPLACE_ADMIN = new PublicKey("3yUkodxjCmZ5DbfmydQDcYWY3CL5idMa4WcTZpT2jkUN");
// marketplace pda -> Hu5RrTKWfpE88QW5iALyXUy6C82JjRdrReYz9EdunJx

export const DEFAULT_MARKETPLACE_FEE = 1000;

export const connection = new Connection(RPC_URL, "confirmed");

export const getProvider = (wallet: any) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return provider;
};

export const getProgram = (provider: AnchorProvider) => {
  return new Program(IDL as PikaVault, provider);
}; 