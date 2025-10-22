import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from 'pages/Home'
import Base64Tool from 'pages/Base64Tool'
import JWTTool from 'pages/JWTTool'
import HMACTool from 'pages/HMACTool'
import Settings from 'pages/Settings'

function App() {
  return (
    <div className="flex flex-col h-screen">
      <div className="w-full h-9 bg-background" style={{ WebkitAppRegion: 'drag' }}></div>
      <HashRouter>
        <Routes>
          {/* Redirect root to Home */}
          <Route path="/" element={<Navigate to="/home/base64" replace />} />

          {/* Home layout with sidebar */}
          <Route path="/home" element={<Home />}>
            <Route path="base64" element={<Base64Tool />} />
            <Route path="jwt" element={<JWTTool />} />
            <Route path="hmac" element={<HMACTool />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App
