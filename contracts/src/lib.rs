#![no_std]

mod errors;
mod types;
mod tenant;
mod landlord;

use soroban_sdk::{contract, contractimpl, token, Address, Env, String, Vec};
pub use types::{DataKey, PaymentRecord};

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {

    pub fn initialize(
        env: Env, landlord: Address, tenant: Address, admin: Address,
        monthly_rent: i128, payment_day: u32, token: Address, deposit_amt: i128,
    ) {
        if env.storage().instance().has(&DataKey::IsActive) {
            panic!("{}", errors::ALREADY_INITIALIZED);
        }
        assert!(monthly_rent > 0 && deposit_amt > 0);
        assert!(payment_day >= 1 && payment_day <= 28);

        let s = env.storage().instance();
        s.set(&DataKey::Landlord,          &landlord);
        s.set(&DataKey::Tenant,            &tenant);
        s.set(&DataKey::Admin,             &admin);
        s.set(&DataKey::Token,             &token);
        s.set(&DataKey::MonthlyRent,       &monthly_rent);
        s.set(&DataKey::PaymentDay,        &payment_day);
        s.set(&DataKey::DepositAmt,        &deposit_amt);
        s.set(&DataKey::IsActive,          &true);
        s.set(&DataKey::LastPaymentLedger, &0u32);
        s.set(&DataKey::GraceDays,         &3u32);
        s.extend_ttl(6_307_200, 6_307_200);

        env.storage().persistent().set(&DataKey::PaymentHistory, &Vec::<PaymentRecord>::new(&env));
        env.storage().persistent().extend_ttl(&DataKey::PaymentHistory, 6_307_200, 6_307_200);
    }

    pub fn deposit_funds(env: Env, amount: i128)          { tenant::deposit_funds(env, amount); }
    pub fn execute_payment(env: Env)                      { landlord::execute_payment(env); }
    pub fn terminate(env: Env)                            { landlord::terminate(env); }
    pub fn release_deposit(env: Env)                      { landlord::release_deposit(env); }
    pub fn claim_deposit(env: Env, reason: String)        { landlord::claim_deposit(env, reason); }

    /// Landlord can adjust grace days (1–7) after the lease is active.
    pub fn set_grace_days(env: Env, days: u32) {
        assert!(days >= 1 && days <= 7, "grace days must be between 1 and 7");
        let s = env.storage().instance();
        let admin: Address = s.get(&DataKey::Admin).unwrap();
        admin.require_auth();
        s.set(&DataKey::GraceDays, &days);
        s.extend_ttl(6_307_200, 6_307_200);
    }

    pub fn get_balance(env: Env) -> i128 {
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token).balance(&env.current_contract_address())
    }

    pub fn is_active(env: Env) -> bool {
        env.storage().instance().get(&DataKey::IsActive).unwrap_or(false)
    }

    pub fn get_monthly_rent(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::MonthlyRent).unwrap()
    }

    pub fn get_deposit_amt(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::DepositAmt).unwrap()
    }

    pub fn get_payment_day(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::PaymentDay).unwrap()
    }

    pub fn get_last_payment_ledger(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::LastPaymentLedger).unwrap_or(0)
    }

    pub fn get_payment_history(env: Env) -> Vec<PaymentRecord> {
        env.storage().persistent()
            .get(&DataKey::PaymentHistory)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Returns true if a payment has failed but the grace window has not yet expired.
    /// Returns false if no failure is recorded OR if already past the grace period.
    pub fn is_in_grace_period(env: Env) -> bool {
        let s = env.storage().instance();
        let failed_since: u32 = s.get(&DataKey::FailedSince).unwrap_or(0);
        if failed_since == 0 { return false; }
        let grace_days: u32 = s.get(&DataKey::GraceDays).unwrap_or(3);
        let now = env.ledger().sequence();
        now.saturating_sub(failed_since) <= grace_days * 17_280
    }

    /// Returns how many days the tenant is past the grace window (0 if within grace or no failure).
    pub fn days_overdue(env: Env) -> u32 {
        let s = env.storage().instance();
        let failed_since: u32 = s.get(&DataKey::FailedSince).unwrap_or(0);
        if failed_since == 0 { return 0; }
        let grace_days: u32 = s.get(&DataKey::GraceDays).unwrap_or(3);
        let now = env.ledger().sequence();
        let ledgers_past_grace = now.saturating_sub(failed_since)
            .saturating_sub(grace_days * 17_280);
        ledgers_past_grace / 17_280
    }
}

#[cfg(test)]
mod test;
