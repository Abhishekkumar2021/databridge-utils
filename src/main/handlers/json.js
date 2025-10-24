import { ipcMain } from 'electron'

export function registerJSONIPC() {
  ipcMain.handle('json:validate', (_, { text }) => {
    try {
      JSON.parse(text)
      return { valid: true }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  })

  ipcMain.handle('json:analyze', (_, { text }) => {
    try {
      const parsed = JSON.parse(text)

      const analyze = (obj, depth = 0) => {
        let stats = {
          objects: 0,
          arrays: 0,
          strings: 0,
          numbers: 0,
          booleans: 0,
          nulls: 0,
          maxDepth: depth,
          totalKeys: 0
        }

        if (Array.isArray(obj)) {
          stats.arrays++
          obj.forEach((item) => {
            const childStats = analyze(item, depth + 1)
            stats = mergeStats(stats, childStats)
          })
        } else if (obj !== null && typeof obj === 'object') {
          stats.objects++
          stats.totalKeys += Object.keys(obj).length
          Object.values(obj).forEach((value) => {
            const childStats = analyze(value, depth + 1)
            stats = mergeStats(stats, childStats)
          })
        } else if (typeof obj === 'string') stats.strings++
        else if (typeof obj === 'number') stats.numbers++
        else if (typeof obj === 'boolean') stats.booleans++
        else if (obj === null) stats.nulls++

        return stats
      }

      const mergeStats = (s1, s2) => ({
        objects: s1.objects + s2.objects,
        arrays: s1.arrays + s2.arrays,
        strings: s1.strings + s2.strings,
        numbers: s1.numbers + s2.numbers,
        booleans: s1.booleans + s2.booleans,
        nulls: s1.nulls + s2.nulls,
        maxDepth: Math.max(s1.maxDepth, s2.maxDepth),
        totalKeys: s1.totalKeys + s2.totalKeys
      })

      const stats = analyze(parsed)
      return { success: true, stats }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })
}
