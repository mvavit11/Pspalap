import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  Keypair,
} from '@solana/web3.js'
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  AuthorityType,
  createSetAuthorityInstruction,
} from '@solana/spl-token'

const FEE_WALLET = new PublicKey(
  import.meta.env.VITE_FEE_WALLET || '11111111111111111111111111111111'
)

const PRICES = {
  basic: parseFloat(import.meta.env.VITE_PRICE_BASIC || '0.3'),
  safe: parseFloat(import.meta.env.VITE_PRICE_SAFE || '0.8'),
  trusted: parseFloat(import.meta.env.VITE_PRICE_TRUSTED || '1.5'),
}

export const PLAN_CONFIG = {
  basic: {
    id: 'basic',
    name: 'LAUNCH BASIC',
    price: PRICES.basic,
    revokeMint: false,
    revokeFreeze: false,
    autoRevoke: false,
    immutableMeta: false,
    customDecimals: false,
    color: 'neon-blue',
    badge: null,
  },
  safe: {
    id: 'safe',
    name: 'SAFE LAUNCH',
    price: PRICES.safe,
    revokeMint: true,
    revokeFreeze: true,
    autoRevoke: false,
    immutableMeta: false,
    customDecimals: true,
    color: 'neon-green',
    badge: 'POPULAR',
  },
  trusted: {
    id: 'trusted',
    name: 'TRUSTED LAUNCH',
    price: PRICES.trusted,
    revokeMint: true,
    revokeFreeze: true,
    autoRevoke: true,
    immutableMeta: true,
    customDecimals: true,
    color: 'gold',
    badge: 'BEST',
  },
}

export async function createToken({
  connection,
  wallet,
  plan,
  tokenConfig,
  onStatus,
}) {
  const { publicKey, signTransaction } = wallet

  if (!publicKey || !signTransaction) {
    throw new Error('Wallet not connected')
  }

  onStatus?.('Preparing transaction...')

  const planConfig = PLAN_CONFIG[plan]
  const feeAmount = planConfig.price * LAMPORTS_PER_SOL

  // Generate new mint keypair
  const mintKeypair = Keypair.generate()
  const mintPubkey = mintKeypair.publicKey

  // Rent exemption for mint
  const mintRent = await getMinimumBalanceForRentExemptMint(connection)

  // Associated token account for creator
  const ata = await getAssociatedTokenAddress(mintPubkey, publicKey)

  const decimals = planConfig.customDecimals
    ? parseInt(tokenConfig.decimals ?? 9)
    : 9

  const totalSupply = BigInt(
    Math.round(parseFloat(tokenConfig.supply || '1000000000')) *
    Math.pow(10, decimals)
  )

  const transaction = new Transaction()

  // 1. Pay fee (atomically with token creation)
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: FEE_WALLET,
      lamports: Math.round(feeAmount),
    })
  )

  // 2. Create mint account
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintPubkey,
      space: MINT_SIZE,
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID,
    })
  )

  // 3. Initialize mint
  transaction.add(
    createInitializeMintInstruction(
      mintPubkey,
      decimals,
      publicKey,   // mint authority
      publicKey,   // freeze authority
      TOKEN_PROGRAM_ID
    )
  )

  // 4. Create ATA
  transaction.add(
    createAssociatedTokenAccountInstruction(
      publicKey,
      ata,
      publicKey,
      mintPubkey
    )
  )

  // 5. Mint tokens to creator
  transaction.add(
    createMintToInstruction(
      mintPubkey,
      ata,
      publicKey,
      totalSupply
    )
  )

  // 6. Auto-revoke for TRUSTED plan
  if (planConfig.autoRevoke) {
    // Revoke mint authority
    transaction.add(
      createSetAuthorityInstruction(
        mintPubkey,
        publicKey,
        AuthorityType.MintTokens,
        null
      )
    )
    // Revoke freeze authority
    transaction.add(
      createSetAuthorityInstruction(
        mintPubkey,
        publicKey,
        AuthorityType.FreezeAccount,
        null
      )
    )
  }

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed')
  transaction.recentBlockhash = blockhash
  transaction.feePayer = publicKey

  // Sign with mint keypair
  transaction.partialSign(mintKeypair)

  onStatus?.('Please approve in your wallet...')

  // Sign with wallet
  const signed = await signTransaction(transaction)

  onStatus?.('Sending transaction...')

  // Send
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  onStatus?.('Confirming transaction...')

  // Confirm
  const confirmation = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed'
  )

  if (confirmation.value.err) {
    throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err))
  }

  return {
    mintAddress: mintPubkey.toBase58(),
    signature,
    ata: ata.toBase58(),
    decimals,
    supply: tokenConfig.supply,
    plan: planConfig.name,
    autoRevoked: planConfig.autoRevoke,
  }
}

export function formatAddress(addr, chars = 6) {
  if (!addr) return ''
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`
}

export function getSolscanUrl(signature) {
  const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`
  return `https://solscan.io/tx/${signature}${cluster}`
}

export function getMintSolscanUrl(mint) {
  const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`
  return `https://solscan.io/token/${mint}${cluster}`
}
