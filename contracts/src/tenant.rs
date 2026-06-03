use soroban_sdk::{symbol_short, token, Address, Env};
use crate::types::DataKey;

pub fn deposit_funds(env: Env, amount: i128) {
    assert!(amount > 0);
    let s = env.storage().instance();
    let tenant: Address      = s.get(&DataKey::Tenant).unwrap();
    let token_addr: Address  = s.get(&DataKey::Token).unwrap();
    tenant.require_auth();
    token::Client::new(&env, &token_addr).transfer(&tenant, &env.current_contract_address(), &amount);
    s.extend_ttl(6_307_200, 6_307_200);
    env.events().publish((symbol_short!("dep_f"),), (amount, tenant));
}
