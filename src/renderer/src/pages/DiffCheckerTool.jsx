import { useState, useRef } from 'react'
import { ScrollArea } from 'ui/scroll-area'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from 'ui/card'
import { Button } from 'ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from 'ui/select'
import { Separator } from 'ui/separator'
import { FileDiff, Clipboard, ArrowRightLeft, Eraser, LayoutList, Columns } from 'lucide-react'
import { toast } from 'sonner'
import { DiffEditor, Editor, loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useTheme } from 'next-themes'

loader.config({ monaco })

const LANGUAGES = [
  'text',
  'javascript',
  'typescript',
  'json',
  'html',
  'css',
  'python',
  'java',
  'cpp',
  'go',
  'yaml',
  'xml',
  'sql',
  'markdown'
]

export default function DiffCheckerTool() {
  const [originalText, setOriginalText] = useState('')
  const [modifiedText, setModifiedText] = useState('')
  const [language, setLanguage] = useState('text')
  const [isSideBySide, setIsSideBySide] = useState(true)
  const { resolvedTheme } = useTheme()

  const diffEditorRef = useRef(null)

  const handleDiffEditorMount = (editor) => {
    diffEditorRef.current = editor
  }

  const copyToClipboard = async (text, label) => {
    if (!text.trim()) return toast.info(`No ${label} content to copy.`)
    try {
      await window.api.clipboard.write(text)
      toast.success(`${label} Copied!`, { description: 'Copied to clipboard.' })
    } catch {
      toast.error('Clipboard Error', { description: 'Failed to copy content.' })
    }
  }

  const swapTexts = () => {
    setOriginalText(modifiedText)
    setModifiedText(originalText)
    toast.info('Swapped!', { description: 'Original and modified content exchanged.' })
  }

  const clearAll = () => {
    setOriginalText('')
    setModifiedText('')
    toast('Cleared All', { description: 'Both editors are now empty.' })
  }

  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light'

  return (
    <ScrollArea className="h-full">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <FileDiff className="w-7 h-7 text-primary" />
            <span>Diff Checker</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Compare, edit, and analyze text or code with live syntax highlighting.
          </p>
        </header>

        {/* Control Bar */}
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Language:</span>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => setIsSideBySide(!isSideBySide)}>
                {isSideBySide ? (
                  <>
                    <LayoutList className="w-4 h-4 mr-1" /> Inline View
                  </>
                ) : (
                  <>
                    <Columns className="w-4 h-4 mr-1" /> Side-by-Side
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={swapTexts}>
                <ArrowRightLeft className="w-4 h-4 mr-1" /> Swap
              </Button>

              <Button variant="outline" onClick={() => clearAll()}>
                <Eraser className="w-4 h-4 mr-1" /> Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Editable Editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>Original Text (A)</CardTitle>
              <CardDescription>Enter or paste your base content</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-72">
              <Editor
                height="100%"
                language={language}
                theme={monacoTheme}
                value={originalText}
                onChange={(v) => setOriginalText(v || '')}
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  fontSize: 14,
                  automaticLayout: true,
                  lineNumbersMinChars: 3,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true
                }}
              />
            </CardContent>
            <div className="p-2 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(originalText, 'Original')}
              >
                <Clipboard className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>Modified Text (B)</CardTitle>
              <CardDescription>Enter or paste the modified content</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-72">
              <Editor
                height="100%"
                language={language}
                theme={monacoTheme}
                value={modifiedText}
                onChange={(v) => setModifiedText(v || '')}
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  fontSize: 14,
                  automaticLayout: true,
                  lineNumbersMinChars: 3,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true
                }}
              />
            </CardContent>
            <div className="p-2 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(modifiedText, 'Modified')}
              >
                <Clipboard className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
          </Card>
        </div>

        <Separator />

        {/* Diff Comparison */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Comparison Result</CardTitle>
            <CardDescription>
              Visualize the differences between Original (A) and Modified (B)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[480px]">
            <DiffEditor
              height="100%"
              language={language}
              theme={monacoTheme}
              original={originalText}
              modified={modifiedText}
              onMount={handleDiffEditorMount}
              options={{
                readOnly: true,
                renderSideBySide: isSideBySide,
                minimap: { enabled: false },
                wordWrap: 'on',
                automaticLayout: true,
                fontSize: 14,
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                diffWordWrap: 'on'
              }}
            />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
