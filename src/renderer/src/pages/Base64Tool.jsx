/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { Button } from 'ui/button'
import { Textarea } from 'ui/textarea'
import { Card } from 'ui/card'
import { ScrollArea } from 'ui/scroll-area'
import { Copy, Check, Upload, Download, X, AlertCircle, FolderOpen } from 'lucide-react'
import { Alert, AlertDescription } from 'ui/alert'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [fileInfo, setFileInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  // Enhanced encode with IPC
  const encode = async () => {
    try {
      setError('')
      setLoading(true)
      const result = await window.api.base64.encodeText(input)
      if (result.success) {
        setOutput(result.base64)
      } else {
        setError('Encoding failed: ' + result.error)
      }
    } catch (err) {
      setError('Encoding failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced decode with IPC
  const decode = async () => {
    try {
      setError('')
      setLoading(true)
      const result = await window.api.base64.decodeText(input)
      if (result.success) {
        setOutput(result.text)
      } else {
        setError('Decoding failed: Invalid Base64 string')
      }
    } catch (err) {
      setError('Decoding failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Copy to clipboard with IPC
  const copyOutput = async () => {
    try {
      const result = await window.api.clipboard.write(output)
      if (result.success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        setError('Failed to copy to clipboard')
      }
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  // Handle file upload with IPC
  const handleFileSelect = async () => {
    try {
      setLoading(true)
      setError('')
      const dialogResult = await window.api.dialog.openFile()

      if (dialogResult.canceled) {
        setLoading(false)
        return
      }

      if (dialogResult.success) {
        const result = await window.api.base64.encodeFile(dialogResult.filePath)

        if (result.success) {
          setOutput(result.base64)
          setFileInfo({
            name: result.name,
            size: (result.size / 1024).toFixed(2) + ' KB',
            type: result.type || 'unknown'
          })
        } else {
          setError('Failed to read file: ' + result.error)
        }
      }
    } catch (err) {
      setError('Failed to read file: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Download decoded file with IPC
  const downloadDecoded = async () => {
    try {
      setLoading(true)
      setError('')

      const dialogResult = await window.api.dialog.saveFile(fileInfo?.name || 'decoded-file')

      if (dialogResult.canceled) {
        setLoading(false)
        return
      }

      if (dialogResult.success) {
        const result = await window.api.base64.decodeFile(output, dialogResult.filePath)

        if (!result.success) {
          setError('Failed to save file: ' + result.error)
        }
      }
    } catch (err) {
      setError('Failed to save file: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Paste from clipboard
  const pasteFromClipboard = async () => {
    try {
      const result = await window.api.clipboard.read()
      if (result.success && result.text) {
        setInput(result.text)
      }
    } catch (err) {
      setError('Failed to paste from clipboard')
    }
  }

  // Clear all
  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setFileInfo(null)
    setCopied(false)
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Base64 Encoder/Decoder</h2>
          <p className="text-muted-foreground">
            Encode and decode text or files with full Unicode support
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* File Info */}
        {fileInfo && (
          <Card className="p-4 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{fileInfo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {fileInfo.size} • {fileInfo.type}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFileInfo(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Input Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Input</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={pasteFromClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Paste
              </Button>
              <Button variant="outline" size="sm" onClick={handleFileSelect} disabled={loading}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Select File
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Enter text to encode or Base64 string to decode..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[150px] font-mono text-sm resize-none"
          />
          <div className="flex gap-2 flex-wrap">
            <Button onClick={encode} disabled={!input || loading}>
              {loading ? 'Processing...' : 'Encode to Base64'}
            </Button>
            <Button onClick={decode} variant="secondary" disabled={!input || loading}>
              {loading ? 'Processing...' : 'Decode from Base64'}
            </Button>
            <Button onClick={clearAll} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </Card>

        {/* Output Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Output</h3>
            {output && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyOutput} disabled={!output}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                {fileInfo && (
                  <Button variant="outline" size="sm" onClick={downloadDecoded} disabled={loading}>
                    <Download className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Download'}
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="p-4 bg-muted rounded-lg border border-border min-h-[150px]">
            <ScrollArea className="max-h-[300px]">
              <pre className="whitespace-pre-wrap break-all font-mono text-sm">
                {output || (
                  <span className="text-muted-foreground">Output will appear here...</span>
                )}
              </pre>
            </ScrollArea>
          </div>
          {output && (
            <p className="text-sm text-muted-foreground">Length: {output.length} characters</p>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-6 space-y-2 bg-primary/5">
          <h3 className="text-sm font-semibold">About Base64</h3>
          <p className="text-sm text-muted-foreground">
            Base64 is a binary-to-text encoding scheme that represents binary data in ASCII string
            format. This tool supports full Unicode characters and can encode/decode both text and
            files using secure IPC communication.
          </p>
        </Card>
      </div>
    </ScrollArea>
  )
}
