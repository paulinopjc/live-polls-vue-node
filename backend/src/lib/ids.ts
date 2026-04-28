import crypto from 'crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

export function generatePollId(length = 11): string {
  const bytes = crypto.randomBytes(length)
  let id = ''
  for (let i = 0; i < length; i++) {
    id += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return [id.slice(0, 4), id.slice(4, 8), id.slice(8)].join('-')
}