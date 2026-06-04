use crate::{EscrowContract, EscrowContractClient};
use soroban_sdk::{
    testutils::{Address as _, Ledger, LedgerInfo},
    token::{Client as TokenClient, StellarAssetClient},
    Env, String,
};

fn setup() -> (Env, soroban_sdk::Address, soroban_sdk::Address, soroban_sdk::Address, soroban_sdk::Address, soroban_sdk::Address) {
    let env = Env::default();
    env.mock_all_auths();

    // Guarantee all contract and balance entries live through large ledger advances
    env.ledger().set(LedgerInfo {
        sequence_number: 0,
        min_persistent_entry_ttl: 10_000_000,
        min_temp_entry_ttl: 10_000_000,
        max_entry_ttl: 10_000_000,
        ..env.ledger().get()
    });

    let id           = env.register_contract(None, EscrowContract);
    let token_admin  = soroban_sdk::Address::generate(&env);
    let token        = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let landlord     = soroban_sdk::Address::generate(&env);
    let tenant       = soroban_sdk::Address::generate(&env);
    let admin        = soroban_sdk::Address::generate(&env);

    StellarAssetClient::new(&env, &token).mint(&tenant, &100_000_000_000i128);
    (env, id, token, landlord, tenant, admin)
}

fn init<'a>(env: &'a Env, id: &'a soroban_sdk::Address, token: &'a soroban_sdk::Address, landlord: &'a soroban_sdk::Address, tenant: &'a soroban_sdk::Address, admin: &'a soroban_sdk::Address) -> EscrowContractClient<'a> {
    let c = EscrowContractClient::new(env, id);
    c.initialize(landlord, tenant, admin, &5_000_000_000i128, &1u32, token, &10_000_000_000i128);
    c
}

fn advance(env: &Env, seq: u32) {
    env.ledger().set(LedgerInfo { sequence_number: seq, ..env.ledger().get() });
}

#[test]
fn initialize_stores_values() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);

    assert!(c.is_active());
    assert_eq!(c.get_monthly_rent(), 5_000_000_000i128);
    assert_eq!(c.get_deposit_amt(),  10_000_000_000i128);
    assert_eq!(c.get_payment_day(),  1u32);
    assert_eq!(c.get_last_payment_ledger(), 0u32);
}

#[test]
#[should_panic(expected = "already initialized")]
fn double_initialize_panics() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);
    c.initialize(&landlord, &tenant, &admin, &5_000_000_000i128, &1u32, &token, &10_000_000_000i128);
}

#[test]
fn deposit_funds_updates_balance() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);
    c.deposit_funds(&20_000_000_000i128);
    assert_eq!(c.get_balance(), 20_000_000_000i128);
}

#[test]
fn execute_payment_transfers_rent() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);
    let tc = TokenClient::new(&env, &token);

    c.deposit_funds(&20_000_000_000i128);
    advance(&env, 500_000);

    let before = tc.balance(&landlord);
    c.execute_payment();
    assert_eq!(tc.balance(&landlord) - before, 5_000_000_000i128);
    assert_eq!(c.get_last_payment_ledger(), 500_000u32);
    assert_eq!(c.get_payment_history().len(), 1);
}

#[test]
#[should_panic(expected = "already paid this period")]
fn double_payment_blocked() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);
    c.deposit_funds(&50_000_000_000i128);
    advance(&env, 500_000);
    c.execute_payment();
    c.execute_payment();
}

#[test]
#[should_panic(expected = "insufficient funds")]
fn insufficient_funds_panics() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);
    advance(&env, 500_000);
    c.execute_payment();
}

#[test]
fn terminate_and_release_deposit() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);
    let tc = TokenClient::new(&env, &token);

    c.deposit_funds(&10_000_000_000i128);
    c.terminate();
    assert!(!c.is_active());

    // admin calls release_deposit on behalf of landlord (custodial platform)
    let before = tc.balance(&tenant);
    c.release_deposit();
    assert_eq!(tc.balance(&tenant) - before, 10_000_000_000i128);
}

#[test]
#[should_panic(expected = "terminate first")]
fn release_on_active_panics() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);
    c.deposit_funds(&10_000_000_000i128);
    c.release_deposit();
}

#[test]
fn claim_deposit_goes_to_landlord() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);
    let tc = TokenClient::new(&env, &token);

    c.deposit_funds(&10_000_000_000i128);
    c.terminate();

    // admin calls claim_deposit on behalf of landlord (custodial platform)
    let before = tc.balance(&landlord);
    c.claim_deposit(&String::from_str(&env, "damage"));
    assert_eq!(tc.balance(&landlord) - before, 10_000_000_000i128);
}

#[test]
fn full_lifecycle() {
    let (env, id, token, landlord, tenant, admin) = setup();
    let c = init(&env, &id, &token, &landlord, &tenant, &admin);
    let tc = TokenClient::new(&env, &token);

    c.deposit_funds(&30_000_000_000i128);

    advance(&env, 500_000);
    c.execute_payment();

    advance(&env, 1_000_000);
    c.execute_payment();

    assert_eq!(c.get_payment_history().len(), 2);

    c.terminate();

    let before = tc.balance(&tenant);
    c.release_deposit();
    assert_eq!(tc.balance(&tenant) - before, 10_000_000_000i128);
}
