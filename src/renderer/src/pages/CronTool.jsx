import { useState } from 'react'
import cronstrue from 'cronstrue'
import { CronExpressionParser } from 'cron-parser'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'ui/card'
import { ScrollArea } from 'ui/scroll-area'
import { Alert, AlertDescription } from 'ui/alert'
import { Input } from 'ui/input'
import { Label } from 'ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/tabs'
import { Calendar, Clock, AlertCircle, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const presets = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 9 AM', value: '0 9 * * *' },
  { label: 'Weekly (Mon 9 AM)', value: '0 9 * * 1' },
  { label: 'Monthly (1st 9 AM)', value: '0 9 1 * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Weekdays at 9 AM', value: '0 9 * * 1-5' }
]

export default function CronTool() {
  const [expression, setExpression] = useState('*/5 * * * *')
  const [description, setDescription] = useState('')
  const [nextRuns, setNextRuns] = useState([])
  const [error, setError] = useState('')
  const [fields, setFields] = useState({
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    weekday: '*'
  })
  const [copied, setCopied] = useState(false)

  const parseCron = () => {
    try {
      setError('')
      const desc = cronstrue.toString(expression)
      setDescription(desc)

      const interval = CronExpressionParser.parse(expression)
      const runs = []
      for (let i = 0; i < 10; i++) {
        runs.push(interval.next().toDate())
      }
      setNextRuns(runs)
      toast.success('Cron parsed successfully')
    } catch (err) {
      setError(err.message)
      setDescription('')
      setNextRuns([])
      toast.error('Invalid cron expression')
    }
  }

  const buildFromFields = () => {
    const expr = `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`
    setExpression(expr)
  }

  const copyToClipboard = async () => {
    try {
      await window.api.clipboard.write(expression)
      setCopied(true)
      toast.success('Copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Cron Expression Parser</h1>
          <p className="text-sm text-muted-foreground">
            Parse, build, and test cron expressions with visual builder
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="parse" className="w-full">
          <div className="flex justify-center mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="parse" className="text-sm">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Parse
              </TabsTrigger>
              <TabsTrigger value="build" className="text-sm">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Build
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="parse" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cron Expression</CardTitle>
                <CardDescription className="text-xs">minute hour day month weekday</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="*/5 * * * *"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="font-mono flex-1"
                  />
                  <Button size="sm" onClick={parseCron} disabled={!expression}>
                    Parse
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => setExpression(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {description && (
              <Card className="bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Human Readable</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{description}</p>
                </CardContent>
              </Card>
            )}

            {nextRuns.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Next 10 Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {nextRuns.map((date, i) => {
                      const now = new Date()
                      const diffMs = date - now
                      const diffMin = Math.round(diffMs / 1000 / 60)
                      const diffHr = Math.round(diffMs / 1000 / 60 / 60)
                      const diffDays = Math.round(diffMs / 1000 / 60 / 60 / 24)

                      let timeAway = ''
                      if (diffDays > 0) timeAway = `in ${diffDays}d`
                      else if (diffHr > 0) timeAway = `in ${diffHr}h`
                      else timeAway = `in ${diffMin}m`

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-card border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-mono text-sm font-medium">
                                {date.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {date.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {timeAway}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="build" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Visual Builder</CardTitle>
                <CardDescription className="text-xs">
                  Build cron expression visually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Minute (0-59)', key: 'minute', placeholder: '* or 0,15,30' },
                  { label: 'Hour (0-23)', key: 'hour', placeholder: '* or 0-23' },
                  { label: 'Day (1-31)', key: 'day', placeholder: '* or 1-31' },
                  { label: 'Month (1-12)', key: 'month', placeholder: '* or 1-12' },
                  { label: 'Weekday (0-7)', key: 'weekday', placeholder: '* or 0-7 (0=Sun)' }
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs">{field.label}</Label>
                    <Input
                      placeholder={field.placeholder}
                      value={fields[field.key]}
                      onChange={(e) => setFields({ ...fields, [field.key]: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button onClick={buildFromFields} className="flex-1">
                    Generate Expression
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFields({ minute: '*', hour: '*', day: '*', month: '*', weekday: '*' })
                    }
                  >
                    Reset
                  </Button>
                </div>

                {expression && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Generated Expression:</p>
                    <p className="font-mono text-sm font-semibold">{expression}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-muted/30">
          <CardContent className="p-3.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="font-medium">Format:</strong> minute (0-59) | hour (0-23) | day
              (1-31) | month (1-12) | weekday (0-7, 0=Sun)
              <br />
              <strong className="font-medium">Special:</strong> * (any) | */n (every n) | n-m
              (range) | n,m (list)
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
