// src/pages/UUIDTool.jsx
import { useState } from 'react'
import { v4 as uuidv4, v1 as uuidv1, v3 as uuidv3, v5 as uuidv5 } from 'uuid'
import { ScrollArea } from 'ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'ui/card'
import { Button } from 'ui/button'
import { Input } from 'ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui/select'
import { Label } from 'ui/label'
import { Copy, CopyCheck, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function UUIDTool() {
  const [uuids, setUuids] = useState([])
  const [count, setCount] = useState(5)
  const [version, setVersion] = useState('v4')
  const [namespace, setNamespace] = useState('')

  const generateUUIDs = () => {
    const newUUIDs = []
    for (let i = 0; i < count; i++) {
      let id
      switch (version) {
        case 'v1':
          id = uuidv1()
          break
        case 'v3':
          if (!namespace) {
            toast.error('Namespace required for v3 UUIDs!')
            return
          }
          id = uuidv3(`name-${i}`, namespace)
          break
        case 'v5':
          if (!namespace) {
            toast.error('Namespace required for v5 UUIDs!')
            return
          }
          id = uuidv5(`name-${i}`, namespace)
          break
        default:
          id = uuidv4()
      }
      newUUIDs.push(id)
    }
    setUuids(newUUIDs)
  }

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id)
    toast.success('Copied!')
  }

  const copyAll = () => {
    if (uuids.length === 0) return
    navigator.clipboard.writeText(uuids.join('\n'))
    toast.success('All UUIDs copied!')
  }

  const clearAll = () => setUuids([])

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight flex gap-2 items-center">
            <FileText /> UUID Generator
          </h1>
          <p className="text-muted-foreground">
            Generate multiple UUIDs of different versions. Copy them individually or all at once.
          </p>
        </div>

        {/* UUID Generator Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Generate UUIDs</CardTitle>
              <CardDescription>
                Select version, count, and optional namespace for v3/v5 UUIDs.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyAll} disabled={uuids.length === 0}>
                <CopyCheck className="w-4 h-4 mr-2" /> Copy All
              </Button>
              <Button size="sm" variant="outline" onClick={clearAll} disabled={uuids.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col gap-1">
                <Label htmlFor="version">UUID Version</Label>
                <Select value={version} onValueChange={setVersion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">v1</SelectItem>
                    <SelectItem value="v3">v3</SelectItem>
                    <SelectItem value="v4">v4</SelectItem>
                    <SelectItem value="v5">v5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="count">Count</Label>
                <Input
                  type="number"
                  id="count"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10))}
                />
              </div>

              {(version === 'v3' || version === 'v5') && (
                <div className="flex flex-col gap-2 col-span-2">
                  <Label htmlFor="namespace">Namespace</Label>
                  <Input
                    id="namespace"
                    placeholder="Enter namespace (URL or DNS)"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                  />
                </div>
              )}

              <div className="sm:col-span-4">
                <Button onClick={generateUUIDs} className="w-full">
                  Generate UUIDs
                </Button>
              </div>
            </div>

            {/* UUID Table */}
            <div className="border border-border/50 rounded-md divide-y divide-border/50">
              {uuids.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No UUIDs generated yet.
                </div>
              ) : (
                uuids.map((id, index) => (
                  <div
                    key={id}
                    className={`flex items-center justify-between p-3 gap-2 ${
                      index % 2 === 0 ? 'bg-card/50' : 'bg-card/40'
                    } hover:bg-muted/30 transition`}
                  >
                    <span className="flex items-center space-x-2">
                      {/* Circular Index Marker */}
                      <span className="shrink-0 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {index + 1}
                      </span>

                      <span className="font-mono text-xs break-all flex-1">{id}</span>
                    </span>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(id)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
