import { ipcMain } from 'electron'
import clipboardy from 'clipboardy'

export function registerClipboardIPC() {
  ipcMain.handle('clipboard:write', async (_, { text }) => {
    try {
      await clipboardy.write(text)
      return { success: true }
    } catch (e) {
      return { error: e.message }
    }
  })

  ipcMain.handle('clipboard:read', async () => {
    try {
      const text = await clipboardy.read()
      return { text }
    } catch (e) {
      return { error: e.message }
    }
  })
}
