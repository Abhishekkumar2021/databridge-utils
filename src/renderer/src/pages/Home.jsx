import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FileJson, FileText, Settings, ChevronLeft, ChevronRight, FileClock } from 'lucide-react'
import { ScrollArea } from 'ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'
import { Button } from 'ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'ui/tooltip'

const topTabs = [
  {
    path: 'base64',
    label: 'Base64',
    icon: <FileText className="w-5 h-5" />
  },
  {
    path: 'json',
    label: 'JSON',
    icon: <FileJson className="w-5 h-5" />
  },
  {
    path: 'timestamp',
    label: 'Timestamp',
    icon: <FileClock className="w-5 h-5" />
  }
]

const bottomTabs = [
  {
    path: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />
  }
]

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const currentTab = location.pathname.split('/').pop() || 'base64'

  const handleTabChange = (value) => {
    navigate(`/home/${value}`)
  }

  const activeTabClass = 'bg-accent text-accent-foreground'
  const hoverTabClass = 'hover:bg-muted/50'

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-56'
        } bg-card/50 backdrop-blur-sm border-r border-border/50 flex flex-col shrink-0 transition-all duration-300`}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-border/50 flex items-center justify-between">
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold tracking-tight truncate">DataBridge Utils</h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Essential dev utilities
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 shrink-0 ${collapsed ? 'mx-auto' : ''}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden py-3">
          <ScrollArea className="flex-1 px-3">
            <TooltipProvider delayDuration={0}>
              <Tabs value={currentTab} onValueChange={handleTabChange} orientation="vertical">
                <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1 p-0">
                  {topTabs.map((tab) => (
                    <Tooltip key={tab.path} disabled={!collapsed}>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value={tab.path}
                          className={`
                            w-full gap-2.5 py-2.5 flex items-center transition-all
                            ${collapsed ? 'justify-center px-0' : 'justify-start px-3'}
                            ${hoverTabClass}
                            data-[state=active]:${activeTabClass}
                            rounded-md
                            text-md
                            font-medium
                          `}
                        >
                          {tab.icon}
                          {!collapsed && <span className="text-sm font-medium">{tab.label}</span>}
                        </TabsTrigger>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          <p>{tab.label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </TabsList>
              </Tabs>
            </TooltipProvider>
          </ScrollArea>

          {/* Bottom Section */}
          <div className="px-3 pt-3 border-t border-border/50">
            <TooltipProvider delayDuration={0}>
              <Tabs value={currentTab} onValueChange={handleTabChange} orientation="vertical">
                <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1 p-0">
                  {bottomTabs.map((tab) => (
                    <Tooltip key={tab.path}>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value={tab.path}
                          className={`
                            w-full gap-2.5 py-2.5 transition-all
                            ${collapsed ? 'justify-center px-0' : 'justify-start px-3'}
                            ${hoverTabClass}
                            data-[state=active]:${activeTabClass}
                            rounded-md
                            text-sm
                            font-medium
                          `}
                        >
                          {tab.icon}
                          {!collapsed && <span className="text-sm font-medium">{tab.label}</span>}
                        </TabsTrigger>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          <p>{tab.label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </TabsList>
              </Tabs>
            </TooltipProvider>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-hidden bg-background">
        <Outlet />
      </main>
    </div>
  )
}
