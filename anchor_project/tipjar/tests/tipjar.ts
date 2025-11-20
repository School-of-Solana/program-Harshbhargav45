import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Tipjar } from "../target/types/tipjar";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("tipjar", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Tipjar as Program<Tipjar>;
  const payer = provider.wallet;
  const recipient = anchor.web3.Keypair.generate();

  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tip"), recipient.publicKey.toBytes()],
    program.programId
  );

  it("Initialize Recipient", async () => {
    await program.methods
      .initializeRecipient()
      .accounts({
        tipAccount: pda,
        payer: payer.publicKey,
        owner: recipient.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const acc = await program.account.tipAccount.fetch(pda);
    assert.equal(acc.totalTipped.toNumber(), 0);
  });

  it("Tip - Happy Path", async () => {
    const amount = new anchor.BN(500000);

    await program.methods
      .tip(amount)
      .accounts({
        tipAccount: pda,
        from: payer.publicKey,
        owner: recipient.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const acc = await program.account.tipAccount.fetch(pda);
    assert.equal(acc.totalTipped.toNumber(), 500000);
  });

  it("Tip - Unhappy - Insufficient Funds", async () => {
    try {
      await program.methods
        .tip(new anchor.BN(10_000_000_000_000))
        .accounts({
          tipAccount: pda,
          from: payer.publicKey,
          owner: recipient.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should fail");
    } catch (e) {}
  });

  it("Withdraw - Unauthorized", async () => {
    const attacker = anchor.web3.Keypair.generate();

    try {
      await program.methods
        .withdraw(new anchor.BN(1))
        .accounts({
          tipAccount: pda,
          recipient: attacker.publicKey,
        })
        .signers([attacker])
        .rpc();
      assert.fail("Should fail");
    } catch (e) {}
  });

  it("Withdraw - Happy Path", async () => {
    await program.methods
      .withdraw(new anchor.BN(200000))
      .accounts({
        tipAccount: pda,
        recipient: recipient.publicKey,
      })
      .signers([recipient])
      .rpc();
  });
});
