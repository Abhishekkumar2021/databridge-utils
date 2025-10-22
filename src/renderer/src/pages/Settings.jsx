'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from 'ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui/select'
import { Switch } from 'ui/switch'
import { Separator } from 'ui/separator'
import { ScrollArea } from 'ui/scroll-area'
import { Label } from 'ui/label'
import { useTheme } from 'next-themes'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from 'ui/tooltip'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [compactMode, setCompactMode] = React.useState(false)
  const [animationsEnabled, setAnimationsEnabled] = React.useState(true)

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your preferences for <span className="font-medium">DataBridge Utils</span>.
          </p>
        </div>

        {/* Theme Settings */}
        <Card className="transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Choose your preferred appearance mode.</CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-52">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent className="flex flex-col py-1">
                      <SelectItem
                        value="light"
                        className="px-3 py-2 min-h-9 hover:bg-muted/20 rounded-md"
                      >
                        Light
                      </SelectItem>
                      <SelectItem
                        value="dark"
                        className="px-3 py-2 min-h-9 hover:bg-muted/20 rounded-md"
                      >
                        Dark
                      </SelectItem>
                      <SelectItem
                        value="system"
                        className="px-3 py-2 min-h-9 hover:bg-muted/20 rounded-md"
                      >
                        System
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  System mode uses your OS preference for light/dark theme.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Adjust layout and interaction options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <Label htmlFor="compact-mode" className="text-sm font-medium">
                  Compact Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reduce spacing and make lists more condensed.
                </p>
              </div>
              <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <Label htmlFor="animations" className="text-sm font-medium">
                  Enable Animations
                </Label>
                <p className="text-xs text-muted-foreground">
                  Smooth transitions and animated effects in UI.
                </p>
              </div>
              <Switch
                id="animations"
                checked={animationsEnabled}
                onCheckedChange={setAnimationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Other Options */}
        <Card className="transition-all duration-200 hover:shadow-lg border-dashed border-2 border-muted/30">
          <CardHeader>
            <CardTitle>Other Options</CardTitle>
            <CardDescription>Customize additional settings and features.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Coming soon: keyboard shortcuts, notifications, app behavior, and more.
            </p>
          </CardContent>
        </Card>

        <Separator className="my-6" />
        <p className="text-xs text-muted-foreground text-center select-none pb-4">
          DataBridge Utils • Version 1.0.0
        </p>
      </div>
    </ScrollArea>
  )
}
