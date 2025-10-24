import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from 'pages/Home'
import Base64Tool from 'pages/Base64Tool'
import { Toaster } from 'components/ui/sonner'
import JSONTool from 'pages/JSONTool'
import Settings from 'pages/Settings'
import TimestampConverterTool from 'pages/TimestampConverterTool'
import DiffCheckerTool from 'pages/DiffCheckerTool'
import CronTool from 'pages/CronTool'
import HMACTool from 'pages/HMACTool'

export default function App() {
  const isMac = window.electron?.process?.platform === 'darwin'

  return (
    <div className="flex flex-col h-screen select-none">
      <Toaster />

      {/* macOS draggable titlebar */}
      {isMac && (
        <div className="w-full h-9 bg-background shrink-0" style={{ WebkitAppRegion: 'drag' }} />
      )}

      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home/base64" replace />} />
          <Route path="/home" element={<Home />}>
            <Route path="base64" element={<Base64Tool />} />
            <Route path="json" element={<JSONTool />} />
            <Route path="settings" element={<Settings />} />
            <Route path="timestamp" element={<TimestampConverterTool />} />
            <Route path="diff" element={<DiffCheckerTool />} />
            <Route path="cron" element={<CronTool />} />
            <Route path="hmac" element={<HMACTool />} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  )
}
