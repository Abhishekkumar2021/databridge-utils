/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { Button } from 'ui/button'
import { Textarea } from 'ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'ui/card'
import { ScrollArea } from 'ui/scroll-area'
import { Switch } from 'ui/switch'
import { Label } from 'ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/tabs'
import {
  Copy,
  Check,
  Upload,
  Download,
  X,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import prettyBytes from 'pretty-bytes'

export default function Base64Tool() {
  const [mode, setMode] = useState('text') // 'text' or 'file'
  const [operation, setOperation] = useState('encode') // 'encode' or 'decode'

  // Text mode
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)

  // File mode
  const [fileInfo, setFileInfo] = useState(null)
  const [fileBase64, setFileBase64] = useState('')
  const [imagePreview, setImagePreview] = useState(null)

  // UI states
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showOutput, setShowOutput] = useState(true)

  // Text encode
  const encodeText = async () => {
    if (!input.trim()) {
      toast.error('Please enter text to encode')
      return
    }

    setLoading(true)

    try {
      const { result, error } = await window.api.base64.encode(input, urlSafe)

      if (error) {
        toast.error('Encoding failed')
      } else {
        setOutput(result)
        toast.success('Text encoded successfully')
      }
    } catch (err) {
      toast.error('Encoding failed')
    } finally {
      setLoading(false)
    }
  }

  // Text decode
  const decodeText = async () => {
    if (!input.trim()) {
      toast.error('Please enter Base64 to decode')
      return
    }

    setLoading(true)

    try {
      // Validate first
      const { valid } = await window.api.base64.validate(input)

      if (!valid) {
        toast.error('Invalid Base64 format')
        setLoading(false)
        return
      }

      const { result, error } = await window.api.base64.decode(input, urlSafe)

      if (error) {
        toast.error('Decoding failed')
      } else {
        setOutput(result)
        toast.success('Text decoded successfully')
      }
    } catch (err) {
      toast.error('Decoding failed')
    } finally {
      setLoading(false)
    }
  }

  // File upload & encode
  const handleFileUpload = async () => {
    setLoading(true)

    try {
      const { canceled, path, content, type, error } = await window.api.file.read()

      if (canceled) {
        setLoading(false)
        return
      }

      if (error) {
        toast.error('Failed to read file')
        setLoading(false)
        return
      }

      // Get file info
      const {
        result,
        name,
        size,
        mimeType,
        error: encodeError
      } = await window.api.base64.encodeFile(path)

      if (encodeError) {
        toast.error('Failed to encode file')
      } else {
        setFileBase64(result)
        setFileInfo({
          name,
          size: prettyBytes(size),
          mimeType,
          path
        })

        // Generate image preview if it's an image
        if (mimeType.startsWith('image/')) {
          const { result: dataURL } = await window.api.base64.toDataURL(result, mimeType)
          setImagePreview(dataURL)
        }

        toast.success('File encoded successfully')
      }
    } catch (err) {
      toast.error('File encoding failed')
    } finally {
      setLoading(false)
    }
  }

  // Download decoded file
  const downloadDecodedFile = async () => {
    if (!fileBase64) {
      toast.error('No file data to download')
      return
    }

    setLoading(true)

    try {
      const { canceled, path, error } = await window.api.file.save(null, fileBase64)

      if (canceled) {
        setLoading(false)
        return
      }

      if (error) {
        toast.error('Failed to save file')
      } else {
        toast.success(`File saved to ${path}`)
      }
    } catch (err) {
      toast.error('Download failed')
    } finally {
      setLoading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await window.api.clipboard.write(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  // Clear all
  const clearAll = () => {
    setInput('')
    setOutput('')
    setFileBase64('')
    setFileInfo(null)
    setImagePreview(null)
    toast.info('Cleared')
  }

  return (
    <ScrollArea className="h-full">
      <div className="w-full mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight flex gap-2 items-center">
            <FileText className="w-6 h-6 text-primary" /> Base64 Encoder/Decoder
          </h1>
          <p className="text-sm text-muted-foreground">
            Encode and decode text or files with full Unicode support
          </p>
        </div>

        {/* Mode Tabs - Centered */}
        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="text" className="text-sm">
                <FileText className="w-4 h-4 mr-2" />
                Text
              </TabsTrigger>
              <TabsTrigger value="file" className="text-sm">
                <Upload className="w-4 h-4 mr-2" />
                File
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TEXT MODE */}
          <TabsContent value="text" className="space-y-4">
            {/* Options */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="url-safe" className="text-sm font-medium cursor-pointer">
                    URL-Safe Encoding
                  </Label>
                  <Switch id="url-safe" checked={urlSafe} onCheckedChange={setUrlSafe} />
                </div>
              </CardContent>
            </Card>

            {/* Input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Input</CardTitle>
                <CardDescription className="text-xs">
                  Enter text to encode or Base64 string to decode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Enter your text here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[180px] font-mono text-sm resize-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{input.length} chars</span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={encodeText} disabled={loading || !input}>
                      {loading ? 'Processing...' : 'Encode'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={decodeText}
                      variant="secondary"
                      disabled={loading || !input}
                    >
                      {loading ? 'Processing...' : 'Decode'}
                    </Button>
                    <Button size="sm" onClick={clearAll} variant="outline">
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            {output && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Output</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {output.length} chars
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOutput(!showOutput)}
                      >
                        {showOutput ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(output)}>
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {showOutput && (
                  <CardContent>
                    <ScrollArea className="h-40 w-full rounded-md border bg-muted/30 p-3">
                      <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
                        {output}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                )}
              </Card>
            )}
          </TabsContent>

          {/* FILE MODE */}
          <TabsContent value="file" className="space-y-4">
            {/* File Upload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Upload File</CardTitle>
                <CardDescription className="text-xs">
                  Select any file to encode to Base64
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleFileUpload} disabled={loading} className="w-full" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? 'Loading...' : 'Select File'}
                </Button>
              </CardContent>
            </Card>

            {/* File Info */}
            {fileInfo && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{fileInfo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {fileInfo.size} • {fileInfo.mimeType}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        setFileInfo(null)
                        setFileBase64('')
                        setImagePreview(null)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-80 object-contain rounded"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Base64 Output */}
            {fileBase64 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Base64 Output</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {fileBase64.length} chars
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(fileBase64)}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadDecodedFile}>
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px] w-full rounded-md border bg-muted/30 p-3">
                    <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
                      {fileBase64}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Footer */}
        <Card className="bg-muted/30 border-muted">
          <CardContent className="p-3.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="font-medium">About Base64:</strong> Binary-to-text encoding scheme
              that represents binary data in ASCII format. Commonly used for embedding images in
              HTML/CSS, API authentication, and data transmission.
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
