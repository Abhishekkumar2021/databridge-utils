// src/pages/Settings.jsx
import { ScrollArea } from 'ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'ui/card'
import { RadioGroup, RadioGroupItem } from 'ui/radio-group' // Assuming 'ui/radio-group' exists
import { Label } from 'ui/label'
import { Palette, Sun, Moon, Laptop, Settings as SettingsIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

const themeOptions = [
  {
    value: 'system',
    label: 'System',
    description: 'Matches your operating system preference.',
    icon: Laptop
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Use the bright light theme.',
    icon: Sun
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Use the subdued dark theme.',
    icon: Moon
  }
]

export default function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        </div>

        {/* Appearance Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Appearance</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <RadioGroup
              value={theme}
              onValueChange={(val) => setTheme(val)}
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              {themeOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  // Apply a style change on selection for visual feedback
                  className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-colors
                    ${theme === option.value ? 'border-primary shadow-lg' : 'border-border/50 bg-card/50 hover:bg-accent/30'}
                  `}
                >
                  {/* The actual radio input, hidden visually */}
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />

                  <option.icon className="mb-3 h-6 w-6 text-primary" />
                  <span className="block w-full text-center font-semibold text-sm">
                    {option.label}
                  </span>
                  <span className="block w-full text-center text-xs text-muted-foreground mt-1">
                    {option.description}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* You can add more setting cards here later */}
      </div>
    </ScrollArea>
  )
}
