import { useState } from 'react'
import { toast } from 'sonner'
import {
  Copy,
  Check,
  Key,
  FileText,
  Lock,
  Upload,
  ShieldCheck,
  EyeOff,
  Eye,
  Loader2,
  Settings,
  Zap,
  XCircle,
  CheckCircle
} from 'lucide-react'
import { ScrollArea } from 'components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select'
import { Label } from 'components/ui/label'
import { Separator } from 'components/ui/separator'
import { Button } from 'components/ui/button'
import { Textarea } from 'components/ui/textarea'

export default function HMACTool() {
  const [message, setMessage] = useState('')
  const [key, setKey] = useState('')
  const [algorithm, setAlgorithm] = useState('sha256')
  const [outputEncoding, setOutputEncoding] = useState('hex')
  const [signature, setSignature] = useState('')
  const [verifyInput, setVerifyInput] = useState('')
  const [verified, setVerified] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showSignature, setShowSignature] = useState(true)
  const [loading, setLoading] = useState(false)

  const algorithms = [
    { label: 'HMAC-SHA1', value: 'sha1' },
    { label: 'HMAC-SHA256', value: 'sha256' },
    { label: 'HMAC-SHA512', value: 'sha512' }
  ]

  const handleGenerate = async () => {
    if (!message || !key) {
      toast.error('Please enter both message and key')
      return
    }
    setLoading(true)
    setVerified(null)
    try {
      const { result, error } = await window.api.hmac.generate({
        message,
        key,
        algorithm,
        outputEncoding
      })
      if (error) toast.error(error)
      else {
        setSignature(result)
        toast.success('Signature generated successfully')
      }
    } catch {
      toast.error('Failed to generate signature')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!message || !key || !verifyInput) {
      toast.error('Please provide message, key, and signature to verify')
      return
    }
    setLoading(true)
    try {
      const { verified, error } = await window.api.hmac.verify({
        message,
        key,
        algorithm,
        outputEncoding,
        signature: verifyInput
      })
      if (error) toast.error(error)
      else {
        setVerified(verified)
        toast[verified ? 'success' : 'error'](verified ? 'Signature verified' : 'Invalid signature')
      }
    } catch {
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await window.api.clipboard.write(text)
      setCopied(true)
      toast.success('Copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed')
    }
  }

  const loadFromFile = async (type) => {
    try {
      const { content } = await window.api.file.read()
      if (!content) return
      if (type === 'message') setMessage(content)
      else setKey(content)
      toast.success(`Loaded ${type} from file`)
    } catch {
      toast.error('File loading failed')
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="w-full mx-auto p-6 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
            <Lock className="w-8 h-8 text-primary/80" />
            HMAC Signature Utility
          </h1>
          <p className="text-lg text-muted-foreground/90">
            Generate and verify keyed message digests using secure HMAC algorithms.
          </p>
        </div>

        <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Zap className="w-5 h-5 text-primary" /> Signature Generator
            </CardTitle>
            <CardDescription>
              Configure your parameters and input to securely generate and verify signatures.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Parameters */}
            <div className="flex flex-col gap-8">
              <h3 className="font-semibold flex items-center gap-2 text-primary/80">
                <Settings className="w-4 h-4" /> Parameters
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label>Algorithm</Label>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithms.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Output Encoding</Label>
                  <Select value={outputEncoding} onValueChange={setOutputEncoding}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select encoding" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hex">Hexadecimal</SelectItem>
                      <SelectItem value="base64">Base64</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Message & Key Inputs */}
            <div className="space-y-6">
              <h3 className="font-semibold flex items-center gap-2 text-primary/80">
                <FileText className="w-4 h-4" /> Input Data
              </h3>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Message</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs text-muted-foreground hover:bg-muted"
                      onClick={() => loadFromFile('message')}
                    >
                      <Upload className="w-3 h-3" /> Load File
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter message to sign..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px] font-mono text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Secret Key</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs text-muted-foreground hover:bg-muted"
                      onClick={() => loadFromFile('key')}
                    >
                      <Key className="w-3 h-3" /> Load File
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter secret key..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="min-h-[120px] font-mono text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-dashed border-border/60">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Generate
              </Button>

              <Button onClick={handleVerify} variant="outline" disabled={loading}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verify
              </Button>

              <Button onClick={resetState()} variant="outline">
                <XCircle className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* Result Row */}
            {(signature || verifyInput) && (
              <div className="grid lg:grid-cols-2 gap-6 pt-6">
                {/* Generated Signature */}
                {signature && (
                  <Card className="bg-muted/10 border border-muted rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row justify-between items-center py-3 px-4 border-b border-muted/20">
                      <CardTitle className="text-sm font-semibold text-primary/90 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> Generated Signature
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowSignature(!showSignature)}
                          title={showSignature ? 'Hide Signature' : 'Show Signature'}
                        >
                          {showSignature ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(signature)}
                          title="Copy Signature"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    {showSignature && (
                      <CardContent className="p-4">
                        <Textarea
                          readOnly
                          className="min-h-[120px] font-mono text-sm resize-none bg-muted/20 border border-muted/30 rounded-md"
                          value={signature}
                        />
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Verification Section */}
                <Card className="bg-muted/10 border border-muted rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row justify-between items-center py-3 px-4 border-b border-muted/20">
                    <CardTitle className="text-sm font-semibold text-primary/90 flex items-center gap-2">
                      <Check className="w-5 h-5" /> Verify Signature
                    </CardTitle>
                    {verified !== null && (
                      <div>
                        {verified ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    <Textarea
                      placeholder="Paste signature to verify..."
                      value={verifyInput}
                      onChange={(e) => {
                        setVerifyInput(e.target.value)
                        setVerified(null)
                      }}
                      className="min-h-[120px] font-mono text-sm resize-none bg-muted/20 border border-muted/30 rounded-md"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )

  function resetState() {
    return () => {
      setMessage('')
      setKey('')
      setSignature('')
      setVerifyInput('')
      setVerified(null)
    }
  }
}
