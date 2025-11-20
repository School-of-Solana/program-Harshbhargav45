# Project Description

**Deployed Frontend URL:** https://1frontend-indol.vercel.app
**Solana Program ID:** `9ZEfZ88ge79GvKJDfj7mdsY7J37tqinWbVbqv7zzdMfv`

---

## 📌 Project Overview

### 📝 Description

The **Solana Tipjar dApp** allows users to collect SOL tips using a secure, wallet-bound, decentralized tipping system built with **Anchor**.  
Each wallet can:

- Create a **Tip Account PDA**
- Receive SOL tips from anyone
- Withdraw collected SOL securely
- Track total amount tipped

This dApp showcases practical Solana development concepts including Program Derived Addresses (PDAs), account ownership, and on-chain lamport management.

---

### ⭐ Key Features

- **Initialize Tip Jar** (Creates PDA linked to your wallet)
- **Send Tips in SOL** (Anyone can tip your address)
- **Withdraw Tips Securely** (Only PDA owner can withdraw)
- **View Total Tipped Amount** (Fetched from on-chain state)

---

### 🚀 How to Use the dApp

1. **Connect your wallet** (Phantom recommended)
2. Click **“Initialize Tip Jar”**
3. Share your wallet address to receive tips
4. Use **“Send Tip”** to tip others
5. Use **“Withdraw”** to withdraw your collected tips

---

## 🏗 Program Architecture

### 🔐 PDA Logic

Each user gets a unique Tip Account PDA based on:

This guarantees:

- Only 1 tip jar per wallet
- Tamper-proof ownership
- Secure withdrawals

---

### 📦 Instructions Overview

| Instruction            | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `initialize_recipient` | Creates PDA tip jar for the wallet                |
| `tip`                  | Sends SOL to another user’s PDA                   |
| `withdraw`             | Allows only the owner to withdraw the PDA balance |

---

### 📂 Account Structure

```rust
#[account]
pub struct TipAccount {
    pub owner: Pubkey,        // The owner who receives tips
    pub total_tipped: u64,    // Total lamports collected
}
```
