import { ipcMain, Notification } from 'electron'

export function registerPomodoroIPC(mainWindow) {
  ipcMain.handle('pomodoro:notify', async (_, { title, body }) => {
    try {
      const notification = new Notification({
        title: title || 'Pomodoro Timer',
        body: body || 'Session finished!',
        silent: false
      })

      notification.on('click', () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      })

      notification.show()
      return { success: true }
    } catch (err) {
      console.error('pomodoro:notify error:', err)
      return { error: err.message }
    }
  })
}
