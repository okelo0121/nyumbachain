use soroban_sdk::contracttype;

#[contracttype]
pub enum DataKey {
    Landlord, Tenant, Admin, Token,
    MonthlyRent, PaymentDay, DepositAmt,
    IsActive, LastPaymentLedger, GraceDays,
    PaymentHistory,
    FailedSince,   // ledger of first payment failure; 0 = no current failure
}

#[contracttype]
#[derive(Clone)]
pub struct PaymentRecord {
    pub amount:  i128,
    pub ledger:  u32,
    pub success: bool,
}
