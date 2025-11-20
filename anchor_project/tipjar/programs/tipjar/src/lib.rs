use anchor_lang::prelude::*;

declare_id!("9ZEfZ88ge79GvKJDfj7mdsY7J37tqinWbVbqv7zzdMfv");

#[program]
pub mod tipjar {
    use super::*;

    pub fn initialize_recipient(ctx: Context<InitializeRecipient>) -> Result<()> {
        let tip_account = &mut ctx.accounts.tip_account;
        tip_account.owner = *ctx.accounts.owner.key;
        tip_account.total_tipped = 0;
        Ok(())
    }

    pub fn tip(ctx: Context<Tip>, amount: u64) -> Result<()> {
        
        let from_info = ctx.accounts.from.to_account_info();
        let pda_info = ctx.accounts.tip_account.to_account_info();
        let system_info = ctx.accounts.system_program.to_account_info();

    
        let tip_account = &mut ctx.accounts.tip_account

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            from_info.key,       // Pubkey
            pda_info.key,        // Pubkey
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                from_info.clone(),
                pda_info.clone(),
                system_info.clone(),
            ],
        )?;

        
        tip_account.total_tipped = tip_account
            .total_tipped
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        
        let pda_info = ctx.accounts.tip_account.to_account_info();
        let recipient_info = ctx.accounts.recipient.to_account_info();

        
        let tip_account = &mut ctx.accounts.tip_account;

        
        require!(
            tip_account.owner == *ctx.accounts.recipient.key,
            ErrorCode::Unauthorized
        );

        let balance = pda_info.lamports();
        require!(balance >= amount, ErrorCode::InsufficientFunds);

        
        **pda_info.try_borrow_mut_lamports()? -= amount;
        **recipient_info.try_borrow_mut_lamports()? += amount;


        tip_account.total_tipped = tip_account
            .total_tipped
            .checked_sub(amount)
            .ok_or(ErrorCode::Overflow)?;

        Ok(())
    }
}

#[account]
pub struct TipAccount {
    pub owner: Pubkey,
    pub total_tipped: u64,
}

#[derive(Accounts)]
pub struct InitializeRecipient<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 8,
        seeds = [b"tip", owner.key().as_ref()],
        bump,
    )]
    pub tip_account: Account<'info, TipAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: only used as a pubkey
    pub owner: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Tip<'info> {
    #[account(
        mut,
        seeds = [b"tip", owner.key().as_ref()],
        bump,
    )]
    pub tip_account: Account<'info, TipAccount>,

    #[account(mut)]
    pub from: Signer<'info>,

    /// CHECK: only used as seed
    pub owner: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"tip", recipient.key().as_ref()],
        bump,
    )]
    pub tip_account: Account<'info, TipAccount>,

    #[account(mut)]
    pub recipient: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Overflow occurred")]
    Overflow,

    #[msg("You cannot withdraw from someone else's tip account")]
    Unauthorized,

    #[msg("Not enough funds in PDA")]
    InsufficientFunds,
}
