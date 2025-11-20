import "./index.css";
import { useEffect, useState } from "react";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  SystemProgram,
} from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "./idl.json";

// Your deployed program id
const programID = new PublicKey("9ZEfZ88ge79GvKJDfj7mdsY7J37tqinWbVbqv7zzdMfv");

export default function App() {
  const wallet = useWallet();
  const [balance, setBalance] = useState("—");

  const getProvider = () => {
    const network = clusterApiUrl("devnet");
    const connection = new Connection(network, "processed");
    return new AnchorProvider(connection, wallet, {});
  };

  const getProgram = () => new Program(idl, programID, getProvider());

  const getPda = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("tip"), wallet.publicKey.toBuffer()],
      programID
    )[0];
  };

  const initializeAccount = async () => {
    try {
      const program = getProgram();
      await program.methods
        .initializeRecipient()
        .accounts({
          tipAccount: getPda(),
          payer: wallet.publicKey,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      alert("Initialized successfully!");
    } catch {
      alert("Initialization failed. Maybe already initialized.");
    }
  };

  const fetchBalance = async () => {
    try {
      const program = getProgram();
      const pda = getPda();
      const account = await program.account.tipAccount.fetchNullable(pda);
      if (!account) return setBalance("Not Initialized");
      setBalance(account.totalTipped.toString());
    } catch {
      setBalance("Error");
    }
  };

  const sendTip = async () => {
    try {
      const program = getProgram();
      const amount = 0.01 * 1e9; // 0.01 SOL
      await program.methods
        .tip(new anchor.BN(amount))
        .accounts({
          tipAccount: getPda(),
          from: wallet.publicKey,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      alert("Tip sent!");
      fetchBalance();
    } catch {
      alert("Send Failed.");
    }
  };

  const withdrawAll = async () => {
    try {
      const program = getProgram();
      const amount = 999999999999; // withdraw everything
      await program.methods
        .withdraw(new anchor.BN(amount))
        .accounts({
          tipAccount: getPda(),
          recipient: wallet.publicKey,
        })
        .rpc();
      alert("Withdrawn!");
      fetchBalance();
    } catch {
      alert("Withdraw Failed");
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">💰 Solana Tip Jar</h1>

      <div className="wallet-button">
        <WalletMultiButton />
      </div>

      <div className="card">
        <div className="btn-group">
          <button onClick={initializeAccount}>🛠 Initialize</button>
          <button onClick={fetchBalance}>📊 Balance</button>
        </div>

        <div className="btn-group">
          <button onClick={sendTip}>💸 Send 0.01 SOL</button>
          <button onClick={withdrawAll}>🔐 Withdraw All</button>
        </div>

        <div className="balance">Balance: {balance}</div>
      </div>
    </div>
  );
}
