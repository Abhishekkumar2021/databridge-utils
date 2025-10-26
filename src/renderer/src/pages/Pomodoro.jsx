/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from 'ui/card'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'
import { Progress } from 'ui/progress'
import { ScrollArea } from 'ui/scroll-area'
import { toast } from 'sonner'
import { Clock, Pause, Play, RotateCcw, Coffee, Moon, Settings as SettingsIcon } from 'lucide-react'
import { Input } from 'ui/input'
import { Label } from 'ui/label'
import { Switch } from 'ui/switch'
import { Separator } from 'ui/separator'

const DEFAULT_SETTINGS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: true,
  autoStartPomodoro: true
}

export default function PomodoroTool() {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('pomodoroSettings')
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS
  })

  const [mode, setMode] = useState('pomodoro') // pomodoro | short | long
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 60)
  const [running, setRunning] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const timerRef = useRef(null)

  const currentDuration =
    mode === 'pomodoro'
      ? settings.pomodoro * 60
      : mode === 'short'
        ? settings.shortBreak * 60
        : settings.longBreak * 60

  const modeDescription = {
    pomodoro: 'Focus on your work without distractions.',
    short: 'Take a short break and relax a bit.',
    long: 'Enjoy a longer break to recharge fully.'
  }

  const formattedTime = () => {
    const m = Math.floor(timeLeft / 60)
    const s = timeLeft % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Persist settings
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings))
  }, [settings])

  // Timer
  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimerEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  const handleTimerEnd = useCallback(async () => {
    toast.success(`${mode === 'pomodoro' ? 'Pomodoro' : 'Break'} session complete!`)
    await window.api?.pomodoro?.notify({
      title: 'Pomodoro Timer',
      body:
        mode === 'pomodoro'
          ? 'Pomodoro session complete! Time for a break.'
          : 'Break over! Back to focus mode.'
    })

    if (mode === 'pomodoro') {
      setCycleCount((c) => c + 1)
      const nextMode = (cycleCount + 1) % 4 === 0 ? 'long' : 'short'
      setMode(nextMode)
      setTimeLeft(nextMode === 'short' ? settings.shortBreak * 60 : settings.longBreak * 60)
      if (settings.autoStartBreaks) setRunning(true)
    } else {
      setMode('pomodoro')
      setTimeLeft(settings.pomodoro * 60)
      if (settings.autoStartPomodoro) setRunning(true)
    }
  }, [
    cycleCount,
    mode,
    settings.autoStartBreaks,
    settings.autoStartPomodoro,
    settings.longBreak,
    settings.pomodoro,
    settings.shortBreak
  ])

  const handleStartPause = () => {
    if (running) {
      clearInterval(timerRef.current)
      toast.message('Timer paused ⏸️')
    } else {
      toast.message('Timer started ▶️')
    }
    setRunning(!running)
  }

  const handleReset = () => {
    clearInterval(timerRef.current)
    setRunning(false)
    setTimeLeft(currentDuration)
    toast.info('Timer reset')
  }

  const switchMode = (m) => {
    clearInterval(timerRef.current)
    setMode(m)
    setRunning(false)
    setTimeLeft(
      m === 'pomodoro'
        ? settings.pomodoro * 60
        : m === 'short'
          ? settings.shortBreak * 60
          : settings.longBreak * 60
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Clock /> Pomodoro Timer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{modeDescription[mode]}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1"
          >
            <SettingsIcon className="w-4 h-4" /> Settings
          </Button>
        </div>

        {/* Timer Card */}
        <Card className={`p-4 md:p-6 border-2 rounded-lg`}>
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg capitalize">
              {mode === 'pomodoro' && 'Focus Session'}
              {mode === 'short' && 'Short Break'}
              {mode === 'long' && 'Long Break'}
            </CardTitle>
            <CardDescription className="text-sm">Cycle {cycleCount + 1} / 4</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center gap-6 ">
            <div className="text-6xl font-mono font-semibold">{formattedTime()}</div>

            <Progress
              value={(timeLeft / currentDuration) * 100}
              className="w-full h-2 bg-white/30"
            />

            <div className="flex gap-3 justify-center mt-2">
              <Button size="sm" onClick={handleStartPause}>
                {running ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {running ? 'Pause' : 'Start'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>

            <Tabs defaultValue={mode} className="w-full mt-6">
              <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto">
                <TabsTrigger
                  value="pomodoro"
                  onClick={() => switchMode('pomodoro')}
                  className="text-xs"
                >
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Pomodoro
                </TabsTrigger>
                <TabsTrigger value="short" onClick={() => switchMode('short')} className="text-xs">
                  <Coffee className="w-3.5 h-3.5 mr-1.5" /> Short Break
                </TabsTrigger>
                <TabsTrigger value="long" onClick={() => switchMode('long')} className="text-xs">
                  <Moon className="w-3.5 h-3.5 mr-1.5" /> Long Break
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Settings Section */}
        {showSettings && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Customize Pomodoro durations and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'pomodoro', label: 'Pomodoro (minutes)' },
                { key: 'shortBreak', label: 'Short Break (minutes)' },
                { key: 'longBreak', label: 'Long Break (minutes)' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <Label className="text-sm w-1/2 text-right">{label}</Label>
                  <Input
                    type="number"
                    className="w-1/2"
                    value={settings[key]}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value)
                      }))
                    }
                  />
                </div>
              ))}

              <Separator className="my-2" />

              <div className="flex items-center justify-between">
                <Label>Auto Start Breaks</Label>
                <Switch
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, autoStartBreaks: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto Start Pomodoro</Label>
                <Switch
                  checked={settings.autoStartPomodoro}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, autoStartPomodoro: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
