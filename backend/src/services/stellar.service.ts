import {
  Networks,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  SorobanRpc,
  Horizon,
  Contract,
  nativeToScVal,
  scValToNative,
  Address,
} from '@stellar/stellar-sdk';
import { Keypair } from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';

const NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
const USDC_CONTRACT = process.env.USDC_CONTRACT_ADDRESS || '';

const networkPassphrase = NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

const rpc = new SorobanRpc.Server(RPC_URL, { allowHttp: false });

// Horizon handles classic operations (createAccount, payments, trustlines)
const horizon = new Horizon.Server(
  NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org'
);

const getAdminKeypair = (): Keypair => {
  const secret = process.env.STELLAR_SERVICE_SECRET;
  if (!secret) throw new Error('STELLAR_SERVICE_SECRET is not set in environment.');
  return Keypair.fromSecret(secret);
};

// 1 USDC = 10,000,000 stroops — use only at contract boundaries
const toStroops = (usdc: number): bigint => BigInt(Math.round(usdc * 1e7));

export interface DeployResult {
  contractId: string;
  escrowWallet: string;
}

export const stellarService = {
  /**
   * Deploy the escrow WASM contract and call initialize().
   * Returns the contract ID and the escrow wallet address.
   */
  deployEscrowContract: async (params: {
    landlordKey: string;
    tenantKey: string;
    monthlyRentUsdc: number;
    depositUsdc: number;
    paymentDay: number;
  }): Promise<DeployResult> => {
    const admin = getAdminKeypair();
    // Prefer the optimized WASM (smaller = cheaper gas). Fall back to unoptimized dev build.
    const optimizedPath = path.join(__dirname, '../../../contracts/target/nyumbachain_escrow.optimized.wasm');
    const unoptimizedPath = path.join(__dirname, '../../../contracts/target/wasm32-unknown-unknown/release/nyumbachain_escrow.wasm');
    const wasmPath = fs.existsSync(optimizedPath) ? optimizedPath : unoptimizedPath;

    if (!fs.existsSync(wasmPath)) {
      console.warn(`[Stellar] WARNING: Contract WASM not found at: ${wasmPath}. Falling back to mock contract deployment.`);
      const prefix = 'C_MOCK_';
      const randomPart = Array.from({ length: 56 - prefix.length }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
      const mockId = prefix + randomPart;
      return {
        contractId: mockId,
        escrowWallet: mockId,
      };
    }

    const wasmBuffer = fs.readFileSync(wasmPath);
    const adminAccount = await rpc.getAccount(admin.publicKey());

    // 1. Upload WASM
    const uploadTx = new TransactionBuilder(adminAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        Operation.uploadContractWasm({ wasm: wasmBuffer })
      )
      .setTimeout(30)
      .build();

    const uploadPrepared = await rpc.prepareTransaction(uploadTx);
    uploadPrepared.sign(admin);
    const uploadResult = await rpc.sendTransaction(uploadPrepared);

    // Wait for WASM upload
    await waitForTx(uploadResult.hash);

    const wasmHash = await getWasmHash(uploadResult.hash);

    // 2. Create contract instance
    const freshAccount = await rpc.getAccount(admin.publicKey());
    const createTx = new TransactionBuilder(freshAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        Operation.createCustomContract({
          address: new Address(admin.publicKey()),
          wasmHash: Buffer.from(wasmHash, 'hex'),
        })
      )
      .setTimeout(30)
      .build();

    const createPrepared = await rpc.prepareTransaction(createTx);
    createPrepared.sign(admin);
    const createResult = await rpc.sendTransaction(createPrepared);
    const contractId = await extractContractId(createResult.hash);

    // 3. Call initialize()
    const contract = new Contract(contractId);
    const landlordAddress = new Address(params.landlordKey || admin.publicKey());
    const tenantAddress = new Address(params.tenantKey || admin.publicKey());

    const freshAccount2 = await rpc.getAccount(admin.publicKey());
    const initTx = new TransactionBuilder(freshAccount2, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          'initialize',
          nativeToScVal(landlordAddress, { type: 'address' }),
          nativeToScVal(tenantAddress, { type: 'address' }),
          nativeToScVal(new Address(admin.publicKey()), { type: 'address' }),
          nativeToScVal(toStroops(params.monthlyRentUsdc), { type: 'i128' }),
          nativeToScVal(params.paymentDay, { type: 'u32' }),
          nativeToScVal(new Address(USDC_CONTRACT), { type: 'address' }),
          nativeToScVal(toStroops(params.depositUsdc), { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    const initPrepared = await rpc.prepareTransaction(initTx);
    initPrepared.sign(admin);
    await rpc.sendTransaction(initPrepared);

    console.log(`[Stellar] Contract deployed: ${contractId}`);

    return {
      contractId,
      escrowWallet: contractId, // Tenant funds the contract address directly
    };
  },

  /**
   * Call execute_payment() on the escrow contract.
   * Only admin (backend service keypair) can call this.
   */
  executePayment: async (contractId: string): Promise<string> => {
    if (contractId.startsWith('C_MOCK_')) {
      console.log(`[Stellar] Mock payment executed for contract: ${contractId}`);
      return 'tx_mock_hash_payment_' + Math.random().toString(36).substring(2, 15);
    }
    const admin = getAdminKeypair();
    const contract = new Contract(contractId);
    const account = await rpc.getAccount(admin.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(contract.call('execute_payment'))
      .setTimeout(30)
      .build();

    const prepared = await rpc.prepareTransaction(tx);
    prepared.sign(admin);
    const result = await rpc.sendTransaction(prepared);

    console.log(`[Stellar] execute_payment tx: ${result.hash}`);
    return result.hash;
  },

  /**
   * Call get_balance() — view function, no signing needed.
   */
  getContractBalance: async (contractId: string): Promise<bigint> => {
    if (contractId.startsWith('C_MOCK_')) {
      return BigInt(2500 * 1e7); // Return mock 2500 USDC (in stroops)
    }
    const admin = getAdminKeypair();
    const contract = new Contract(contractId);
    const account = await rpc.getAccount(admin.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(contract.call('get_balance'))
      .setTimeout(30)
      .build();

    const simResult = await rpc.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationSuccess(simResult) && simResult.result) {
      const val = scValToNative(simResult.result.retval);
      return BigInt(val);
    }
    return BigInt(0);
  },

  /**
   * Call terminate() to end the contract (sets is_active = false).
   */
  terminateContract: async (contractId: string): Promise<string> => {
    if (contractId.startsWith('C_MOCK_')) {
      console.log(`[Stellar] Mock lease termination for contract: ${contractId}`);
      return 'tx_mock_hash_terminate_' + Math.random().toString(36).substring(2, 15);
    }
    const admin = getAdminKeypair();
    const contract = new Contract(contractId);
    const account = await rpc.getAccount(admin.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(contract.call('terminate'))
      .setTimeout(30)
      .build();

    const prepared = await rpc.prepareTransaction(tx);
    prepared.sign(admin);
    const result = await rpc.sendTransaction(prepared);

    console.log(`[Stellar] terminate tx: ${result.hash}`);
    return result.hash;
  },

  /**
   * Call claim_deposit() — landlord claims deposit during dispute window.
   */
  claimDeposit: async (contractId: string, reason: string): Promise<string> => {
    if (contractId.startsWith('C_MOCK_')) {
      console.log(`[Stellar] Mock deposit claim for contract: ${contractId}. Reason: ${reason}`);
      return 'tx_mock_hash_claim_' + Math.random().toString(36).substring(2, 15);
    }
    const admin = getAdminKeypair();
    const contract = new Contract(contractId);
    const account = await rpc.getAccount(admin.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call('claim_deposit', nativeToScVal(reason, { type: 'string' }))
      )
      .setTimeout(30)
      .build();

    const prepared = await rpc.prepareTransaction(tx);
    prepared.sign(admin);
    const result = await rpc.sendTransaction(prepared);

    console.log(`[Stellar] claim_deposit tx: ${result.hash}`);
    return result.hash;
  },

  /**
   * Call release_deposit() — admin releases deposit back to tenant after inspection window.
   */
  releaseDeposit: async (contractId: string): Promise<string> => {
    if (contractId.startsWith('C_MOCK_')) {
      console.log(`[Stellar] Mock deposit release for contract: ${contractId}`);
      return 'tx_mock_hash_release_' + Math.random().toString(36).substring(2, 15);
    }
    const admin = getAdminKeypair();
    const contract = new Contract(contractId);
    const account = await rpc.getAccount(admin.publicKey());

    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
      .addOperation(contract.call('release_deposit'))
      .setTimeout(30)
      .build();

    const prepared = await rpc.prepareTransaction(tx);
    prepared.sign(admin);
    const result = await rpc.sendTransaction(prepared);

    console.log(`[Stellar] release_deposit tx: ${result.hash}`);
    return result.hash;
  },

  /**
   * Call set_grace_days() — landlord adjusts grace window (1–7 days) on an active lease.
   */
  setGraceDays: async (contractId: string, days: number): Promise<string> => {
    if (contractId.startsWith('C_MOCK_')) {
      console.log(`[Stellar] Mock set_grace_days(${days}) for contract: ${contractId}`);
      return 'tx_mock_hash_grace_' + Math.random().toString(36).substring(2, 15);
    }
    const admin = getAdminKeypair();
    const contract = new Contract(contractId);
    const account = await rpc.getAccount(admin.publicKey());

    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
      .addOperation(contract.call('set_grace_days', nativeToScVal(days, { type: 'u32' })))
      .setTimeout(30)
      .build();

    const prepared = await rpc.prepareTransaction(tx);
    prepared.sign(admin);
    const result = await rpc.sendTransaction(prepared);
    console.log(`[Stellar] set_grace_days tx: ${result.hash}`);
    return result.hash;
  },

  /**
   * Query is_in_grace_period() and days_overdue() — view calls, no signing.
   */
  getGracePeriodStatus: async (contractId: string): Promise<{ inGrace: boolean; daysOverdue: number }> => {
    if (contractId.startsWith('C_MOCK_')) {
      return { inGrace: false, daysOverdue: 0 };
    }
    const admin = getAdminKeypair();
    const contract = new Contract(contractId);
    const account = await rpc.getAccount(admin.publicKey());

    const graceTx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
      .addOperation(contract.call('is_in_grace_period'))
      .setTimeout(30)
      .build();
    const graceResult = await rpc.simulateTransaction(graceTx);
    const inGrace = SorobanRpc.Api.isSimulationSuccess(graceResult) && graceResult.result
      ? Boolean(scValToNative(graceResult.result.retval))
      : false;

    const overdueTx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
      .addOperation(contract.call('days_overdue'))
      .setTimeout(30)
      .build();
    const overdueResult = await rpc.simulateTransaction(overdueTx);
    const daysOverdue = SorobanRpc.Api.isSimulationSuccess(overdueResult) && overdueResult.result
      ? Number(scValToNative(overdueResult.result.retval))
      : 0;

    return { inGrace, daysOverdue };
  },

  /**
   * Call deposit_funds() on behalf of the tenant using a fee-bump transaction.
   *
   * deposit_funds() has `tenant.require_auth()` in the contract, so the tenant's
   * keypair must sign. But tenants may have no XLM for fees. The fee-bump pattern
   * lets the admin keypair wrap the tenant's inner tx and pay all fees —
   * tenant contributes zero XLM.
   *
   *   [Fee Bump Tx]  ← admin signs, pays all XLM fees
   *     └── [Inner Tx] ← tenant signs, satisfies require_auth in contract
   */
  depositFunds: async (params: {
    contractId: string;
    tenantSecret: string;  // decrypted from stellar_wallet_secret_encrypted
    amountUsdc: number;
  }): Promise<string> => {
    const { contractId, tenantSecret, amountUsdc } = params;

    if (contractId.startsWith('C_MOCK_')) {
      console.log(`[Stellar] Mock deposit for contract: ${contractId}`);
      return 'tx_mock_hash_deposit_' + Math.random().toString(36).substring(2, 15);
    }

    const admin = getAdminKeypair();
    const tenantKeypair = Keypair.fromSecret(tenantSecret);
    const contract = new Contract(contractId);

    // Inner tx: tenant is source so require_auth is satisfied
    const tenantAccount = await rpc.getAccount(tenantKeypair.publicKey());
    const innerTx = new TransactionBuilder(tenantAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call('deposit_funds', nativeToScVal(toStroops(amountUsdc), { type: 'i128' }))
      )
      .setTimeout(30)
      .build();

    // Simulate so Soroban populates auth entries
    const simResult = await rpc.simulateTransaction(innerTx);
    if (!SorobanRpc.Api.isSimulationSuccess(simResult)) {
      throw new Error(`deposit_funds simulation failed: ${JSON.stringify(simResult)}`);
    }
    const assembled = SorobanRpc.assembleTransaction(innerTx, simResult).build();
    assembled.sign(tenantKeypair);

    // Fee bump: admin wraps inner tx and pays all XLM fees
    const feeBump = TransactionBuilder.buildFeeBumpTransaction(
      admin.publicKey(),
      String(parseInt(BASE_FEE) * 10),
      assembled,
      networkPassphrase
    );
    feeBump.sign(admin);

    const txResponse = await rpc.sendTransaction(feeBump);
    await waitForTx(txResponse.hash);

    console.log(`[Stellar] deposit_funds tx: ${txResponse.hash}`);
    return txResponse.hash;
  },

  /**
   * Activate a tenant's Stellar account after registration.
   * Every Stellar account must receive at least 1 XLM before it exists
   * on-chain. The service account pays this automatically so the tenant
   * never has to worry about it.
   * Called non-blocking after registration — failure is logged, not fatal.
   */
  setupTenantWallet: async (tenantPublicKey: string): Promise<void> => {
    const admin = getAdminKeypair();

    // Check if already activated — idempotent
    try {
      await horizon.loadAccount(tenantPublicKey);
      console.log(`[Stellar] Wallet already active: ${tenantPublicKey}`);
      return;
    } catch {
      // Account not found on network — proceed with creation
    }

    const adminAccount = await horizon.loadAccount(admin.publicKey());

    const tx = new TransactionBuilder(adminAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        Operation.createAccount({
          destination: tenantPublicKey,
          startingBalance: '2', // 2 XLM: 1 base reserve + 1 buffer for operations
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(admin);
    await horizon.submitTransaction(tx);
    console.log(`[Stellar] Activated tenant wallet: ${tenantPublicKey}`);
  },

  /**
   * Send test USDC from the service account to a tenant's wallet.
   * TESTNET ONLY — the service account acts as a faucet.
   * In production, tenants acquire USDC via fiat on-ramp or external wallet.
   */
  mintTestUsdc: async (tenantPublicKey: string, amountUsdc: number): Promise<string> => {
    if (NETWORK === 'mainnet') {
      throw new Error('mintTestUsdc is not available on mainnet.');
    }
    if (!USDC_CONTRACT) {
      throw new Error('USDC_CONTRACT_ADDRESS is not set.');
    }

    const admin = getAdminKeypair();
    const contract = new Contract(USDC_CONTRACT);
    const adminAccount = await rpc.getAccount(admin.publicKey());

    // Call transfer(from=admin, to=tenant, amount) on the USDC Soroban contract
    const tx = new TransactionBuilder(adminAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          'transfer',
          Address.fromString(admin.publicKey()).toScVal(),
          Address.fromString(tenantPublicKey).toScVal(),
          nativeToScVal(toStroops(amountUsdc), { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    const simResult = await rpc.simulateTransaction(tx);
    if (!SorobanRpc.Api.isSimulationSuccess(simResult)) {
      throw new Error(`mintTestUsdc simulation failed: ${JSON.stringify(simResult)}`);
    }
    const assembled = SorobanRpc.assembleTransaction(tx, simResult).build();
    assembled.sign(admin);

    const txResponse = await rpc.sendTransaction(assembled);
    await waitForTx(txResponse.hash);

    console.log(`[Stellar] Minted ${amountUsdc} test USDC → ${tenantPublicKey}`);
    return txResponse.hash;
  },

  /**
   * Stream Horizon events for a contract to detect PaymentExecuted events.
   * Used by the backend to sync on-chain events to the DB.
   */
  subscribeToContractEvents: (
    contractId: string,
    onPaymentExecuted: (txHash: string, amountStroops: bigint) => void
  ) => {
    console.log(`[Stellar] Subscribing to events for contract: ${contractId}`);
    // Polling via Horizon /transactions — real streaming requires Horizon SSE
    // In production, use Horizon event streaming: /accounts/:id/transactions?cursor=now
    // For hackathon, we poll every 30s for new transactions on the contract
    const interval = setInterval(async () => {
      try {
        const events = await rpc.getEvents({
          startLedger: 1,
          filters: [
            {
              type: 'contract',
              contractIds: [contractId],
              topics: [['payment_executed']],
            },
          ],
          limit: 10,
        });

        for (const event of events.events) {
          const amount = BigInt(scValToNative(event.value));
          onPaymentExecuted(event.txHash, amount);
        }
      } catch (err) {
        console.error('[Stellar] Event subscription error:', err);
      }
    }, 30_000);

    return () => clearInterval(interval);
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

async function waitForTx(txHash: string, retries = 20): Promise<void> {
  for (let i = 0; i < retries; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const result = await rpc.getTransaction(txHash);
      if (result.status === 'SUCCESS') return;
      if (result.status === 'FAILED') throw new Error(`Transaction ${txHash} failed.`);
    } catch (_) {}
  }
  throw new Error(`Transaction ${txHash} timed out.`);
}

async function getWasmHash(uploadTxHash: string): Promise<string> {
  await waitForTx(uploadTxHash);
  const result = await rpc.getTransaction(uploadTxHash);
  if (result.status !== 'SUCCESS' || !result.returnValue) {
    throw new Error('WASM upload did not return a hash.');
  }
  const hashBytes = scValToNative(result.returnValue) as Uint8Array;
  return Buffer.from(hashBytes).toString('hex');
}

async function extractContractId(createTxHash: string): Promise<string> {
  await waitForTx(createTxHash);
  const result = await rpc.getTransaction(createTxHash);
  if (result.status !== 'SUCCESS' || !result.returnValue) {
    throw new Error('Contract creation did not return an ID.');
  }
  const val = scValToNative(result.returnValue);
  return String(val);
}
