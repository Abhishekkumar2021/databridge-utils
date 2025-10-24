import { ipcMain } from 'electron'
import { Base64 } from 'js-base64'
import fs from 'fs-extra'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'
import mime from 'mime-types'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function registerBase64IPC() {
  ipcMain.handle('base64:encode', async (_, { text, urlSafe = false }) => {
    try {
      // Check input size
      if (text.length > 10_000_000) {
        // 10MB text limit
        return { error: 'Text too large. Max 10MB.' }
      }

      const result = urlSafe ? Base64.encodeURI(text) : Base64.encode(text)
      return { result }
    } catch (error) {
      return { error: error.message }
    }
  })

  ipcMain.handle('base64:decode', async (_, { text, urlSafe = false }) => {
    try {
      if (text.length > 15_000_000) {
        // ~10MB decoded
        return { error: 'Base64 string too large. Max ~10MB.' }
      }

      const result = urlSafe
        ? Base64.decode(text.replace(/-/g, '+').replace(/_/g, '/'))
        : Base64.decode(text)
      return { result }
    } catch (error) {
      return { error: error.message }
    }
  })

  ipcMain.handle('base64:encodeFile', async (_, { filePath }) => {
    try {
      const stats = await fs.stat(filePath)

      // Check file size
      if (stats.size > MAX_FILE_SIZE) {
        return {
          error: `File too large (${(stats.size / 1024 / 1024).toFixed(2)}MB). Max 50MB.`
        }
      }

      const buffer = await fs.readFile(filePath)
      const base64 = buffer.toString('base64')
      const fileType = await fileTypeFromBuffer(buffer)

      return {
        result: base64,
        name: path.basename(filePath),
        size: stats.size,
        mimeType: fileType?.mime || mime.lookup(filePath) || 'application/octet-stream',
        extension: path.extname(filePath)
      }
    } catch (error) {
      return { error: error.message }
    }
  })

  ipcMain.handle('base64:decodeFile', async (_, { base64, savePath }) => {
    try {
      const buffer = Buffer.from(base64, 'base64')
      await fs.writeFile(savePath, buffer)
      const stats = await fs.stat(savePath)

      // Clear base64 from memory
      base64 = null

      return {
        success: true,
        path: savePath,
        size: stats.size
      }
    } catch (error) {
      return { error: error.message }
    }
  })

  ipcMain.handle('base64:toDataURL', async (_, { base64, mimeType }) => {
    try {
      // Limit data URL generation to 5MB
      if (base64.length > 7_000_000) {
        // ~5MB
        return { error: 'Image too large for preview. Max 5MB.' }
      }

      const dataURL = `data:${mimeType};base64,${base64}`
      return { result: dataURL }
    } catch (error) {
      return { error: error.message }
    }
  })

  ipcMain.handle('base64:validate', async (_, { text }) => {
    try {
      const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/
      const isValid = base64Regex.test(text.replace(/\s/g, ''))
      return { valid: isValid }
    } catch (error) {
      return { error: error.message }
    }
  })
}
