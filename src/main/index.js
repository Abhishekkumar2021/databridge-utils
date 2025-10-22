import { app, shell, BrowserWindow, ipcMain, dialog, clipboard } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import icon from '../../resources/icon.png?asset'

// ----------------------------------
// 🧩 Utility Functions
// ----------------------------------

const log = (scope, ...msg) => console.log(`[${scope}]`, ...msg)

const respond = (success, data = {}, error = null) => ({
  success,
  ...(success ? { ...data } : { error })
})

// Base64URL helpers
const base64UrlEncode = (data) =>
  Buffer.from(data).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const base64UrlDecode = (data) => {
  let base64 = data.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  return Buffer.from(base64, 'base64').toString('utf8')
}

// ----------------------------------
// 🔐 Crypto Helpers
// ----------------------------------

const hmacSign = (key, data, algorithm = 'SHA-256') => {
  try {
    const alg = algorithm.toLowerCase().replace('-', '')
    const hash = crypto.createHmac(alg, key)
    hash.update(data)
    return respond(true, { signature: hash.digest('hex') })
  } catch (err) {
    log('HMAC', err)
    return respond(false, {}, 'Failed to generate HMAC. Check key and algorithm.')
  }
}

const jwtSign = (header, payload, secret, algorithm = 'HS256') => {
  try {
    const algName = algorithm.replace('HS', 'SHA')
    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(JSON.stringify(payload))
    const dataToSign = `${encodedHeader}.${encodedPayload}`

    const hash = crypto.createHmac(algName.toLowerCase(), secret)
    hash.update(dataToSign)
    const signature = base64UrlEncode(hash.digest('base64'))

    return respond(true, { token: `${dataToSign}.${signature}` })
  } catch (err) {
    log('JWT', err)
    return respond(false, {}, `JWT signing failed: ${err.message}`)
  }
}

const jwtDecodeAndValidate = (token, secret) => {
  const parts = token.split('.')
  if (parts.length !== 3) return respond(false, {}, 'Invalid JWT format (must have 3 parts).')

  const [encodedHeader, encodedPayload, tokenSignature] = parts
  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader))
    const payload = JSON.parse(base64UrlDecode(encodedPayload))

    const alg = header.alg?.replace('HS', 'SHA')?.toLowerCase() || 'sha256'
    const dataToSign = `${encodedHeader}.${encodedPayload}`

    const hash = crypto.createHmac(alg, secret)
    hash.update(dataToSign)
    const calculatedSignature = base64UrlEncode(hash.digest('base64'))
    const isValid = calculatedSignature === tokenSignature

    return respond(true, { header, payload, isValid })
  } catch (err) {
    return respond(false, {}, `Decoding or validation failed: ${err.message}`)
  }
}

// ----------------------------------
// 🪟 Window Creation
// ----------------------------------

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 720,
    minWidth: 820,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ----------------------------------
// ⚙️ IPC Handlers
// ----------------------------------

ipcMain.handle('base64:encode-file', async (_, filePath) => {
  try {
    const buffer = await fs.readFile(filePath)
    const stats = await fs.stat(filePath)
    return respond(true, {
      base64: buffer.toString('base64'),
      size: stats.size,
      name: path.basename(filePath),
      type: path.extname(filePath)
    })
  } catch (err) {
    return respond(false, {}, err.message)
  }
})

ipcMain.handle('base64:decode-file', async (_, base64, savePath) => {
  try {
    const buffer = Buffer.from(base64, 'base64')
    await fs.writeFile(savePath, buffer)
    return respond(true, { path: savePath })
  } catch (err) {
    return respond(false, {}, err.message)
  }
})

ipcMain.handle('base64:encode-text', async (_, text) => {
  try {
    const buffer = Buffer.from(text, 'utf8')
    return respond(true, { base64: buffer.toString('base64') })
  } catch (err) {
    return respond(false, {}, err.message)
  }
})

ipcMain.handle('base64:decode-text', async (_, base64) => {
  try {
    const buffer = Buffer.from(base64, 'base64')
    return respond(true, { text: buffer.toString('utf8') })
  } catch (err) {
    return respond(false, {}, err.message)
  }
})

ipcMain.handle('dialog:open-file', async (_, options = {}) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: options.filters || [{ name: 'All Files', extensions: ['*'] }]
    })
    if (result.canceled) return respond(false, { canceled: true })
    return respond(true, { filePath: result.filePaths[0] })
  } catch (err) {
    return respond(false, {}, err.message)
  }
})

ipcMain.handle('dialog:save-file', async (_, defaultName) => {
  try {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: 'All Files', extensions: ['*'] }]
    })
    if (result.canceled) return respond(false, { canceled: true })
    return respond(true, { filePath: result.filePath })
  } catch (err) {
    return respond(false, {}, err.message)
  }
})

ipcMain.handle('clipboard:write', async (_, text) => {
  try {
    clipboard.writeText(text)
    return respond(true)
  } catch (err) {
    return respond(false, {}, err.message)
  }
})

ipcMain.handle('clipboard:read', async () => {
  try {
    const text = clipboard.readText()
    return respond(true, { text })
  } catch (err) {
    return respond(false, {}, err.message)
  }
})

// --- Crypto ---
ipcMain.handle('crypto:hmac-generate', (_, data, key, algorithm) => hmacSign(key, data, algorithm))

ipcMain.handle('crypto:jwt-encode', (_, header, payload, secret) =>
  jwtSign(header, payload, secret, header?.alg || 'HS256')
)

ipcMain.handle('crypto:jwt-decode-and-validate', (_, token, secret) =>
  jwtDecodeAndValidate(token, secret)
)

// --- App Info Channel (optional future use) ---
ipcMain.handle('app:get-info', () =>
  respond(true, {
    version: app.getVersion(),
    platform: process.platform,
    env: is.dev ? 'development' : 'production'
  })
)

// ----------------------------------
// 🚀 App Lifecycle
// ----------------------------------

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.abhishek.dbclient')

  app.on('browser-window-created', (_, win) => optimizer.watchWindowShortcuts(win))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
