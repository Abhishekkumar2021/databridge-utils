/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from 'react'
import { ScrollArea } from 'ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'ui/card'
import { Input } from 'ui/input'
import { Button } from 'ui/button'
import {
  Clipboard,
  Clock,
  Calendar,
  Hash,
  ArrowRight,
  FileClock,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react'
import dayjs from 'dayjs'
import { toast } from 'sonner'

const formatOptions = {
  iso: (date) => dayjs(date).toISOString(),
  local: (date) => dayjs(date).format('dddd, MMMM D, YYYY h:mm:ss A [Local Time]'),
  unixSec: (date) => dayjs(date).unix().toString(),
  unixMs: (date) => dayjs(date).valueOf().toString()
}

const parseDateInput = (input) => {
  if (!input) return null
  const trimmed = input.trim()
  const num = parseInt(trimmed, 10)

  if (isNaN(num) && trimmed.length > 0) {
    const date = new Date(trimmed)
    if (!isNaN(date.getTime())) return date
  } else if (num > 0) {
    if (trimmed.length === 10) return new Date(num * 1000)
    else if (trimmed.length >= 13 && trimmed.length <= 17) return new Date(num)
  }

  return null
}

const copyToClipboard = async (text) => {
  try {
    await window.api.clipboard.write(text)
    toast.success('Copied!', { description: text, duration: 1500 })
  } catch {
    toast.error('Copy failed')
  }
}

const ResultRow = ({ title, icon, value }) => {
  if (!value) return null
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-border/20">
      <div className="flex items-center space-x-3 text-sm">
        {icon}
        <span className="font-medium text-muted-foreground">{title}:</span>
      </div>
      <div className="flex items-center space-x-2">
        <code className="text-foreground bg-accent/10 px-3 py-1 rounded text-sm break-all font-mono">
          {value}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10 transition-colors"
          onClick={() => copyToClipboard(value)}
          aria-label={`Copy ${title}`}
        >
          <Clipboard className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function TimestampConverterTool() {
  const [input, setInput] = useState('')
  const [liveDate, setLiveDate] = useState(new Date())
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setLiveDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const parsedDate = useMemo(() => parseDateInput(input), [input])
  const adjustedDate = useMemo(
    () => (parsedDate ? new Date(parsedDate.getTime() + offset * 1000) : null),
    [parsedDate, offset]
  )
  const isInputValid = !!parsedDate && !isNaN(parsedDate.getTime())

  const LiveTime = useMemo(
    () => ({
      iso: formatOptions.iso(liveDate),
      unixSec: formatOptions.unixSec(liveDate),
      local: formatOptions.local(liveDate),
      unixMs: formatOptions.unixMs(liveDate)
    }),
    [liveDate]
  )

  return (
    <ScrollArea className="h-full">
      <div className="w-full mx-auto p-6 flex flex-col space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight flex items-center space-x-2 mb-1">
            <FileClock className="w-6 h-6 text-primary" />
            <span>Timestamp Converter</span>
          </h1>
          <p className="text-muted-foreground">
            Convert between Unix Epoch, ISO 8601, and human-readable dates.
          </p>
        </header>

        {/* Live Clock */}
        <Card className="bg-card/70 backdrop-blur-sm shadow-md rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Live Clock</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => setInput(LiveTime.unixSec)}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Use Now</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ResultRow
              title="ISO 8601 (UTC)"
              icon={<Calendar className="w-4 h-4 text-orange-500" />}
              value={LiveTime.iso}
            />
            <ResultRow
              title="Local Time"
              icon={<Clock className="w-4 h-4 text-green-500" />}
              value={LiveTime.local}
            />
            <ResultRow
              title="Unix Ms"
              icon={<Hash className="w-4 h-4 text-blue-500" />}
              value={LiveTime.unixMs}
            />
            <ResultRow
              title="Unix Sec"
              icon={<Hash className="w-4 h-4 text-red-500" />}
              value={LiveTime.unixSec}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          {/* Input Converter */}
          <Card className="w-full rounded-md shadow-md lg:w-80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span>Input Converter</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Enter a timestamp (seconds, milliseconds, or ISO 8601 string)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="e.g., 1678886400 or 2023-03-15T00:00:00.000Z"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full text-sm p-2 font-mono"
              />

              {input.trim() && isInputValid && (
                <div className="flex flex-wrap items-center gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + 3600)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Plus className="w-3 h-3" /> 1 hour
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset - 3600)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Minus className="w-3 h-3" /> 1 hour
                  </Button>
                </div>
              )}

              {!input.trim() && (
                <p className="text-xs text-muted-foreground text-center">
                  Awaiting input for conversion...
                </p>
              )}
              {input.trim() && !isInputValid && (
                <p className="text-xs text-destructive font-medium text-center bg-destructive/10 p-1 rounded border border-destructive">
                  Invalid format. Enter a valid Unix number (10 or 13+ digits) or ISO date string.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Conversion Results */}
          {isInputValid && (
            <Card className="shadow-md rounded-md flex-1 p-3">
              <CardHeader>
                <CardTitle className="text-md">Conversion Results</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {[
                  {
                    title: 'ISO 8601 (UTC)',
                    icon: <Calendar className="w-4 h-4 text-orange-500" />,
                    value: formatOptions.iso(adjustedDate)
                  },
                  {
                    title: 'Local Time',
                    icon: <Clock className="w-4 h-4 text-green-500" />,
                    value: formatOptions.local(adjustedDate)
                  },
                  {
                    title: 'Unix Ms (Epoch)',
                    icon: <Hash className="w-4 h-4 text-blue-500" />,
                    value: formatOptions.unixMs(adjustedDate)
                  },
                  {
                    title: 'Unix Sec (Epoch)',
                    icon: <Hash className="w-4 h-4 text-red-500" />,
                    value: formatOptions.unixSec(adjustedDate)
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-card/50 p-2 rounded-md shadow-sm hover:bg-card/60 transition-colors text-sm"
                  >
                    <div className="min-w-28 flex items-center space-x-2">
                      {item.icon}
                      <span className="font-medium text-muted-foreground">{item.title}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <code className="text-foreground bg-accent/10 px-2 py-0.5 rounded font-mono break-all text-xs">
                        {item.value}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-primary/10 transition-colors"
                        onClick={() => copyToClipboard(item.value)}
                        aria-label={`Copy ${item.title}`}
                      >
                        <Clipboard className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
