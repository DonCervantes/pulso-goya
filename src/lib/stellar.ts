import {
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
} from "@stellar/stellar-sdk";

// Firma y envía record_event al contrato Soroban (cuenta de servicio del backend).
// Si no está configurado, el anclaje se omite (no-op) — las alertas no dependen de esto.

const RPC_URL = process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const CONTRACT_ID = process.env.STELLAR_CONTRACT_ID;
const SECRET = process.env.STELLAR_SERVICE_SECRET;
const NETWORK = process.env.STELLAR_NETWORK || "testnet";
const PASSPHRASE = NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

export function isStellarConfigured(): boolean {
  return !!(CONTRACT_ID && SECRET);
}

export function explorerTxUrl(hash: string): string {
  return `https://stellar.expert/explorer/${NETWORK}/tx/${hash}`;
}
export function explorerContractUrl(): string | null {
  return CONTRACT_ID ? `https://stellar.expert/explorer/${NETWORK}/contract/${CONTRACT_ID}` : null;
}

export async function anchorEvent(params: {
  caseKeyHex: string;
  seq: number;
  eventCode: number;
  serverReceivedAtUnix: number;
  commitmentHex: string;
}): Promise<{ txHash: string; ledger?: number }> {
  if (!isStellarConfigured()) throw new Error("Stellar no configurado");

  const server = new rpc.Server(RPC_URL);
  const kp = Keypair.fromSecret(SECRET!);
  const source = await server.getAccount(kp.publicKey());
  const contract = new Contract(CONTRACT_ID!);

  const args = [
    nativeToScVal(Buffer.from(params.caseKeyHex, "hex"), { type: "bytes" }),
    nativeToScVal(params.seq, { type: "u32" }),
    nativeToScVal(params.eventCode, { type: "u32" }),
    nativeToScVal(BigInt(params.serverReceivedAtUnix), { type: "u64" }),
    nativeToScVal(Buffer.from(params.commitmentHex, "hex"), { type: "bytes" }),
  ];

  const tx = new TransactionBuilder(source, {
    fee: String(Math.max(Number(BASE_FEE), 1_000_000)),
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(contract.call("record_event", ...args))
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(kp);

  const sent = await server.sendTransaction(prepared);
  if (sent.status === "ERROR") {
    throw new Error("sendTransaction ERROR: " + JSON.stringify(sent.errorResult ?? {}));
  }

  const hash = sent.hash;
  const start = Date.now();
  let res = await server.getTransaction(hash);
  while (res.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    if (Date.now() - start > 30_000) throw new Error("Timeout esperando confirmación");
    await new Promise((r) => setTimeout(r, 1500));
    res = await server.getTransaction(hash);
  }
  if (res.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error("Transacción falló: " + res.status);
  }
  return { txHash: hash, ledger: res.ledger };
}
