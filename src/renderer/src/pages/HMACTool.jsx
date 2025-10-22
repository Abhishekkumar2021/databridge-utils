import { useState, useCallback, useEffect } from 'react'
import { Button } from 'ui/button'
import { Textarea } from 'ui/textarea'
import { Input } from 'ui/input'
import { Card } from 'ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'ui/select'
import { ScrollArea } from 'ui/scroll-area'
import { Copy, Check, Key, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription } from 'ui/alert'
import { Label } from 'ui/label'

const ALGORITHMS = ['SHA-256', 'SHA-384', 'SHA-512']

export default function HMACTool() {
  const [data, setData] = useState('')
  const [key, setKey] = useState('')
  const [algorithm, setAlgorithm] = useState('SHA-256')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)

  const generateHmac = useCallback(async () => {
    if (!data.trim() || !key.trim()) {
      setError('Both Data (Message) and Key (Secret) are required.')
      setOutput('')
      return
    }

    setError('')
    setLoading(true)
    setOutput('')
    setCopied(false)

    try {
      const result = await window.api.crypto.hmacGenerate(data, key, algorithm)
      if (result.success) {
        setOutput(result.signature)
      } else {
        setError(result.error || 'Unknown error generating HMAC.')
      }
    } catch {
      setError('An IPC error occurred while generating the HMAC.')
    } finally {
      setLoading(false)
    }
  }, [data, key, algorithm])

  const copyOutput = useCallback(async () => {
    if (!output) return
    try {
      const result = await window.api.clipboard.write(output)
      if (!result.success) throw new Error('IPC failed, using fallback.')

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [output])

  const handleReset = async () => {
    setResetting(true)
    setTimeout(() => {
      setData('')
      setKey('')
      setOutput('')
      setError('')
      setCopied(false)
      setAlgorithm('SHA-256')
      setResetting(false)
    }, 300)
  }

  useEffect(() => {
    if (!error && !loading) document.getElementById('data')?.focus()
  }, [error, loading])

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">HMAC Signature Generator</h2>
          <p className="text-muted-foreground">
            Generate secure Hash-based Message Authentication Codes (HMAC) for data integrity.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input Section */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Input Data (Message)</h3>
          <Textarea
            id="data"
            placeholder="Enter the data/message to be signed..."
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="min-h-[100px] font-mono text-sm resize-none"
            disabled={loading}
          />
        </Card>

        {/* Configuration Section */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">HMAC Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Secret Key */}
            <div className="flex-col gap-2 flex">
              <Label className="text-xs text-muted-foreground">
                The secret key used for HMAC generation.
              </Label>
              <Input
                id="key"
                type="text"
                placeholder="Enter Secret Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="font-mono text-sm"
                disabled={loading}
              />
            </div>

            {/* Algorithm */}
            <div className="flex-col gap-2 flex">
              <Label className="text-xs text-muted-foreground">
                Select the hashing algorithm for HMAC.
              </Label>
              <Select
                value={algorithm}
                onValueChange={(value) => setAlgorithm(value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {ALGORITHMS.map((alg) => (
                    <SelectItem key={alg} value={alg}>
                      {alg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <Button onClick={generateHmac} disabled={loading || !data || !key} className="flex-1">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating Signature...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" /> Generate HMAC Signature (Hex)
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              disabled={loading || resetting}
              className="flex-none"
            >
              {resetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Clearing...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Output Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">HMAC Output (Hexadecimal)</h3>
            {output && (
              <Button variant="outline" size="sm" onClick={copyOutput} disabled={copied || !output}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg border border-border min-h-[120px]">
            <ScrollArea className="max-h-[300px]">
              <pre className="whitespace-pre-wrap break-all font-mono text-sm leading-relaxed">
                {output || (
                  <span className="text-muted-foreground">
                    Generated HMAC signature will appear here...
                  </span>
                )}
              </pre>
            </ScrollArea>
          </div>

          {output && (
            <p className="text-sm text-muted-foreground">Hash Length: {output.length} characters</p>
          )}
        </Card>
      </div>
    </ScrollArea>
  )
}
