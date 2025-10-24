// src/main/handlers/hmac.js
import { ipcMain } from 'electron'
import CryptoJS from 'crypto-js'

// Utility: map algorithm name to the correct CryptoJS function
function getHmacFunction(algorithm) {
  switch (algorithm.toLowerCase()) {
    case 'sha1':
      return CryptoJS.HmacSHA1
    case 'sha256':
      return CryptoJS.HmacSHA256
    case 'sha512':
      return CryptoJS.HmacSHA512
    default:
      throw new Error(`Unsupported HMAC algorithm: ${algorithm}`)
  }
}

function encodeOutput(wordArray, outputEncoding = 'hex') {
  if (outputEncoding === 'base64') return CryptoJS.enc.Base64.stringify(wordArray)
  return CryptoJS.enc.Hex.stringify(wordArray)
}

export function registerHMACIPC() {
  ipcMain.handle('hmac:generate', async (_, { message, key, algorithm, outputEncoding }) => {
    try {
      if (!message || !key) {
        return { error: 'Message and key are required' }
      }

      const hmacFunc = getHmacFunction(algorithm)
      const digest = hmacFunc(message, key)
      const encoded = encodeOutput(digest, outputEncoding)

      return { result: encoded }
    } catch (err) {
      console.error('HMAC generation failed:', err)
      return { error: err.message }
    }
  })

  ipcMain.handle(
    'hmac:verify',
    async (_, { message, key, algorithm, outputEncoding, signature }) => {
      try {
        if (!message || !key || !signature) {
          return { error: 'Message, key, and signature are required' }
        }

        const hmacFunc = getHmacFunction(algorithm)
        const digest = hmacFunc(message, key)
        const encoded = encodeOutput(digest, outputEncoding)

        const verified = encoded === signature
        return { verified }
      } catch (err) {
        console.error('HMAC verification failed:', err)
        return { error: err.message }
      }
    }
  )
}
