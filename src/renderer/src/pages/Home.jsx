/* eslint-disable react/prop-types */
import { NavLink, Outlet } from 'react-router-dom'
import { FileText, Lock, Key, Settings } from 'lucide-react'
import { Separator } from 'ui/separator'
import { ScrollArea } from 'ui/scroll-area'

// Top and bottom tabs
const topTabs = [
  { path: 'base64', label: 'Base64', icon: <FileText className="w-5 h-5" /> },
  { path: 'jwt', label: 'JWT', icon: <Lock className="w-5 h-5" /> },
  { path: 'hmac', label: 'HMAC', icon: <Key className="w-5 h-5" /> }
]

const bottomTabs = [{ path: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }]

// Reusable Sidebar Tab component
function SidebarTab({ path, label, icon }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 hover:bg-primary/10 ${
          isActive ? 'bg-primary/20 font-semibold' : ''
        }`
      }
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  )
}

export default function Home() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col" role="navigation">
        {/* Header - separate from scrollable area to preserve drag space */}
        <div className="p-3 pb-2">
          <h2 className="text-lg font-bold tracking-wide">DataBridge Utils</h2>
        </div>
        <Separator />

        {/* Scrollable content area */}
        <div className="flex-1 flex flex-col min-h-0 p-3 pt-2">
          {/* Top tabs */}
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 pr-3">
              {topTabs.map((tab) => (
                <SidebarTab key={tab.path} {...tab} />
              ))}
            </div>
          </ScrollArea>

          {/* Bottom tabs - stays at bottom */}
          <div className="mt-4 pt-2 border-t border-border">
            {bottomTabs.map((tab) => (
              <SidebarTab key={tab.path} {...tab} />
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
