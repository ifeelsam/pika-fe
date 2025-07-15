import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { getProvider, getProgram, connection } from "./config";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import IDL from "./idl.json";
import type { PikaVault } from "./idl";

export const useAnchorProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return getProvider(wallet);
  }, [wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return getProgram(provider) as any; // Type assertion to work around the IDL typing issue
  }, [provider]);

  return {
    program: program as any, // Ensure the program is typed correctly for our usage
    provider,
    wallet,
    connection,
  };
};

export const useReadOnlyProgram = () => {
  const { connection: walletConnection } = useConnection();
  
  const readOnlyProgram = useMemo(() => {
    try {
      const dummyWallet = {
        publicKey: new PublicKey("11111111111111111111111111111111"),
        signTransaction: () => Promise.reject("Read-only mode"),
        signAllTransactions: () => Promise.reject("Read-only mode"),
      };
      
      const conn = walletConnection || connection;
      
      const provider = new AnchorProvider(conn, dummyWallet, {
        commitment: "confirmed",
      });
      
      // Create program instance
      return new Program(IDL as PikaVault, provider);
    } catch (error) {
      console.error("Error creating read-only program:", error);
      return null;
    }
  }, [walletConnection]);

  return {
    readOnlyProgram: readOnlyProgram as Program<PikaVault> | null,
    connection: walletConnection || connection,
  };
};

// Example of how to use the program:
/*
const { program, wallet } = useAnchorProgram();

// Example function to call a program instruction
const callProgramInstruction = async () => {
  if (!program || !wallet.publicKey) return;

  try {
    const tx = await program.methods
      .yourInstructionName()
      .accounts({
        // Add your account constraints here
      })
      .rpc();
    
    console.log("Transaction signature:", tx);
  } catch (error) {
    console.error("Error calling program:", error);
  }
};
*/ 