use soroban_sdk::{symbol_short, token, Address, Env, String, Vec};
use crate::types::{DataKey, PaymentRecord};
use crate::errors;

// ~17,280 ledgers per day at 5 seconds per ledger
const LEDGERS_PER_DAY: u32 = 17_280;

pub fn execute_payment(env: Env) {
    let s = env.storage().instance();
    let admin: Address = s.get(&DataKey::Admin).unwrap();
    admin.require_auth();

    if !s.get::<_, bool>(&DataKey::IsActive).unwrap() {
        panic!("{}", errors::NOT_ACTIVE);
    }

    let last: u32 = s.get(&DataKey::LastPaymentLedger).unwrap();
    let now: u32  = env.ledger().sequence();
    if now.saturating_sub(last) <= 432_000 {
        panic!("{}", errors::ALREADY_PAID);
    }

    let rent: i128        = s.get(&DataKey::MonthlyRent).unwrap();
    let grace_days: u32   = s.get(&DataKey::GraceDays).unwrap_or(3);
    let failed_since: u32 = s.get(&DataKey::FailedSince).unwrap_or(0);

    // If tenant is past the grace window, add a 5% late fee
    let late_fee: i128 = if failed_since > 0
        && now.saturating_sub(failed_since) > grace_days * LEDGERS_PER_DAY
    {
        rent / 20
    } else {
        0
    };
    let total_due = rent + late_fee;

    let landlord: Address = s.get(&DataKey::Landlord).unwrap();
    let token: Address    = s.get(&DataKey::Token).unwrap();
    let client            = token::Client::new(&env, &token);
    let balance: i128     = client.balance(&env.current_contract_address());

    if balance < total_due {
        // Record the first failure ledger so the grace window starts counting
        if failed_since == 0 {
            s.set(&DataKey::FailedSince, &now);
        }
        env.events().publish((symbol_short!("insuf_f"),), (total_due, balance));
        panic!("{}: {} < {}", errors::INSUFFICIENT_FUNDS, balance, total_due);
    }

    // Payment succeeded — clear failure tracking
    s.set(&DataKey::FailedSince,         &0u32);
    s.set(&DataKey::LastPaymentLedger,   &now);
    s.extend_ttl(6_307_200, 6_307_200);

    let mut history: Vec<PaymentRecord> = env.storage().persistent()
        .get(&DataKey::PaymentHistory).unwrap_or_else(|| Vec::new(&env));
    history.push_back(PaymentRecord { amount: total_due, ledger: now, success: true });
    if history.len() > 24 { history.pop_front(); }
    env.storage().persistent().set(&DataKey::PaymentHistory, &history);
    env.storage().persistent().extend_ttl(&DataKey::PaymentHistory, 6_307_200, 6_307_200);

    client.transfer(&env.current_contract_address(), &landlord, &total_due);
    if late_fee > 0 {
        env.events().publish((symbol_short!("late_f"),), (late_fee, landlord.clone(), now));
    }
    env.events().publish((symbol_short!("pmt_ok"),), (total_due, landlord, now));
}

pub fn terminate(env: Env) {
    let s = env.storage().instance();
    let admin: Address = s.get(&DataKey::Admin).unwrap();
    admin.require_auth();
    if !s.get::<_, bool>(&DataKey::IsActive).unwrap() {
        panic!("{}", errors::ALREADY_TERMINATED);
    }
    s.set(&DataKey::IsActive, &false);
    s.extend_ttl(6_307_200, 6_307_200);
    env.events().publish((symbol_short!("term"),), (admin,));
}

pub fn claim_deposit(env: Env, reason: String) {
    let s = env.storage().instance();
    let admin: Address = s.get(&DataKey::Admin).unwrap();
    admin.require_auth();
    if s.get::<_, bool>(&DataKey::IsActive).unwrap() {
        panic!("{}", errors::TERMINATE_FIRST);
    }
    let deposit: i128     = s.get(&DataKey::DepositAmt).unwrap();
    let landlord: Address = s.get(&DataKey::Landlord).unwrap();
    let token: Address    = s.get(&DataKey::Token).unwrap();
    token::Client::new(&env, &token).transfer(&env.current_contract_address(), &landlord, &deposit);
    s.extend_ttl(6_307_200, 6_307_200);
    env.events().publish((symbol_short!("dep_clm"),), (deposit, landlord, reason));
}

pub fn release_deposit(env: Env) {
    let s = env.storage().instance();
    let admin: Address = s.get(&DataKey::Admin).unwrap();
    admin.require_auth();
    if s.get::<_, bool>(&DataKey::IsActive).unwrap() {
        panic!("{}", errors::TERMINATE_FIRST);
    }
    // Block release if tenant has an uncleared payment failure
    let failed_since: u32 = s.get(&DataKey::FailedSince).unwrap_or(0);
    if failed_since > 0 {
        panic!("{}", errors::ARREARS_BLOCK);
    }
    let deposit: i128   = s.get(&DataKey::DepositAmt).unwrap();
    let tenant: Address = s.get(&DataKey::Tenant).unwrap();
    let token: Address  = s.get(&DataKey::Token).unwrap();
    token::Client::new(&env, &token).transfer(&env.current_contract_address(), &tenant, &deposit);
    s.extend_ttl(6_307_200, 6_307_200);
    env.events().publish((symbol_short!("dep_rel"),), (deposit, tenant));
}
