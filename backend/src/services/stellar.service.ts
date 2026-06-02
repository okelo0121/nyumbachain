import {
  Networks,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  SorobanRpc,
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
    const wasmPath = path.join(
      __dirname,
      '../../../contracts/escrow/target/wasm32-unknown-unknown/release/nyumbachain_escrow.wasm'
    );

    if (!fs.existsSync(wasmPath)) {
      throw new Error(`Contract WASM not found at: ${wasmPath}. Run: cargo build --target wasm32-unknown-unknown --release`);
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
