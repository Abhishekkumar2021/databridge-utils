/* eslint-disable no-unused-vars */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from 'ui/card'
import { Button } from 'ui/button'
import { Textarea } from 'ui/textarea'
import { Input } from 'ui/input'
import { ScrollArea } from 'ui/scroll-area'
import { Label } from 'ui/label'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from 'ui/tooltip'
import {
  Copy,
  Check,
  KeyRound,
  AlertCircle,
  Lightbulb,
  Zap,
  RefreshCw,
  Eye as EyeIcon,
  EyeOff
} from 'lucide-react'
import { Alert, AlertDescription } from 'ui/alert'
import { toast } from 'sonner'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTheme } from 'next-themes'

export default function JWTTool() {
  const [token, setToken] = useState('')
  const [header, setHeader] = useState('{}')
  const [payload, setPayload] = useState('{}')
  const [secret, setSecret] = useState('your-secret-key-here')
  const [isSecretVisible, setIsSecretVisible] = useState(false)
  const [error, setError] = useState('')
  const [signatureStatus, setSignatureStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { resolvedTheme } = useTheme()

  const decodeAndValidate = useCallback(async (currentToken, currentSecret) => {
    if (!currentToken) {
      setHeader('{}')
      setPayload('{}')
      setSignatureStatus(null)
      return
    }

    setLoading(true)
    setError('')
    setSignatureStatus(null)

    try {
      const result = await window.api.crypto.jwtDecodeAndValidate(currentToken, currentSecret)

      if (result.success) {
        setHeader(JSON.stringify(result.header, null, 2))
        setPayload(JSON.stringify(result.payload, null, 2))
        setSignatureStatus(result.isValid ? 'Valid' : 'Invalid')
      } else {
        setError(result.error)
        setHeader('{}')
        setPayload('{}')
      }
    } catch (e) {
      setError('An IPC error occurred.')
    } finally {
      setLoading(false)
    }
  }, [])

  const encodeToken = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    setSignatureStatus(null)

    try {
      const parsedHeader = JSON.parse(header)
      const parsedPayload = JSON.parse(payload)
      const result = await window.api.crypto.jwtEncode(parsedHeader, parsedPayload, secret)

      if (result.success) {
        setToken(result.token)
        setSignatureStatus('Generated')
        toast.success('JWT token encoded successfully!')
      } else {
        setError(result.error)
      }
    } catch (e) {
      setError('Invalid Header or Payload JSON.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      decodeAndValidate(token, secret)
    }, 500)
    return () => clearTimeout(debounce)
  }, [token, secret, decodeAndValidate])

  const signatureStyle = useMemo(() => {
    switch (signatureStatus) {
      case 'Valid':
        return 'text-green-600 dark:text-green-400 font-semibold'
      case 'Invalid':
        return 'text-red-600 dark:text-red-400 font-semibold'
      case 'Generated':
        return 'text-primary font-semibold'
      default:
        return 'text-muted-foreground'
    }
  }, [signatureStatus])

  const copyToken = async () => {
    if (!token) return
    const result = await window.api.clipboard.write(token)
    if (result.success) {
      setCopied(true)
      toast.success('Token copied!')
      setTimeout(() => setCopied(false), 1200)
    } else {
      toast.error('Failed to copy token.')
    }
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">JWT Encoder & Validator</h1>
          <p className="text-muted-foreground">
            Decode, verify, and encode JWT tokens securely using your secret key.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Token Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Encoded JWT</CardTitle>
            <CardDescription>Paste your token to decode or validate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste or enter your JWT here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="min-h-[100px] font-mono text-sm resize-none"
              disabled={loading}
            />
            <div className="flex justify-end">
              <Button variant="outline" onClick={copyToken} disabled={!token || loading}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy Token'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Decoded Header & Payload */}
          <div className="lg:w-2/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Header
                </CardTitle>
                <CardDescription>Base64URL-decoded JWT header</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeMirror
                  value={header}
                  height="150px"
                  extensions={[json()]}
                  onChange={(value) => setHeader(value)}
                  editable={!loading}
                  theme={resolvedTheme === 'dark' ? oneDark : 'light'} // dynamic theme
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLine: true,
                    highlightActiveLineGutter: true,
                    foldGutter: true
                  }}
                  className="border border-muted rounded-md bg-muted/10"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Payload
                </CardTitle>
                <CardDescription>Base64URL-decoded JWT payload</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeMirror
                  value={payload}
                  height="150px"
                  extensions={[json()]}
                  onChange={(value) => setPayload(value)}
                  editable={!loading}
                  theme={resolvedTheme === 'dark' ? oneDark : 'light'} // dynamic theme
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLine: true,
                    highlightActiveLineGutter: true,
                    foldGutter: true
                  }}
                  className="border border-muted rounded-md bg-muted/10"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="bg-primary/5 border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Verification & Generation
                </CardTitle>
                <CardDescription>Validate or encode JWTs with a secret key</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Secret Key Input */}
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="secret"
                      type={isSecretVisible ? 'text' : 'password'}
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="Enter secret key"
                      className="pr-10 font-mono text-sm"
                      disabled={loading}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setIsSecretVisible(!isSecretVisible)}
                            disabled={loading}
                          >
                            {isSecretVisible ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <EyeIcon className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isSecretVisible ? 'Hide secret' : 'Show secret'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Signature Status */}
                <div>
                  <Label>Signature Status</Label>
                  <p className={`mt-2 text-lg ${signatureStyle}`}>
                    {loading && (
                      <>
                        <RefreshCw className="w-4 h-4 inline animate-spin mr-2" />
                        Processing...
                      </>
                    )}
                    {!loading && signatureStatus === 'Valid' && '✅ Signature Verified'}
                    {!loading && signatureStatus === 'Invalid' && '❌ Invalid Signature'}
                    {!loading && signatureStatus === 'Generated' && '✨ Token Encoded'}
                    {!loading &&
                      signatureStatus === null &&
                      (token ? 'Awaiting validation...' : 'Input a token to begin')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uses <code>HS256</code> algorithm for verification.
                  </p>
                </div>

                <Button onClick={encodeToken} className="w-full" disabled={loading}>
                  <Zap className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Encode New Token'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">How JWTs Work</CardTitle>
                <CardDescription>
                  A JWT consists of three Base64URL-encoded parts: Header, Payload, and Signature.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This tool decodes each section and validates the signature using your secret key.
                  Useful for debugging and learning JWT internals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
