import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs-extra'
import { fileTypeFromBuffer } from 'file-type'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB limit for in-memory processing

export function registerFileIPC() {
  ipcMain.handle('file:read', async () => {
    const win = BrowserWindow.getFocusedWindow()
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile']
    })

    if (canceled || !filePaths.length) return { canceled: true }

    try {
      const filePath = filePaths[0]
      const stats = await fs.stat(filePath)

      // Check file size
      if (stats.size > MAX_FILE_SIZE) {
        return {
          error: `File too large (${(stats.size / 1024 / 1024).toFixed(2)}MB). Max 50MB.`
        }
      }

      const buffer = await fs.readFile(filePath)
      const type = await fileTypeFromBuffer(buffer)

      // Only convert to string if text file
      const isText = type?.mime?.startsWith('text') || !type
      const content = isText ? buffer.toString('utf-8') : buffer.toString('base64')

      return {
        canceled: false,
        path: filePath,
        content,
        type: type?.mime || 'text/plain',
        size: stats.size
      }
    } catch (e) {
      return { error: e.message }
    }
  })

  ipcMain.handle('file:save', async (_, { filename, content, binary = false }) => {
    const win = BrowserWindow.getFocusedWindow()

    try {
      if (!filename) {
        const { canceled, filePath } = await dialog.showSaveDialog(win, {
          defaultPath: 'output.txt'
        })
        if (canceled) return { canceled: true }
        filename = filePath
      }

      const data = binary ? Buffer.from(content, 'base64') : content
      await fs.writeFile(filename, data)

      return { canceled: false, path: filename }
    } catch (e) {
      return { error: e.message }
    }
  })
}
