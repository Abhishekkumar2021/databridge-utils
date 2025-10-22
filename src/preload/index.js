// preload/index.js
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  base64: {
    encodeFile: (filePath) => ipcRenderer.invoke('base64:encode-file', filePath),
    decodeFile: (base64, savePath) => ipcRenderer.invoke('base64:decode-file', base64, savePath),
    encodeText: (text) => ipcRenderer.invoke('base64:encode-text', text),
    decodeText: (base64) => ipcRenderer.invoke('base64:decode-text', base64)
  },
  dialog: {
    openFile: () => ipcRenderer.invoke('dialog:open-file'),
    saveFile: (defaultName) => ipcRenderer.invoke('dialog:save-file', defaultName)
  },
  clipboard: {
    write: (text) => ipcRenderer.invoke('clipboard:write', text),
    read: () => ipcRenderer.invoke('clipboard:read')
  },
  crypto: {
    hmacGenerate: (data, key, algorithm) =>
      ipcRenderer.invoke('crypto:hmac-generate', data, key, algorithm),

    jwtEncode: (header, payload, secret) =>
      ipcRenderer.invoke('crypto:jwt-encode', header, payload, secret),

    jwtDecodeAndValidate: (token, secret) =>
      ipcRenderer.invoke('crypto:jwt-decode-and-validate', token, secret)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
