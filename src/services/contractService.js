import { createClient } from 'genlayer-js'
import { studionet } from 'genlayer-js/chains'
import { TransactionStatus } from 'genlayer-js/types'

const CONTRACT_ADDRESS = import.meta.env.VITE_GENLAYER_CONTRACT_ADDRESS
const ENDPOINT = import.meta.env.VITE_GENLAYER_RPC || 'https://studio.genlayer.com/api'

function requireAddress() {
  if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x')) {
    throw new Error('Missing VITE_GENLAYER_CONTRACT_ADDRESS. Rebuild the app with correct env.')
  }
}

let cached = {
  address: '',
  endpoint: '',
  account: '',
  client: null,
  initPromise: null
}

async function getClient(userAddress) {
  requireAddress()

  const addr = String(CONTRACT_ADDRESS)
  const ep = String(ENDPOINT)
  const acct = String(userAddress || '')

  if (!acct.startsWith('0x')) {
    throw new Error('Invalid user address')
  }

  const same =
    cached.client &&
    cached.address === addr &&
    cached.endpoint === ep &&
    cached.account.toLowerCase() === acct.toLowerCase()

  if (same && cached.initPromise) {
    await cached.initPromise
    return cached.client
  }

  const client = createClient({
    chain: studionet,
    endpoint: ep,
    account: acct
  })

  const initPromise = client.initializeConsensusSmartContract()

  cached = {
    address: addr,
    endpoint: ep,
    account: acct,
    client,
    initPromise
  }

  await initPromise
  return client
}

function safeJsonParse(value, fallback) {
  try {
    if (typeof value === 'string') return JSON.parse(value)
    return fallback
  } catch {
    return fallback
  }
}

export async function interpretDream(userAddress, dreamText) {
  const client = await getClient(userAddress)

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'interpret_dream',
    args: [String(dreamText || '')],
    value: 0n
  })

  await client.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
    retries: 80,
    interval: 5000
  })

  const jsonStr = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_last_result',
    args: [userAddress]
  })

  const parsed = safeJsonParse(jsonStr, {
    score: 0,
    interpretation: '',
    saved: false,
    fallback: false
  })

  const score = Number(parsed.score ?? 0)

  return {
    score,
    interpretation: String(parsed.interpretation ?? ''),
    saved: Boolean(parsed.saved ?? (score >= 8)),
    fallback: Boolean(parsed.fallback ?? false)
  }
}

export async function getGallery(userAddress) {
  const client = await getClient(userAddress)

  const jsonStr = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_gallery',
    args: []
  })

  const arr = safeJsonParse(jsonStr, [])
  if (!Array.isArray(arr)) return []

  return arr
    .map((row) => ({
      dream: String(row.dream ?? ''),
      interpretation: String(row.interpretation ?? ''),
      score: Number(row.score ?? 0),
      author: String(row.author ?? '')
    }))
    .sort((a, b) => b.score - a.score)
}

export function formatAddress(address) {
  if (!address || typeof address !== 'string' || address.length < 10) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function renderStars(score10) {
  const s = Math.max(0, Math.min(10, Number(score10) || 0))
  const fullStars = Math.floor(s / 2)
  return '⭐'.repeat(fullStars || 1)
}

export async function getLastDebug(userAddress) {
  const client = await getClient(userAddress)

  const jsonStr = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_last_debug',
    args: [userAddress]
  })

  try {
    return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
  } catch {
    return { error: 'failed to parse debug', raw: String(jsonStr ?? '') }
  }
}
