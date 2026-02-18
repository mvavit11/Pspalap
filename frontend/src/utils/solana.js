import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddress,
  getMint,
  AuthorityType,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMetadataPointerInstruction,
  ExtensionType,
} from '@solana/spl-token';

// Metaplex token metadata program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const getNetwork = () => import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta';

export function getConnection() {
  const network = getNetwork();
  const rpcUrl = network === 'mainnet-beta'
    ? 'https://api.mainnet-beta.solana.com'
    : clusterApiUrl(network);
  return new Connection(rpcUrl, 'confirmed');
}

export async function createSPLToken({
  wallet,
  name,
  symbol,
  decimals,
  supply,
  packageId,
  keepMintAuthority = false,
  keepFreezeAuthority = false,
  onStatus,
}) {
  if (!wallet?.publicKey) throw new Error('Wallet not connected');

  const connection = getConnection();
  const payer = wallet.publicKey;

  onStatus?.('Generating token keypair...');

  // Generate new mint keypair via Phantom's signTransaction
  const { Keypair } = await import('@solana/web3.js');
  const mintKeypair = Keypair.generate();
  const mintPubkey = mintKeypair.publicKey;

  onStatus?.('Preparing token creation transaction...');

  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  // Get ATA
  const ata = await getAssociatedTokenAddress(mintPubkey, payer);

  const supplyRaw = BigInt(Math.floor(supply)) * BigInt(10 ** decimals);

  const tx = new Transaction();

  // Create mint account
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintPubkey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  // Initialize mint
  tx.add(
    createInitializeMintInstruction(
      mintPubkey,
      decimals,
      payer,           // mint authority
      keepFreezeAuthority ? payer : null, // freeze authority
      TOKEN_PROGRAM_ID
    )
  );

  // Create ATA
  tx.add(
    createAssociatedTokenAccountInstruction(
      payer,
      ata,
      payer,
      mintPubkey
    )
  );

  // Mint initial supply
  if (supply > 0) {
    tx.add(
      createMintToInstruction(mintPubkey, ata, payer, supplyRaw)
    );
  }

  // Revoke authorities for Starter (Safe Mode) or if user chose to revoke
  if (!keepMintAuthority) {
    tx.add(
      createSetAuthorityInstruction(
        mintPubkey,
        payer,
        AuthorityType.MintTokens,
        null
      )
    );
  }

  if (!keepFreezeAuthority) {
    tx.add(
      createSetAuthorityInstruction(
        mintPubkey,
        payer,
        AuthorityType.FreezeAccount,
        null
      )
    );
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;

  // Partial sign with mint keypair
  tx.partialSign(mintKeypair);

  onStatus?.('Please approve the transaction in Phantom...');

  // Sign with wallet
  const signedTx = await wallet.signTransaction(tx);

  onStatus?.('Sending transaction...');
  const signature = await connection.sendRawTransaction(signedTx.serialize());

  onStatus?.('Confirming transaction...');
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

  onStatus?.('Token created successfully! ✓');

  return {
    mint: mintPubkey.toBase58(),
    ata: ata.toBase58(),
    signature,
    mintAuthority: keepMintAuthority ? payer.toBase58() : null,
    freezeAuthority: keepFreezeAuthority ? payer.toBase58() : null,
  };
}

export async function sendPayment({ wallet, recipientAddress, amountSol, onStatus }) {
  if (!wallet?.publicKey) throw new Error('Wallet not connected');

  const connection = getConnection();
  const payer = wallet.publicKey;
  const recipient = new PublicKey(recipientAddress);
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  onStatus?.('Preparing payment transaction...');

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: recipient,
      lamports,
    })
  );

  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;

  onStatus?.('Please approve payment in Phantom...');
  const signedTx = await wallet.signTransaction(tx);

  onStatus?.('Sending payment...');
  const signature = await connection.sendRawTransaction(signedTx.serialize());

  onStatus?.('Confirming payment...');
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

  return signature;
}
