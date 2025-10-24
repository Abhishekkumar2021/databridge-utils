import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const base64 = {
  encode: (text, urlSafe = false) => ipcRenderer.invoke('base64:encode', { text, urlSafe }),
  decode: (text, urlSafe = false) => ipcRenderer.invoke('base64:decode', { text, urlSafe }),
  encodeFile: (filePath) => ipcRenderer.invoke('base64:encodeFile', { filePath }),
  decodeFile: (base64, savePath) => ipcRenderer.invoke('base64:decodeFile', { base64, savePath }),
  toDataURL: (base64, mimeType) => ipcRenderer.invoke('base64:toDataURL', { base64, mimeType }),
  validate: (text) => ipcRenderer.invoke('base64:validate', { text })
}

const file = {
  read: () => ipcRenderer.invoke('file:read'),
  save: (filename, content) => ipcRenderer.invoke('file:save', { filename, content })
}

const clipboard = {
  write: (text) => ipcRenderer.invoke('clipboard:write', { text }),
  read: () => ipcRenderer.invoke('clipboard:read')
}

const json = {
  validate: (text) => ipcRenderer.invoke('json:validate', { text }),
  analyze: (text) => ipcRenderer.invoke('json:analyze', { text })
}

const api = { base64, file, clipboard, json }

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (err) {
    console.error('Preload contextBridge error:', err)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
